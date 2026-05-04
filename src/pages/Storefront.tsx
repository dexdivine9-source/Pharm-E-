import React, { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSupabase } from '../lib/mock-db';
import { Package, Search, ShoppingCart, ArrowLeft, ShieldCheck, Plus } from 'lucide-react';
import { motion } from 'motion/react';

export default function Storefront() {
  const { pharmacyId } = useParams<{ pharmacyId: string }>();
  const { allProfiles, inventory } = useSupabase();

  const pharmacy = allProfiles.find(p => p.id === pharmacyId && p.role === 'pharmacy');
  
  const pharmacyInventory = useMemo(() => {
    return inventory.filter(item => item.pharmacy_id === pharmacyId && item.stock_level > 0);
  }, [inventory, pharmacyId]);

  if (!pharmacy) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <Package className="h-16 w-16 text-gray-300 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900">Store Not Found</h2>
        <p className="text-gray-500 mt-2 text-center max-w-md">We couldn't find a pharmacy with this link. They may have been removed from the network.</p>
        <Link to="/" className="mt-6 text-emerald-600 font-medium hover:text-emerald-700">
          Return Home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-emerald-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="text-gray-400 hover:text-emerald-600 transition-colors">
              <ArrowLeft className="h-6 w-6" />
            </Link>
            <div>
              <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
                {pharmacy.full_name}
                {pharmacy.is_verified && <ShieldCheck className="h-5 w-5 text-emerald-500" title="Verified Pharmacy" />}
              </h1>
              <p className="text-sm text-gray-500 font-medium">Official Pharma-E Storefront</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-gray-400 hover:text-emerald-600 transition-colors">
              <ShoppingCart className="h-6 w-6" />
              <span className="absolute top-0 right-0 -mt-1 -mr-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-bold text-white">
                0
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-sm"
              placeholder={`Search ${pharmacy.full_name}'s inventory...`}
            />
          </div>
          <select className="block w-full sm:w-48 pl-3 pr-10 py-3 text-base border-gray-200 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm rounded-xl shadow-sm bg-white">
            <option>All Categories</option>
            <option>Antibiotics</option>
            <option>Pain Relief</option>
            <option>Vitamins</option>
            <option>First Aid</option>
          </select>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {pharmacyInventory.length === 0 ? (
            <div className="col-span-full py-12 text-center bg-white rounded-2xl border border-dashed border-gray-300">
              <Package className="mx-auto h-12 w-12 text-gray-300 mb-3" />
              <h3 className="text-lg font-medium text-gray-900">No items available</h3>
              <p className="mt-1 text-sm text-gray-500">This pharmacy hasn't added any public inventory yet.</p>
            </div>
          ) : (
            pharmacyInventory.map((item, i) => (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                key={item.id} 
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group flex flex-col"
              >
                <div className="aspect-square bg-gray-50 p-4 flex items-center justify-center relative">
                  {item.image_url ? (
                    <img src={item.image_url} alt={item.med_name} className="object-contain h-full w-full" />
                  ) : (
                    <Package className="h-16 w-16 text-emerald-100 group-hover:text-emerald-200 transition-colors" />
                  )}
                  {item.category && (
                    <span className="absolute top-2 right-2 bg-white/80 backdrop-blur text-[10px] font-bold text-gray-500 px-2 py-1 rounded-md uppercase tracking-wider">
                      {item.category}
                    </span>
                  )}
                </div>
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 line-clamp-2 leading-tight">{item.med_name}</h3>
                    <p className="text-xs text-emerald-600 font-medium mt-1">{item.stock_level} in stock</p>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-lg font-extrabold text-gray-900">₦{item.price.toLocaleString()}</span>
                    <button className="bg-gray-100 hover:bg-emerald-600 hover:text-white text-gray-900 h-8 w-8 rounded-full flex items-center justify-center transition-colors">
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>

      </main>
    </div>
  );
}
