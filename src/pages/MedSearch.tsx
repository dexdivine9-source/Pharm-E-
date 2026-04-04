'use client';

import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Mic, 
  Camera, 
  ArrowLeft, 
  ArrowRight,
  MapPin, 
  Navigation, 
  ShieldCheck, 
  Clock, 
  Filter,
  ChevronRight,
  Star,
  Activity,
  QrCode,
  Bike
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';

const PHARMACIES = [
  {
    id: 1,
    name: "Peace Standard Pharmacy",
    location: "Tanke, Ilorin",
    distance: "0.8 km",
    price: "₦4,000",
    stock: "In Stock",
    rating: 4.8,
    image: "https://picsum.photos/seed/pharmacy1/400/300"
  },
  {
    id: 2,
    name: "Medsoft Pharmacy",
    location: "GRA, Ilorin",
    distance: "2.4 km",
    price: "₦4,200",
    stock: "In Stock",
    rating: 4.9,
    image: "https://picsum.photos/seed/pharmacy2/400/300"
  },
  {
    id: 3,
    name: "Basin Central Pharmacy",
    location: "Basin, Ilorin",
    distance: "4.1 km",
    price: "₦3,850",
    stock: "Limited Stock",
    rating: 4.6,
    image: "https://picsum.photos/seed/pharmacy3/400/300"
  }
];

export default function MedSearch() {
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!query.trim()) return;
    
    setIsSearching(true);
    setShowResults(false);
    
    // Simulate search delay
    setTimeout(() => {
      setIsSearching(false);
      setShowResults(true);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-slate-100 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-lg shadow-emerald-200">
              <Activity size={24} />
            </div>
            <span className="text-2xl font-black tracking-tighter text-slate-900 font-sans">GoPharma</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/auth" className="hidden sm:flex items-center gap-2 rounded-full bg-slate-900 px-5 py-2 text-sm font-bold text-white transition-all hover:bg-slate-800 hover:scale-105">
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Sign in
            </Link>
            <Link to="/" className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-2 text-sm font-bold text-slate-700 transition-all hover:bg-slate-50 hover:scale-105">
              <ArrowLeft size={16} /> Back
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-slate-50 py-16 lg:py-24">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl"
          >
            GoPharma: Find Your Medicine <span className="text-emerald-600">in Seconds.</span>
          </motion.h1>
          <p className="mt-6 text-lg text-slate-600">
            Search across verified pharmacies in Ilorin. Real-time stock, prices, and fast delivery.
          </p>

          {/* Search Bar */}
          <div className="mt-10">
            <form onSubmit={handleSearch} className="relative mx-auto max-w-2xl">
              <div className="relative flex items-center overflow-hidden rounded-2xl bg-white p-2 shadow-2xl shadow-emerald-100 ring-1 ring-slate-200 focus-within:ring-2 focus-within:ring-emerald-500/20">
                <div className="flex h-12 w-12 items-center justify-center text-slate-400">
                  <Search size={24} />
                </div>
                <input 
                  type="text" 
                  placeholder="Search for 'Artemether', 'Insulin', 'Paracetamol'..." 
                  className="flex-1 bg-transparent py-4 text-lg outline-none placeholder:text-slate-400"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                <div className="flex items-center gap-2 px-2">
                  <button type="button" className="flex h-12 w-12 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-50 hover:text-emerald-600 transition-colors">
                    <Mic size={24} />
                  </button>
                  <button type="button" className="flex h-12 w-12 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-50 hover:text-emerald-600 transition-colors">
                    <Camera size={24} />
                  </button>
                  <button 
                    type="submit"
                    className="hidden h-12 items-center justify-center rounded-xl bg-emerald-600 px-6 font-bold text-white shadow-lg shadow-emerald-200 transition-all hover:bg-emerald-700 hover:scale-105 active:scale-95 sm:flex"
                  >
                    Search
                  </button>
                </div>
              </div>
              <button 
                type="submit"
                className="mt-4 flex w-full h-14 items-center justify-center rounded-2xl bg-emerald-600 font-bold text-white shadow-lg shadow-emerald-200 transition-all hover:bg-emerald-700 hover:scale-105 active:scale-95 sm:hidden"
              >
                Search Medicine
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Results Section */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <AnimatePresence mode="wait">
          {isSearching ? (
            <motion.div 
              key="searching"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-20"
            >
              <div className="relative flex h-20 w-20 items-center justify-center">
                <div className="absolute h-full w-full animate-ping rounded-full bg-emerald-100 opacity-75"></div>
                <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-emerald-600 text-white shadow-xl">
                  <Activity size={32} className="animate-pulse" />
                </div>
              </div>
              <h3 className="mt-8 text-xl font-bold text-slate-900">Scanning Ilorin Pharmacies...</h3>
              <p className="mt-2 text-slate-500">Checking real-time stock and prices</p>
            </motion.div>
          ) : showResults ? (
            <motion.div 
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-6">
                <h2 className="text-2xl font-bold text-slate-900">
                  Results for "<span className="text-emerald-600">{query}</span>"
                </h2>
                <button className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50">
                  <Filter size={16} /> Filter
                </button>
              </div>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {PHARMACIES.map((pharmacy, idx) => (
                  <motion.div 
                    key={pharmacy.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="group overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm transition-all hover:-translate-y-2 hover:shadow-xl"
                  >
                    <div className="relative h-48">
                      <img src={pharmacy.image} alt={pharmacy.name} className="h-full w-full object-cover transition-transform group-hover:scale-110" referrerPolicy="no-referrer" />
                      <div className="absolute top-4 right-4 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-emerald-700 backdrop-blur-sm">
                        {pharmacy.distance} away
                      </div>
                      <div className="absolute bottom-4 left-4 flex items-center gap-1 rounded-full bg-emerald-600 px-3 py-1 text-xs font-bold text-white">
                        <ShieldCheck size={12} /> {pharmacy.stock}
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="mb-2 flex items-center justify-between">
                        <h3 className="text-lg font-bold text-slate-900">{pharmacy.name}</h3>
                        <div className="flex items-center gap-1 text-amber-500">
                          <Star size={14} fill="currentColor" />
                          <span className="text-sm font-bold text-slate-700">{pharmacy.rating}</span>
                        </div>
                      </div>
                      <div className="mb-6 flex items-center gap-2 text-sm text-slate-500">
                        <MapPin size={14} /> {pharmacy.location}
                      </div>
                      <div className="flex items-center justify-between border-t border-slate-50 pt-4">
                        <div>
                          <p className="text-xs font-bold text-slate-400 uppercase">Price</p>
                          <p className="text-xl font-bold text-emerald-600">{pharmacy.price}</p>
                        </div>
                        <Link 
                          to="/demo/customer"
                          className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-900 text-white shadow-lg transition-all hover:scale-110 active:scale-95"
                        >
                          <ChevronRight size={24} />
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ) : (
            <div className="py-20 text-center">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-slate-50 text-slate-300">
                <Search size={40} />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Start your search</h3>
              <p className="mt-2 text-slate-500">Enter a medication name to find nearby pharmacies in Ilorin.</p>
            </div>
          )}
        </AnimatePresence>
      </section>

      {/* The GoPharma Advantage Section */}
      <section className="bg-slate-900 py-24 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">The GoPharma Advantage</h2>
            <p className="mt-4 text-lg text-slate-400">A seamless, tech-driven approach to healthcare in Ilorin.</p>
          </div>

          <div className="grid gap-12 lg:grid-cols-3">
            {[
              {
                title: "Search & Buy",
                icon: <Search className="text-emerald-500" size={32} />,
                desc: "Find your specific medicine across Ilorin in seconds. Complete your purchase immediately via our secure web portal or through the WhatsApp AI assistant."
              },
              {
                title: "QR Instant-Pickup",
                icon: <QrCode className="text-emerald-500" size={32} />,
                desc: "Skip the pharmacy queues. Choose 'Pre-Order' to secure your drugs online. You will receive a unique QR code via WhatsApp; simply show it at the pharmacy counter for instant collection."
              },
              {
                title: "Last-Mile Delivery",
                icon: <Bike className="text-emerald-500" size={32} />,
                desc: "Instead of just 'Locate and Collect,' let us do the work. Our professional rider network delivers your verified medication directly to your designated location in under 30 minutes."
              }
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.2 }}
                className="flex flex-col items-center text-center lg:items-start lg:text-left"
              >
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-800 shadow-lg shadow-emerald-500/10 ring-1 ring-slate-700">
                  {feature.icon}
                </div>
                <h3 className="mb-4 text-2xl font-bold text-white">{feature.title}</h3>
                <p className="text-slate-400 leading-relaxed">
                  {feature.desc}
                </p>
                <Link to="/demo/customer" className="mt-6 text-sm font-bold text-emerald-500 hover:text-emerald-400 flex items-center gap-1 group">
                  Try it now <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="bg-slate-50 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-3">
            {[
              { title: "Verified Stock", desc: "Real-time inventory updates from PCN-licensed pharmacies.", icon: <ShieldCheck className="text-emerald-600" /> },
              { title: "Price Comparison", desc: "Find the best prices across Ilorin without leaving home.", icon: <Activity className="text-emerald-600" /> },
              { title: "Fast Delivery", desc: "Average delivery time of 15 minutes to your doorstep.", icon: <Clock className="text-emerald-600" /> }
            ].map((item, idx) => (
              <div key={idx} className="flex gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm">
                  {item.icon}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">{item.title}</h4>
                  <p className="mt-1 text-sm text-slate-600">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
