// ========================================================================================
// PHARMA-E: usePaymentSync Hook
// ========================================================================================
// Three-channel sync: Supabase Realtime (primary) → Polling (fallback) → Manual verify.
// Provides reactive payment state to any component that needs it.
// ========================================================================================

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import type { TransactionStatus, PaymentSplit } from '../../services/payment/types';

interface PaymentState {
  status: TransactionStatus;
  amountPaid: number;
  amountRemaining: number;
  splitCount: number;
  expiresAt: string | null;
  splits: PaymentSplit[];
  isLoading: boolean;
  error: string | null;
}

const POLL_INTERVAL_MS = 15_000;  // 15 seconds
const TERMINAL_STATES: TransactionStatus[] = ['COMPLETED', 'FAILED', 'EXPIRED', 'EXPIRED_PARTIAL', 'CANCELLED'];

export function usePaymentSync(reference: string | null) {
  const [state, setState] = useState<PaymentState>({
    status: 'INITIATED',
    amountPaid: 0,
    amountRemaining: 0,
    splitCount: 0,
    expiresAt: null,
    splits: [],
    isLoading: true,
    error: null,
  });

  const isTerminal = TERMINAL_STATES.includes(state.status);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ─── Fetch from polling endpoint ────────────────────────────────────────────
  const fetchStatus = useCallback(async () => {
    if (!reference) return;

    try {
      const res = await fetch(`/api/payment/status/${encodeURIComponent(reference)}`);
      if (!res.ok) throw new Error('Status fetch failed');

      const data = await res.json();
      setState(prev => ({
        ...prev,
        status: data.status,
        amountPaid: data.amountPaid || 0,
        amountRemaining: data.amountRemaining || 0,
        splitCount: data.splitCount || 0,
        expiresAt: data.expiresAt || null,
        splits: data.splits || [],
        isLoading: false,
        error: null,
      }));
    } catch (err: any) {
      setState(prev => ({ ...prev, isLoading: false, error: err.message }));
    }
  }, [reference]);

  // ─── Manual verify trigger (for card payments) ──────────────────────────────
  const verifyPayment = useCallback(async () => {
    if (!reference) return;

    setState(prev => ({ ...prev, isLoading: true }));
    try {
      const res = await fetch('/api/payment/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reference }),
      });
      const data = await res.json();
      setState(prev => ({
        ...prev,
        status: data.status,
        amountPaid: data.amountPaid || prev.amountPaid,
        isLoading: false,
      }));
      return data;
    } catch (err: any) {
      setState(prev => ({ ...prev, isLoading: false, error: err.message }));
      return null;
    }
  }, [reference]);

  // ─── Channel 1: Supabase Realtime ───────────────────────────────────────────
  useEffect(() => {
    if (!reference || isTerminal) return;

    const channel = supabase
      .channel(`payment:${reference}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'transactions',
        filter: `reference=eq.${reference}`,
      }, (payload: any) => {
        const newRow = payload.new;
        setState(prev => ({
          ...prev,
          status: newRow.status,
          amountPaid: newRow.amount_paid || 0,
          splitCount: newRow.split_count || 0,
          isLoading: false,
        }));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [reference, isTerminal]);

  // ─── Channel 2: Polling fallback ────────────────────────────────────────────
  useEffect(() => {
    if (!reference || isTerminal) {
      if (pollRef.current) clearInterval(pollRef.current);
      return;
    }

    // Initial fetch
    fetchStatus();

    // Start polling
    pollRef.current = setInterval(fetchStatus, POLL_INTERVAL_MS);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [reference, isTerminal, fetchStatus]);

  return {
    ...state,
    isTerminal,
    isCompleted: state.status === 'COMPLETED',
    isFailed: state.status === 'FAILED',
    isExpired: state.status === 'EXPIRED' || state.status === 'EXPIRED_PARTIAL',
    isPartial: state.status === 'PARTIAL',
    verifyPayment,
    refetch: fetchStatus,
  };
}
