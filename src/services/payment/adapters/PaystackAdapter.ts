import { IPaymentGateway, PaymentIntentRequest, PaymentIntentResponse, PaymentStatus, VerifyResult, WebhookEvent } from '../types';
import crypto from 'crypto';

export class PaystackAdapter implements IPaymentGateway {
  private secretKey: string;
  private baseUrl: string = 'https://api.paystack.co';

  constructor() {
    this.secretKey = process.env.PAYSTACK_SECRET_KEY || '';
  }

  getProviderName(): string {
    return 'PAYSTACK';
  }

  getSecretKey(): string {
    return this.secretKey;
  }

  async initializePayment(req: PaymentIntentRequest): Promise<PaymentIntentResponse> {
    const reference = `PSTK_${Date.now()}_${req.orderId}`;
    
    // Paystack amounts are in kobo (base currency * 100)
    const amountInKobo = Math.round(req.amount * 100);

    const response = await fetch(`${this.baseUrl}/transaction/initialize`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.secretKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: req.customerEmail,
        amount: amountInKobo,
        reference: reference,
        currency: req.currency || "NGN",
        metadata: {
          custom_fields: [
            {
              display_name: 'Customer Name',
              variable_name: 'customer_name',
              value: req.customerName
            },
            {
              display_name: 'Order ID',
              variable_name: 'order_id',
              value: req.orderId
            }
          ]
        }
      })
    });

    const data = await response.json();
    
    if (!data.status) {
      throw new Error(`Paystack Init Failed: ${data.message}`);
    }

    return {
      provider: this.getProviderName(),
      reference: data.data.reference,
      status: 'INITIATED',
      checkoutUrl: data.data.authorization_url,
      accessCode: data.data.access_code
    };
  }

  async verifyTransaction(transactionRef: string): Promise<PaymentStatus> {
    const result = await this.verifyTransactionDetailed(transactionRef);
    return result.status;
  }

  async verifyTransactionDetailed(transactionRef: string): Promise<VerifyResult> {
    const response = await fetch(`${this.baseUrl}/transaction/verify/${encodeURIComponent(transactionRef)}`, {
      headers: {
        'Authorization': `Bearer ${this.secretKey}`
      }
    });

    const data = await response.json();
    if (!data.status) {
      return { status: 'FAILED', amountPaid: 0, totalPayable: 0 };
    }

    const paystackStatus = data.data.status;
    let status: PaymentStatus = 'PENDING';
    if (paystackStatus === 'success') status = 'SUCCESS';
    else if (paystackStatus === 'abandoned' || paystackStatus === 'failed') status = 'FAILED';

    return {
      status,
      // Paystack amount is in kobo, convert back to main currency
      amountPaid: (data.data.amount || 0) / 100,
      totalPayable: (data.data.requested_amount || data.data.amount || 0) / 100,
    };
  }

  parseAndValidateWebhook(payload: any, signature: string): WebhookEvent {
    // Paystack computes signature using HMAC SHA512 of stringified payload against secret key
    const payloadString = JSON.stringify(payload);
    const expectedSignature = crypto
      .createHmac('sha512', this.secretKey)
      .update(payloadString)
      .digest('hex');

    if (expectedSignature !== signature) {
      throw new Error('Invalid Paystack Webhook Signature');
    }

    let status: PaymentStatus = 'PENDING';
    if (payload.event === 'charge.success') status = 'SUCCESS';

    return {
      provider: this.getProviderName(),
      status,
      // Paystack stores the reference in data.reference
      transactionReference: payload.data.reference,
      // Paystack amount is in kobo, convert back to main currency
      amountPaid: payload.data.amount / 100,
      rawPayload: payload
    };
  }
}
