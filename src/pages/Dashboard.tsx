'use client';

import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, 
  QrCode, 
  Bike, 
  Activity, 
  LogOut, 
  ChevronRight,
  Bell,
  User
} from 'lucide-react';
import { motion } from 'motion/react';

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Dashboard Header */}
      <nav className="sticky top-0 z-50 border-b border-slate-100 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-lg shadow-emerald-200">
              <Activity size={24} />
            </div>
            <span className="text-2xl font-black tracking-tighter text-slate-900 font-sans">GoPharma</span>
          </Link>
          
          <div className="flex items-center gap-4">
            <button className="relative flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition-all hover:bg-slate-200">
              <Bell size={20} />
              <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-white"></span>
            </button>
            <div className="h-10 w-10 overflow-hidden rounded-full border-2 border-emerald-100">
              <img src="https://picsum.photos/seed/user/100/100" alt="User Profile" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
            </div>
            <Link to="/auth" className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition-all hover:bg-red-50 hover:text-red-600">
              <LogOut size={20} />
            </Link>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Welcome Header */}
        <div className="mb-12">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
              Welcome back, <span className="text-emerald-600">Divine</span>
            </h1>
            <p className="mt-2 text-lg text-slate-500">
              What would you like to do today?
            </p>
          </motion.div>
        </div>

        {/* Action Cards Grid */}
        <div className="grid gap-8 md:grid-cols-3">
          {/* Action 1: Find & Buy */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Link 
              to="/search"
              className="group relative flex flex-col h-full overflow-hidden rounded-[2rem] bg-white p-8 shadow-xl shadow-emerald-100/50 border border-slate-100 transition-all hover:-translate-y-2 hover:shadow-2xl"
            >
              <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 transition-colors group-hover:bg-emerald-600 group-hover:text-white">
                <Search size={40} />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-3">Find & Buy</h2>
              <p className="text-slate-500 leading-relaxed mb-8">
                Search across all verified pharmacies in Nigeria and purchase securely online.
              </p>
              <div className="mt-auto flex items-center font-bold text-emerald-600 group-hover:translate-x-2 transition-transform">
                Start Searching <ChevronRight size={20} />
              </div>
            </Link>
          </motion.div>

          {/* Action 2: Scan to Collect */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="group relative flex flex-col h-full overflow-hidden rounded-[2rem] bg-white p-8 shadow-xl shadow-emerald-100/50 border border-slate-100 transition-all hover:-translate-y-2 hover:shadow-2xl">
              <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 transition-colors group-hover:bg-blue-600 group-hover:text-white">
                <QrCode size={40} />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-3">Scan to Collect</h2>
              <p className="text-slate-500 leading-relaxed mb-8">
                Use your unique QR code for instant, queue-free pickup at your chosen pharmacy.
              </p>
              <div className="mt-auto space-y-3">
                <button className="w-full flex items-center justify-center gap-2 h-14 rounded-2xl bg-slate-900 text-white font-bold transition-all hover:scale-105 active:scale-95">
                  <QrCode size={20} /> Open QR Scanner
                </button>
                <button className="w-full flex items-center justify-center gap-2 h-14 rounded-2xl border border-slate-200 bg-white text-slate-700 font-bold transition-all hover:bg-slate-50">
                  View My Codes
                </button>
              </div>
            </div>
          </motion.div>

          {/* Action 3: Track My Rider */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Link 
              to="/demo/delivery"
              className="group relative flex flex-col h-full overflow-hidden rounded-[2rem] bg-white p-8 shadow-xl shadow-emerald-100/50 border border-slate-100 transition-all hover:-translate-y-2 hover:shadow-2xl"
            >
              <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 transition-colors group-hover:bg-amber-600 group-hover:text-white">
                <Bike size={40} />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-3">Track My Rider</h2>
              <p className="text-slate-500 leading-relaxed mb-8">
                Monitor your medication delivery in real-time. Average delivery time: 15 mins.
              </p>
              <div className="mt-auto flex items-center font-bold text-amber-600 group-hover:translate-x-2 transition-transform">
                View Active Deliveries <ChevronRight size={20} />
              </div>
            </Link>
          </motion.div>
        </div>

        {/* Recent Activity Section */}
        <div className="mt-16">
          <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <Activity size={20} className="text-emerald-600" /> Recent Activity
          </h3>
          <div className="rounded-[2rem] bg-white border border-slate-100 overflow-hidden shadow-sm">
            {[
              { title: "Artemether/Lumefantrine", pharmacy: "Peace Standard", status: "Delivered", date: "Today, 2:30 PM" },
              { title: "Paracetamol 500mg", pharmacy: "Medsoft Pharmacy", status: "Ready for Pickup", date: "Yesterday" }
            ].map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-6 border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400">
                    <Activity size={24} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{item.title}</p>
                    <p className="text-sm text-slate-500">{item.pharmacy}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-bold ${item.status === 'Delivered' ? 'text-emerald-600' : 'text-blue-600'}`}>
                    {item.status}
                  </p>
                  <p className="text-xs text-slate-400">{item.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
