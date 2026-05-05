import React, { useState, useEffect } from 'react';
import { useSupabase } from '../lib/mock-db';
import { supabase } from '../lib/supabase';
import { useNavigate, Link } from 'react-router-dom';
import { Activity, AlertCircle, Mail, ArrowLeft, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const GoogleIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24">
    <path fill="#EA4335" d="M12 5.04c1.94 0 3.51.68 4.75 1.81l3.5-3.5C18.16 1.42 15.34 0 12 0 7.31 0 3.25 2.67 1.25 6.58l3.92 3.04c.93-2.8 3.53-4.58 6.83-4.58z"/>
    <path fill="#4285F4" d="M23.49 12.27c0-.85-.07-1.48-.22-2.11h-11.27v4.01h6.44c-.28 1.48-1.12 2.74-2.38 3.58l3.72 2.88c2.18-2.02 3.44-5.02 3.44-8.36z"/>
    <path fill="#FBBC05" d="M5.17 14.85c-.24-.72-.38-1.49-.38-2.3s.14-1.58.38-2.3L1.25 7.21C.45 8.7 0 10.3 0 12s.45 3.3 1.25 4.79l3.92-2.94z"/>
    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.72-2.88c-1.1.74-2.51 1.18-4.21 1.18-3.3 0-6.1-2.26-7.1-5.31l-3.92 2.94C3.06 20.94 6.94 24 12 24z"/>
  </svg>
);

const AppleIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.05 20.28c-.96.95-2.05 1.72-3.23 1.72-1.14 0-1.49-.69-2.82-.69-1.33 0-1.74.67-2.82.67-1.12 0-2.15-.7-3.14-1.68C2.9 18.23 1.54 15.36 1.54 12.35c0-2.97 1.86-4.54 3.67-4.54 1.05 0 1.86.63 2.69.63.83 0 1.63-.67 2.87-.67 1.14 0 2.03.54 2.8 1.55-1.58.91-1.31 3.26.24 3.91-.71 1.73-1.63 3.42-2.76 5.05zm-2.07-15.11c-.56.67-1.49 1.13-2.38 1.06-.1-.85.34-1.78.85-2.39.58-.69 1.56-1.14 2.38-1.06.11.89-.29 1.72-.85 2.39z"/>
  </svg>
);

export default function SignUp() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [timer, setTimer] = useState(60);

  const { login } = useSupabase();
  const navigate = useNavigate();

  useEffect(() => {
    let interval: any;
    if (isVerifying && timer > 0) {
      interval = setInterval(() => setTimer((p) => p - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isVerifying, timer]);

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setError(null);
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({ email });
      if (error) throw error;
      setIsVerifying(true);
      setTimer(60);
    } catch (err: any) {
      setError(err.message || 'Failed to send verification code.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) return;
    setError(null);
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.verifyOtp({ email, token: otp, type: 'email' });
      if (error) throw error;
      const fullName = data.user?.user_metadata?.full_name || email.split('@')[0] || 'User';
      login(email, fullName);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Invalid code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'apple') => {
    if (provider === 'apple') { alert('Coming soon.'); return; }
    setError(null);
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: `${window.location.origin}/auth/callback` }
      });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message || `Could not authenticate with ${provider}`);
      setLoading(false);
    }
  };

  const BgLayer = () => (
    <>
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-200 via-white to-teal-100" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-300 rounded-full blur-[120px] opacity-40 animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-200 rounded-full blur-[120px] opacity-40 animate-pulse delay-1000" />
    </>
  );

  // ── OTP VERIFICATION VIEW ──
  if (isVerifying) {
    return (
      <div className="min-h-screen bg-emerald-50 relative flex flex-col items-center justify-center p-4 overflow-hidden">
        <BgLayer />
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative w-full max-w-sm"
        >
          <div className="bg-white/50 backdrop-blur-xl border border-white/50 rounded-[2.5rem] p-10 shadow-2xl text-center">
            <div className="mx-auto w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mb-6 shadow-lg">
              <ShieldCheck className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Check your email</h2>
            <p className="text-slate-500 mb-8 text-sm">
              We sent a 6-digit code to <span className="font-semibold text-slate-700">{email}</span>
            </p>

            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm mb-4 flex items-center gap-2 border border-red-100">
                <AlertCircle className="w-4 h-4 shrink-0" /> {error}
              </div>
            )}

            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <input
                type="text"
                inputMode="numeric"
                placeholder="• • • • • •"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                className="w-full py-4 text-center tracking-[0.6em] font-mono text-2xl bg-white/70 border border-white/60 rounded-full focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder-slate-300 text-slate-800"
                maxLength={6}
                required
              />
              <button
                type="submit"
                disabled={loading || otp.length < 6}
                className="w-full py-4 bg-emerald-600 text-white rounded-full font-bold hover:bg-emerald-700 shadow-lg transition-all disabled:opacity-50"
              >
                {loading ? 'Verifying...' : 'Verify & Create Account'}
              </button>
            </form>

            <div className="mt-4 space-y-2">
              <button
                onClick={() => setIsVerifying(false)}
                className="text-sm text-slate-500 hover:text-slate-700 transition-colors"
              >
                ← Use a different email
              </button>
              <div>
                {timer > 0 ? (
                  <p className="text-xs text-slate-400">Resend in {timer}s</p>
                ) : (
                  <button
                    onClick={handleSendCode}
                    disabled={loading}
                    className="text-xs text-emerald-600 font-semibold hover:underline"
                  >
                    Resend Code
                  </button>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // ── SIGN UP MAIN VIEW ──
  return (
    <div className="min-h-screen bg-emerald-50 relative flex flex-col items-center justify-center p-4 overflow-hidden font-sans">
      <BgLayer />

      {/* Back Button */}
      <button
        onClick={() => navigate('/')}
        className="absolute top-6 left-6 flex items-center gap-2 text-emerald-800/60 hover:text-emerald-800 transition-colors font-medium bg-white/30 hover:bg-white/50 backdrop-blur-md px-4 py-2 rounded-full border border-white/40 shadow-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Home
      </button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-sm space-y-4"
      >
        {/* Brand Logo */}
        <div className="flex flex-col items-center justify-center mb-8">
          <div className="bg-white/60 backdrop-blur-xl border border-white/40 p-4 rounded-2xl shadow-xl mb-4 text-emerald-600 flex items-center justify-center">
            <Activity className="h-10 w-10" />
          </div>
          <h1 className="text-3xl font-extrabold text-emerald-900 tracking-tight">Pharma-E</h1>
          <p className="text-emerald-700/80 font-medium mt-1">Create your account</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm flex items-center gap-2 border border-red-100">
            <AlertCircle className="w-4 h-4 shrink-0" /> {error}
          </div>
        )}

        {/* Email Sign Up */}
        <form onSubmit={handleSendCode} className="space-y-3">
          <div className="bg-white/40 backdrop-blur-xl border border-white/40 rounded-full p-2 shadow-xl flex items-center gap-3 px-4 h-14">
            <Mail className="h-5 w-5 text-slate-500 shrink-0" />
            <input
              type="email"
              placeholder="Sign up with your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-transparent border-none focus:ring-0 text-slate-800 placeholder-slate-400 w-full font-medium text-sm"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading || !email}
            className="w-full h-14 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full font-bold shadow-lg transition-all disabled:opacity-50"
          >
            {loading ? 'Sending code...' : 'Send Verification Code'}
          </button>
        </form>

        {/* Divider */}
        <div className="relative flex items-center py-2">
          <div className="flex-grow border-t border-emerald-900/10" />
          <span className="flex-shrink-0 mx-4 text-emerald-900/30 text-sm font-medium">OR</span>
          <div className="flex-grow border-t border-emerald-900/10" />
        </div>

        {/* Social Buttons */}
        <div className="space-y-3">
          <button
            type="button"
            onClick={() => handleSocialLogin('google')}
            className="w-full h-14 bg-white/40 backdrop-blur-xl border border-white/40 rounded-full flex items-center shadow-lg hover:bg-white/60 transition-all px-3 gap-3"
          >
            <div className="bg-white h-10 w-10 rounded-full flex items-center justify-center shadow-sm shrink-0">
              <GoogleIcon />
            </div>
            <span className="flex-1 text-center font-bold text-slate-800 pr-10">Continue with Google</span>
          </button>

          <button
            type="button"
            onClick={() => handleSocialLogin('apple')}
            className="w-full h-14 bg-white/40 backdrop-blur-xl border border-white/40 rounded-full flex items-center shadow-lg hover:bg-white/60 transition-all px-3 gap-3"
          >
            <div className="bg-black h-10 w-10 rounded-full flex items-center justify-center shadow-sm shrink-0 text-white">
              <AppleIcon />
            </div>
            <span className="flex-1 text-center font-bold text-slate-800 pr-10">Continue with Apple</span>
          </button>
        </div>

        {/* Footer */}
        <div className="pt-4 text-center space-y-3">
          <p className="text-slate-500 text-sm">
            Already have an account?{' '}
            <Link to="/login" className="text-emerald-700 font-semibold hover:underline">
              Sign In
            </Link>
          </p>
          <p className="text-slate-400 text-xs">
            By continuing, you agree to our{' '}
            <a href="#" className="underline">Terms of Use</a> and{' '}
            <a href="#" className="underline">Privacy Policy</a>.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
