import React, { useEffect, useRef, useState, Component } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Zap,
  ZapOff,
  Keyboard,
  X,
  ShieldAlert,
  Camera,
  CameraOff,
} from 'lucide-react';

interface CameraViewProps {
  onScanSuccess: (decodedText: string) => void;
  isActive: boolean;
}

// ─── Animated corner brackets ─────────────────────────────────────────────────
function ScanFrameCorners() {
  return (
    <>
      <div className="absolute top-0 left-0 w-8 h-8 border-t-[3px] border-l-[3px] border-emerald-400 rounded-tl-lg" />
      <div className="absolute top-0 right-0 w-8 h-8 border-t-[3px] border-r-[3px] border-emerald-400 rounded-tr-lg" />
      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-[3px] border-l-[3px] border-emerald-400 rounded-bl-lg" />
      <div className="absolute bottom-0 right-0 w-8 h-8 border-b-[3px] border-r-[3px] border-emerald-400 rounded-br-lg" />
    </>
  );
}

// ─── Manual Input Panel (always available) ────────────────────────────────────
function ManualInputPanel({
  show,
  value,
  onChange,
  onSubmit,
  compact = false,
}: {
  show: boolean;
  value: string;
  onChange: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  compact?: boolean;
}) {
  return (
    <AnimatePresence>
      {show && (
        <motion.form
          onSubmit={onSubmit}
          className={`w-full max-w-xs space-y-2.5 px-4 ${compact ? 'mt-3' : 'mt-4'}`}
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.25 }}
        >
          <div className="relative">
            <input
              id="scanner-manual-input"
              type="text"
              value={value}
              onChange={e => onChange(e.target.value)}
              placeholder="12-digit NAFDAC PIN or Order ID"
              autoFocus
              className="w-full bg-slate-800 border border-slate-600 focus:border-emerald-500 text-white placeholder-slate-500 rounded-xl px-4 py-3 text-sm font-mono outline-none transition-colors pr-10"
            />
            {value && (
              <button
                type="button"
                onClick={() => onChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                <X size={14} />
              </button>
            )}
          </div>
          <button
            id="scanner-manual-submit-btn"
            type="submit"
            disabled={!value.trim()}
            className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-colors"
          >
            Verify Code
          </button>
        </motion.form>
      )}
    </AnimatePresence>
  );
}

// ─── No-Camera Fallback UI ────────────────────────────────────────────────────
function NoCameraFallback({
  reason,
  onScanSuccess,
}: {
  reason: string;
  onScanSuccess: (code: string) => void;
}) {
  const [value, setValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) {
      onScanSuccess(value.trim());
      setValue('');
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center bg-slate-950 px-6 py-8">
      {/* Decorative background */}
      <div className="absolute inset-0 bg-gradient-to-b from-emerald-950/20 to-slate-950 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-sm space-y-6 text-center"
      >
        {/* Icon */}
        <div className="mx-auto w-20 h-20 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center">
          <CameraOff size={32} className="text-slate-400" />
        </div>

        <div>
          <p className="text-white font-bold text-base">Manual Verification Mode</p>
          <p className="text-slate-400 text-sm mt-1 leading-relaxed">
            {reason === 'permission'
              ? 'Camera access was denied. Enter the code manually below.'
              : reason === 'unavailable'
              ? 'No camera detected. Enter the NAFDAC PIN or Order ID below.'
              : 'Camera unavailable. Use manual input to verify.'}
          </p>
        </div>

        {/* Inline manual input — always shown in no-camera mode */}
        <form onSubmit={handleSubmit} className="space-y-3 text-left">
          <div className="relative">
            <Keyboard size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              id="scanner-manual-input"
              type="text"
              value={value}
              onChange={e => setValue(e.target.value)}
              placeholder="e.g. BJ-2024-EMZ001 or pharmae-order-abc"
              autoFocus
              className="w-full bg-slate-800 border border-slate-600 focus:border-emerald-500 text-white placeholder-slate-500 rounded-xl pl-10 pr-10 py-3.5 text-sm font-mono outline-none transition-colors"
            />
            {value && (
              <button
                type="button"
                onClick={() => setValue('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                <X size={14} />
              </button>
            )}
          </div>
          <button
            id="scanner-manual-submit-btn"
            type="submit"
            disabled={!value.trim()}
            className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl transition-colors text-sm"
          >
            Verify Code
          </button>
        </form>

        {/* Demo hint inline */}
        <div className="bg-slate-900 border border-slate-700 rounded-xl p-3 text-left space-y-1.5">
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Quick test codes</p>
          {[
            { code: 'BJ-2024-EMZ001', label: 'Authentic' },
            { code: 'FAKE-0000-XXX01', label: 'Counterfeit' },
          ].map(({ code, label }) => (
            <button
              key={code}
              type="button"
              onClick={() => {
                setValue(code);
              }}
              className="w-full flex items-center justify-between bg-slate-800 hover:bg-slate-700 rounded-lg px-3 py-2 transition-colors group"
            >
              <code className="text-emerald-400 text-xs font-mono">{code}</code>
              <span className={`text-[10px] font-bold ${label === 'Authentic' ? 'text-emerald-500' : 'text-rose-400'}`}>
                {label}
              </span>
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

// ─── Error Boundary ───────────────────────────────────────────────────────────
interface EBState { hasError: boolean; }
class CameraErrorBoundary extends Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  EBState
> {
  state: EBState = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error: Error) { console.warn('[CameraView] caught:', error.message); }
  render() {
    return this.state.hasError ? this.props.fallback : this.props.children;
  }
}

// ─── Main CameraView ──────────────────────────────────────────────────────────
export default function CameraView({ onScanSuccess, isActive }: CameraViewProps) {
  const scannerRef = useRef<InstanceType<typeof import('html5-qrcode').Html5Qrcode> | null>(null);
  const CONTAINER_ID = 'html5-qrcode-viewfinder';

  const [torchOn, setTorchOn] = useState(false);
  const [torchSupported, setTorchSupported] = useState(false);
  const [showManual, setShowManual] = useState(false);
  const [manualValue, setManualValue] = useState('');
  const [cameraStatus, setCameraStatus] = useState<'loading' | 'active' | 'denied' | 'unavailable' | 'error'>('loading');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  // Determine "no-camera" reason string for the fallback UI
  const noCameraReason =
    cameraStatus === 'denied' ? 'permission'
    : cameraStatus === 'unavailable' ? 'unavailable'
    : 'error';

  // ── Start / Stop camera on isActive toggle ───────────────────────────────
  useEffect(() => {
    if (!isActive) {
      if (scannerRef.current && isScanning) {
        scannerRef.current.stop().catch(() => {});
        setIsScanning(false);
      }
      return;
    }

    // Async import to prevent module-level errors from crashing the tree
    let scanner: InstanceType<typeof import('html5-qrcode').Html5Qrcode> | null = null;
    let destroyed = false;

    const startCamera = async () => {
      try {
        const { Html5Qrcode, Html5QrcodeSupportedFormats } = await import('html5-qrcode');

        // Verify the DOM element exists before constructing
        if (!document.getElementById(CONTAINER_ID)) {
          setCameraStatus('error');
          return;
        }

        scanner = new Html5Qrcode(CONTAINER_ID, {
          formatsToSupport: [
            Html5QrcodeSupportedFormats.QR_CODE,
            Html5QrcodeSupportedFormats.CODE_128,
            Html5QrcodeSupportedFormats.CODE_39,
            Html5QrcodeSupportedFormats.EAN_13,
          ],
          verbose: false,
        });
        scannerRef.current = scanner;

        if (destroyed) { scanner.stop().catch(() => {}); return; }

        await scanner.start(
          { facingMode: 'environment' },
          { fps: 12, qrbox: { width: 240, height: 240 }, aspectRatio: 1.0 },
          (decodedText) => { if (!destroyed) onScanSuccess(decodedText); },
          () => { /* per-frame fail — normal */ }
        );

        if (destroyed) { scanner.stop().catch(() => {}); return; }

        setIsScanning(true);
        setCameraStatus('active');

        // Torch feature check
        try {
          const torchFeature = (scanner as any)
            .getRunningTrackCameraCapabilities?.()
            ?.torchFeature?.();
          if (torchFeature?.isSupported()) setTorchSupported(true);
        } catch { /* torch not supported */ }

      } catch (err: unknown) {
        const error = err as Error;
        const name = error?.name ?? '';
        const message = (error?.message ?? '').toLowerCase();

        if (name === 'NotAllowedError' || message.includes('permission') || message.includes('denied')) {
          setCameraStatus('denied');
        } else if (
          name === 'NotFoundError' ||
          name === 'OverconstrainedError' ||
          message.includes('no camera') ||
          message.includes('no device') ||
          message.includes('could not start')
        ) {
          setCameraStatus('unavailable');
        } else {
          setCameraStatus('error');
          setCameraError(error?.message || 'Camera error.');
        }
      }
    };

    startCamera();

    return () => {
      destroyed = true;
      if (scanner) scanner.stop().catch(() => {});
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive]);

  // ── Torch toggle ─────────────────────────────────────────────────────────
  const handleTorchToggle = async () => {
    if (!scannerRef.current || !torchSupported) return;
    try {
      const tf = (scannerRef.current as any)
        .getRunningTrackCameraCapabilities?.()?.torchFeature?.();
      const newState = !torchOn;
      await tf?.apply(newState);
      setTorchOn(newState);
    } catch { /* silently fail */ }
  };

  // ── Manual submit ─────────────────────────────────────────────────────────
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualValue.trim()) {
      onScanSuccess(manualValue.trim());
      setManualValue('');
      setShowManual(false);
    }
  };

  // ── No-camera states → show fallback UI ──────────────────────────────────
  const showFallback = ['denied', 'unavailable', 'error'].includes(cameraStatus);

  if (showFallback) {
    return (
      <CameraErrorBoundary fallback={<NoCameraFallback reason="error" onScanSuccess={onScanSuccess} />}>
        <NoCameraFallback reason={noCameraReason} onScanSuccess={onScanSuccess} />
      </CameraErrorBoundary>
    );
  }

  return (
    <CameraErrorBoundary
      fallback={<NoCameraFallback reason="error" onScanSuccess={onScanSuccess} />}
    >
      <div className="relative w-full h-full flex flex-col items-center justify-center bg-slate-950 overflow-hidden">

        {/* ── Loading shimmer ── */}
        {cameraStatus === 'loading' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 pointer-events-none">
            <div className="w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center">
              <Camera size={28} className="text-slate-500" />
            </div>
            <p className="text-slate-500 text-xs">Starting camera…</p>
          </div>
        )}

        {/* ── Viewfinder DOM target ── */}
        <div className="relative w-full max-w-xs aspect-square">
          <div id={CONTAINER_ID} className="w-full h-full rounded-2xl overflow-hidden" />

          {/* Corner brackets */}
          <div className="absolute inset-0 pointer-events-none">
            <ScanFrameCorners />
          </div>

          {/* Animated scan line */}
          {cameraStatus === 'active' && (
            <div
              className="absolute left-2 right-2 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent rounded-full pointer-events-none scan-line"
              style={{ top: '50%' }}
            />
          )}
        </div>

        {/* ── Hint text ── */}
        <p className="mt-4 text-slate-400 text-xs text-center px-6">
          Align the{' '}
          <span className="text-emerald-400 font-semibold">QR code or NAFDAC PIN</span>{' '}
          within the frame
        </p>

        {/* ── Controls row ── */}
        <div className="mt-4 flex items-center gap-3">
          {torchSupported && (
            <motion.button
              id="scanner-torch-btn"
              whileTap={{ scale: 0.9 }}
              onClick={handleTorchToggle}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-colors ${
                torchOn
                  ? 'bg-amber-400 text-amber-900'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {torchOn ? <Zap size={16} /> : <ZapOff size={16} />}
              {torchOn ? 'Flash On' : 'Flash Off'}
            </motion.button>
          )}

          <motion.button
            id="scanner-manual-toggle-btn"
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowManual(v => !v)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 font-semibold text-sm transition-colors"
          >
            <Keyboard size={16} />
            Can't Scan?
          </motion.button>
        </div>

        {/* ── Manual input panel ── */}
        <ManualInputPanel
          show={showManual}
          value={manualValue}
          onChange={setManualValue}
          onSubmit={handleManualSubmit}
        />

        {/* ── Permission modal (secondary fallback) ── */}
        <AnimatePresence>
          {cameraStatus === 'denied' && (
            <motion.div
              className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/80 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="bg-white rounded-3xl mx-4 w-full max-w-sm p-6 space-y-5 mb-4 sm:mb-0"
                initial={{ y: 60, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 60, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              >
                <div className="flex items-center justify-center w-14 h-14 bg-emerald-100 rounded-2xl mx-auto">
                  <ShieldAlert size={28} className="text-emerald-600" />
                </div>
                <div className="text-center space-y-2">
                  <h2 className="font-black text-slate-900 text-lg">Camera Access Required</h2>
                  <p className="text-slate-500 text-sm leading-relaxed">
                    Pharma-E needs camera access for Product Safety & Pickup verification.
                    Please allow camera access in your browser settings.
                  </p>
                </div>
                <div className="space-y-2.5">
                  <button
                    id="camera-permission-manual-btn"
                    onClick={() => setCameraStatus('unavailable')}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-2xl transition-colors flex items-center justify-center gap-2"
                  >
                    <Keyboard size={16} />
                    Use Manual Input Instead
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Scan line keyframe */}
        <style>{`
          @keyframes scanLine {
            0%   { transform: translateY(-110px); opacity: 0.4; }
            50%  { opacity: 1; }
            100% { transform: translateY(110px); opacity: 0.4; }
          }
          .scan-line { animation: scanLine 2s ease-in-out infinite; }
        `}</style>
      </div>
    </CameraErrorBoundary>
  );
}
