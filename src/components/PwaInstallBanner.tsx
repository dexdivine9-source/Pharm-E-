import React, { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useSupabase } from '../lib/mock-db';

export default function PwaInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isDismissed, setIsDismissed] = useState(false);
  const { currentUser } = useSupabase();

  useEffect(() => {
    // Intercept the browser's native install prompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    
    // Show the native browser install prompt
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  // Only show the banner if:
  // 1. The browser supports PWA installation and hasn't installed it yet
  // 2. The user has successfully logged in
  // 3. The user hasn't explicitly dismissed this banner
  const showBanner = deferredPrompt !== null && currentUser !== null && !isDismissed;

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-4 left-4 right-4 md:left-auto md:w-[350px] bg-white/90 backdrop-blur-xl border border-slate-200/60 shadow-2xl rounded-2xl p-4 z-50 flex items-start gap-4"
        >
          <div className="bg-emerald-100 p-2 rounded-xl text-emerald-600 shrink-0 shadow-inner">
            <Download className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-slate-800 tracking-tight">Install Pharma-E</h3>
            <p className="text-xs text-slate-600 mt-1 font-medium leading-relaxed">
              Add Pharma-E to your home screen for faster ordering and instant notifications!
            </p>
            <div className="mt-3 flex gap-2">
              <button 
                onClick={handleInstall}
                className="flex-1 bg-emerald-600 text-white rounded-lg py-2 text-sm font-bold shadow hover:bg-emerald-700 transition-colors"
              >
                Install App
              </button>
            </div>
          </div>
          <button 
            onClick={() => setIsDismissed(true)}
            className="text-slate-400 hover:text-slate-600 transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
