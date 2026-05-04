import React, { useState } from 'react';
import { useSupabase } from '../lib/mock-db';
import { motion } from 'motion/react';
import { MapPin, Navigation, Star, Activity, ToggleLeft, ToggleRight, LogOut, Package } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function LogisticsDashboard() {
  const { currentUser, logout, orders } = useSupabase();
  const navigate = useNavigate();
  const [isOnline, setIsOnline] = useState(false);

  // Get orders that are pending pickup (or just PENDING for mock purposes)
  const availableOrders = orders.filter(o => o.status === 'PENDING');

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!currentUser) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Nav */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-6 w-6 text-emerald-600" />
            <span className="font-bold text-xl text-gray-900">Driver Hub</span>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-yellow-50 text-yellow-700 px-3 py-1 rounded-full text-sm font-medium border border-yellow-200">
              <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
              <span>4.9 Trust Score</span>
            </div>
            
            <div className="flex items-center gap-2 border-l pl-4">
              <span className={`text-sm font-medium ${isOnline ? 'text-emerald-600' : 'text-gray-500'}`}>
                {isOnline ? 'Online' : 'Offline'}
              </span>
              <button onClick={() => setIsOnline(!isOnline)} className="focus:outline-none">
                {isOnline ? (
                  <ToggleRight className="h-8 w-8 text-emerald-600" />
                ) : (
                  <ToggleLeft className="h-8 w-8 text-gray-400" />
                )}
              </button>
            </div>
            
            <button onClick={handleLogout} className="text-gray-500 hover:text-red-600 transition-colors">
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col md:flex-row h-[calc(100vh-64px)]">
        
        {/* Left Side: Order Feed */}
        <div className="w-full md:w-1/3 bg-white border-r border-gray-200 overflow-y-auto flex flex-col">
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <h2 className="font-semibold text-gray-900">Available Orders</h2>
            <p className="text-sm text-gray-500">Orders within your 5km radius</p>
          </div>
          
          <div className="flex-1 p-4 space-y-4">
            {!isOnline ? (
              <div className="text-center py-12">
                <ToggleLeft className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">Go online to receive orders.</p>
              </div>
            ) : availableOrders.length === 0 ? (
              <div className="text-center py-12">
                <Package className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">No orders available right now.</p>
                <p className="text-sm text-gray-400 mt-1">We'll notify you when new requests come in.</p>
              </div>
            ) : (
              availableOrders.map((order) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={order.id} 
                  className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:border-emerald-500 transition-all cursor-pointer"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="bg-emerald-100 text-emerald-800 text-xs font-medium px-2.5 py-0.5 rounded">NEW</span>
                    <span className="text-xs text-gray-500">Just now</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-emerald-600" />
                    Pickup: Central Pharmacy
                  </h3>
                  <div className="text-sm text-gray-600 mb-4 pl-6 border-l-2 border-emerald-100 space-y-1">
                    <p><strong>Deliver to:</strong> GRA, Ilorin</p>
                    <p className="text-xs text-gray-400">Order #{order.id.toUpperCase()}</p>
                  </div>
                  <button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-lg font-medium text-sm transition-colors">
                    Accept Order
                  </button>
                </motion.div>
              ))
            )}
          </div>
        </div>

        {/* Right Side: Map View */}
        <div className="w-full md:w-2/3 bg-gray-100 relative h-full">
          {/* Decorative Map Placeholder */}
          <div className="absolute inset-0 bg-[#e5e7eb] opacity-50 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-multiply pointer-events-none"></div>
          
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <Navigation className="h-16 w-16 text-emerald-600 opacity-20 mb-4" />
            <p className="text-gray-500 font-medium opacity-50">Live Tracking Map Integration</p>
          </div>

          {/* Overlay Status (if offline) */}
          {!isOnline && (
            <div className="absolute inset-0 bg-gray-900/10 backdrop-blur-sm flex items-center justify-center z-10">
              <div className="bg-white px-6 py-4 rounded-xl shadow-lg text-center">
                <p className="font-medium text-gray-900">You are currently offline</p>
                <p className="text-sm text-gray-500 mt-1">Toggle your status to online to start working.</p>
              </div>
            </div>
          )}
        </div>

      </main>
    </div>
  );
}
