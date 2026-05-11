import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useSupabase } from '../lib/mock-db';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, MapPin, Search, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Pharmacy {
  id: string;
  full_name: string;
  is_verified: boolean;
  location?: string;
}

interface InventoryItem {
  id: string;
  pharmacy_id: string;
  med_name: string;
  stock_level: number;
  price: number;
}

export default function BrowseInventory() {
  const { currentUser } = useSupabase();
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // 1. Initial Fetch
    const fetchInitialData = async () => {
      try {
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, full_name, is_verified')
          .eq('role', 'pharmacy');

        const { data: inventoryData, error: inventoryError } = await supabase
          .from('inventory')
          .select('id, pharmacy_id, med_name, stock_level, price')
          .gt('stock_level', 0);

        if (!profilesError && profilesData) setPharmacies(profilesData);
        if (!inventoryError && inventoryData) setInventory(inventoryData);
      } catch (err) {
        console.error('Error fetching initial data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();

    // 2. Real-time Subscriptions
    const profilesSubscription = supabase
      .channel('public:profiles')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles', filter: "role=eq.pharmacy" }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setPharmacies((prev) => [...prev, payload.new as Pharmacy]);
        } else if (payload.eventType === 'UPDATE') {
          setPharmacies((prev) => prev.map(p => p.id === payload.new.id ? payload.new as Pharmacy : p));
        } else if (payload.eventType === 'DELETE') {
          setPharmacies((prev) => prev.filter(p => p.id !== payload.old.id));
        }
      })
      .subscribe();

    const inventorySubscription = supabase
      .channel('public:inventory')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'inventory' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setInventory((prev) => [...prev, payload.new as InventoryItem]);
        } else if (payload.eventType === 'UPDATE') {
          setInventory((prev) => prev.map(i => i.id === payload.new.id ? payload.new as InventoryItem : i));
        } else if (payload.eventType === 'DELETE') {
          setInventory((prev) => prev.filter(i => i.id !== payload.old.id));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(profilesSubscription);
      supabase.removeChannel(inventorySubscription);
    };
  }, []);

  const filteredPharmacies = pharmacies.filter(p => 
    p.full_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-full transition-colors">
              <ArrowLeft className="h-6 w-6" />
            </Link>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
                Live Inventory <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse ml-2" title="Live updates active"></div>
              </h1>
              <p className="text-sm text-slate-500 font-medium">Browse real-time stock across the network</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Search */}
        <div className="mb-8">
          <div className="relative max-w-xl">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-12 pr-4 py-4 border border-slate-200 rounded-2xl leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-sm transition-all"
              placeholder="Search pharmacies by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Package className="h-12 w-12 text-slate-300 animate-bounce mb-4" />
            <p className="text-slate-500 font-medium">Connecting to live network...</p>
          </div>
        ) : filteredPharmacies.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
            <Package className="h-16 w-16 text-slate-300 mb-4" />
            <h3 className="text-xl font-bold text-slate-900">No pharmacies found</h3>
            <p className="mt-2 text-slate-500">Wait for pharmacies to register or clear your search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
            <AnimatePresence>
              {filteredPharmacies.map((pharmacy) => {
                const availableDrugs = inventory.filter(i => i.pharmacy_id === pharmacy.id && i.stock_level > 0);
                
                return (
                  <motion.div
                    key={pharmacy.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col"
                  >
                    <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                            {pharmacy.full_name}
                            {pharmacy.is_verified && <ShieldCheck className="h-5 w-5 text-emerald-500" title="Verified Pharmacy" />}
                          </h3>
                          <div className="flex items-center gap-1.5 text-sm text-slate-500 mt-1">
                            <MapPin className="h-4 w-4 text-emerald-500" />
                            {pharmacy.location || 'Ilorin Network'}
                          </div>
                        </div>
                        <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700 ring-1 ring-inset ring-blue-600/20">
                          {availableDrugs.length} Items
                        </span>
                      </div>
                    </div>

                    <div className="p-6 flex-1 flex flex-col">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Live Inventory Available</h4>
                      
                      {availableDrugs.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center py-6 text-center">
                          <Package className="h-8 w-8 text-slate-200 mb-2" />
                          <p className="text-sm text-slate-400">No active stock</p>
                        </div>
                      ) : (
                        <div className="space-y-3 flex-1 max-h-60 overflow-y-auto pr-2" style={{ scrollbarWidth: 'thin' }}>
                          {availableDrugs.map(drug => (
                            <div key={drug.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-emerald-50 border border-slate-100 transition-colors group">
                              <div className="flex flex-col">
                                <span className="text-sm font-bold text-slate-800">{drug.med_name}</span>
                                <span className="text-xs font-medium text-slate-500 mt-0.5">{drug.stock_level} in stock</span>
                              </div>
                              <span className="text-sm font-extrabold text-emerald-600">₦{drug.price.toLocaleString()}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      <Link 
                        to={`/store/${pharmacy.id}`}
                        className="mt-6 w-full py-3 px-4 bg-white border-2 border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 hover:border-slate-300 transition-all text-center flex items-center justify-center gap-2"
                      >
                        Visit Storefront
                      </Link>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </main>
    </div>
  );
}
