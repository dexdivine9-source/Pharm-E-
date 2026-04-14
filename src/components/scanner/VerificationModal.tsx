import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShieldCheck,
  ShieldX,
  Loader2,
  CheckCircle2,
  Phone,
  RefreshCw,
  RotateCcw,
  Package,
  Calendar,
  Factory,
  Hash,
} from 'lucide-react';
import type { ScanState, VerificationResult } from '../../hooks/useNAFDACVerify';

interface VerificationModalProps {
  scanState: ScanState;
  result: VerificationResult | null;
  errorMessage: string | null;
  onReset: () => void;
  onRequestRefund?: () => void;
  pharmacyPhone?: string;
}

// ─── Confetti Particle ────────────────────────────────────────────────────────
function ConfettiParticle({ index }: { index: number; key?: React.Key }) {
  const colors = [
    '#059669', '#10b981', '#34d399', '#6ee7b7',
    '#fbbf24', '#f59e0b', '#ffffff',
  ];
  const color = colors[index % colors.length];
  const angle = (index / 20) * 360;
  const distance = 80 + Math.random() * 60;
  const size = 6 + Math.random() * 6;

  return (
    <motion.div
      className="absolute rounded-sm"
      style={{
        width: size,
        height: size * 0.6,
        backgroundColor: color,
        top: '50%',
        left: '50%',
      }}
      initial={{ x: 0, y: 0, opacity: 1, rotate: 0 }}
      animate={{
        x: Math.cos((angle * Math.PI) / 180) * distance,
        y: Math.sin((angle * Math.PI) / 180) * distance - 40,
        opacity: 0,
        rotate: angle * 2,
      }}
      transition={{ duration: 0.9, ease: 'easeOut', delay: index * 0.02 }}
    />
  );
}

// ─── Main Modal ───────────────────────────────────────────────────────────────
export default function VerificationModal({
  scanState,
  result,
  errorMessage,
  onReset,
  onRequestRefund,
  pharmacyPhone = '+2348012345678',
}: VerificationModalProps) {
  const isVisible = ['VERIFYING', 'AUTHENTIC', 'ORDER_COMPLETE', 'FAILED'].includes(scanState);
  const isSuccess = scanState === 'AUTHENTIC' || scanState === 'ORDER_COMPLETE';
  const isFailed = scanState === 'FAILED';
  const isPending = scanState === 'VERIFYING';

  const confettiParticles = Array.from({ length: 20 }, (_, i) => i);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            onClick={isSuccess || isFailed ? onReset : undefined}
          />

          {/* Card */}
          <motion.div
            className="relative w-full max-w-sm mx-4 rounded-3xl overflow-hidden"
            initial={{ y: 80, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 80, opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
          >
            {/* ── VERIFYING STATE ── */}
            {isPending && (
              <div className="bg-slate-900 p-8 text-center space-y-5">
                <div className="relative mx-auto w-20 h-20">
                  {/* Pulsing ring */}
                  <motion.div
                    className="absolute inset-0 rounded-full border-2 border-emerald-500"
                    animate={{ scale: [1, 1.35, 1], opacity: [0.8, 0, 0.8] }}
                    transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
                  />
                  <motion.div
                    className="absolute inset-2 rounded-full border-2 border-emerald-400"
                    animate={{ scale: [1, 1.25, 1], opacity: [0.6, 0, 0.6] }}
                    transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Loader2 size={30} className="text-emerald-400 animate-spin" />
                  </div>
                </div>
                <div>
                  <p className="text-white font-bold text-lg">Verifying Product</p>
                  <p className="text-slate-400 text-sm mt-1">Checking NAFDAC registry…</p>
                </div>
                {/* Shimmer bar */}
                <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-emerald-600 via-emerald-400 to-emerald-600 rounded-full"
                    animate={{ x: ['-100%', '100%'] }}
                    transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
                  />
                </div>
              </div>
            )}

            {/* ── AUTHENTIC / ORDER_COMPLETE STATE ── */}
            {isSuccess && result && (
              <div className="bg-white">
                {/* Green header */}
                <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 px-6 pt-8 pb-10 text-center relative overflow-hidden">
                  {/* Confetti */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    {confettiParticles.map(i => (
                      <ConfettiParticle key={i} index={i} />
                    ))}
                  </div>
                  <motion.div
                    initial={{ scale: 0, rotate: -15 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 20, delay: 0.1 }}
                    className="mx-auto w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-4"
                  >
                    {scanState === 'ORDER_COMPLETE' ? (
                      <CheckCircle2 size={32} className="text-white" />
                    ) : (
                      <ShieldCheck size={32} className="text-white" />
                    )}
                  </motion.div>
                  <motion.p
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-white font-black text-xl"
                  >
                    {scanState === 'ORDER_COMPLETE' ? 'Order Confirmed! ✓' : 'Authentic Product ✓'}
                  </motion.p>
                  <p className="text-emerald-100 text-sm mt-1">
                    {scanState === 'ORDER_COMPLETE'
                      ? 'Pickup marked complete. Dashboard updated.'
                      : 'Verified against NAFDAC registry'}
                  </p>
                </div>

                {/* Result details card */}
                <div className="-mt-4 mx-4 bg-white rounded-2xl shadow-lg border border-slate-100 p-4 space-y-3">
                  {result.type === 'order' && result.orderId && (
                    <DetailRow
                      icon={<Package size={15} className="text-emerald-600" />}
                      label="Order ID"
                      value={result.orderId}
                    />
                  )}
                  {result.type === 'nafdac' && (
                    <>
                      {result.drugName && (
                        <DetailRow
                          icon={<Package size={15} className="text-emerald-600" />}
                          label="Drug"
                          value={result.drugName}
                        />
                      )}
                      {result.manufacturer && (
                        <DetailRow
                          icon={<Factory size={15} className="text-emerald-600" />}
                          label="Manufacturer"
                          value={result.manufacturer}
                        />
                      )}
                      {result.batchCode && (
                        <DetailRow
                          icon={<Hash size={15} className="text-emerald-600" />}
                          label="Batch Code"
                          value={result.batchCode}
                        />
                      )}
                      {result.expiryDate && (
                        <DetailRow
                          icon={<Calendar size={15} className="text-emerald-600" />}
                          label="Expires"
                          value={new Date(result.expiryDate).toLocaleDateString('en-NG', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        />
                      )}
                    </>
                  )}
                </div>

                {/* Action */}
                <div className="p-4 pt-3">
                  <button
                    id="scan-result-continue-btn"
                    onClick={onReset}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold py-3.5 rounded-2xl transition-all duration-150 flex items-center justify-center gap-2"
                  >
                    <RotateCcw size={16} />
                    Scan Another
                  </button>
                </div>
              </div>
            )}

            {/* ── FAILED STATE ── */}
            {isFailed && (
              <div className="bg-white">
                {/* Red header */}
                <div className="bg-gradient-to-br from-rose-500 to-rose-700 px-6 pt-8 pb-10 text-center relative overflow-hidden">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 22, delay: 0.1 }}
                    className="mx-auto w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-4"
                  >
                    <ShieldX size={32} className="text-white" />
                  </motion.div>
                  <p className="text-white font-black text-xl">Verification Failed</p>
                  <p className="text-rose-100 text-sm mt-1">Do NOT dispense this product</p>
                </div>

                {/* Error message */}
                <div className="-mt-4 mx-4 bg-rose-50 rounded-2xl border border-rose-200 p-4">
                  <p className="text-rose-800 text-sm font-medium leading-relaxed">
                    {errorMessage || 'Unable to verify this product.'}
                  </p>
                </div>

                {/* Conflict-resolution actions */}
                <div className="p-4 pt-3 space-y-3">
                  {/* Call Pharmacist */}
                  <a
                    id="scan-fail-call-pharmacist-btn"
                    href={`tel:${pharmacyPhone}`}
                    className="w-full flex items-center justify-center gap-2.5 bg-slate-900 hover:bg-slate-800 active:scale-95 text-white font-bold py-3.5 rounded-2xl transition-all duration-150"
                  >
                    <Phone size={16} />
                    Call Pharmacist
                  </a>

                  {/* Request Refund */}
                  {onRequestRefund && (
                    <button
                      id="scan-fail-refund-btn"
                      onClick={onRequestRefund}
                      className="w-full flex items-center justify-center gap-2.5 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-bold py-3.5 rounded-2xl transition-all duration-150"
                    >
                      <RefreshCw size={16} />
                      Request Refund
                    </button>
                  )}

                  {/* Try again */}
                  <button
                    id="scan-fail-retry-btn"
                    onClick={onReset}
                    className="w-full text-slate-500 hover:text-slate-700 text-sm font-semibold py-2 transition-colors"
                  >
                    Try scanning again
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Helper ───────────────────────────────────────────────────────────────────
function DetailRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between text-sm">
      <div className="flex items-center gap-1.5 text-slate-500">
        {icon}
        <span>{label}</span>
      </div>
      <span className="font-bold text-slate-800 text-right max-w-[55%] truncate">{value}</span>
    </div>
  );
}
