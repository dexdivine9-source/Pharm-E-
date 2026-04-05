'use client';

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Activity, ArrowLeft, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';

export default function Auth() {
  const navigate = useNavigate();

  const handleLogin = (provider: string) => {
    console.log(`Logging in with ${provider}`);
    // Simulate login and redirect to dashboard
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      {/* Back to Home */}
      <Link 
        to="/" 
        className="absolute top-8 left-8 flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-emerald-600 transition-colors"
      >
        <ArrowLeft size={16} /> Back to Home
      </Link>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl shadow-emerald-100 p-8 md:p-12 text-center border border-slate-100"
      >
        <div className="mx-auto mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-200">
          <Activity size={32} />
        </div>

        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mb-2">
          Secure & Verified Access
        </h1>
        <p className="text-slate-500 mb-10">
          Join Pharma-E to access verified medicine across Ilorin.
        </p>

        <div className="space-y-4">
          <button 
            onClick={() => handleLogin('Google')}
            className="w-full flex items-center justify-center gap-3 h-14 rounded-2xl border border-slate-200 bg-white text-slate-700 font-bold hover:bg-slate-50 transition-all active:scale-95"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          <button 
            onClick={() => handleLogin('Apple')}
            className="w-full flex items-center justify-center gap-3 h-14 rounded-2xl bg-black text-white font-bold hover:bg-slate-900 transition-all active:scale-95"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.05 20.28c-.96.95-2.04 1.72-3.24 1.72-1.2 0-1.58-.73-3.03-.73-1.46 0-1.89.71-3.03.71-1.15 0-2.34-.84-3.32-1.82-2.02-2.02-3.55-5.69-3.55-8.96 0-5.27 3.42-8.05 6.66-8.05 1.73 0 3.03.63 4.01 1.25.6.38 1.1.84 1.51 1.34.41-.5.91-.96 1.51-1.34.98-.62 2.28-1.25 4.01-1.25 3.24 0 6.66 2.78 6.66 8.05 0 3.27-1.53 6.94-3.55 8.96-.98.98-2.17 1.82-3.32 1.82-1.14 0-1.57-.71-3.03-.71-1.45 0-1.83.73-3.03.73-1.2 0-2.28-.77-3.24-1.72zm-1.05-16.28c0-2.11 1.71-3.82 3.82-3.82.07 0 .14 0 .21.01-.13 2.08-1.84 3.74-3.89 3.74-.05 0-.1 0-.14-.01z"/>
            </svg>
            Continue with Apple
          </button>
        </div>

        {/* Divider */}
        <div className="mt-6 flex items-center gap-4">
          <div className="flex-1 h-px bg-slate-100"></div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">or</span>
          <div className="flex-1 h-px bg-slate-100"></div>
        </div>

        {/* Manual Sign In */}
        <button
          onClick={() => handleLogin('Manual')}
          className="mt-4 w-full flex items-center justify-center gap-3 h-14 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 text-slate-600 font-bold hover:border-emerald-400 hover:text-emerald-700 hover:bg-emerald-50 transition-all active:scale-95"
        >
          Sign in manually
        </button>

        <div className="mt-10 pt-8 border-t border-slate-50 flex items-center justify-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
          <ShieldCheck size={14} className="text-emerald-500" />
          End-to-End Verified Healthcare
        </div>
      </motion.div>
    </div>
  );
}
