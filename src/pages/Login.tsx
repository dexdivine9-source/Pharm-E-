import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate, Link } from 'react-router-dom';
import { Activity, AlertCircle, ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';

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

export default function Login() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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
      setError(err.message || `Could not sign in with ${provider}`);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-emerald-50 relative flex flex-col items-center justify-center p-4 overflow-hidden font-sans">
      {/* Mesh gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-200 via-white to-teal-100" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-300 rounded-full blur-[120px] opacity-40 animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-200 rounded-full blur-[120px] opacity-40 animate-pulse delay-1000" />

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
        <div className="flex flex-col items-center justify-center mb-10">
          <div className="bg-white/60 backdrop-blur-xl border border-white/40 p-4 rounded-2xl shadow-xl mb-4 text-emerald-600 flex items-center justify-center">
            <Activity className="h-10 w-10" />
          </div>
          <h1 className="text-3xl font-extrabold text-emerald-900 tracking-tight">Pharma-E</h1>
          <p className="text-emerald-700/80 font-medium mt-1">Welcome back</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm flex items-center gap-2 border border-red-100">
            <AlertCircle className="w-4 h-4 shrink-0" /> {error}
          </div>
        )}

        {/* Social Sign In Buttons */}
        <div className="space-y-3">
          <button
            type="button"
            onClick={() => handleSocialLogin('google')}
            disabled={loading}
            className="w-full h-14 bg-white/40 backdrop-blur-xl border border-white/40 rounded-full flex items-center shadow-lg hover:bg-white/60 transition-all px-3 gap-3 disabled:opacity-60"
          >
            <div className="bg-white h-10 w-10 rounded-full flex items-center justify-center shadow-sm shrink-0">
              <GoogleIcon />
            </div>
            <span className="flex-1 text-center font-bold text-slate-800 pr-10">
              {loading ? 'Redirecting...' : 'Continue with Google'}
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleSocialLogin('apple')}
            disabled={loading}
            className="w-full h-14 bg-white/40 backdrop-blur-xl border border-white/40 rounded-full flex items-center shadow-lg hover:bg-white/60 transition-all px-3 gap-3 disabled:opacity-60"
          >
            <div className="bg-black h-10 w-10 rounded-full flex items-center justify-center shadow-sm shrink-0 text-white">
              <AppleIcon />
            </div>
            <span className="flex-1 text-center font-bold text-slate-800 pr-10">Continue with Apple</span>
          </button>
        </div>

        {/* Footer */}
        <div className="pt-6 text-center space-y-3">
          <p className="text-slate-500 text-sm">
            Don't have an account?{' '}
            <Link to="/signup" className="text-emerald-700 font-semibold hover:underline">
              Create one
            </Link>
          </p>
          <p className="text-slate-400 text-xs">
            By signing in, you agree to our{' '}
            <a href="#" className="underline">Terms of Use</a> and{' '}
            <a href="#" className="underline">Privacy Policy</a>.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
