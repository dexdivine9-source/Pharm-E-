import React, { useState, useEffect } from 'react';
import { useSupabase } from '../lib/mock-db';
import { useNavigate } from 'react-router-dom';
import { Activity, AlertCircle, Mail, ArrowLeft, ShieldCheck, CheckCircle2 } from 'lucide-react';
import SocialButtons from '../components/auth/SocialButtons';
import { motion, AnimatePresence } from 'motion/react';

export default function Login() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const { login, allProfiles } = useSupabase();
  const navigate = useNavigate();

  const handleManualAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Mock delay for "sending email"
    setTimeout(() => {
      // Mock Duplicate checking logic
      const existingUser = allProfiles.find(p => p.email.toLowerCase() === email.toLowerCase());

      if (isSignUp) {
        if (!fullName) {
          setError("Full Name is required for registration.");
          setLoading(false);
          return;
        }
        if (existingUser) {
          setError("An account with this email already exists.");
          setLoading(false);
          return;
        }
      } else {
        if (!existingUser) {
          setError("Account not found. Please sign up first.");
          setLoading(false);
          return;
        }
      }

      setLoading(false);
      setIsVerifying(true);
    }, 1500);
  };

  const handleVerifyOTP = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // In a real app, this would verify with backend
    // For demo, any 6-digit code works, or we can check for '123456'
    setTimeout(() => {
      const existingUser = allProfiles.find(p => p.email.toLowerCase() === email.toLowerCase());
      login(email, fullName || existingUser?.full_name || 'Verified User');
      navigate('/');
    }, 1500);
  };

  const handleSocialLogin = (provider: 'google' | 'apple') => {
    setError(null);
    setLoading(true);

    setTimeout(() => {
      let mockEmail = '';
      let mockName = '';

      if (provider === 'google') {
        mockEmail = 'user-google@example.com';
        mockName = 'Google Social User';
      } else {
        mockEmail = 'user-apple@example.com';
        mockName = 'Apple Social User';
      }

      login(mockEmail, mockName);
      navigate('/');
    }, 1200);
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) value = value.slice(-1);
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="sm:mx-auto sm:w-full sm:max-w-md"
        >
          <div className="bg-white py-10 px-6 sm:px-12 rounded-[2.5rem] shadow-2xl shadow-emerald-100/50 border border-slate-100">
            <button 
              onClick={() => setIsVerifying(false)}
              className="mb-8 flex items-center gap-2 text-slate-400 hover:text-emerald-600 transition-colors font-bold text-sm"
            >
              <ArrowLeft size={18} /> Back
            </button>

            <div className="text-center mb-8">
              <div className="mx-auto w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mb-6">
                <ShieldCheck className="w-8 h-8 text-emerald-600" />
              </div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">Verify Email</h2>
              <p className="mt-2 text-slate-500">
                We've sent a 6-digit code to <span className="font-bold text-slate-900">{email}</span>
              </p>
            </div>

            <form onSubmit={handleVerifyOTP} className="space-y-8">
              <div className="flex justify-between gap-2">
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    id={`otp-${idx}`}
                    type="text"
                    inputMode="numeric"
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    className="w-12 h-14 text-center text-2xl font-black text-emerald-600 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-emerald-500 focus:bg-white focus:outline-none transition-all"
                    required
                  />
                ))}
              </div>

              <button
                type="submit"
                disabled={loading || otp.some(d => !d)}
                className="w-full h-14 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all active:scale-[0.98] shadow-xl shadow-slate-200 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>Verify & Continue <CheckCircle2 size={20} /></>
                )}
              </button>

              <p className="text-center text-sm text-slate-400">
                Didn't receive the code? <button type="button" className="text-emerald-600 font-bold hover:underline">Resend</button>
              </p>
            </form>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sm:mx-auto sm:w-full sm:max-w-md"
      >
        <div className="text-center mb-10">
          <div className="mx-auto w-16 h-16 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-xl shadow-emerald-200 mb-6">
            <Activity className="h-9 w-9 text-white" />
          </div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter">
            {isSignUp ? 'Create account' : 'Welcome back'}
          </h2>
          <p className="mt-3 text-slate-500 text-lg">
            {isSignUp ? 'Start your healthcare journey today' : 'Access your medical dashboard'}
          </p>
        </div>

        <div className="bg-white py-10 px-6 sm:px-12 rounded-[2.5rem] shadow-2xl shadow-emerald-100/50 border border-slate-100">
          
          <SocialButtons onSocialLogin={handleSocialLogin} />

          <div className="my-8 flex items-center gap-4">
            <div className="flex-1 h-px bg-slate-100" />
            <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">Or email</span>
            <div className="flex-1 h-px bg-slate-100" />
          </div>

          <form className="space-y-5" onSubmit={handleManualAuth}>
            <AnimatePresence mode="wait">
              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-4 bg-red-50 text-red-700 text-sm rounded-2xl flex items-start gap-3 border border-red-100 mb-4"
                >
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <span className="font-medium">{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {isSignUp && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <div className="relative group">
                  <input
                    id="fullName"
                    type="text"
                    required={isSignUp}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="peer w-full px-5 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:border-emerald-500 focus:bg-white focus:outline-none transition-all placeholder-transparent"
                    placeholder="Full Name"
                  />
                  <label htmlFor="fullName" className="absolute left-5 top-4 text-slate-400 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-4 peer-focus:-top-2.5 peer-focus:left-4 peer-focus:text-xs peer-focus:text-emerald-600 peer-focus:bg-white peer-focus:px-1 font-bold pointer-events-none">
                    Full Name
                  </label>
                </div>
              </motion.div>
            )}

            <div className="relative">
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="peer w-full px-5 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:border-emerald-500 focus:bg-white focus:outline-none transition-all placeholder-transparent"
                placeholder="Email address"
              />
              <label htmlFor="email" className="absolute left-5 top-4 text-slate-400 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-4 peer-focus:-top-2.5 peer-focus:left-4 peer-focus:text-xs peer-focus:text-emerald-600 peer-focus:bg-white peer-focus:px-1 font-bold pointer-events-none">
                Email address
              </label>
            </div>

            <div className="relative">
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="peer w-full px-5 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:border-emerald-500 focus:bg-white focus:outline-none transition-all placeholder-transparent"
                placeholder="Password"
              />
              <label htmlFor="password" className="absolute left-5 top-4 text-slate-400 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-4 peer-focus:-top-2.5 peer-focus:left-4 peer-focus:text-xs peer-focus:text-emerald-600 peer-focus:bg-white peer-focus:px-1 font-bold pointer-events-none">
                Password
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-14 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 transition-all active:scale-[0.98] shadow-xl shadow-emerald-100 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>{isSignUp ? 'Create Account' : 'Sign In'} <ArrowLeft className="rotate-180" size={18} /></>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError(null);
              }}
              className="text-slate-400 hover:text-emerald-600 text-sm font-bold transition-colors"
            >
              {isSignUp ? (
                <>Already have an account? <span className="text-emerald-600">Sign in</span></>
              ) : (
                <>Don't have an account? <span className="text-emerald-600">Sign up</span></>
              )}
            </button>
          </div>
          
        </div>
      </motion.div>
    </div>
  );
}
