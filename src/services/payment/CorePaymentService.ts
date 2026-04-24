// ========================================================================================
// PHARMA-E CORE PAYMENT SERVICE — Production-Grade with DB Persistence
// ========================================================================================
// Replaces all TODO stubs with real Supabase operations, FSM-driven state transitions,
// partial payment reconciliation, overpayment detection, and ghost payment quarantine.
// ========================================================================================

import {
  PaymentIntentRequest,
  PaymentIntentResponse,
  IPaymentGateway,
  WebhookEvent,
  TransactionStatus,
  ReconcileResult,
  VerifyResult,
} from './types';
import { MonnifyAdapter } from './adapters/MonnifyAdapter';
import { PaystackAdapter } from './adapters/PaystackAdapter';
import { transition, isFrozenState, PaymentEvent, TransitionContext } from './PaymentStateMachine';
import { getServerSupabase } from '../../lib/supabase-server';

// ─── Configuration ─────────────────────────────────────────────────────────────

const MINIMUM_SPLIT_NGN = 100;  // Dust payment threshold
const MAX_VERIFY_RETRIES = 3;
const MAX_RETRIES = 3;
const MAX_SWITCHES = 3;
const DEFAULT_EXPIRY_MINUTES = 60;

// ─── Service ───────────────────────────────────────────────────────────────────

export class CorePaymentService {
  private adapters: Map<string, IPaymentGateway>;

  constructor() {
    this.adapters = new Map();
    
    // Register Adapters
    const monnify = new MonnifyAdapter();
    this.adapters.set(monnify.getProviderName(), monnify);
    
    const paystack = new PaystackAdapter();
    this.adapters.set(paystack.getProviderName(), paystack);
  }

  /**
   * Get adapter by provider name (for external use).
   */
  getAdapter(providerName: string): IPaymentGateway | undefined {
    return this.adapters.get(providerName.toUpperCase());
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 1. INITIATE PAYMENT
  // ═══════════════════════════════════════════════════════════════════════════

  async initiatePayment(req: PaymentIntentRequest): Promise<PaymentIntentResponse> {
    // Architectural Rule: BANK_TRANSFER uses Monnify, CARD uses Paystack
    const targetProvider = req.method === 'BANK_TRANSFER' ? 'MONNIFY' : 'PAYSTACK';
    
    const adapter = this.adapters.get(targetProvider);
    if (!adapter) {
      throw new Error(`Integration for ${targetProvider} is not configured.`);
    }

    const supabase = getServerSupabase();

    // 1. Insert INITIATED transaction in DB
    const { data: txnRow, error: insertError } = await supabase
      .from('transactions')
      .insert({
        order_id: req.orderId,
        reference: `${targetProvider === 'MONNIFY' ? 'MNY' : 'PSTK'}_${Date.now()}_${req.orderId}`,
        provider: targetProvider,
        amount: req.amount,
        currency: req.currency || 'NGN',
        status: 'INITIATED' as TransactionStatus,
        payment_method: req.method,
        customer_email: req.customerEmail,
        customer_name: req.customerName,
      })
      .select()
      .single();

    if (insertError || !txnRow) {
      console.error('[PaymentService] DB insert failed:', insertError);
      throw new Error('Failed to create transaction record.');
    }

    // 2. Call provider API
    try {
      const response = await adapter.initializePayment(req);

      // 3. Determine event and target state
      const event: PaymentEvent = targetProvider === 'MONNIFY' ? 'MONNIFY_INIT_OK' : 'PAYSTACK_INIT_OK';
      const targetState = targetProvider === 'MONNIFY' ? 'PENDING_TRANSFER' : 'PENDING_CARD';

      // 4. Update transaction with provider response
      const updatePayload: Record<string, any> = {
        status: targetState,
        provider_txn_ref: response.reference,
        version: 1,
        updated_at: new Date().toISOString(),
      };

      if (response.virtualAccount) {
        updatePayload.va_account_number = response.virtualAccount.accountNumber;
        updatePayload.va_account_name = response.virtualAccount.accountName;
        updatePayload.va_bank_name = response.virtualAccount.bankName;
        updatePayload.va_expires_at = response.virtualAccount.expiresAt || 
          new Date(Date.now() + DEFAULT_EXPIRY_MINUTES * 60 * 1000).toISOString();
      }

      if (response.checkoutUrl) {
        updatePayload.checkout_url = response.checkoutUrl;
        updatePayload.access_code = response.accessCode;
      }

      await supabase.from('transactions').update(updatePayload).eq('id', txnRow.id);

      // 5. Create or update payment session
      await this.ensurePaymentSession(supabase, req.orderId, targetProvider, txnRow.id);

      // Return response with our DB reference
      return {
        ...response,
        reference: txnRow.reference,
      };
    } catch (error) {
      // Mark transaction as FAILED
      await supabase.from('transactions').update({
        status: 'FAILED' as TransactionStatus,
        version: 1,
        updated_at: new Date().toISOString(),
      }).eq('id', txnRow.id);

      console.error(`[PaymentService] Initiate Error:`, error);
      throw error;
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 2. PROCESS WEBHOOK
  // ═══════════════════════════════════════════════════════════════════════════

  async processWebhook(providerName: string, payload: any, signature: string): Promise<ReconcileResult> {
    const adapter = this.adapters.get(providerName.toUpperCase());
    if (!adapter) {
      throw new Error(`Unknown Webhook Provider: ${providerName}`);
    }

    // 1. Validate Cryptographic Signature
    let webhookEvent: WebhookEvent;
    try {
      webhookEvent = adapter.parseAndValidateWebhook(payload, signature);
    } catch (error) {
      console.error(`[Webhook] Invalid signature for ${providerName}`, error);
      throw error;
    }

    // 2. Double-Verify with provider API (with retries)
    const verifyResult = await this.doubleVerifyWithRetry(adapter, webhookEvent.transactionReference);

    // 3. Reconcile
    return this.reconcilePayment(
      webhookEvent.transactionReference,
      verifyResult,
      payload,
      providerName
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 3. RECONCILE PAYMENT (Core Logic)
  // ═══════════════════════════════════════════════════════════════════════════

  async reconcilePayment(
    txnRef: string,
    verifyResult: VerifyResult,
    webhookPayload: any,
    providerName: string
  ): Promise<ReconcileResult> {
    const supabase = getServerSupabase();

    // 1. Find transaction by provider reference or our reference
    const { data: txn } = await supabase
      .from('transactions')
      .select('*')
      .or(`provider_txn_ref.eq.${txnRef},reference.eq.${txnRef}`)
      .single();

    if (!txn) {
      console.error(`[Reconcile] Transaction not found: ${txnRef}`);
      return { action: 'TXN_NOT_FOUND', txnStatus: 'FAILED', changed: false };
    }

    // 2. GHOST PAYMENT GUARD — freeze check
    if (isFrozenState(txn.status)) {
      await this.quarantineGhostPayment(supabase, txn, verifyResult.amountPaid, webhookPayload);
      return { action: 'GHOST_QUARANTINED', txnStatus: txn.status, changed: false };
    }

    // 3. Calculate split amount (for partial payment tracking)
    const splitAmount = verifyResult.amountPaid - (txn.amount_paid || 0);

    // Guard: no new money (duplicate webhook for same transfer)
    if (splitAmount <= 0) {
      return { action: 'DUPLICATE_IGNORED', txnStatus: txn.status, changed: false };
    }

    // Guard: dust payment
    if (splitAmount < MINIMUM_SPLIT_NGN && verifyResult.amountPaid < txn.amount) {
      // Log but don't advance state
      await supabase.from('payment_splits').insert({
        transaction_id: txn.id,
        order_id: txn.order_id,
        split_amount: splitAmount,
        cumulative_total: verifyResult.amountPaid,
        sender_name: `[DUST] ${webhookPayload.customer?.name || 'Unknown'}`,
        webhook_payload: webhookPayload,
      });
      return { action: 'DUST_IGNORED', txnStatus: txn.status, changed: false };
    }

    // 4. ACQUIRE PAYMENT LOCK
    const lockAcquired = await this.acquirePaymentLock(supabase, txn.order_id, providerName);
    if (!lockAcquired) {
      return { action: 'LOCK_CONFLICT_SKIPPED', txnStatus: txn.status, changed: false };
    }

    try {
      // 5. Determine FSM event based on amounts
      const isFullPayment = verifyResult.amountPaid >= txn.amount;
      let fsmEvent: PaymentEvent;

      if (verifyResult.status === 'SUCCESS' && isFullPayment) {
        fsmEvent = txn.provider === 'PAYSTACK' ? 'CARD_CHARGED' : 'PAYMENT_RECEIVED';
      } else if (verifyResult.amountPaid > 0 && !isFullPayment) {
        fsmEvent = 'PARTIAL_RECEIVED';
      } else if (verifyResult.status === 'FAILED') {
        fsmEvent = txn.provider === 'PAYSTACK' ? 'CARD_DECLINED' : 'VERIFY_REJECTED';
        // Handle failure
        await this.transitionState(supabase, txn, fsmEvent, { webhook_raw: webhookPayload });
        return { action: 'PAYMENT_FAILED', txnStatus: 'FAILED', changed: true };
      } else {
        return { action: 'NO_ACTION_NEEDED', txnStatus: txn.status, changed: false };
      }

      // 6. Log the individual split (Monnify partial payments)
      if (txn.provider === 'MONNIFY' && splitAmount > 0) {
        await supabase.from('payment_splits').insert({
          transaction_id: txn.id,
          order_id: txn.order_id,
          split_amount: splitAmount,
          cumulative_total: verifyResult.amountPaid,
          sender_name: webhookPayload.customer?.name || null,
          sender_bank: webhookPayload.destinationBankName || null,
          monnify_ref: webhookPayload.transactionReference || null,
          webhook_payload: webhookPayload,
        });
      }

      // 7. Transition to intermediate state
      const intermediateState = await this.transitionState(supabase, txn, fsmEvent, {
        amount_paid: verifyResult.amountPaid,
        split_count: (txn.split_count || 0) + 1,
        last_split_at: new Date().toISOString(),
        webhook_raw: webhookPayload,
      });

      if (!intermediateState) {
        return { action: 'TRANSITION_REJECTED', txnStatus: txn.status, changed: false };
      }

      // 8. If we reached PROCESSING, verify and transition to COMPLETED
      if (intermediateState === 'PROCESSING') {
        // Re-fetch txn with updated version
        const { data: updatedTxn } = await supabase
          .from('transactions')
          .select('*')
          .eq('id', txn.id)
          .single();

        if (updatedTxn) {
          const finalState = await this.transitionState(supabase, updatedTxn, 'VERIFY_CONFIRMED', {
            verified_at: new Date().toISOString(),
            completed_at: new Date().toISOString(),
          });

          if (finalState === 'COMPLETED') {
            // Mark order as PAID
            const orderPaymentStatus = verifyResult.amountPaid > txn.amount ? 'OVERPAID' : 'PAID';
            await supabase.from('orders').update({
              payment_status: orderPaymentStatus,
              amount_paid: verifyResult.amountPaid,
            }).eq('id', txn.order_id);

            // Cancel sibling transactions
            await supabase.from('transactions').update({
              status: 'CANCELLED' as TransactionStatus,
              updated_at: new Date().toISOString(),
            }).eq('order_id', txn.order_id)
              .neq('id', txn.id)
              .in('status', ['PENDING_TRANSFER', 'PENDING_CARD', 'SUSPENDED', 'INITIATED']);

            // Close payment session
            await supabase.from('payment_sessions').update({
              status: 'COMPLETED',
              updated_at: new Date().toISOString(),
            }).eq('order_id', txn.order_id)
              .eq('status', 'ACTIVE');

            // Handle overpayment
            if (verifyResult.amountPaid > txn.amount) {
              await this.handleOverpayment(supabase, txn, verifyResult.amountPaid);
            }

            return { action: 'PAYMENT_COMPLETED', txnStatus: 'COMPLETED', changed: true };
          }
        }
      }

      // Partial payment — update order
      if (intermediateState === 'PARTIAL') {
        await supabase.from('orders').update({
          payment_status: 'PARTIAL',
          amount_paid: verifyResult.amountPaid,
        }).eq('id', txn.order_id);

        return { action: 'PARTIAL_RECORDED', txnStatus: 'PARTIAL', changed: true };
      }

      return { action: `STATE_${intermediateState}`, txnStatus: intermediateState, changed: true };
    } finally {
      // Always release lock
      await this.releasePaymentLock(supabase, txn.order_id);
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 4. HELPERS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Transition state using the FSM with optimistic concurrency.
   */
  private async transitionState(
    supabase: any,
    txn: any,
    event: PaymentEvent,
    additionalUpdates: Record<string, any> = {}
  ): Promise<TransactionStatus | null> {
    const ctx: TransitionContext = {
      amount: txn.amount,
      amountPaid: additionalUpdates.amount_paid ?? txn.amount_paid ?? 0,
      vaExpiresAt: txn.va_expires_at,
      switchCount: 0,
      maxSwitches: MAX_SWITCHES,
      retryCount: 0,
      maxRetries: MAX_RETRIES,
      paymentLock: false,
    };

    const newState = transition(txn.status, event, ctx);
    if (!newState) {
      console.warn(`[FSM] Illegal transition: ${txn.status} + ${event}`);
      return null;
    }

    // Optimistic concurrency via version check
    const { data, error } = await supabase
      .from('transactions')
      .update({
        status: newState,
        version: txn.version + 1,
        updated_at: new Date().toISOString(),
        ...additionalUpdates,
      })
      .eq('id', txn.id)
      .eq('version', txn.version)
      .select()
      .single();

    if (!data || error) {
      console.warn(`[FSM] Version conflict on ${txn.id}: expected v${txn.version}`);
      return null;
    }

    console.log(`[FSM] ${txn.reference}: ${txn.status} → ${newState} (v${txn.version + 1})`);
    return newState;
  }

  /**
   * Double-verify with exponential backoff.
   */
  private async doubleVerifyWithRetry(adapter: IPaymentGateway, txnRef: string): Promise<VerifyResult> {
    for (let attempt = 1; attempt <= MAX_VERIFY_RETRIES; attempt++) {
      try {
        return await adapter.verifyTransactionDetailed(txnRef);
      } catch (err) {
        if (attempt === MAX_VERIFY_RETRIES) throw err;
        await new Promise(res => setTimeout(res, 1000 * Math.pow(2, attempt - 1)));
      }
    }
    throw new Error('Unreachable');
  }

  /**
   * Quarantine a ghost payment (arrived on frozen/expired transaction).
   */
  private async quarantineGhostPayment(
    supabase: any,
    txn: any,
    amountReceived: number,
    webhookPayload: any
  ): Promise<void> {
    await supabase.from('ghost_payments').insert({
      original_txn_id: txn.id,
      original_txn_ref: txn.reference,
      order_id: txn.order_id,
      amount_received: amountReceived,
      customer_email: txn.customer_email,
      webhook_payload: webhookPayload,
      status: 'QUARANTINED',
    });

    await supabase.from('admin_notifications').insert({
      type: 'GHOST_PAYMENT',
      severity: 'CRITICAL',
      title: `Ghost payment: ₦${amountReceived.toLocaleString()} on ${txn.status} Txn`,
      body: `Payment received on ${txn.status} transaction ${txn.reference}. Order ${txn.order_id} NOT auto-confirmed.`,
      metadata: { txnId: txn.id, orderId: txn.order_id, amount: amountReceived },
    });

    console.warn(`[GHOST] ₦${amountReceived} quarantined for txn ${txn.reference} (status: ${txn.status})`);
  }

  /**
   * Handle overpayment — log refund record + notify.
   */
  private async handleOverpayment(supabase: any, txn: any, amountPaid: number): Promise<void> {
    const excessAmount = amountPaid - txn.amount;

    await supabase.from('refunds').insert({
      transaction_id: txn.id,
      order_id: txn.order_id,
      customer_email: txn.customer_email || '',
      customer_name: txn.customer_name,
      order_amount: txn.amount,
      amount_paid: amountPaid,
      excess_amount: excessAmount,
      status: 'PENDING_REVIEW',
      source: 'AUTO_DETECTED',
    });

    await supabase.from('admin_notifications').insert({
      type: 'OVERPAYMENT',
      severity: 'HIGH',
      title: `Overpayment: ₦${excessAmount.toLocaleString()} on Order ${txn.order_id}`,
      body: `Customer ${txn.customer_email} overpaid ₦${excessAmount.toLocaleString()} (Ref: ${txn.reference}).`,
      metadata: { txnId: txn.id, orderId: txn.order_id, excess: excessAmount },
    });
  }

  /**
   * Ensure a payment session exists for this order.
   */
  private async ensurePaymentSession(
    supabase: any,
    orderId: string,
    provider: string,
    txnId: string
  ): Promise<void> {
    // Try to find existing active session
    const { data: existing } = await supabase
      .from('payment_sessions')
      .select('id')
      .eq('order_id', orderId)
      .eq('status', 'ACTIVE')
      .single();

    if (existing) {
      // Update existing session
      await supabase.from('payment_sessions').update({
        active_provider: provider,
        active_txn_id: txnId,
        attempt_count: existing.attempt_count + 1,
        updated_at: new Date().toISOString(),
      }).eq('id', existing.id);
    } else {
      // Fetch customer_id from order
      const { data: order } = await supabase
        .from('orders')
        .select('customer_id')
        .eq('id', orderId)
        .single();

      await supabase.from('payment_sessions').insert({
        order_id: orderId,
        customer_id: order?.customer_id || '',
        active_provider: provider,
        active_txn_id: txnId,
        attempt_count: 1,
        expires_at: new Date(Date.now() + 90 * 60 * 1000).toISOString(),
      });
    }
  }

  /**
   * Acquire payment lock (prevents double payment across gateways).
   */
  private async acquirePaymentLock(supabase: any, orderId: string, provider: string): Promise<boolean> {
    const { data } = await supabase.rpc('acquire_payment_lock', {
      p_order_id: orderId,
      p_provider: provider,
    });
    return data === true;
  }

  /**
   * Release payment lock.
   */
  private async releasePaymentLock(supabase: any, orderId: string): Promise<void> {
    await supabase.rpc('release_payment_lock', { p_order_id: orderId });
  }
}

// Export singleton instance for app-wide use
export const paymentService = new CorePaymentService();
