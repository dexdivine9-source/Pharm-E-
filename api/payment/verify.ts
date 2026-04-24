// ========================================================================================
// PAYMENT VERIFY ENDPOINT — Instant card payment confirmation
// ========================================================================================
// Called by frontend after Paystack callback for immediate server-to-server verification.
// Also serves as manual verification trigger for any provider.
// ========================================================================================

import { paymentService } from '../../src/services/payment/CorePaymentService';
import { getServerSupabase } from '../../src/lib/supabase-server';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { reference } = req.body;

    if (!reference) {
      return res.status(400).json({ error: 'reference is required.' });
    }

    const supabase = getServerSupabase();

    // 1. Find the transaction
    const { data: txn } = await supabase
      .from('transactions')
      .select('*')
      .eq('reference', reference)
      .single();

    if (!txn) {
      return res.status(404).json({ error: 'Transaction not found.' });
    }

    // 2. If already completed, return immediately
    if (txn.status === 'COMPLETED') {
      return res.json({
        status: 'COMPLETED',
        orderId: txn.order_id,
        amountPaid: txn.amount_paid,
        message: 'Payment already confirmed.',
      });
    }

    // 3. Get adapter and verify
    const adapter = paymentService.getAdapter(txn.provider);
    if (!adapter) {
      return res.status(500).json({ error: `Unknown provider: ${txn.provider}` });
    }

    const providerRef = txn.provider_txn_ref || txn.reference;
    const verifyResult = await adapter.verifyTransactionDetailed(providerRef);

    // 4. If provider confirms payment, reconcile
    if (verifyResult.status === 'SUCCESS' || verifyResult.amountPaid > (txn.amount_paid || 0)) {
      const result = await paymentService.reconcilePayment(
        providerRef,
        verifyResult,
        { source: 'VERIFY_ENDPOINT' },
        txn.provider
      );

      return res.json({
        status: result.txnStatus,
        orderId: txn.order_id,
        amountPaid: verifyResult.amountPaid,
        action: result.action,
      });
    }

    // 5. Not yet paid
    return res.json({
      status: txn.status,
      orderId: txn.order_id,
      amountPaid: txn.amount_paid || 0,
      providerStatus: verifyResult.status,
    });

  } catch (error: any) {
    console.error('[Verify] Error:', error);
    return res.status(500).json({ error: error.message || 'Server Error' });
  }
}
