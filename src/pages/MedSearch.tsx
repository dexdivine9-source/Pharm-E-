'use client';

import React, { useState } from 'react';
import { 
  Search, 
  Mic, 
  Camera, 
  ArrowLeft, 
  ArrowRight,
  MapPin, 
  ShieldCheck, 
  Clock, 
  Filter,
  Activity,
  QrCode,
  Bike,
  ShoppingCart,
  Star,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import { useSupabase } from '../lib/mock-db';

export const partneredStores = [
  { id: 1, name: "Fiolu Pharmacy Ltd", location: "GRA", distance: "0.8km", status: "Verified" },
  { id: 2, name: "PS GENERAL DRUGS CENTRE", location: "Post Office", distance: "1.2km", status: "Verified" },
  { id: 3, name: "Coby Pharmacy", location: "Tanke", distance: "1.5km", status: "Verified" },
  { id: 4, name: "Bioraj Pharmacy", location: "Industrial Estate", distance: "4.0km", status: "Manufacturer" },
  { id: 5, name: "Rotamedics Pharmacy", location: "Challenge", distance: "2.1km", status: "Verified" },
  { id: 6, name: "Assamadiya Pharmacy", location: "Taiwo Isale", distance: "2.8km", status: "Verified" },
  { id: 7, name: "Medsoft Pharmacy", location: "Basin", distance: "3.2km", status: "Verified" },
  { id: 8, name: "Ason Pharmacy", location: "Adewole", distance: "3.5km", status: "Verified" },
];

export default function MedSearch() {
  const navigate = useNavigate();
  const { currentUser, logout } = useSupabase();
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
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, x: '-20%' }}
      className="min-h-screen bg-white font-sans text-slate-900"
    >
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-slate-100 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-lg shadow-emerald-200">
              <Activity size={24} />
            </div>
            <span className="text-2xl font-black tracking-tighter text-slate-900 font-sans">Pharma-E</span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="hidden sm:inline text-sm font-bold text-slate-700">
              Hi, {currentUser?.full_name?.split(' ')[0]}
            </span>
            <Link to="/dashboard" className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-2 text-sm font-bold text-slate-700 transition-all hover:bg-slate-50 hover:scale-105">
              <ShoppingCart size={16} /> My Orders
            </Link>
            <button 
              onClick={() => {
                logout();
                navigate('/login');
              }}
              className="flex items-center gap-2 rounded-full bg-slate-900 px-5 py-2 text-sm font-bold text-white transition-all hover:bg-slate-800 hover:scale-105"
            >
              Logout
            </button>
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
            Pharma-E: Find Your Medicine <span className="text-emerald-600">in Seconds.</span>
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

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {partneredStores.map((pharmacy, idx) => (
                  <motion.div 
                    key={pharmacy.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.08 }}
                    className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
                  >
                    {/* Gold Manufacturer Banner */}
                    {pharmacy.status === "Manufacturer" && (
                      <div className="flex items-center justify-center gap-1.5 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 px-3 py-2 text-xs font-black text-amber-900 tracking-wide">
                        <Sparkles size={12} className="shrink-0" />
                        Direct from Manufacturer
                        <Sparkles size={12} className="shrink-0" />
                      </div>
                    )}

                    <div className="flex flex-1 flex-col p-5">
                      {/* Top: Name + Distance */}
                      <div className="mb-3 flex items-start justify-between gap-2">
                        <h3 className="text-sm font-extrabold leading-tight text-slate-900">{pharmacy.name}</h3>
                        <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600 whitespace-nowrap">
                          {pharmacy.distance} away
                        </span>
                      </div>

                      {/* Location */}
                      <div className="mb-3 flex items-center gap-1.5 text-sm text-slate-500">
                        <MapPin size={13} className="shrink-0 text-emerald-500" />
                        <span>{pharmacy.location}</span>
                      </div>

                      {/* Verified Badge */}
                      <div className="mb-5">
                        {pharmacy.status === "Manufacturer" ? (
                          <span className="inline-flex items-center gap-1 rounded-full border border-amber-300 bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700">
                            <Star size={11} fill="currentColor" /> Manufacturer
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-600">
                            <ShieldCheck size={11} /> Verified
                          </span>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="mt-auto flex flex-col gap-2">
                        <button
                          onClick={() => navigate('/checkout', {
                            state: {
                              pharmacyName: pharmacy.name,
                              medicineName: query || 'Insulin (Mixtard 30/70)',
                              location: pharmacy.location,
                              distance: pharmacy.distance,
                            }
                          })}
                          className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm shadow-emerald-200 transition-all hover:bg-emerald-700 hover:scale-[1.02] active:scale-95"
                        >
                          <ShoppingCart size={13} /> Buy Now
                        </button>
                        <button
                          onClick={() => navigate('/pickup', {
                            state: {
                              pharmacyName: pharmacy.name,
                              medicineName: query || 'Insulin (Mixtard 30/70)',
                              location: pharmacy.location,
                              distance: pharmacy.distance,
                            }
                          })}
                          className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs font-bold text-slate-700 transition-all hover:bg-slate-100 hover:scale-[1.02] active:scale-95"
                        >
                          <QrCode size={13} /> Pre-order QR
                        </button>
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

      {/* The Pharma-E Advantage Section */}
      <section className="bg-slate-900 py-24 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">The Pharma-E Advantage</h2>
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
    </motion.div>
  );
}
