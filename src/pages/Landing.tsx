'use client';

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Truck, Store, MessageSquare, ArrowRight, Activity, MapPin, Clock, Eye, Phone, Map, DollarSign, Search, QrCode, Bike, Zap, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const FAQS = [
  {
    question: "What is Pharma-E?",
    answer: "Nigeria's first AI-powered pharmacy network, connecting users to verified pharmacies and manufacturers to discover and buy authentic medicines instantly."
  },
  {
    question: "How does the \"Find in Seconds\" search work?",
    answer: "Our AI scans the live inventory of verified pharmacies in your specific area (like Tanke, GRA, or Challenge). No more walking from store to store; if Pharma-E says it's there, it’s there."
  },
  {
    question: "How do I use the QR Code for Pre-orders?",
    answer: "When you select \"Pre-order for Pickup,\" we alert the pharmacy to pack your meds immediately. You get a secure Pharma-E QR code on your dashboard or WhatsApp, just show it at the counter to scan & collect your drugs without waiting in line."
  },
  {
    question: "Is the 15-minute delivery guaranteed?",
    answer: "For most areas in Ilorin Central, yes! Pharma-E has a dedicated network of riders stationed at key hubs to ensure your medication reaches your doorstep faster than a food delivery."
  },
  {
    question: "How do I know the medicine is authentic?",
    answer: "We only partner with PCN-licensed pharmacies and top Ilorin manufacturers. Every order comes with a Pharma-E \"Verified\" seal to ensure it hasn't been tampered with or Check the Authenticity of the drug through NAFDAC verification code (MAS)."
  },
  {
    question: "Do I need to create an account to order?",
    answer: "To ensure your health records and QR codes are secure, Pharma-E requires a quick one-tap sign-in with Google or Apple. It takes less than 3 seconds!"
  },
  {
    question: "Can I order via WhatsApp?",
    answer: "Absolutely! Our Pharma-E AI bot can handle your orders, voice notes, and prescription photos directly on WhatsApp if you prefer not to use the website."
  }
];

export default function Landing() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [faqSearch, setFaqSearch] = useState("");

  const filteredFaqs = FAQS.filter(faq =>
    faq.question.toLowerCase().includes(faqSearch.toLowerCase()) ||
    faq.answer.toLowerCase().includes(faqSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-slate-100 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-lg shadow-emerald-200">
              <Activity size={24} />
            </div>
            <span className="text-2xl font-black tracking-tighter text-slate-900 font-sans">Pharma-E</span>
          </div>
          <div className="hidden items-center gap-8 md:flex">
            <a href="#features" className="text-sm font-medium text-slate-600 hover:text-emerald-600">Features</a>
            <a href="#locations" className="text-sm font-medium text-slate-600 hover:text-emerald-600">Locations</a>
            <Link to="/auth" className="flex items-center gap-2 rounded-full bg-slate-900 px-5 py-2.5 text-sm font-bold text-white transition-all hover:bg-slate-800 hover:scale-105">
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Sign in with Google
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-32 bg-slate-50 font-sans flex flex-col items-center justify-center min-h-[80vh]">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col items-center w-full"
          >
            <div className="mb-8 inline-flex items-center rounded-full bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-800 ring-1 ring-inset ring-emerald-600/30">
              <span className="relative flex h-2.5 w-2.5 mr-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              Now serving Ilorin
            </div>

            <h1 className="text-5xl font-extrabold tracking-tight text-slate-900 sm:text-6xl md:text-7xl leading-[1.1] mb-6">
              Order authentic medication from <span className="text-emerald-600">trusted pharmacies</span> in Nigeria.
            </h1>

            <p className="mt-4 text-lg md:text-xl tracking-[0.2em] text-slate-500 uppercase font-medium max-w-3xl mx-auto leading-relaxed">
              The gateway to verified healthcare.
              <br className="hidden sm:block" />
              <span className="text-slate-700 font-bold ml-2 inline-block">
                {"Find It, Verify It, Buy It.".split('').map((char, index) => (
                  <motion.span
                    key={index}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.05, delay: 0.5 + index * 0.05 }}
                  >
                    {char}
                  </motion.span>
                ))}
              </span>
            </p>

            <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4 w-full">
              <Link to="/demo/customer" className="w-full sm:w-auto flex justify-center items-center gap-2 rounded-full bg-emerald-600 px-8 py-4 text-lg font-bold text-white transition-all hover:bg-emerald-700 hover:scale-105 shadow-md hover:shadow-xl">
                Start Interactive Demo <ArrowRight size={20} />
              </Link>
              <Link to="/search" className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-transparent hover:bg-white px-8 py-4 text-lg font-bold text-slate-600 transition-all hover:scale-105">
                Med-Search
              </Link>
              <Link to="/demo/pharmacy" className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-transparent hover:bg-white px-8 py-4 text-lg font-bold text-slate-600 transition-all hover:scale-105">
                Pharmacy Portal
              </Link>
            </div>

            <div className="mt-12 flex items-center justify-center gap-4 text-sm text-slate-500">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <img key={i} className="h-8 w-8 rounded-full border-2 border-slate-50 object-cover" src={`https://picsum.photos/seed/user${i}/100/100`} alt="User" referrerPolicy="no-referrer" />
                ))}
              </div>
              <span>Joined by 500+ residents in Ilorin</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Problem/Solution Section */}
      <section className="bg-white py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">A Broken System That's Failing Ilorin</h2>
            <p className="mt-4 text-lg text-slate-600">Sourcing traditional medicine is slow, unreliable, and expensive, with limited availability.</p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { title: "Endless Queues", icon: <Clock className="text-emerald-600" size={24} />, desc: "Waiting hours at pharmacies only to find out they don't have what you need." },
              { title: "No Real-Time Visibility", icon: <Eye className="text-emerald-600" size={24} />, desc: "Patients have no way of knowing which pharmacy has stock in real-time." },
              { title: "Blind Search", icon: <Phone className="text-emerald-600" size={24} />, desc: "Calling dozens of stores manually just to find a single life-saving drug." },
              { title: "Limited Rural Access", icon: <Map className="text-emerald-600" size={24} />, desc: "Residents outside the city center struggle to access verified medications." },
              { title: "Unexpected Costs", icon: <DollarSign className="text-emerald-600" size={24} />, desc: "Price gouging and hidden fees due to a lack of market transparency." },
              { title: "Trust Issues", icon: <ShieldCheck className="text-emerald-600" size={24} />, desc: "Counterfeit drugs and unverified sources put lives at risk every day." }
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="rounded-2xl border border-slate-100 bg-slate-50 p-6 transition-all hover:shadow-md"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-sm">
                  {item.icon}
                </div>
                <h3 className="mb-2 text-lg font-bold text-slate-900">{item.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>

          {/* The Bridge - WhatsApp Bubble */}
          <div className="mt-20 flex flex-col items-center">
            <div className="mb-8 h-px w-24 bg-slate-200"></div>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative max-w-2xl rounded-3xl bg-emerald-50 p-8 shadow-sm"
            >
              <div className="absolute -top-4 left-8 flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-white shadow-lg">
                <MessageSquare size={16} />
              </div>
              <p className="text-lg font-medium leading-relaxed text-slate-800">
                "Our platform allows all pharmacies to list products in real-time, creating a unified digital inventory for Ilorin. Patients can buy securely via our <span className="font-bold text-emerald-700">Website</span> or through our <span className="font-bold text-emerald-700">WhatsApp AI Assistant</span>, ensuring no one is left behind."
              </p>
              <div className="mt-6 flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold">GP</div>
                <div>
                  <p className="text-sm font-bold text-slate-900">Pharma-E Bridge</p>
                  <p className="text-xs text-emerald-600 font-medium">Connecting Ilorin to Health</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-slate-50 py-24 overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center lg:text-left">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">How Pharma-E Works</h2>
            <p className="mt-4 text-lg text-slate-600">From search to delivery, we've simplified healthcare for you.</p>
          </div>

          <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
            {/* Left Side: Progress Tracker */}
            <div className="space-y-12">
              {[
                {
                  id: 1,
                  title: "Search to Order",
                  icon: <Search size={24} />,
                  desc: "Find your specific medicine across Ilorin in seconds. Complete your purchase immediately via our secure web portal or through the WhatsApp AI assistant."
                },
                {
                  id: 2,
                  title: "QR Pre-order",
                  icon: <QrCode size={24} />,
                  desc: "Skip the pharmacy queues. Choose 'Pre-Order' to secure your drugs online. The pharmacy is instantly alerted, and you receive a unique QR code for instant pickup."
                },
                {
                  id: 3,
                  title: "Smart Delivery",
                  icon: <Bike size={24} />,
                  desc: "Our professional rider network delivers your verified medication directly to your designated location in under 30 minutes. Real-time tracking included."
                }
              ].map((step, idx) => (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.2 }}
                  className="relative flex gap-6"
                >
                  {/* Vertical Line */}
                  {idx !== 2 && (
                    <div className="absolute left-6 top-12 h-full w-px bg-slate-200"></div>
                  )}

                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white shadow-lg shadow-emerald-200">
                    {step.icon}
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-slate-900">{step.title}</h3>
                    <p className="mt-2 text-slate-600 leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Right Side: Mobile Mockup */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative mx-auto w-full max-w-[320px]"
            >
              {/* Phone Frame */}
              <div className="relative z-10 overflow-hidden rounded-[3rem] border-[8px] border-slate-900 bg-slate-900 shadow-2xl">
                <div className="aspect-[9/19.5] bg-white">
                  {/* Status Bar */}
                  <div className="h-6 bg-slate-900 px-6 pt-1 flex justify-between items-center">
                    <span className="text-[10px] text-white font-medium">10:46</span>
                    <div className="flex gap-1">
                      <div className="h-2 w-2 rounded-full bg-white/40"></div>
                      <div className="h-2 w-2 rounded-full bg-white"></div>
                    </div>
                  </div>

                  {/* WhatsApp Simulation Content */}
                  <div className="flex h-full flex-col bg-[#e5ddd5]">
                    {/* Header */}
                    <div className="flex items-center gap-3 bg-[#075e54] p-3 text-white">
                      <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-xs">GP</div>
                      <div>
                        <p className="text-xs font-bold">Pharma-E AI</p>
                        <p className="text-[10px] opacity-80">Online</p>
                      </div>
                    </div>

                    {/* Chat Messages */}
                    <div className="flex-1 p-3 space-y-3 overflow-hidden">
                      <div className="max-w-[80%] rounded-lg bg-white p-2 text-[11px] shadow-sm">
                        I need Artemether/Lumefantrine.
                      </div>
                      <div className="ml-auto max-w-[80%] rounded-lg bg-[#dcf8c6] p-2 text-[11px] shadow-sm">
                        Found at Peace Standard Pharmacy (₦4,000). Would you like to order?
                      </div>

                      {/* QR Code Mockup */}
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1 }}
                        className="ml-auto max-w-[80%] rounded-lg bg-[#dcf8c6] p-3 shadow-sm"
                      >
                        <p className="mb-2 text-[10px] font-bold text-slate-900">Order Confirmed! Your Pharma-E QR Code is ready for instant pickup.</p>
                        <div className="aspect-square w-full rounded-lg bg-white p-2 flex items-center justify-center">
                          <QrCode size={80} className="text-slate-900" />
                        </div>
                        <p className="mt-2 text-[9px] text-slate-600">Show this at the counter.</p>
                      </motion.div>
                    </div>

                    {/* Input Area */}
                    <div className="bg-white p-2 flex items-center gap-2">
                      <div className="flex-1 h-8 rounded-full bg-slate-100 px-3 flex items-center text-[10px] text-slate-400">
                        Type a message...
                      </div>
                      <div className="h-8 w-8 rounded-full bg-[#128c7e] flex items-center justify-center text-white">
                        <MessageSquare size={14} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Decorative Elements */}
              <div className="absolute -right-12 -top-12 h-64 w-64 rounded-full bg-emerald-100/50 blur-3xl"></div>
              <div className="absolute -bottom-12 -left-12 h-64 w-64 rounded-full bg-emerald-100/50 blur-3xl"></div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section id="features" className="bg-slate-50 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Verified Healthcare, Delivered</h2>
            <p className="mt-4 text-lg text-slate-600">Built specifically for the Ilorin community.</p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                title: "Verified Sources",
                desc: "Sourced directly from Ilorin manufacturers.",
                icon: <ShieldCheck className="text-emerald-600" size={32} />,
                link: "/demo/customer"
              },
              {
                title: "Pharmacist Reviewed",
                desc: "Every order verified by a licensed professional.",
                icon: <Activity className="text-emerald-600" size={32} />,
                link: "/demo/pharmacy"
              },
              {
                title: "Hyper-Local",
                desc: "30-minute delivery to Tanke, GRA, and beyond.",
                icon: <Truck className="text-emerald-600" size={32} />,
                link: "/demo/delivery"
              }
            ].map((feature, idx) => (
              <Link key={idx} to={feature.link} className="group rounded-2xl bg-white p-8 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md">
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-xl bg-emerald-50 group-hover:bg-emerald-100 transition-colors">
                  {feature.icon}
                </div>
                <h3 className="mb-3 text-xl font-bold text-slate-900">{feature.title}</h3>
                <p className="text-slate-600">{feature.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>


      {/* Locations */}
      <section id="locations" className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-12 lg:flex-row">
            <div className="max-w-xl">
              <h2 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">Local coverage in Ilorin</h2>
              <p className="mt-6 text-lg text-slate-600 leading-relaxed">
                We've mapped out the city to ensure the fastest delivery times possible. From Tanke to Challenge, we've got you covered.
              </p>
              <div className="mt-10 grid grid-cols-2 gap-6">
                {['Tanke', 'GRA', 'Basin', 'Ilorin Central', 'Adewole', 'Challenge', 'Post Office', 'Fate', 'Sango', 'Offa Garage', 'Ganmo', 'Gaa-kanbi'].map((loc) => (
                  <div key={loc} className="flex items-center gap-3 text-slate-700 group">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 transition-colors group-hover:bg-emerald-600 group-hover:text-white">
                      <MapPin size={16} />
                    </div>
                    <span className="font-bold text-lg">{loc}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-6 w-full lg:w-auto">
              {/* 15 min Card */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex-1 rounded-[2.5rem] bg-gradient-to-br from-emerald-500 to-emerald-600 p-10 text-white shadow-2xl shadow-emerald-200 lg:w-64"
              >
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md">
                  <Clock size={32} />
                </div>
                <div className="flex items-center gap-2 text-5xl font-black">
                  15 min <Zap size={24} className="fill-current text-emerald-200" />
                </div>
                <div className="mt-2 text-lg font-bold text-emerald-100">Average delivery</div>
              </motion.div>

              {/* 100% Verified Card */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex-1 rounded-[2.5rem] bg-slate-900 p-10 text-white shadow-2xl shadow-slate-200 lg:w-64"
              >
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10">
                  <ShieldCheck size={32} className="text-emerald-500" />
                </div>
                <div className="text-5xl font-black tracking-tight">100%</div>
                <div className="mt-2 text-lg font-bold text-slate-400">Verified Meds</div>
              </motion.div>
            </div>
          </div>

          {/* Auth CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-20 flex flex-col items-center justify-center rounded-[3rem] bg-slate-50 p-12 text-center border border-slate-100"
          >
            <h3 className="text-2xl font-bold text-slate-900">Ready for 15-minute delivery?</h3>
            <p className="mt-2 text-slate-600 mb-8">Join thousands of Ilorin residents getting their meds faster than ever.</p>
            <Link
              to="/auth"
              className="flex items-center gap-3 rounded-full bg-white px-8 py-4 text-lg font-bold text-slate-900 shadow-xl shadow-slate-200 transition-all hover:scale-105 active:scale-95 border border-slate-100"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Sign in with Google to get started
            </Link>
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-white py-24">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Frequently Asked Questions</h2>
            <p className="mt-4 text-lg text-slate-600">Everything you need to know about Pharma-E.</p>
          </div>

          {/* FAQ Search */}
          <div className="mb-12 relative">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400">
              <Search size={20} />
            </div>
            <input
              type="text"
              placeholder="Search FAQs..."
              className="w-full rounded-2xl border border-slate-100 bg-slate-50 py-4 pl-12 pr-4 text-lg outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
              value={faqSearch}
              onChange={(e) => setFaqSearch(e.target.value)}
            />
          </div>

          {/* Accordion */}
          <div className="space-y-4">
            {filteredFaqs.map((faq, idx) => (
              <div
                key={idx}
                className={`overflow-hidden rounded-2xl border transition-all ${openFaq === idx
                  ? 'border-emerald-100 bg-emerald-50/30'
                  : 'border-slate-50 bg-white'
                  }`}
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className={`flex w-full items-center justify-between p-6 text-left transition-all ${openFaq === idx ? 'border-l-4 border-emerald-600' : ''
                    }`}
                >
                  <span className={`text-lg font-bold ${openFaq === idx ? 'text-emerald-900' : 'text-slate-900'}`}>
                    {faq.question}
                  </span>
                  <div className={`shrink-0 text-slate-400 transition-transform ${openFaq === idx ? 'rotate-180 text-emerald-600' : ''}`}>
                    <ChevronDown size={20} />
                  </div>
                </button>

                <AnimatePresence>
                  {openFaq === idx && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="px-6 pb-6 text-slate-600 leading-relaxed">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}

            {filteredFaqs.length === 0 && (
              <div className="py-12 text-center text-slate-500">
                No questions found matching "{faqSearch}".
              </div>
            )}
          </div>

          {/* FAQ CTA */}
          <div className="mt-16 flex flex-col items-center justify-center rounded-3xl bg-slate-50 p-10 text-center border border-slate-100">
            <p className="text-lg font-medium text-slate-800 mb-6">Still confused? Chat with our Pharmacist on WhatsApp</p>
            <a
              href="https://wa.me/yournumber"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-full bg-[#25D366] px-8 py-4 text-lg font-bold text-white shadow-xl shadow-emerald-200 transition-all hover:scale-105 active:scale-95"
            >
              <MessageSquare size={20} />
              Chat on WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 bg-white py-12">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Activity className="text-emerald-600" size={24} />
            <span className="text-2xl font-black tracking-tighter text-slate-900 font-sans">Pharma-E</span>
          </div>
          <p className="text-slate-600 font-medium mb-2">Pharma-E - If it's not verified, it's not here. The smart way to get medicine.</p>
          <p className="text-slate-500 text-sm">© 2026 Pharma-E Ilorin. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
