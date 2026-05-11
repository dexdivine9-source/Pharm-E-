import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, MessageCircle, PhoneCall, HeartPulse } from 'lucide-react';
import { motion } from 'motion/react';

export default function PharmacistConsult() {
  const PHARMA_E_NUMBER = '2348000000000'; // Placeholder contact number
  const WA_LINK = `https://wa.me/${PHARMA_E_NUMBER}?text=Hi%2C%20I%20need%20to%20speak%20with%20a%20pharmacist`;
  const TEL_LINK = `tel:${PHARMA_E_NUMBER}`;

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center gap-4">
          <Link to="/dashboard" className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-full transition-colors">
            <ArrowLeft className="h-6 w-6" />
          </Link>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
              Talk with a Pharmacist
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="mx-auto w-24 h-24 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mb-8 shadow-inner border-4 border-white">
            <HeartPulse className="w-12 h-12" />
          </div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight sm:text-5xl">How would you like to connect?</h2>
          <p className="mt-6 text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
            Our certified pharmacists are available to answer your medication questions, provide dosage guidance, and verify prescriptions.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {/* WhatsApp Option */}
          <motion.a 
            href={WA_LINK}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="group flex flex-col items-center justify-center p-10 bg-white rounded-3xl border-2 border-emerald-100 shadow-sm hover:border-emerald-400 hover:shadow-2xl hover:shadow-emerald-500/20 transition-all duration-300"
          >
            <div className="w-24 h-24 bg-[#25D366]/10 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-[#25D366]/20 transition-all duration-300">
              <MessageCircle className="w-12 h-12 text-[#25D366]" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-3">Chat on WhatsApp</h3>
            <p className="text-slate-500 text-center mb-10 leading-relaxed">Send us a message and get a quick reply from our team.</p>
            
            <div className="w-full py-4 bg-[#25D366] text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-[#25D366]/30 group-hover:bg-[#20bd5a] transition-colors text-lg">
              Open WhatsApp
            </div>
          </motion.a>

          {/* Phone Call Option */}
          <motion.a 
            href={TEL_LINK}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="group flex flex-col items-center justify-center p-10 bg-white rounded-3xl border-2 border-blue-100 shadow-sm hover:border-blue-500 hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-300"
          >
            <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-blue-100 transition-all duration-300">
              <PhoneCall className="w-12 h-12 text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-3">Call via Phone</h3>
            <p className="text-slate-500 text-center mb-10 leading-relaxed">Speak directly with an available pharmacist immediately.</p>
            
            <div className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 group-hover:bg-blue-700 transition-colors text-lg">
              Call Now
            </div>
          </motion.a>
        </div>
      </main>
    </div>
  );
}
