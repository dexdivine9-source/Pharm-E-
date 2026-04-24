// ========================================================================================
// PHARMA-E PAYMENT TYPES — Canonical Type Definitions
// ========================================================================================

// ─── Payment Methods ────────────────────────────────────────────────────────────
export type PaymentMethod = 'BANK_TRANSFER' | 'CARD';

// ─── Canonical Payment States (State Machine) ──────────────────────────────────
export type TransactionStatus =
  | 'INITIATED'
  | 'PENDING_TRANSFER'
  | 'PENDING_CARD'
  | 'PARTIAL'
  | 'PROCESSING'
  | 'COMPLETED'
  | 'FAILED'
  | 'EXPIRED'
  | 'EXPIRED_PARTIAL'
  | 'SUSPENDED'
  | 'REGENERATED'
  | 'CANCELLED';

// Backward-compatible alias for provider verification responses
export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED';

// Order-level payment tracking
export type OrderPaymentStatus =
  | 'UNPAID'
  | 'PARTIAL'
  | 'PAID'
  | 'OVERPAID'
  | 'REFUND_PENDING';

// ─── Request / Response Interfaces ─────────────────────────────────────────────

export interface PaymentIntentRequest {
  orderId: string;
  amount: number;
  currency?: string;
  customerName: string;
  customerEmail: string;
  method: PaymentMethod;
}

export interface PaymentIntentResponse {
  provider: string;
  reference: string;
  status: TransactionStatus;

  // Paystack (Card) — checkout URL / access code
  checkoutUrl?: string;
  accessCode?: string;

  // Monnify (Bank Transfer) — virtual account details
  virtualAccount?: {
    accountNumber: string;
    accountName: string;
    bankName: string;
    expiresAt?: string;
  };
}

// ─── Webhook Event ─────────────────────────────────────────────────────────────

export interface WebhookEvent {
  provider: string;
  status: PaymentStatus;
  transactionReference: string;
  amountPaid: number;
  rawPayload: any;
}

// ─── Detailed Verify Result ────────────────────────────────────────────────────

export interface VerifyResult {
  status: PaymentStatus;
  amountPaid: number;
  totalPayable: number;
}

// ─── Payment Split (Individual Transfer Log) ───────────────────────────────────

export interface PaymentSplit {
  amount: number;
  senderName?: string;
  senderBank?: string;
  timestamp: string;
}

// ─── Reconciliation Result ─────────────────────────────────────────────────────

export interface ReconcileResult {
  action: string;
  txnStatus: TransactionStatus;
  changed: boolean;
}

// ─── Gateway Interface ─────────────────────────────────────────────────────────

export interface IPaymentGateway {
  getProviderName(): string;
  initializePayment(req: PaymentIntentRequest): Promise<PaymentIntentResponse>;
  verifyTransaction(transactionRef: string): Promise<PaymentStatus>;
  verifyTransactionDetailed(transactionRef: string): Promise<VerifyResult>;
  parseAndValidateWebhook(payload: any, signature: string): WebhookEvent;
}

// ─── Database Row Types (Supabase) ─────────────────────────────────────────────

export interface TransactionRow {
  id: string;
  order_id: string;
  reference: string;
  provider: string;
  amount: number;
  amount_paid: number;
  currency: string;
  status: TransactionStatus;
  payment_method: string;
  version: number;
  va_account_number: string | null;
  va_account_name: string | null;
  va_bank_name: string | null;
  va_expires_at: string | null;
  provider_txn_ref: string | null;
  checkout_url: string | null;
  access_code: string | null;
  split_count: number;
  last_split_at: string | null;
  customer_email: string | null;
  customer_name: string | null;
  webhook_raw: any;
  verified_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface PaymentSessionRow {
  id: string;
  order_id: string;
  customer_id: string;
  active_provider: string | null;
  active_txn_id: string | null;
  payment_lock: boolean;
  locked_at: string | null;
  lock_provider: string | null;
  attempt_count: number;
  switch_count: number;
  max_switches: number;
  status: string;
  created_at: string;
  updated_at: string;
  expires_at: string | null;
}
