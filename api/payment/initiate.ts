import { paymentService } from '../../src/services/payment/CorePaymentService';
import { PaymentIntentRequest } from '../../src/services/payment/types';
import { getServerSupabase } from '../../src/lib/supabase-server';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { orderId, method, customerName, customerEmail } = req.body;

    if (!orderId || !method) {
      return res.status(400).json({ error: 'orderId and method are required.' });
    }

    const supabase = getServerSupabase();

    // SERVER-SIDE AMOUNT VALIDATION — never trust the client
    const { data: order, error: orderErr } = await supabase
      .from('orders')
      .select('id, total_price, status, customer_id')
      .eq('id', orderId)
      .single();

    if (orderErr || !order) {
      return res.status(404).json({ error: 'Order not found.' });
    }

    if (order.status !== 'ACCEPTED' && order.status !== 'PENDING') {
      return res.status(400).json({ error: `Order is not payable (status: ${order.status}).` });
    }

    const paymentReq: PaymentIntentRequest = {
      orderId: order.id,
      amount: order.total_price,  // Use server-side amount
      currency: 'NGN',
      customerName: customerName || 'Customer',
      customerEmail: customerEmail || '',
      method,
    };

    const intentResponse = await paymentService.initiatePayment(paymentReq);
    
    return res.status(200).json(intentResponse);
  } catch (error: any) {
    console.error('Payment Initialization Error:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
