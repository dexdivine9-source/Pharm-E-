// ========================================================================================
// PHARMA-E PAYMENT STATE MACHINE — Pure Transition Function
// ========================================================================================
// This module has ZERO side effects. It only validates whether a given state transition
// is legal. All DB writes, API calls, and notifications happen in CorePaymentService.
// ========================================================================================

import { TransactionStatus } from './types';

// ─── Events ────────────────────────────────────────────────────────────────────

export type PaymentEvent =
  | 'MONNIFY_INIT_OK'
  | 'PAYSTACK_INIT_OK'
  | 'PROVIDER_INIT_FAIL'
  | 'PAYMENT_RECEIVED'      // full amount (or more) received
  | 'PARTIAL_RECEIVED'      // some amount received, less than total
  | 'CARD_CHARGED'          // Paystack callback success
  | 'CARD_DECLINED'         // Paystack declined / abandoned
  | 'VERIFY_CONFIRMED'      // double-verify returned PAID/success
  | 'VERIFY_REJECTED'       // double-verify mismatch (fraud)
  | 'TIMER_EXPIRED_CLEAN'   // VA expired, nothing received
  | 'TIMER_EXPIRED_PARTIAL' // VA expired, partial funds received
  | 'USER_RETRY'            // user retries after failure
  | 'USER_REGENERATE'       // user regenerates after expiry
  | 'SWITCH_GATEWAY'        // user switches payment method
  | 'REACTIVATE'            // user switches back, VA still alive
  | 'GHOST_WEBHOOK'         // webhook on frozen/expired txn
  | 'CANCEL';               // sibling txn cancelled on success of another

// ─── Context (for guard evaluation) ────────────────────────────────────────────

export interface TransitionContext {
  amount: number;
  amountPaid: number;
  vaExpiresAt: string | null;
  switchCount: number;
  maxSwitches: number;
  retryCount: number;
  maxRetries: number;
  paymentLock: boolean;
}

// ─── Transition Definition ─────────────────────────────────────────────────────

interface TransitionRule {
  to: TransactionStatus;
  guard?: (ctx: TransitionContext) => boolean;
}

// ─── Transition Map ────────────────────────────────────────────────────────────

const TRANSITIONS: Record<TransactionStatus, Partial<Record<PaymentEvent, TransitionRule>>> = {
  INITIATED: {
    MONNIFY_INIT_OK:    { to: 'PENDING_TRANSFER' },
    PAYSTACK_INIT_OK:   { to: 'PENDING_CARD' },
    PROVIDER_INIT_FAIL: { to: 'FAILED' },
  },

  PENDING_TRANSFER: {
    PAYMENT_RECEIVED:      { to: 'PROCESSING', guard: ctx => ctx.amountPaid >= ctx.amount },
    PARTIAL_RECEIVED:      { to: 'PARTIAL',    guard: ctx => ctx.amountPaid > 0 && ctx.amountPaid < ctx.amount },
    TIMER_EXPIRED_CLEAN:   { to: 'EXPIRED',    guard: ctx => ctx.amountPaid === 0 },
    SWITCH_GATEWAY:        { to: 'SUSPENDED',  guard: ctx => ctx.switchCount < ctx.maxSwitches && !ctx.paymentLock },
    CANCEL:                { to: 'CANCELLED' },
  },

  PENDING_CARD: {
    CARD_CHARGED:          { to: 'PROCESSING' },
    CARD_DECLINED:         { to: 'FAILED' },
    SWITCH_GATEWAY:        { to: 'SUSPENDED',  guard: ctx => ctx.switchCount < ctx.maxSwitches && !ctx.paymentLock },
    CANCEL:                { to: 'CANCELLED' },
  },

  PARTIAL: {
    PAYMENT_RECEIVED:      { to: 'PROCESSING', guard: ctx => ctx.amountPaid >= ctx.amount },
    PARTIAL_RECEIVED:      { to: 'PARTIAL',    guard: ctx => ctx.amountPaid > 0 && ctx.amountPaid < ctx.amount },
    TIMER_EXPIRED_PARTIAL: { to: 'EXPIRED_PARTIAL', guard: ctx => ctx.amountPaid > 0 },
    SWITCH_GATEWAY:        { to: 'SUSPENDED',  guard: ctx => ctx.switchCount < ctx.maxSwitches && !ctx.paymentLock },
    CANCEL:                { to: 'CANCELLED' },
  },

  PROCESSING: {
    VERIFY_CONFIRMED: { to: 'COMPLETED' },
    VERIFY_REJECTED:  { to: 'FAILED' },
  },

  COMPLETED: {
    // Terminal state — no outbound transitions
  },

  FAILED: {
    USER_RETRY:      { to: 'INITIATED', guard: ctx => ctx.retryCount < ctx.maxRetries },
    USER_REGENERATE: { to: 'INITIATED', guard: ctx => ctx.retryCount < ctx.maxRetries },
  },

  EXPIRED: {
    USER_REGENERATE: { to: 'INITIATED', guard: ctx => ctx.retryCount < ctx.maxRetries },
  },

  EXPIRED_PARTIAL: {
    USER_REGENERATE: { to: 'INITIATED', guard: ctx => ctx.retryCount < ctx.maxRetries },
  },

  SUSPENDED: {
    REACTIVATE:    { to: 'PENDING_TRANSFER' },
    GHOST_WEBHOOK: { to: 'SUSPENDED' },  // stays suspended (no-op)
    CANCEL:        { to: 'CANCELLED' },
  },

  REGENERATED: {
    // Terminal — replaced by new transaction
  },

  CANCELLED: {
    // Terminal — sibling cancelled on success of another
  },
};

// ─── Frozen States (webhooks should be quarantined) ────────────────────────────

const FROZEN_STATES: Set<TransactionStatus> = new Set([
  'EXPIRED', 'EXPIRED_PARTIAL', 'SUSPENDED', 'REGENERATED', 'CANCELLED', 'COMPLETED',
]);

// ─── Public API ────────────────────────────────────────────────────────────────

/**
 * Pure function: given current state + event + context, returns new state or null (illegal).
 * Does NOT perform any side effects.
 */
export function transition(
  current: TransactionStatus,
  event: PaymentEvent,
  ctx: TransitionContext
): TransactionStatus | null {
  const stateRules = TRANSITIONS[current];
  if (!stateRules) return null;

  const rule = stateRules[event];
  if (!rule) return null;

  // Evaluate guard condition
  if (rule.guard && !rule.guard(ctx)) return null;

  return rule.to;
}

/**
 * Check if a transaction in this state should quarantine incoming webhooks.
 */
export function isFrozenState(status: TransactionStatus): boolean {
  return FROZEN_STATES.has(status);
}

/**
 * Check if a state is terminal (no further transitions possible).
 */
export function isTerminalState(status: TransactionStatus): boolean {
  const stateRules = TRANSITIONS[status];
  return !stateRules || Object.keys(stateRules).length === 0;
}

/**
 * Get all valid events for a given state.
 */
export function getValidEvents(status: TransactionStatus): PaymentEvent[] {
  const stateRules = TRANSITIONS[status];
  if (!stateRules) return [];
  return Object.keys(stateRules) as PaymentEvent[];
}
