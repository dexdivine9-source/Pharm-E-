// ========================================================================================
// PAYMENT REGENERATION ENDPOINT — Generate new virtual account after expiry
// ========================================================================================

import { paymentService } from '../../src/services/payment/CorePaymentService';
import { getServerSupabase } from '../../src/lib/supabase-server';
import { TransactionStatus } from '../../src/services/payment/types';

const MAX_REGENERATIONS = 3;

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({ error: 'orderId is required.' });
    }

    const supabase = getServerSupabase();

    // 1. Validate order is in re-payable state
    const { data: order } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .in('status', ['ACCEPTED', 'PENDING'])
      .in('payment_status', ['UNPAID', 'REFUND_PENDING', null])
      .single();

    if (!order) {
      return res.status(400).json({ error: 'Order is not eligible for payment regeneration.' });
    }

    // 2. Count previous attempts
    const { count } = await supabase
      .from('transactions')
      .select('*', { count: 'exact', head: true })
      .eq('order_id', orderId);

    if ((count || 0) >= MAX_REGENERATIONS + 1) {
      return res.status(429).json({
        error: `Maximum regeneration attempts (${MAX_REGENERATIONS}) reached. Contact support.`,
        regenerationCount: count,
        maxRegenerations: MAX_REGENERATIONS,
      });
    }

    // 3. Mark any existing EXPIRED transactions as REGENERATED
    await supabase
      .from('transactions')
      .update({
        status: 'REGENERATED' as TransactionStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('order_id', orderId)
      .in('status', ['EXPIRED', 'EXPIRED_PARTIAL']);

    // 4. Get customer info
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, email')
      .eq('id', order.customer_id)
      .single();

    // 5. Create new Monnify transaction
    const intentResponse = await paymentService.initiatePayment({
      orderId: order.id,
      amount: order.total_price,
      customerName: profile?.full_name || 'Customer',
      customerEmail: profile?.email || '',
      method: 'BANK_TRANSFER',
      currency: 'NGN',
    });

    return res.status(200).json({
      ...intentResponse,
      regenerationCount: (count || 0),
      maxRegenerations: MAX_REGENERATIONS,
    });

  } catch (error: any) {
    console.error('[Regenerate] Error:', error);
    return res.status(500).json({ error: error.message || 'Server Error' });
  }
}
