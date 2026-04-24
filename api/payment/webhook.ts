import { paymentService } from '../../src/services/payment/CorePaymentService';

/* 
 * Required for providers like Paystack/Monnify that require the EXACT raw body string
 * for HMAC SHA512 signature computation.
 */
export const config = {
  api: {
    bodyParser: false,
  },
};

const getRawBody = async (req: any): Promise<string> => {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk: any) => { body += chunk.toString(); });
    req.on('end', () => { resolve(body); });
    req.on('error', reject);
  });
};

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // RESPOND 200 IMMEDIATELY — Monnify/Paystack retry on timeout
  res.status(200).json({ message: 'Webhook received' });

  try {
    // Determine provider from query param (e.g. /api/payment/webhook?provider=MONNIFY)
    const provider = String(req.query.provider || '').toUpperCase();
    
    const rawBodyData = await getRawBody(req);
    const payload = JSON.parse(rawBodyData);
    
    let signature = '';
    if (provider === 'MONNIFY') {
      signature = req.headers['monnify-signature'] as string;
    } else if (provider === 'PAYSTACK') {
      signature = req.headers['x-paystack-signature'] as string;
    }
    
    if (!provider || !signature) {
      console.error('[Webhook] Missing provider or signature');
      return;
    }

    // Process webhook — validates signature, double-verifies, reconciles via FSM
    const result = await paymentService.processWebhook(provider, payload, signature);
    console.log(`[Webhook] Result: ${result.action} (${result.txnStatus})`);

  } catch (error: any) {
    // Already responded 200 — log error but don't send another response
    console.error('[Webhook] Processing Error:', error.message || error);
  }
}
