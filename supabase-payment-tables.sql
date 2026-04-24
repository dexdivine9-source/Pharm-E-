-- ========================================================================================
-- PHARMA-E PAYMENT SYSTEM: SUPABASE SCHEMA MIGRATION
-- ========================================================================================
-- Run this migration AFTER the base schema (supabase-rls.sql) is in place.
-- Requires: orders table to already exist.
-- ========================================================================================

-- ==========================================
-- 1. TRANSACTIONS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS transactions (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id          UUID NOT NULL REFERENCES orders(id),
  reference         TEXT UNIQUE NOT NULL,          -- MNY_1713913200000_abc123 or PSTK_...
  provider          TEXT NOT NULL DEFAULT 'MONNIFY', -- MONNIFY | PAYSTACK
  amount            NUMERIC(12,2) NOT NULL,
  amount_paid       NUMERIC(12,2) DEFAULT 0,
  currency          TEXT DEFAULT 'NGN',
  status            TEXT NOT NULL DEFAULT 'INITIATED',
    -- INITIATED | PENDING_TRANSFER | PENDING_CARD | PARTIAL | PROCESSING
    -- | COMPLETED | FAILED | EXPIRED | EXPIRED_PARTIAL | SUSPENDED | REGENERATED | CANCELLED
  payment_method    TEXT DEFAULT 'BANK_TRANSFER',  -- BANK_TRANSFER | CARD
  version           INT DEFAULT 0,                 -- optimistic concurrency counter

  -- Virtual account details (Monnify-specific)
  va_account_number TEXT,
  va_account_name   TEXT,
  va_bank_name      TEXT,
  va_expires_at     TIMESTAMPTZ,

  -- Provider references
  provider_txn_ref  TEXT,            -- Monnify's transactionReference or Paystack's reference

  -- Paystack-specific
  checkout_url      TEXT,
  access_code       TEXT,

  -- Split tracking
  split_count       INT DEFAULT 0,
  last_split_at     TIMESTAMPTZ,

  -- Metadata
  customer_email    TEXT,
  customer_name     TEXT,
  webhook_raw       JSONB,
  verified_at       TIMESTAMPTZ,
  completed_at      TIMESTAMPTZ,
  created_at        TIMESTAMPTZ DEFAULT now(),
  updated_at        TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_transactions_order ON transactions(order_id);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_provider_ref ON transactions(provider_txn_ref);
CREATE INDEX idx_transactions_expiry ON transactions(va_expires_at) WHERE status IN ('PENDING_TRANSFER', 'PARTIAL');

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transactions"
ON transactions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM orders WHERE orders.id = transactions.order_id
    AND orders.customer_id = auth.uid()
  )
);


-- ==========================================
-- 2. PAYMENT SPLITS TABLE (Individual Transfers)
-- ==========================================
CREATE TABLE IF NOT EXISTS payment_splits (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id    UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
  order_id          UUID NOT NULL REFERENCES orders(id),

  split_amount      NUMERIC(12,2) NOT NULL,
  cumulative_total  NUMERIC(12,2) NOT NULL,

  sender_bank       TEXT,
  sender_account    TEXT,
  sender_name       TEXT,

  monnify_ref       TEXT,
  webhook_payload   JSONB NOT NULL,

  created_at        TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_splits_txn ON payment_splits(transaction_id);
CREATE INDEX idx_splits_order ON payment_splits(order_id);

ALTER TABLE payment_splits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own payment splits"
ON payment_splits FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM orders WHERE orders.id = payment_splits.order_id
    AND orders.customer_id = auth.uid()
  )
);


-- ==========================================
-- 3. PAYMENT SESSIONS TABLE (Checkout State)
-- ==========================================
CREATE TABLE IF NOT EXISTS payment_sessions (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id          UUID NOT NULL REFERENCES orders(id),
  customer_id       UUID NOT NULL,

  active_provider   TEXT,               -- MONNIFY | PAYSTACK | null
  active_txn_id     UUID REFERENCES transactions(id),

  payment_lock      BOOLEAN DEFAULT false,
  locked_at         TIMESTAMPTZ,
  lock_provider     TEXT,

  attempt_count     INT DEFAULT 0,
  switch_count      INT DEFAULT 0,
  max_switches      INT DEFAULT 3,

  status            TEXT DEFAULT 'ACTIVE',
    -- ACTIVE | COMPLETED | ABANDONED | LOCKED

  created_at        TIMESTAMPTZ DEFAULT now(),
  updated_at        TIMESTAMPTZ DEFAULT now(),
  expires_at        TIMESTAMPTZ
);

CREATE UNIQUE INDEX idx_session_active_order
  ON payment_sessions(order_id) WHERE status = 'ACTIVE';

ALTER TABLE payment_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own payment sessions"
ON payment_sessions FOR SELECT
USING (customer_id = auth.uid());


-- ==========================================
-- 4. REFUNDS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS refunds (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id      UUID NOT NULL REFERENCES transactions(id),
  order_id            UUID NOT NULL REFERENCES orders(id),

  order_amount        NUMERIC(12,2) NOT NULL,
  amount_paid         NUMERIC(12,2) NOT NULL,
  excess_amount       NUMERIC(12,2) NOT NULL,

  customer_email      TEXT NOT NULL,
  customer_name       TEXT,

  refund_bank_code    TEXT,
  refund_bank_name    TEXT,
  refund_account      TEXT,
  refund_account_name TEXT,

  status              TEXT NOT NULL DEFAULT 'PENDING_REVIEW',
    -- PENDING_REVIEW | APPROVED | PROCESSING | COMPLETED | FAILED | REJECTED
  source              TEXT NOT NULL DEFAULT 'AUTO_DETECTED',
    -- AUTO_DETECTED | PARTIAL_EXPIRY | GATEWAY_SWITCH | MANUAL_ENTRY | CUSTOMER_REQUEST

  reviewed_by         TEXT,
  reviewed_at         TIMESTAMPTZ,
  review_notes        TEXT,
  rejection_reason    TEXT,

  disbursement_ref    TEXT,
  disbursement_status TEXT,
  disbursement_error  TEXT,
  retry_count         INT DEFAULT 0,
  max_retries         INT DEFAULT 3,
  last_retry_at       TIMESTAMPTZ,

  created_at          TIMESTAMPTZ DEFAULT now(),
  updated_at          TIMESTAMPTZ DEFAULT now(),
  completed_at        TIMESTAMPTZ
);

CREATE INDEX idx_refunds_status ON refunds(status);
CREATE INDEX idx_refunds_order ON refunds(order_id);

ALTER TABLE refunds ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own refunds"
ON refunds FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM orders WHERE orders.id = refunds.order_id
    AND orders.customer_id = auth.uid()
  )
);


-- ==========================================
-- 5. GHOST PAYMENTS TABLE (Post-Expiry Quarantine)
-- ==========================================
CREATE TABLE IF NOT EXISTS ghost_payments (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  original_txn_id   UUID REFERENCES transactions(id),
  original_txn_ref  TEXT NOT NULL,
  order_id          UUID REFERENCES orders(id),
  amount_received   NUMERIC(12,2) NOT NULL,
  customer_email    TEXT,
  webhook_payload   JSONB NOT NULL,

  status            TEXT DEFAULT 'QUARANTINED',
    -- QUARANTINED | APPLIED_TO_NEW | REFUNDED | RESOLVED
  resolution_notes  TEXT,
  resolved_by       TEXT,
  resolved_at       TIMESTAMPTZ,

  created_at        TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE ghost_payments ENABLE ROW LEVEL SECURITY;


-- ==========================================
-- 6. ADMIN NOTIFICATIONS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS admin_notifications (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type        TEXT NOT NULL,          -- OVERPAYMENT | PARTIAL_EXPIRY | GHOST_PAYMENT | FRAUD_ALERT
  severity    TEXT DEFAULT 'MEDIUM',  -- LOW | MEDIUM | HIGH | CRITICAL
  title       TEXT NOT NULL,
  body        TEXT,
  metadata    JSONB,
  read        BOOLEAN DEFAULT false,
  read_at     TIMESTAMPTZ,
  created_at  TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE admin_notifications ENABLE ROW LEVEL SECURITY;


-- ==========================================
-- 7. ALTER ORDERS TABLE (Add payment columns)
-- ==========================================
-- Note: Only run if columns don't already exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'payment_status'
  ) THEN
    ALTER TABLE orders ADD COLUMN payment_status TEXT DEFAULT 'UNPAID';
    ALTER TABLE orders ADD COLUMN amount_paid NUMERIC(12,2) DEFAULT 0;
  END IF;
END $$;


-- ==========================================
-- 8. RPC FUNCTIONS
-- ==========================================

-- Atomic state transition with optimistic concurrency
CREATE OR REPLACE FUNCTION transition_payment_state(
  p_txn_id UUID,
  p_expected_version INT,
  p_new_status TEXT,
  p_amount_paid NUMERIC DEFAULT NULL,
  p_split_count INT DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
  v_updated INT;
BEGIN
  UPDATE transactions SET
    status = p_new_status,
    version = p_expected_version + 1,
    amount_paid = COALESCE(p_amount_paid, amount_paid),
    split_count = COALESCE(p_split_count, split_count),
    updated_at = now(),
    completed_at = CASE WHEN p_new_status IN ('COMPLETED') THEN now() ELSE completed_at END,
    verified_at = CASE WHEN p_new_status IN ('COMPLETED', 'PROCESSING') THEN now() ELSE verified_at END
  WHERE id = p_txn_id AND version = p_expected_version;

  GET DIAGNOSTICS v_updated = ROW_COUNT;
  RETURN v_updated > 0;
END;
$$ LANGUAGE plpgsql;


-- Restore inventory on expiry/cancellation
CREATE OR REPLACE FUNCTION restore_inventory(
  p_pharmacy_id UUID,
  p_med_name TEXT,
  p_qty INT
) RETURNS VOID AS $$
BEGIN
  UPDATE inventory
  SET stock_level = stock_level + p_qty
  WHERE pharmacy_id = p_pharmacy_id AND med_name = p_med_name;
END;
$$ LANGUAGE plpgsql;


-- Acquire payment lock (atomic)
CREATE OR REPLACE FUNCTION acquire_payment_lock(
  p_order_id UUID,
  p_provider TEXT
) RETURNS BOOLEAN AS $$
DECLARE
  v_updated INT;
BEGIN
  UPDATE payment_sessions SET
    payment_lock = true,
    locked_at = now(),
    lock_provider = p_provider,
    updated_at = now()
  WHERE order_id = p_order_id
    AND status = 'ACTIVE'
    AND payment_lock = false;

  GET DIAGNOSTICS v_updated = ROW_COUNT;
  RETURN v_updated > 0;
END;
$$ LANGUAGE plpgsql;


-- Release payment lock
CREATE OR REPLACE FUNCTION release_payment_lock(
  p_order_id UUID
) RETURNS VOID AS $$
BEGIN
  UPDATE payment_sessions SET
    payment_lock = false,
    locked_at = NULL,
    lock_provider = NULL,
    updated_at = now()
  WHERE order_id = p_order_id;
END;
$$ LANGUAGE plpgsql;
