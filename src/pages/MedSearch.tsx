'use client';

import React, { useState, useEffect } from 'react';
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
import { supabase } from '../lib/supabase';

// Haversine distance calculator
const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);  
  const dLon = (lon2 - lon1) * (Math.PI / 180); 
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  const d = R * c; 
  return d;
}

export const partneredStores = [
  { id: '1', name: "Fiolu Pharmacy Ltd", location: "GRA", lat: 8.4833, lng: 4.5333, status: "Verified" },
  { id: '2', name: "PS GENERAL DRUGS CENTRE", location: "Post Office", lat: 8.4900, lng: 4.5500, status: "Verified" },
  { id: '3', name: "Coby Pharmacy", location: "Tanke", lat: 8.4700, lng: 4.5700, status: "Verified" },
  { id: '4', name: "Bioraj Pharmacy", location: "Industrial Estate", lat: 8.4500, lng: 4.5200, status: "Manufacturer" },
  { id: '5', name: "Rotamedics Pharmacy", location: "Challenge", lat: 8.4750, lng: 4.5400, status: "Verified" },
  { id: '6', name: "Assamadiya Pharmacy", location: "Taiwo Isale", lat: 8.4800, lng: 4.5450, status: "Verified" },
  { id: '7', name: "Medsoft Pharmacy", location: "Basin", lat: 8.4850, lng: 4.5600, status: "Verified" },
  { id: '8', name: "Ason Pharmacy", location: "Adewole", lat: 8.4950, lng: 4.5200, status: "Verified" },
];

const mockInventory = [
  { pharmacy_id: '1', med_name: "Artemether", price: 1500, stock_level: 10 },
  { pharmacy_id: '1', med_name: "Paracetamol", price: 500, stock_level: 50 },
  { pharmacy_id: '2', med_name: "Insulin (Mixtard 30/70)", price: 4500, stock_level: 5 },
  { pharmacy_id: '2', med_name: "Amoxicillin", price: 1200, stock_level: 20 },
  { pharmacy_id: '3', med_name: "Vitamin C", price: 800, stock_level: 100 },
  { pharmacy_id: '4', med_name: "Ibuprofen", price: 600, stock_level: 200 },
  { pharmacy_id: '5', med_name: "Ciprofloxacin", price: 1500, stock_level: 15 },
  { pharmacy_id: '6', med_name: "Metformin", price: 2500, stock_level: 30 },
  { pharmacy_id: '7', med_name: "Loratadine", price: 1000, stock_level: 40 },
  { pharmacy_id: '8', med_name: "Omeprazole", price: 1800, stock_level: 25 },
];

export default function MedSearch() {
  const navigate = useNavigate();
  const { currentUser, logout } = useSupabase();
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<any[]>([]);

  const [coords, setCoords] = useState<{lat: number, lng: number} | null>(null);
  const [locationError, setLocationError] = useState(false);
  const [manualLocation, setManualLocation] = useState("");

  useEffect(() => {
    // Automatically trigger location permission on mount
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoords({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setLocationError(false);
          // Automatically fetch nearest pharmacies based on location
          fetchPharmaciesFromDB(position.coords.latitude, position.coords.longitude, "");
        },
        (error) => {
          console.error("Location error:", error);
          setLocationError(true);
        }
      );
    } else {
      setLocationError(true);
    }
  }, []);

  const fetchPharmaciesFromDB = async (userLat: number, userLng: number, searchQuery: string) => {
    setIsSearching(true);
    setShowResults(false);

    try {
      // 1. Query Supabase for pharmacies (profiles with role='pharmacy')
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('id, full_name, is_verified, lat, lng')
        .eq('role', 'pharmacy');
        
      // 2. Query Supabase for inventory
      let invQuery = supabase
        .from('inventory')
        .select('pharmacy_id, med_name, stock_level, price')
        .gt('stock_level', 0);
        
      if (searchQuery.trim()) {
        invQuery = invQuery.ilike('med_name', `%${searchQuery}%`);
      }
      
      const { data: inventory } = await invQuery;

      let pharmaciesData: any[] = [];

      // If we have real data from Supabase
      if (!profileError && profiles && profiles.length > 0) {
        pharmaciesData = profiles.map(p => {
          const available_drugs = inventory?.filter(i => i.pharmacy_id === p.id) || [];
          const distNum = p.lat && p.lng ? getDistance(userLat, userLng, p.lat, p.lng) : 999;
          return {
            id: p.id,
            name: p.full_name,
            location: 'Address Unavailable',
            status: p.is_verified ? 'Verified' : 'Unverified',
            distance: distNum.toFixed(1) + 'km',
            distanceNum: distNum,
            available_drugs
          };
        });
      } else {
        // Fallback to mock data if real DB fails or is empty
        let filteredInventory = mockInventory;
        if (searchQuery.trim()) {
          filteredInventory = mockInventory.filter(i => 
            i.med_name.toLowerCase().includes(searchQuery.toLowerCase())
          );
        }

        pharmaciesData = partneredStores.map(p => {
          const available_drugs = filteredInventory.filter(i => i.pharmacy_id === p.id);
          const distNum = getDistance(userLat, userLng, p.lat, p.lng);
          return {
            ...p,
            distance: distNum.toFixed(1) + 'km',
            distanceNum: distNum,
            available_drugs
          };
        });
      }

      // Filter out pharmacies with no matching drugs if we are searching
      if (searchQuery.trim()) {
        pharmaciesData = pharmaciesData.filter(p => p.available_drugs.length > 0);
      }

      // Sort by distance (Nearest first)
      pharmaciesData.sort((a, b) => a.distanceNum - b.distanceNum);
      
      setResults(pharmaciesData);
      
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearching(false);
      setShowResults(true);
    }
  };

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!query.trim() && !locationError) return;
    
    // Default to Ilorin center if no location provided manually
    let lat = coords?.lat || 8.4966;
    let lng = coords?.lng || 4.5421;
    
    fetchPharmaciesFromDB(lat, lng, query);
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
              Hi, {currentUser?.full_name?.split(' ')[0] || 'Guest'}
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
            Search across verified pharmacies. Real-time stock, prices, and fast delivery to your location.
          </p>

          {/* Search Bar */}
          <div className="mt-10 max-w-2xl mx-auto space-y-4">
            {locationError && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="relative flex items-center overflow-hidden rounded-2xl bg-amber-50 p-2 shadow-inner ring-1 ring-amber-200 focus-within:ring-2 focus-within:ring-amber-500/20"
              >
                <div className="flex h-12 w-12 items-center justify-center text-amber-500">
                  <MapPin size={24} />
                </div>
                <input 
                  type="text" 
                  placeholder="Enter your location manually (e.g., Tanke, Ilorin)" 
                  className="flex-1 bg-transparent py-3 text-lg outline-none placeholder:text-amber-400/70 text-amber-900"
                  value={manualLocation}
                  onChange={(e) => setManualLocation(e.target.value)}
                />
              </motion.div>
            )}

            <form onSubmit={handleSearch} className="relative">
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
              <h3 className="mt-8 text-xl font-bold text-slate-900">Finding nearest pharmacies...</h3>
              <p className="mt-2 text-slate-500">Calculating distance and checking stock</p>
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
                  {query ? (
                    <>Results for "<span className="text-emerald-600">{query}</span>"</>
                  ) : (
                    <>Nearest Pharmacies</>
                  )}
                </h2>
                <button className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50">
                  <Filter size={16} /> Filter
                </button>
              </div>

              {results.length === 0 ? (
                <div className="py-12 text-center bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                  <Search className="mx-auto h-12 w-12 text-slate-300 mb-3" />
                  <h3 className="text-lg font-bold text-slate-900">No pharmacies found</h3>
                  <p className="mt-1 text-slate-500">We couldn't find any nearby pharmacies with that medication in stock.</p>
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {results.map((pharmacy, idx) => (
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
                          <span className="shrink-0 rounded-full bg-emerald-50 border border-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-700 whitespace-nowrap">
                            {pharmacy.distance}
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

                        {/* Available Drugs */}
                        {pharmacy.available_drugs && pharmacy.available_drugs.length > 0 && (
                          <div className="mb-5">
                            <p className="text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-wider">Available Stock:</p>
                            <div className="flex flex-wrap gap-2">
                              {pharmacy.available_drugs.slice(0, 3).map((drug: any, didx: number) => (
                                <div key={didx} className="flex flex-col bg-slate-50 rounded-lg p-2 border border-slate-100 flex-1 min-w-[45%]">
                                  <span className="text-xs font-bold text-slate-800 truncate">{drug.med_name}</span>
                                  <span className="text-xs text-emerald-600 font-bold">₦{drug.price}</span>
                                </div>
                              ))}
                              {pharmacy.available_drugs.length > 3 && (
                                <div className="flex items-center justify-center bg-slate-50 rounded-lg p-2 border border-slate-100 flex-1 min-w-[45%]">
                                  <span className="text-xs font-bold text-slate-500">+{pharmacy.available_drugs.length - 3} more</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="mt-auto flex flex-col gap-2">
                          <button
                            onClick={() => navigate('/checkout', {
                              state: {
                                pharmacyName: pharmacy.name,
                                medicineName: query || (pharmacy.available_drugs[0]?.med_name || 'Insulin'),
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
                                medicineName: query || (pharmacy.available_drugs[0]?.med_name || 'Insulin'),
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
              )}
            </motion.div>
          ) : null}
        </AnimatePresence>
      </section>

      {/* The Pharma-E Advantage Section */}
      <section className="bg-slate-900 py-24 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">The Pharma-E Advantage</h2>
            <p className="mt-4 text-lg text-slate-400">A seamless, tech-driven approach to healthcare.</p>
          </div>

          <div className="grid gap-12 lg:grid-cols-3">
            {[
              {
                title: "Search & Buy",
                icon: <Search className="text-emerald-500" size={32} />,
                desc: "Find your specific medicine in seconds. Complete your purchase immediately via our secure web portal."
              },
              {
                title: "QR Instant-Pickup",
                icon: <QrCode className="text-emerald-500" size={32} />,
                desc: "Skip the pharmacy queues. Secure your drugs online and use a unique QR code for instant collection."
              },
              {
                title: "Last-Mile Delivery",
                icon: <Bike className="text-emerald-500" size={32} />,
                desc: "Our professional rider network delivers your verified medication directly to your location in under 30 minutes."
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
              { title: "Price Comparison", desc: "Find the best prices around you without leaving home.", icon: <Activity className="text-emerald-600" /> },
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
