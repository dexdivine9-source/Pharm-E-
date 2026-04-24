// ========================================================================================
// GATEWAY SWITCH ENDPOINT — Switch between Monnify and Paystack mid-checkout
// ========================================================================================
// Suspends the current transaction, initializes a new one with the target provider,
// and handles Monnify VA reactivation when switching back.
// ========================================================================================

import { paymentService } from '../../src/services/payment/CorePaymentService';
import { getServerSupabase } from '../../src/lib/supabase-server';
import { TransactionStatus, PaymentMethod } from '../../src/services/payment/types';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { orderId, targetMethod } = req.body as { orderId: string; targetMethod: PaymentMethod };

    if (!orderId || !targetMethod) {
      return res.status(400).json({ error: 'orderId and targetMethod are required.' });
    }

    const supabase = getServerSupabase();
    const targetProvider = targetMethod === 'BANK_TRANSFER' ? 'MONNIFY' : 'PAYSTACK';

    // 1. Load active session
    const { data: session } = await supabase
      .from('payment_sessions')
      .select('*')
      .eq('order_id', orderId)
      .eq('status', 'ACTIVE')
      .single();

    if (!session) {
      return res.status(404).json({ error: 'No active payment session for this order.' });
    }

    // 2. Enforce switch limit
    if (session.switch_count >= session.max_switches) {
      return res.status(429).json({
        error: `Maximum gateway switches (${session.max_switches}) reached. Contact support.`,
      });
    }

    // 3. Prevent switching if payment lock is held
    if (session.payment_lock) {
      return res.status(409).json({
        error: 'A payment is currently being processed. Please wait.',
      });
    }

    // 4. Already on this provider?
    if (session.active_provider === targetProvider) {
      return res.status(400).json({ error: 'Already on this payment method.' });
    }

    // 5. SUSPEND current transaction
    if (session.active_txn_id) {
      const { data: currentTxn } = await supabase
        .from('transactions')
        .select('id, status, amount_paid, amount, customer_email, customer_name')
        .eq('id', session.active_txn_id)
        .single();

      if (currentTxn && !['COMPLETED', 'FAILED', 'CANCELLED'].includes(currentTxn.status)) {
        // If partial payment on Monnify, queue refund
        if ((currentTxn.amount_paid || 0) > 0 && currentTxn.status === 'PARTIAL') {
          await supabase.from('refunds').insert({
            transaction_id: currentTxn.id,
            order_id: orderId,
            customer_email: currentTxn.customer_email || '',
            customer_name: currentTxn.customer_name,
            order_amount: currentTxn.amount,
            amount_paid: currentTxn.amount_paid,
            excess_amount: currentTxn.amount_paid,
            status: 'PENDING_REVIEW',
            source: 'GATEWAY_SWITCH',
          });
        }

        await supabase.from('transactions').update({
          status: 'SUSPENDED' as TransactionStatus,
          updated_at: new Date().toISOString(),
        }).eq('id', currentTxn.id);
      }
    }

    // 6. Check if we can REACTIVATE an existing Monnify VA (switching back)
    if (targetProvider === 'MONNIFY') {
      const { data: suspendedMonnify } = await supabase
        .from('transactions')
        .select('*')
        .eq('order_id', orderId)
        .eq('provider', 'MONNIFY')
        .eq('status', 'SUSPENDED')
        .gt('va_expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (suspendedMonnify) {
        // Reactivate — no new Monnify API call needed!
        await supabase.from('transactions').update({
          status: 'PENDING_TRANSFER' as TransactionStatus,
          updated_at: new Date().toISOString(),
        }).eq('id', suspendedMonnify.id);

        // Suspend Paystack txn if exists
        if (session.active_txn_id && session.active_txn_id !== suspendedMonnify.id) {
          await supabase.from('transactions').update({
            status: 'SUSPENDED' as TransactionStatus,
            updated_at: new Date().toISOString(),
          }).eq('id', session.active_txn_id);
        }

        // Update session
        await supabase.from('payment_sessions').update({
          active_provider: targetProvider,
          active_txn_id: suspendedMonnify.id,
          switch_count: session.switch_count + 1,
          updated_at: new Date().toISOString(),
        }).eq('id', session.id);

        return res.json({
          provider: targetProvider,
          reactivated: true,
          reference: suspendedMonnify.reference,
          status: 'PENDING_TRANSFER',
          switchCount: session.switch_count + 1,
          maxSwitches: session.max_switches,
          virtualAccount: {
            accountNumber: suspendedMonnify.va_account_number,
            bankName: suspendedMonnify.va_bank_name,
            accountName: suspendedMonnify.va_account_name,
            expiresAt: suspendedMonnify.va_expires_at,
          },
        });
      }
    }

    // 7. Load order for amount
    const { data: order } = await supabase
      .from('orders')
      .select('id, total_price, customer_id')
      .eq('id', orderId)
      .single();

    if (!order) {
      return res.status(404).json({ error: 'Order not found.' });
    }

    // 8. Get customer info from session or order
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, email')
      .eq('id', order.customer_id)
      .single();

    // 9. Initialize NEW transaction
    const intent = await paymentService.initiatePayment({
      orderId,
      amount: order.total_price,
      customerName: profile?.full_name || 'Customer',
      customerEmail: profile?.email || '',
      method: targetMethod,
      currency: 'NGN',
    });

    // 10. Update session
    const { data: newTxn } = await supabase
      .from('transactions')
      .select('id')
      .eq('reference', intent.reference)
      .single();

    await supabase.from('payment_sessions').update({
      active_provider: targetProvider,
      active_txn_id: newTxn?.id,
      switch_count: session.switch_count + 1,
      attempt_count: session.attempt_count + 1,
      updated_at: new Date().toISOString(),
    }).eq('id', session.id);

    return res.json({
      provider: targetProvider,
      reactivated: false,
      switchCount: session.switch_count + 1,
      maxSwitches: session.max_switches,
      ...intent,
    });

  } catch (error: any) {
    console.error('[Switch] Error:', error);
    return res.status(500).json({ error: error.message || 'Server Error' });
  }
}
