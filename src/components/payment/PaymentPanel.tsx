// ========================================================================================
// PHARMA-E: PaymentPanel Component
// ========================================================================================
// Radio-card payment interface: Bank Transfer (Monnify) ↔ Card (Paystack)
// Features: conversion-focused selection, inline expansion, countdown timer, copy account number, 
// progress bar, split history, gateway switching, expiry handling, and regeneration.
// ========================================================================================

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Building2,
  CreditCard,
  Copy,
  Check,
  Clock,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ArrowLeftRight,
  Loader2,
  Ban,
  ChevronDown,
  Lock
} from 'lucide-react';
import { usePaymentSync } from '../../hooks/payment/usePaymentSync';

// ─── Types ─────────────────────────────────────────────────────────────────────

interface PaymentPanelProps {
  orderId: string;
  orderAmount: number;
  customerName: string;
  customerEmail: string;
  onPaymentComplete: (orderId: string) => void;
  onCancel: () => void;
}

type PaymentMethod = 'bank' | 'card';

interface VirtualAccount {
  accountNumber: string;
  accountName: string;
  bankName: string;
  expiresAt?: string;
}

// ─── Component ─────────────────────────────────────────────────────────────────

export default function PaymentPanel({
  orderId,
  orderAmount,
  customerName,
  customerEmail,
  onPaymentComplete,
  onCancel,
}: PaymentPanelProps) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('bank');
  const [hasInitiated, setHasInitiated] = useState(false);
  const [activeTab, setActiveTab] = useState<PaymentMethod>('bank');
  const [reference, setReference] = useState<string | null>(null);
  const [virtualAccount, setVirtualAccount] = useState<VirtualAccount | null>(null);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [switchCount, setSwitchCount] = useState(0);
  const [maxSwitches] = useState(3);
  const [showSplits, setShowSplits] = useState(false);

  // Calculate dynamic savings for Bank Transfer vs Card
  const savingsAmount = useMemo(() => {
    // Paystack fee ~1.5%, Monnify fee ~0.5%. Cap at reasonable amounts if needed.
    const cardFee = Math.round(orderAmount * 0.015);
    const transferFee = Math.round(orderAmount * 0.005);
    return cardFee - transferFee;
  }, [orderAmount]);

  // Realtime payment sync
  const payment = usePaymentSync(reference);

  // Auto-navigate on completion
  useEffect(() => {
    if (payment.isCompleted) {
      onPaymentComplete(orderId);
    }
  }, [payment.isCompleted, orderId, onPaymentComplete]);

  // ─── Initialize Payment ──────────────────────────────────────────────────

  const initPayment = useCallback(async (method: 'BANK_TRANSFER' | 'CARD') => {
    setIsInitializing(true);
    setError(null);

    try {
      const res = await fetch('/api/payment/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          method,
          customerName,
          customerEmail,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Payment initialization failed.');
      }

      setReference(data.reference);

      if (data.virtualAccount) {
        setVirtualAccount(data.virtualAccount);
        setActiveTab('bank');
      }
      if (data.checkoutUrl) {
        setCheckoutUrl(data.checkoutUrl);
        setActiveTab('card');
      }
      setHasInitiated(true);
    } catch (err: any) {
      setError(err.message || 'Failed to initialize payment.');
    } finally {
      setIsInitializing(false);
    }
  }, [orderId, customerName, customerEmail]);

  // ─── Switch Gateway ──────────────────────────────────────────────────────

  const handleSwitch = async (targetMethod: 'BANK_TRANSFER' | 'CARD') => {
    if (isSwitching || payment.isLoading) return;
    setIsSwitching(true);
    setError(null);

    try {
      const res = await fetch('/api/payment/switch-gateway', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, targetMethod }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Gateway switch failed.');
      }

      setReference(data.reference);
      setSwitchCount(data.switchCount || switchCount + 1);

      if (data.virtualAccount) {
        setVirtualAccount(data.virtualAccount);
        setCheckoutUrl(null);
        setActiveTab('bank');
        setSelectedMethod('bank');
      }
      if (data.checkoutUrl) {
        setCheckoutUrl(data.checkoutUrl);
        setVirtualAccount(null);
        setActiveTab('card');
        setSelectedMethod('card');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to switch payment method.');
    } finally {
      setIsSwitching(false);
    }
  };

  // ─── Regenerate (After Expiry) ───────────────────────────────────────────

  const handleRegenerate = async () => {
    setIsInitializing(true);
    setError(null);

    try {
      const res = await fetch('/api/payment/regenerate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Regeneration failed.');

      setReference(data.reference);
      if (data.virtualAccount) {
        setVirtualAccount(data.virtualAccount);
        setActiveTab('bank');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to generate new account.');
    } finally {
      setIsInitializing(false);
    }
  };

  // ─── Verify Card Payment ────────────────────────────────────────────────

  const handleCardPayment = () => {
    if (checkoutUrl) {
      // Open Paystack checkout in new window
      const popup = window.open(checkoutUrl, '_blank', 'width=500,height=700');

      // Poll for completion after user returns
      const pollInterval = setInterval(async () => {
        if (popup?.closed) {
          clearInterval(pollInterval);
          if (reference) {
            await payment.verifyPayment();
          }
        }
      }, 1000);
    }
  };

  // ─── Copy Account Number ────────────────────────────────────────────────

  const copyAccountNumber = () => {
    if (virtualAccount?.accountNumber) {
      navigator.clipboard.writeText(virtualAccount.accountNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleContinue = () => {
    initPayment(selectedMethod === 'bank' ? 'BANK_TRANSFER' : 'CARD');
  };

  // ─── Countdown Timer ────────────────────────────────────────────────────

  const expiresAt = virtualAccount?.expiresAt || payment.expiresAt;
  const timeRemaining = useCountdown(expiresAt);
  const progressPercent = useMemo(() => {
    if (!expiresAt) return 100;
    const totalMs = 60 * 60 * 1000; // assume 60 min window
    const remaining = new Date(expiresAt).getTime() - Date.now();
    return Math.max(0, Math.min(100, (remaining / totalMs) * 100));
  }, [expiresAt, timeRemaining]);

  // ─── Render States ──────────────────────────────────────────────────────

  // Completed state
  if (payment.isCompleted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-3xl border-2 border-emerald-500 bg-emerald-50 p-8 text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
          className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-600"
        >
          <CheckCircle2 className="text-white" size={32} />
        </motion.div>
        <h2 className="text-2xl font-black text-slate-900">Payment Confirmed</h2>
        <p className="mt-2 text-slate-600">
          ₦{orderAmount.toLocaleString()} received successfully.
        </p>
      </motion.div>
    );
  }

  // Failed state
  if (payment.isFailed) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="rounded-3xl border-2 border-red-200 bg-red-50 p-8 text-center"
      >
        <XCircle className="mx-auto mb-4 text-red-500" size={48} />
        <h2 className="text-xl font-bold text-slate-900">Payment Failed</h2>
        <p className="mt-2 text-sm text-slate-600">Your payment could not be processed.</p>
        <button
          onClick={() => setHasInitiated(false)}
          className="mt-6 rounded-xl bg-slate-900 px-6 py-3 text-sm font-bold text-white hover:bg-slate-800 transition-colors"
        >
          Try Again
        </button>
      </motion.div>
    );
  }

  // Expired state
  if (payment.isExpired) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="rounded-3xl border-2 border-amber-200 bg-amber-50 p-8"
      >
        <div className="text-center">
          <Clock className="mx-auto mb-4 text-amber-500" size={48} />
          <h2 className="text-xl font-bold text-slate-900">Payment Session Expired</h2>

          {payment.amountPaid > 0 ? (
            <div className="mt-4">
              <div className="mx-auto max-w-xs rounded-2xl border border-amber-200 bg-white p-4">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Received</span>
                  <span className="font-bold text-slate-900">₦{payment.amountPaid.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-slate-500">Outstanding</span>
                  <span className="font-bold text-red-600">₦{payment.amountRemaining.toLocaleString()}</span>
                </div>
              </div>
              <p className="mt-4 text-sm text-slate-600">
                The ₦{payment.amountPaid.toLocaleString()} will be refunded to your account.
              </p>
            </div>
          ) : (
            <p className="mt-2 text-sm text-slate-600">
              No payment was received. Your order is still reserved.
            </p>
          )}

          <button
            onClick={handleRegenerate}
            disabled={isInitializing}
            className="mt-6 flex items-center gap-2 mx-auto rounded-xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white hover:bg-emerald-700 transition-colors disabled:opacity-50"
          >
            {isInitializing ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <RefreshCw size={16} />
            )}
            Generate New Account
          </button>

          <button onClick={onCancel} className="mt-3 text-sm text-slate-500 hover:text-slate-700 underline">
            Cancel Order
          </button>
        </div>
      </motion.div>
    );
  }

  // ─── Main Payment View ──────────────────────────────────────────────────

  return (
    <div className="space-y-4">
      {/* Error Banner */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-start gap-3 rounded-2xl bg-red-50 border border-red-200 p-4"
          >
            <AlertTriangle size={16} className="shrink-0 text-red-500 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {!hasInitiated ? (
        // ─── Step 1: Radio Card Selection ─────────────────────────────────────
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="mb-2">
            <h3 className="text-lg font-bold text-slate-900">How would you like to pay?</h3>
          </div>

          <div className="space-y-3">
            {/* Bank Transfer Radio Card */}
            <label
              className={`relative flex cursor-pointer rounded-2xl border-2 p-4 transition-all ${
                selectedMethod === 'bank'
                  ? 'border-emerald-500 bg-emerald-50/50 shadow-md shadow-emerald-100'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
              }`}
            >
              <input
                type="radio"
                name="payment_method"
                className="peer sr-only"
                checked={selectedMethod === 'bank'}
                onChange={() => setSelectedMethod('bank')}
              />
              <div className="flex w-full items-start gap-3">
                <div className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                  selectedMethod === 'bank' ? 'border-emerald-600 bg-emerald-600' : 'border-slate-300 bg-transparent'
                }`}>
                  {selectedMethod === 'bank' && <div className="h-2 w-2 rounded-full bg-white" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Building2 size={16} className={selectedMethod === 'bank' ? 'text-emerald-700' : 'text-slate-500'} />
                    <span className="font-bold text-slate-900">Bank Transfer</span>
                  </div>
                  <p className="mt-0.5 text-sm text-slate-500">Transfer to a dedicated account</p>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-700">
                      Most Popular
                    </span>
                    {savingsAmount > 0 && (
                      <span className="rounded-full border border-emerald-300 px-2 py-0.5 text-[11px] font-bold text-emerald-600 bg-white">
                        Save ₦{savingsAmount} on fees
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </label>

            {/* Card Radio Card */}
            <label
              className={`relative flex cursor-pointer rounded-2xl border-2 p-4 transition-all ${
                selectedMethod === 'card'
                  ? 'border-blue-500 bg-blue-50/30 shadow-md shadow-blue-100'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
              }`}
            >
              <input
                type="radio"
                name="payment_method"
                className="peer sr-only"
                checked={selectedMethod === 'card'}
                onChange={() => setSelectedMethod('card')}
              />
              <div className="flex w-full items-start gap-3">
                <div className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                  selectedMethod === 'card' ? 'border-blue-600 bg-blue-600' : 'border-slate-300 bg-transparent'
                }`}>
                  {selectedMethod === 'card' && <div className="h-2 w-2 rounded-full bg-white" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <CreditCard size={16} className={selectedMethod === 'card' ? 'text-blue-700' : 'text-slate-500'} />
                    <span className="font-bold text-slate-900">Pay with Card</span>
                  </div>
                  <p className="mt-0.5 text-sm text-slate-500">Debit or credit card · Secured by Paystack</p>
                  <div className="mt-3 flex items-center gap-2">
                    <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-bold text-blue-600">
                      Instant
                    </span>
                    <span className="text-[11px] font-medium text-slate-400">
                      Confirms in seconds
                    </span>
                  </div>
                </div>
              </div>
            </label>
          </div>

          <button
            onClick={handleContinue}
            disabled={isInitializing}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-4 text-base font-black text-white shadow-lg shadow-emerald-200 hover:bg-emerald-700 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 mt-2"
          >
            {isInitializing ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Processing...
              </>
            ) : (
              <>
                Continue to Payment
                <ChevronDown size={18} className="-rotate-90" />
              </>
            )}
          </button>
          
          <div className="flex items-center justify-center gap-2 pt-2 pb-1 text-slate-400 text-xs">
            <Lock size={12} />
            <span>Payments are secured with bank-grade encryption</span>
          </div>

          <div className="text-center pt-2">
            <button
              onClick={onCancel}
              className="text-xs font-medium text-slate-400 hover:text-slate-600 transition-colors"
            >
              Cancel Order
            </button>
          </div>
        </motion.div>
      ) : (
        // ─── Step 2: Initiated View (Inline Expansion) ─────────────────────────
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4"
        >
          {/* Switch indicator */}
          {switchCount > 0 && (
            <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400 mb-2">
              <ArrowLeftRight size={12} />
              Switch {switchCount} of {maxSwitches}
            </div>
          )}

          {/* Switching loader */}
          {isSwitching && (
            <div className="flex items-center justify-center gap-2 py-8">
              <Loader2 size={20} className="animate-spin text-emerald-600" />
              <span className="text-sm font-bold text-slate-600">Switching payment method...</span>
            </div>
          )}

          {/* Bank Transfer Panel */}
          {activeTab === 'bank' && !isSwitching && (
            <AnimatePresence mode="wait">
              {virtualAccount && (
                <motion.div
                  key="bank"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  {/* Bank Details Card */}
                  <div className="rounded-2xl border-2 border-emerald-500 bg-emerald-50/50 p-5 space-y-4 shadow-md shadow-emerald-100">
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Building2 size={16} className="text-emerald-700"/>
                      Transfer to this account
                    </h3>

                    <div className="space-y-3 bg-white rounded-xl p-4 border border-emerald-100 shadow-sm">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Bank</p>
                        <p className="font-bold text-slate-900">{virtualAccount.bankName}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Account Number</p>
                        <div className="flex items-center gap-3">
                          <p className="font-black text-2xl tracking-wider text-emerald-600">
                            {virtualAccount.accountNumber}
                          </p>
                          <button
                            onClick={copyAccountNumber}
                            className="flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1.5 text-xs font-bold text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors"
                          >
                            {copied ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                            {copied ? 'Copied!' : 'Copy'}
                          </button>
                        </div>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Account Name</p>
                        <p className="font-bold text-slate-900">{virtualAccount.accountName}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Amount</p>
                        <p className="font-black text-lg text-slate-900">₦{orderAmount.toLocaleString()}</p>
                      </div>
                    </div>

                    {/* Countdown Timer */}
                    {timeRemaining && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-1.5 text-slate-500">
                            <Clock size={12} />
                            <span>Expires in</span>
                          </div>
                          <span className={`font-mono font-bold ${
                            progressPercent < 20 ? 'text-red-600' : 'text-slate-700'
                          }`}>
                            {timeRemaining}
                          </span>
                        </div>
                        <div className="h-1.5 rounded-full bg-emerald-200/50 overflow-hidden">
                          <motion.div
                            className={`h-full rounded-full ${
                              progressPercent < 20 ? 'bg-red-500' : progressPercent < 50 ? 'bg-amber-500' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${progressPercent}%` }}
                            transition={{ duration: 1 }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Partial Payment Progress */}
                  {payment.isPartial && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="rounded-2xl border border-amber-200 bg-amber-50 p-4 space-y-3"
                    >
                      <div className="flex items-center gap-2">
                        <AlertTriangle size={14} className="text-amber-600" />
                        <span className="text-sm font-bold text-amber-800">Partial Payment Received</span>
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-600">Received</span>
                          <span className="font-bold text-emerald-600">₦{payment.amountPaid.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-600">Remaining</span>
                          <span className="font-bold text-red-600">₦{payment.amountRemaining.toLocaleString()}</span>
                        </div>
                      </div>

                      {/* Progress bar */}
                      <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
                        <motion.div
                          className="h-full bg-emerald-500 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${(payment.amountPaid / orderAmount) * 100}%` }}
                          transition={{ duration: 0.5, ease: 'easeOut' }}
                        />
                      </div>

                      {/* Split History */}
                      {payment.splits.length > 0 && (
                        <div>
                          <button
                            onClick={() => setShowSplits(!showSplits)}
                            className="flex items-center gap-1 text-xs font-bold text-amber-700 hover:text-amber-900"
                          >
                            <ChevronDown size={12} className={`transition-transform ${showSplits ? 'rotate-180' : ''}`} />
                            {payment.splits.length} payment{payment.splits.length > 1 ? 's' : ''} received
                          </button>

                          <AnimatePresence>
                            {showSplits && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mt-2 space-y-1"
                              >
                                {payment.splits.map((split, i) => (
                                  <div key={i} className="flex items-center justify-between text-xs bg-white rounded-lg px-3 py-2">
                                    <span className="text-slate-600">{split.senderName || 'Transfer'}</span>
                                    <span className="font-bold text-slate-900">₦{split.amount.toLocaleString()}</span>
                                  </div>
                                ))}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      )}

                      <p className="text-xs text-amber-700">
                        Transfer the remaining ₦{payment.amountRemaining.toLocaleString()} to complete your order.
                      </p>
                    </motion.div>
                  )}

                  {/* Waiting indicator */}
                  {!payment.isPartial && (
                    <div className="flex items-center justify-center gap-3 py-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
                      <span className="text-sm font-medium text-slate-600">
                        Listening for your transfer...
                      </span>
                    </div>
                  )}
                  
                  {/* Compact Switch Bar */}
                  <div className="text-center pt-2">
                    <button
                      onClick={() => handleSwitch('CARD')}
                      disabled={isSwitching}
                      className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
                    >
                      Want to pay by card instead? <span className="text-blue-600 font-bold ml-1">Switch →</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          )}

          {/* Card Payment Panel */}
          {activeTab === 'card' && !isSwitching && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="rounded-2xl border-2 border-blue-500 bg-blue-50/30 p-6 text-center space-y-4 shadow-md shadow-blue-100">
                <CreditCard className="mx-auto text-blue-500" size={40} />
                <div>
                  <h3 className="font-bold text-slate-900">Pay with Debit Card</h3>
                  <p className="mt-1 text-sm text-slate-500">Instant confirmation · Secured by Paystack</p>
                </div>

                <button
                  onClick={handleCardPayment}
                  disabled={!checkoutUrl}
                  className="w-full rounded-xl bg-blue-600 py-4 text-base font-black text-white shadow-lg shadow-blue-200 hover:bg-blue-700 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  Pay ₦{orderAmount.toLocaleString()} Now
                </button>
              </div>
              
              {/* Compact Switch Bar */}
              <div className="text-center pt-2">
                <button
                  onClick={() => handleSwitch('BANK_TRANSFER')}
                  disabled={isSwitching}
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
                >
                  Want to pay by transfer instead? <span className="text-emerald-600 font-bold ml-1">Switch →</span>
                </button>
              </div>
            </motion.div>
          )}

          {/* Cancel */}
          <div className="text-center pt-4">
            <button
              onClick={onCancel}
              className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
            >
              Cancel Payment
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}

// ─── Countdown Hook ────────────────────────────────────────────────────────────

function useCountdown(expiresAt: string | null | undefined): string | null {
  const [timeStr, setTimeStr] = useState<string | null>(null);

  useEffect(() => {
    if (!expiresAt) return;

    const update = () => {
      const diff = new Date(expiresAt).getTime() - Date.now();
      if (diff <= 0) {
        setTimeStr('00:00');
        return;
      }
      const mins = Math.floor(diff / 60000);
      const secs = Math.floor((diff % 60000) / 1000);
      setTimeStr(`${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`);
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  return timeStr;
}
