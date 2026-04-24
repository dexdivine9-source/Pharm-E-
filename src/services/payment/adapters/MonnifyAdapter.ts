import { IPaymentGateway, PaymentIntentRequest, PaymentIntentResponse, PaymentStatus, VerifyResult, WebhookEvent } from '../types';
import crypto from 'crypto';

// ─── Token Cache ───────────────────────────────────────────────────────────────
let cachedToken: string | null = null;
let tokenExpiresAt = 0;
const TOKEN_TTL_MS = 50 * 60 * 1000; // Cache for 50 minutes (tokens expire at 60)

export class MonnifyAdapter implements IPaymentGateway {
  private apiKey: string;
  private secretKey: string;
  private contractCode: string;
  private baseUrl: string = 'https://sandbox.monnify.com'; // Use api.monnify.com for prod

  constructor() {
    // In a real Vercel/Node backend, use process.env
    this.apiKey = process.env.MONNIFY_API_KEY || '';
    this.secretKey = process.env.MONNIFY_SECRET_KEY || '';
    this.contractCode = process.env.MONNIFY_CONTRACT_CODE || '';
  }

  getProviderName(): string {
    return 'MONNIFY';
  }

  getSecretKey(): string {
    return this.secretKey;
  }

  async getAccessToken(): Promise<string> {
    // Return cached token if still valid
    if (cachedToken && Date.now() < tokenExpiresAt) {
      return cachedToken;
    }

    const auth = Buffer.from(`${this.apiKey}:${this.secretKey}`).toString('base64');
    const response = await fetch(`${this.baseUrl}/api/v1/auth/login/`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`
      }
    });
    
    if (!response.ok) throw new Error('Monnify Auth Failed');
    
    const data = await response.json();
    cachedToken = data.responseBody.accessToken;
    tokenExpiresAt = Date.now() + TOKEN_TTL_MS;
    return cachedToken!;
  }

  async initializePayment(req: PaymentIntentRequest): Promise<PaymentIntentResponse> {
    const token = await this.getAccessToken();
    const reference = `MNY_${Date.now()}_${req.orderId}`;
    
    // Initialize transaction explicitly requesting TRANSFER matching the architectural design
    const response = await fetch(`${this.baseUrl}/api/v1/merchant/transactions/init-transaction`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        amount: req.amount,
        customerName: req.customerName,
        customerEmail: req.customerEmail,
        paymentReference: reference,
        paymentDescription: `Payment for Order ${req.orderId}`,
        currencyCode: req.currency || "NGN",
        contractCode: this.contractCode,
        paymentMethods: ["ACCOUNT_TRANSFER"]
      })
    });

    const data = await response.json();
    
    if (!data.requestSuccessful) {
      throw new Error(`Monnify Init Failed: ${data.responseMessage}`);
    }

    // Monnify's init response contains the dynamic account details when configured correctly
    const body = data.responseBody;

    return {
      provider: this.getProviderName(),
      reference: body.transactionReference || reference,
      status: 'INITIATED',
      virtualAccount: {
        accountNumber: body.accountNumber || 'Pending Account',
        accountName: body.accountName || this.contractCode,
        bankName: body.bankName || 'Partner Bank',
        expiresAt: body.expiresOn || null,
      }
    };
  }

  async verifyTransaction(transactionRef: string): Promise<PaymentStatus> {
    const result = await this.verifyTransactionDetailed(transactionRef);
    return result.status;
  }

  async verifyTransactionDetailed(transactionRef: string): Promise<VerifyResult> {
    const token = await this.getAccessToken();
    const response = await fetch(`${this.baseUrl}/api/v2/transactions/${encodeURIComponent(transactionRef)}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();
    if (!data.requestSuccessful) {
      return { status: 'FAILED', amountPaid: 0, totalPayable: 0 };
    }

    const body = data.responseBody;
    const mnyStatus = body.paymentStatus;

    let status: PaymentStatus = 'PENDING';
    if (mnyStatus === 'PAID') status = 'SUCCESS';
    else if (mnyStatus === 'EXPIRED' || mnyStatus === 'CANCELLED' || mnyStatus === 'FAILED') status = 'FAILED';

    return {
      status,
      amountPaid: body.amountPaid || 0,
      totalPayable: body.amount || 0,
    };
  }

  parseAndValidateWebhook(payload: any, signature: string): WebhookEvent {
    // Monnify computes signature using HMAC SHA512 of stringified request body
    const payloadString = JSON.stringify(payload);
    const expectedSignature = crypto
      .createHmac('sha512', this.secretKey)
      .update(payloadString)
      .digest('hex');

    if (expectedSignature !== signature) {
      throw new Error('Invalid Monnify Webhook Signature');
    }

    let status: PaymentStatus = 'PENDING';
    if (payload.paymentStatus === 'PAID') status = 'SUCCESS';
    else if (payload.paymentStatus === 'FAILED') status = 'FAILED';

    return {
      provider: this.getProviderName(),
      status,
      transactionReference: payload.transactionReference,
      amountPaid: payload.amountPaid || 0,
      rawPayload: payload
    };
  }
}
