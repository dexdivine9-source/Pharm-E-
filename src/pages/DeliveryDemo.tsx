'use client';

import React, { useState, useEffect } from 'react';
import { 
  Navigation, 
  Phone, 
  MessageSquare, 
  Clock, 
  MapPin, 
  ChevronRight, 
  Package, 
  ArrowLeft,
  ShieldCheck,
  Star,
  CheckCircle2,
  Camera,
  X,
  Home
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';

export default function DeliveryDemo() {
  const [progress, setProgress] = useState(75);
  const [showProof, setShowProof] = useState(false);
  const [isDelivered, setIsDelivered] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          setIsDelivered(true);
          return 100;
        }
        return prev + 1;
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const steps = [
    { label: "Order Confirmed", completed: true },
    { label: "Verified by Pharmacist", completed: true },
    { label: "Picked up from Tanke", completed: true },
    { label: progress >= 100 ? "Delivered" : "Arriving in 5 Mins", current: progress < 100, completed: progress >= 100 },
  ];

  return (
    <div className="flex h-screen flex-col bg-slate-50 font-sans text-slate-900 overflow-hidden">
      {/* Header */}
      <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6">
        <div className="flex items-center gap-4">
          <Link to="/demo/pharmacy" className="rounded-full p-2 hover:bg-slate-100 hover:scale-105 transition-transform">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Real-time Tracking</h1>
            <p className="text-lg font-mono font-bold">GP-2026-1023</p>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
          <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-500"></div>
          Live
        </div>
      </header>

      {/* Map Simulation Area */}
      <div className="relative flex-1 bg-slate-200 overflow-hidden m-4 rounded-3xl border border-slate-300 shadow-inner">
        {/* Fake Map Grid */}
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
        
        {/* Route Line */}
        <svg className="absolute inset-0 h-full w-full">
          <path 
            d="M 100 500 Q 300 400 500 200" 
            fill="none" 
            stroke="#10b981" 
            strokeWidth="6" 
            strokeDasharray="12 12"
            className="opacity-30"
          />
          <motion.path 
            d="M 100 500 Q 300 400 500 200" 
            fill="none" 
            stroke="#10b981" 
            strokeWidth="6" 
            initial={{ pathLength: 0 }}
            animate={{ pathLength: progress / 100 }}
            transition={{ duration: 0.5 }}
          />
        </svg>

        {/* Rider Icon */}
        <motion.div 
          className="absolute z-20"
          animate={{ 
            left: `${progress}%`, 
            top: `${70 - (progress * 0.5)}%` 
          }}
          transition={{ duration: 0.5 }}
        >
          <div className="relative">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-600 text-white shadow-2xl shadow-emerald-400 ring-4 ring-white">
              <Navigation size={28} className="rotate-45" />
            </div>
            <div className="absolute -top-14 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white shadow-xl">
              Samuel is moving 🛵
              <div className="absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 bg-slate-900"></div>
            </div>
          </div>
        </motion.div>

        {/* Destination Icon */}
        <div className="absolute top-[20%] left-[50%] z-10">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-slate-900 shadow-xl ring-4 ring-emerald-100">
            <MapPin size={24} className="text-emerald-600" />
          </div>
          <div className="absolute -top-14 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-xl bg-white px-4 py-2 text-xs font-bold text-slate-900 shadow-xl border border-slate-100">
            Home (Tanke)
            <div className="absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 bg-white border-b border-r border-slate-100"></div>
          </div>
        </div>
      </div>

      {/* Delivery Info Card */}
      <motion.div 
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="z-30 rounded-t-[40px] bg-white p-8 shadow-[0_-20px_50px_rgba(0,0,0,0.1)] border-t border-slate-100"
      >
        <div className="mx-auto mb-6 h-1.5 w-16 rounded-full bg-slate-100"></div>
        
        <AnimatePresence mode="wait">
          {isDelivered ? (
            <motion.div 
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-4"
            >
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <CheckCircle2 size={48} />
              </div>
              <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">Delivered Successfully</h2>
              <p className="mt-2 text-slate-500 font-medium">Your health is our priority. Thank you for choosing GoPharma!</p>
              <div className="mt-8 flex justify-center gap-4">
                <button 
                  onClick={() => setShowProof(true)}
                  className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 hover:scale-105 transition-transform"
                >
                  <Camera size={18} /> View Proof
                </button>
                <Link to="/" className="flex items-center gap-2 rounded-full bg-emerald-600 px-8 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-200 hover:bg-emerald-700 hover:scale-105 transition-all">
                  <Home size={18} /> Back to Start
                </Link>
              </div>
            </motion.div>
          ) : (
            <motion.div key="tracking">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-extrabold tracking-tight">Arriving in 5 mins</h2>
                  <p className="text-slate-500 font-medium">Samuel is bringing your order from GRA</p>
                </div>
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                  <Clock size={28} />
                </div>
              </div>

              {/* Progress Stepper */}
              <div className="mb-10 relative">
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-100"></div>
                <div className="space-y-6 relative">
                  {steps.map((step, idx) => (
                    <div key={idx} className="flex items-center gap-4">
                      <div className={`z-10 flex h-8 w-8 items-center justify-center rounded-full border-4 border-white shadow-sm ${
                        step.completed ? 'bg-emerald-600 text-white' : 
                        step.current ? 'bg-emerald-100 text-emerald-600 animate-pulse' : 
                        'bg-slate-100 text-slate-400'
                      }`}>
                        {step.completed ? <CheckCircle2 size={14} /> : 
                         idx === 3 ? <Truck size={14} /> : 
                         <div className="h-2 w-2 rounded-full bg-current"></div>}
                      </div>
                      <span className={`text-sm font-bold ${
                        step.completed ? 'text-slate-900' : 
                        step.current ? 'text-emerald-700' : 
                        'text-slate-400'
                      }`}>
                        {step.label} {step.completed && '✅'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Rider Profile Mini */}
              <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50/50 p-4">
                <div className="flex items-center gap-4">
                  <img src="https://picsum.photos/seed/rider/100/100" alt="Rider" className="h-12 w-12 rounded-xl object-cover" referrerPolicy="no-referrer" />
                  <div>
                    <h3 className="text-sm font-bold">Samuel Olawale</h3>
                    <p className="text-xs text-slate-500">Kwara Express Rider</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-emerald-600 shadow-sm border border-slate-100 hover:scale-105 transition-transform">
                    <MessageSquare size={18} />
                  </button>
                  <button className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-lg shadow-emerald-200 hover:scale-105 transition-transform">
                    <Phone size={18} />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Proof of Delivery Modal */}
      <AnimatePresence>
        {showProof && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 p-6 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl"
            >
              <button 
                onClick={() => setShowProof(false)}
                className="absolute top-4 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/20 text-white backdrop-blur-md hover:bg-black/40 hover:scale-110 transition-transform"
              >
                <X size={20} />
              </button>
              <div className="p-6">
                <h3 className="mb-4 text-xl font-bold">Proof of Delivery</h3>
                <div className="overflow-hidden rounded-2xl border-4 border-emerald-50 shadow-inner">
                  <img src="https://picsum.photos/seed/pharma-bag/600/800" alt="Proof of Delivery" className="w-full object-cover" referrerPolicy="no-referrer" />
                </div>
                <div className="mt-4 flex items-center gap-3 rounded-xl bg-emerald-50 p-4">
                  <ShieldCheck className="text-emerald-600" size={24} />
                  <div>
                    <p className="text-xs font-bold text-emerald-800 uppercase">Tamper-Proof Seal Intact</p>
                    <p className="text-[10px] text-emerald-600">Verified by GoPharma Ilorin</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const Truck = ({ size, className }: { size: number, className?: string }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <rect x="1" y="3" width="15" height="13" />
    <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
    <circle cx="5.5" cy="18.5" r="2.5" />
    <circle cx="18.5" cy="18.5" r="2.5" />
  </svg>
);

