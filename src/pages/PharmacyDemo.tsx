'use client';

import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  Settings, 
  Bell, 
  Search, 
  TrendingUp, 
  AlertCircle,
  CheckCircle2,
  Clock,
  MoreHorizontal,
  ArrowUpRight,
  ShieldCheck,
  UserCheck,
  Truck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';

const ORDERS = [
  { id: "ORD-7280", customer: "Sarah O.", items: "Insulin Pen", total: "₦12,000", status: "Processing", time: "15 mins ago", location: "GRA" },
  { id: "ORD-7279", customer: "Musa J.", items: "Cough Syrup", total: "₦2,800", status: "Delivered", time: "1 hour ago", location: "Basin" },
  { id: "ORD-7278", customer: "Ibrahim L.", items: "First Aid Kit", total: "₦8,500", status: "Delivered", time: "3 hours ago", location: "Nigeria Central" },
];

export default function PharmacyDemo() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [orderStatus, setOrderStatus] = useState<'awaiting' | 'preparing' | 'ready'>('awaiting');

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900">
      {/* Sidebar */}
      <aside className="hidden w-64 flex-col border-r border-slate-200 bg-white lg:flex">
        <div className="flex h-16 items-center gap-2 px-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white">
            <Package size={18} />
          </div>
          <span className="text-lg font-bold tracking-tight">GoPharma</span>
        </div>
        
        <nav className="flex-1 space-y-1 px-3 py-4">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
            { id: 'orders', label: 'Orders', icon: <ShoppingCart size={20} />, badge: 1 },
            { id: 'inventory', label: 'Inventory', icon: <Package size={20} /> },
            { id: 'customers', label: 'Customers', icon: <Users size={20} /> },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-all hover:scale-105 ${
                activeTab === item.id 
                  ? 'bg-emerald-50 text-emerald-700' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                {item.icon}
                {item.label}
              </div>
              {item.badge && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-[10px] text-white">
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="border-t border-slate-100 p-4">
          <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:scale-105 transition-transform">
            <Settings size={20} />
            Settings
          </button>
          <div className="mt-4 flex items-center gap-3 rounded-xl bg-slate-900 p-3 text-white">
            <img src="https://picsum.photos/seed/pharmacy-owner/100/100" alt="User" className="h-10 w-10 rounded-full" referrerPolicy="no-referrer" />
            <div className="overflow-hidden">
              <p className="truncate text-xs font-bold">Peace Standard Pharmacy</p>
              <p className="truncate text-[10px] text-slate-400">Tanke, Nigeria</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-slate-200 bg-white/80 px-8 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold">Peace Standard Pharmacy</h2>
            <div className="hidden items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-bold text-emerald-700 ring-1 ring-emerald-600/20 sm:flex">
              <ShieldCheck size={12} /> PCN Verified ✅
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search orders..." 
                className="w-64 rounded-full bg-slate-100 py-2 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
            <button className="relative rounded-full p-2 text-slate-600 hover:bg-slate-100 hover:scale-105 transition-transform">
              <Bell size={20} />
              <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500"></span>
            </button>
            <Link to="/demo/delivery" className="rounded-full bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:scale-105 transition-transform">
              Rider View
            </Link>
          </div>
        </header>

        <div className="p-8">
          {/* Live Order Card */}
          <div className="mb-8">
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-500">Active Order</h3>
            <motion.div 
              layout
              className="overflow-hidden rounded-2xl border-2 border-emerald-100 bg-white shadow-xl shadow-emerald-50"
            >
              <div className="flex flex-col md:flex-row">
                <div className="flex-1 p-6">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-400">Order ID</span>
                      <h4 className="text-xl font-mono font-bold">GP-2026-1023</h4>
                    </div>
                    <AnimatePresence mode="wait">
                      <motion.span 
                        key={orderStatus}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${
                          orderStatus === 'awaiting' ? 'bg-amber-100 text-amber-700' :
                          orderStatus === 'preparing' ? 'bg-blue-100 text-blue-700' :
                          'bg-emerald-100 text-emerald-700'
                        }`}
                      >
                        {orderStatus === 'awaiting' ? 'Awaiting Clinical Approval' :
                         orderStatus === 'preparing' ? 'Preparing Package' :
                         'Ready for Handover'}
                      </motion.span>
                    </AnimatePresence>
                  </div>

                  <div className="mb-6 grid gap-4 rounded-xl bg-slate-50 p-4 sm:grid-cols-2">
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase">Customer</p>
                      <p className="font-bold">Adebayo K. (Tanke)</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase">Items</p>
                      <p className="font-bold text-emerald-700">Artemether/Lumefantrine (ACT)</p>
                    </div>
                  </div>

                  {/* Expert Fix Notification */}
                  <div className="mb-6 flex items-center gap-3 rounded-xl border border-emerald-100 bg-emerald-50/50 p-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                      <UserCheck size={20} />
                    </div>
                    <p className="text-sm font-medium text-emerald-800">
                      Online Pharmacist <span className="font-bold">[Dr. Usman]</span> has verified the prescription. You are cleared to dispense.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    {orderStatus === 'awaiting' && (
                      <button 
                        onClick={() => setOrderStatus('preparing')}
                        className="rounded-full bg-emerald-600 px-8 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-200 transition-all hover:scale-105 active:scale-95"
                      >
                        Accept Order
                      </button>
                    )}
                    {orderStatus === 'preparing' && (
                      <button 
                        onClick={() => setOrderStatus('ready')}
                        className="flex items-center gap-2 rounded-full bg-blue-600 px-8 py-3 text-sm font-bold text-white shadow-lg shadow-blue-200 transition-all hover:scale-105 active:scale-95"
                      >
                        <Package size={18} /> Mark as Ready
                      </button>
                    )}
                    {orderStatus === 'ready' && (
                      <Link 
                        to="/demo/delivery"
                        className="flex items-center gap-2 rounded-full bg-slate-900 px-8 py-3 text-sm font-bold text-white shadow-lg shadow-slate-200 transition-all hover:scale-105 active:scale-95"
                      >
                        <Truck size={18} /> Hand over to Rider
                      </Link>
                    )}
                    <button className="rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 hover:scale-105 transition-all">
                      View Prescription
                    </button>
                  </div>
                </div>
                <div className="w-full bg-slate-50 p-6 md:w-64 border-l border-slate-100">
                  <h5 className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-400">Order Summary</h5>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Subtotal</span>
                      <span className="font-bold">₦4,000</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Delivery</span>
                      <span className="font-bold">₦500</span>
                    </div>
                    <div className="border-t border-slate-200 pt-3 flex justify-between text-base">
                      <span className="font-bold">Total</span>
                      <span className="font-bold text-emerald-600">₦4,500</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Stats */}
          <div className="grid gap-6 md:grid-cols-4">
            {[
              { label: "Total Revenue", value: "₦142,500", trend: "+12.5%", icon: <TrendingUp className="text-emerald-600" /> },
              { label: "Active Orders", value: "12", trend: "+2 today", icon: <ShoppingCart className="text-blue-600" /> },
              { label: "Low Stock", value: "5 items", trend: "Action needed", icon: <AlertCircle className="text-amber-600" /> },
              { label: "Avg Delivery", value: "24 mins", trend: "-2 mins", icon: <Clock className="text-purple-600" /> },
            ].map((stat, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100"
              >
                <div className="mb-4 flex items-center justify-between">
                  <div className="rounded-xl bg-slate-50 p-2">{stat.icon}</div>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">{stat.trend}</span>
                </div>
                <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                <h3 className="mt-1 text-2xl font-bold">{stat.value}</h3>
              </motion.div>
            ))}
          </div>

          {/* Recent Orders */}
          <div className="mt-8 rounded-2xl bg-white shadow-sm border border-slate-100 overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <h3 className="font-bold">Recent Orders</h3>
              <button className="text-xs font-bold text-emerald-600 hover:underline hover:scale-105 transition-transform">View All</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-6 py-4">Order ID</th>
                    <th className="px-6 py-4">Customer</th>
                    <th className="px-6 py-4">Medications</th>
                    <th className="px-6 py-4">Location</th>
                    <th className="px-6 py-4">Total</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {ORDERS.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-mono font-medium text-slate-600">{order.id}</td>
                      <td className="px-6 py-4 font-bold">{order.customer}</td>
                      <td className="px-6 py-4 text-slate-600">{order.items}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-600 uppercase">
                          <Clock size={10} /> {order.location}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-bold">{order.total}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-bold uppercase ${
                          order.status === 'Delivered' ? 'bg-emerald-50 text-emerald-700' :
                          order.status === 'Processing' ? 'bg-blue-50 text-blue-700' :
                          'bg-amber-50 text-amber-700'
                        }`}>
                          {order.status === 'Delivered' && <CheckCircle2 size={10} />}
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 hover:scale-110 transition-transform">
                          <MoreHorizontal size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl bg-emerald-600 p-8 text-white shadow-lg shadow-emerald-200">
              <h3 className="text-xl font-bold">Inventory Alert</h3>
              <p className="mt-2 text-emerald-100">5 items are running low on stock. Restock now to avoid missed orders.</p>
              <button className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-emerald-700 transition-transform hover:scale-105">
                Manage Inventory <ArrowUpRight size={16} />
              </button>
            </div>
            <div className="rounded-2xl bg-slate-900 p-8 text-white shadow-lg shadow-slate-200">
              <h3 className="text-xl font-bold">Rider Performance</h3>
              <p className="mt-2 text-slate-400">Your average delivery time in Tanke has improved by 15% this week.</p>
              <Link to="/demo/delivery" className="mt-6 inline-flex items-center gap-2 rounded-full bg-emerald-600 px-6 py-3 text-sm font-bold text-white transition-transform hover:scale-105">
                Track Riders <ArrowUpRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Floating Action for Demo Context */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-3">
        <Link to="/demo/delivery" className="flex items-center gap-2 rounded-full bg-emerald-600 px-6 py-3 text-sm font-bold text-white shadow-xl hover:bg-emerald-700 hover:scale-105 transition-all">
          Proceed to Delivery View <ArrowUpRight size={18} />
        </Link>
      </div>
    </div>
  );
}

