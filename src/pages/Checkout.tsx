'use client';

import React, { useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Activity,
  ArrowLeft,
  ShieldCheck,
  Truck,
  CreditCard,
  CheckCircle2,
  MapPin,
  Package,
  ChevronRight,
  Info,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSupabase } from '../lib/mock-db';
import PaymentPanel from '../components/payment/PaymentPanel';

type PaymentMethod = 'pay_now' | 'pod' | null;

export default function Checkout() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as {
    pharmacyName?: string;
    medicineName?: string;
    distance?: string;
    location?: string;
    orderId?: string;
    totalPrice?: number;
  } | null;

  const pharmacyName = state?.pharmacyName ?? 'Fiolu Pharmacy Ltd';
  const medicineName = state?.medicineName ?? 'Insulin (Mixtard 30/70)';
  const pharmacyLocation = state?.location ?? 'GRA';
  const distance = state?.distance ?? '0.8km';
  const orderId = state?.orderId ?? `ORD_${Date.now()}`;
  const orderAmount = state?.totalPrice ?? 4500;

  const [selected, setSelected] = useState<PaymentMethod>(null);
  const [confirming, setConfirming] = useState(false);
  const [showPaymentPanel, setShowPaymentPanel] = useState(false);

  const { currentUser } = useSupabase();

  const handlePaymentComplete = useCallback((completedOrderId: string) => {
    setTimeout(() => {
      navigate('/fulfillment', {
        state: { pharmacyName, medicineName, pharmacyLocation, paymentMethod: 'PAID' },
      });
    }, 1500);
  }, [navigate, pharmacyName, medicineName, pharmacyLocation]);

  const handleConfirm = async () => {
    if (!selected) return;
    setConfirming(true);

    if (selected === 'pay_now') {
      // Show the integrated payment panel
      setShowPaymentPanel(true);
      setConfirming(false);
    } else {
      // POD or other bypassed method
      setTimeout(() => {
        navigate('/fulfillment', {
          state: { pharmacyName, medicineName, pharmacyLocation, paymentMethod: selected },
        });
      }, 800);
    }
  };

  return (
    <motion.div
      initial={{ x: '100%', opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: '-100%', opacity: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="min-h-screen bg-white font-sans text-slate-900"
    >
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-slate-100 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
          <Link to="/search" className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors">
            <ArrowLeft size={20} />
            <span className="font-semibold text-sm">Back to Search</span>
          </Link>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-lg shadow-emerald-200">
              <Activity size={20} />
            </div>
            <span className="text-xl font-black tracking-tighter text-slate-900">Pharma-E</span>
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-10"
        >
          <p className="text-xs font-bold uppercase tracking-widest text-emerald-600 mb-2">Secure Checkout</p>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Confirm Your Order
          </h1>
          <p className="mt-2 text-slate-500">Review your order details and choose a payment method.</p>
        </motion.div>

        <div className="grid gap-8 lg:grid-cols-5">
          {/* Left: Payment Selection */}
          <div className="lg:col-span-3 space-y-6">
            {showPaymentPanel ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <PaymentPanel
                  orderId={orderId}
                  orderAmount={orderAmount}
                  customerName={currentUser?.full_name || 'Guest User'}
                  customerEmail={currentUser?.email || 'guest@example.com'}
                  onPaymentComplete={handlePaymentComplete}
                  onCancel={() => setShowPaymentPanel(false)}
                />
              </motion.div>
            ) : (
             <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h2 className="text-base font-bold text-slate-900 mb-4">Choose Payment Method</h2>
              <div className="space-y-4">

                {/* Pay Now Card */}
                <button
                  onClick={() => setSelected('pay_now')}
                  className={`w-full text-left rounded-2xl border-2 p-5 transition-all duration-200 ${
                    selected === 'pay_now'
                      ? 'border-emerald-500 bg-emerald-50 shadow-md shadow-emerald-100'
                      : 'border-slate-100 bg-white hover:border-slate-200 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors ${
                      selected === 'pay_now' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200' : 'bg-slate-100 text-slate-500'
                    }`}>
                      <CreditCard size={20} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-bold text-slate-900 text-base">Pay Now</p>
                        <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                          selected === 'pay_now' ? 'border-emerald-600 bg-emerald-600' : 'border-slate-300'
                        }`}>
                          {selected === 'pay_now' && <div className="h-2 w-2 rounded-full bg-white" />}
                        </div>
                      </div>
                      <p className="mt-1 text-sm text-slate-500">Bank Transfer or Card · Instant Confirmation</p>
                      <div className="mt-3 flex items-center gap-2">
                        <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-700">
                          Recommended
                        </span>
                        <span className="text-xs text-slate-400">Fastest dispatch priority</span>
                      </div>
                    </div>
                  </div>
                </button>

                {/* Pay on Delivery Card */}
                <button
                  onClick={() => setSelected('pod')}
                  className={`w-full text-left rounded-2xl border-2 p-5 transition-all duration-200 ${
                    selected === 'pod'
                      ? 'border-slate-900 bg-slate-50 shadow-md shadow-slate-100'
                      : 'border-slate-100 bg-white hover:border-slate-200 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors ${
                      selected === 'pod' ? 'bg-slate-900 text-white shadow-lg' : 'bg-slate-100 text-slate-500'
                    }`}>
                      <Truck size={20} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-bold text-slate-900 text-base">Pay on Delivery</p>
                        <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                          selected === 'pod' ? 'border-slate-900 bg-slate-900' : 'border-slate-300'
                        }`}>
                          {selected === 'pod' && <div className="h-2 w-2 rounded-full bg-white" />}
                        </div>
                      </div>
                      <p className="mt-1 text-sm text-slate-500">POD — Verified First</p>

                      {/* Commitment Clause */}
                      <AnimatePresence>
                        {selected === 'pod' && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.25 }}
                            className="overflow-hidden"
                          >
                            <div className="mt-3 flex items-start gap-2 rounded-xl bg-amber-50 border border-amber-200 px-3 py-2.5">
                              <Info size={14} className="shrink-0 text-amber-600 mt-0.5" />
                              <p className="text-xs text-amber-800 leading-relaxed">
                                A small commitment fee of <span className="font-bold">₦200</span> is required for dispatch. This ensures your order is reserved and packed.
                              </p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </button>
              </div>
            </motion.div>

            {/* Trust Signal */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="flex items-center gap-3 rounded-2xl bg-slate-50 border border-slate-100 px-5 py-4"
            >
              <ShieldCheck size={20} className="shrink-0 text-emerald-600" />
              <p className="text-sm font-semibold text-slate-700">
                100% Money-Back Guarantee if Verification Fails
              </p>
            </motion.div>

            {/* Confirm Button */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
            >
              <button
                onClick={handleConfirm}
                disabled={!selected || confirming}
                className={`w-full relative overflow-hidden rounded-2xl py-5 text-lg font-black text-white shadow-xl transition-all duration-200 ${
                  selected
                    ? 'bg-emerald-600 shadow-emerald-200 hover:bg-emerald-700 hover:scale-[1.02] active:scale-[0.98]'
                    : 'bg-slate-200 cursor-not-allowed shadow-none'
                }`}
              >
                {confirming ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Processing...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    Confirm Order & Track Rider
                    <ChevronRight size={22} />
                  </span>
                )}
              </button>
              {!selected && (
                <p className="mt-2 text-center text-xs text-slate-400">Select a payment method to continue</p>
              )}
            </motion.div>
           </div>
          )}
          </div>

          {/* Right: Order Summary */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.25 }}
            className="lg:col-span-2"
          >
            <div className="sticky top-24 rounded-3xl border border-slate-100 bg-slate-50 p-6 shadow-sm">
              <h2 className="text-base font-bold text-slate-900 mb-5">Order Summary</h2>

              {/* Medicine */}
              <div className="mb-6 rounded-2xl bg-white border border-slate-100 p-4 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100">
                    <Package size={18} className="text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Medicine</p>
                    <p className="mt-0.5 font-bold text-slate-900 leading-tight">{medicineName}</p>
                  </div>
                </div>
              </div>

              {/* Pharmacy Source */}
              <div className="mb-4 rounded-2xl bg-white border border-slate-100 p-4 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100">
                    <MapPin size={18} className="text-slate-600" />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Pharmacy Source</p>
                    <p className="mt-0.5 font-bold text-slate-900 leading-tight">{pharmacyName}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{pharmacyLocation} · {distance} away</p>
                  </div>
                </div>
              </div>

              {/* Line Items */}
              <div className="space-y-3 border-t border-slate-200 pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Subtotal</span>
                  <span className="font-bold text-slate-900">₦{(orderAmount - 500).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-500">Delivery Fee</span>
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-700">Verified</span>
                  </div>
                  <span className="font-bold text-slate-900">₦500</span>
                </div>
                <div className="flex justify-between border-t border-dashed border-slate-200 pt-3 text-base">
                  <span className="font-bold text-slate-900">Total</span>
                  <span className="text-xl font-black text-emerald-600">₦{orderAmount.toLocaleString()}</span>
                </div>
              </div>

              {/* Pharma-E Verified Seal */}
              <div className="mt-5 flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3">
                <CheckCircle2 size={16} className="text-white" />
                <span className="text-xs font-bold text-white">Pharma-E Verified Purchase</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
