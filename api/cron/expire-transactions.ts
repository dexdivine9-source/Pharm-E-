// ========================================================================================
// TRANSACTION EXPIRY CRON JOB — Sweeps stale transactions every 2 minutes
// ========================================================================================
// Vercel Cron: */2 * * * * (requires Pro plan)
// For Hobby plan: use external cron service to hit this endpoint.
// ========================================================================================

import { getServerSupabase } from '../../src/lib/supabase-server';
import { TransactionStatus } from '../../src/services/payment/types';

export default async function handler(req: any, res: any) {
  // Verify cron authorization
  const authHeader = req.headers.authorization;
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const supabase = getServerSupabase();
  const now = new Date().toISOString();
  const results = { expiredClean: 0, expiredPartial: 0, errors: 0 };

  try {
    // 1. Fetch all expired transactions (PENDING_TRANSFER or PARTIAL with passed VA expiry)
    const { data: expired, error } = await supabase
      .from('transactions')
      .select('id, order_id, reference, status, amount, amount_paid, customer_email, customer_name')
      .in('status', ['PENDING_TRANSFER', 'PARTIAL'])
      .lt('va_expires_at', now);

    if (error) {
      console.error('[Cron] Query error:', error);
      return res.status(500).json({ error: 'Query failed' });
    }

    if (!expired || expired.length === 0) {
      return res.status(200).json({ message: 'No expired transactions.', results });
    }

    for (const txn of expired) {
      try {
        const amountPaid = txn.amount_paid || 0;

        if (amountPaid === 0) {
          // ── CLEAN EXPIRY ── (no money received)
          await supabase.from('transactions').update({
            status: 'EXPIRED' as TransactionStatus,
            updated_at: now,
          }).eq('id', txn.id);

          // Reset order to re-payable state
          await supabase.from('orders').update({
            payment_status: 'UNPAID',
          }).eq('id', txn.order_id);

          results.expiredClean++;

        } else {
          // ── PARTIAL EXPIRY ── (some money received, needs refund)
          await supabase.from('transactions').update({
            status: 'EXPIRED_PARTIAL' as TransactionStatus,
            updated_at: now,
          }).eq('id', txn.id);

          // Queue refund for partial amount
          await supabase.from('refunds').insert({
            transaction_id: txn.id,
            order_id: txn.order_id,
            customer_email: txn.customer_email || '',
            customer_name: txn.customer_name,
            order_amount: txn.amount,
            amount_paid: amountPaid,
            excess_amount: amountPaid,  // refund everything
            status: 'PENDING_REVIEW',
            source: 'PARTIAL_EXPIRY',
          });

          // Notify admin
          await supabase.from('admin_notifications').insert({
            type: 'PARTIAL_EXPIRY',
            severity: 'HIGH',
            title: `Partial expiry: ₦${amountPaid.toLocaleString()} on Order ${txn.order_id}`,
            body: `Transaction ${txn.reference} expired with ₦${amountPaid} of ₦${txn.amount}. Refund queued.`,
            metadata: { txnId: txn.id, orderId: txn.order_id, amountPaid },
          });

          // Reset order
          await supabase.from('orders').update({
            payment_status: 'REFUND_PENDING',
          }).eq('id', txn.order_id);

          results.expiredPartial++;
        }
      } catch (err) {
        console.error(`[Cron] Failed to expire txn ${txn.id}:`, err);
        results.errors++;
      }
    }

    console.log('[Cron] Expiry sweep complete:', results);
    return res.status(200).json({ message: 'Sweep complete.', results });

  } catch (error: any) {
    console.error('[Cron] Fatal error:', error);
    return res.status(500).json({ error: error.message || 'Cron failed' });
  }
}
