// ========================================================================================
// PAYMENT STATUS ENDPOINT — Polling fallback with self-healing
// ========================================================================================
// Frontend polls this every 15 seconds as a fallback for missed webhooks.
// If the provider reports payment but our DB doesn't reflect it, triggers reconciliation.
// ========================================================================================

import { paymentService } from '../../../src/services/payment/CorePaymentService';
import { getServerSupabase } from '../../../src/lib/supabase-server';

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const ref = req.query.ref as string;

    if (!ref) {
      return res.status(400).json({ error: 'ref parameter is required.' });
    }

    const supabase = getServerSupabase();

    // 1. Check DB state first (fast path)
    const { data: txn } = await supabase
      .from('transactions')
      .select('id, reference, status, amount, amount_paid, split_count, va_expires_at, provider, provider_txn_ref, order_id')
      .eq('reference', ref)
      .single();

    if (!txn) {
      return res.status(404).json({ error: 'Transaction not found.' });
    }

    // If terminal, return immediately without hitting provider
    if (['COMPLETED', 'FAILED', 'EXPIRED', 'EXPIRED_PARTIAL', 'CANCELLED'].includes(txn.status)) {
      // Fetch splits for history display
      const { data: splits } = await supabase
        .from('payment_splits')
        .select('split_amount, sender_name, created_at')
        .eq('transaction_id', txn.id)
        .order('created_at', { ascending: true });

      return res.json({
        reference: ref,
        status: txn.status,
        amountPaid: txn.amount_paid || 0,
        amountRemaining: txn.amount - (txn.amount_paid || 0),
        splitCount: txn.split_count || 0,
        expiresAt: txn.va_expires_at,
        splits: (splits || []).map((s: any) => ({
          amount: s.split_amount,
          senderName: s.sender_name,
          timestamp: s.created_at,
        })),
      });
    }

    // 2. Active transaction — probe the provider (self-healing)
    const adapter = paymentService.getAdapter(txn.provider);
    if (!adapter) {
      return res.json({ reference: ref, status: txn.status, amountPaid: txn.amount_paid || 0 });
    }

    const providerRef = txn.provider_txn_ref || txn.reference;

    try {
      const verifyResult = await adapter.verifyTransactionDetailed(providerRef);

      // Self-heal: provider says paid but our DB doesn't reflect it
      if (verifyResult.amountPaid > 0 && verifyResult.amountPaid > (txn.amount_paid || 0)) {
        const result = await paymentService.reconcilePayment(
          providerRef,
          verifyResult,
          { source: 'POLLING_RECOVERY' },
          txn.provider
        );

        // Re-fetch updated state
        const { data: updated } = await supabase
          .from('transactions')
          .select('status, amount_paid, split_count')
          .eq('id', txn.id)
          .single();

        return res.json({
          reference: ref,
          status: updated?.status || result.txnStatus,
          amountPaid: updated?.amount_paid || verifyResult.amountPaid,
          amountRemaining: txn.amount - (updated?.amount_paid || verifyResult.amountPaid),
          splitCount: updated?.split_count || 0,
          expiresAt: txn.va_expires_at,
          selfHealed: true,
        });
      }
    } catch (verifyErr) {
      // Provider API down — return DB state as-is
      console.warn(`[Status] Provider verify failed for ${ref}:`, verifyErr);
    }

    // 3. Return current DB state
    const { data: splits } = await supabase
      .from('payment_splits')
      .select('split_amount, sender_name, created_at')
      .eq('transaction_id', txn.id)
      .order('created_at', { ascending: true });

    return res.json({
      reference: ref,
      status: txn.status,
      amountPaid: txn.amount_paid || 0,
      amountRemaining: txn.amount - (txn.amount_paid || 0),
      splitCount: txn.split_count || 0,
      expiresAt: txn.va_expires_at,
      splits: (splits || []).map((s: any) => ({
        amount: s.split_amount,
        senderName: s.sender_name,
        timestamp: s.created_at,
      })),
    });

  } catch (error: any) {
    console.error('[Status] Error:', error);
    return res.status(500).json({ error: error.message || 'Server Error' });
  }
}
