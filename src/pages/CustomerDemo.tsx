'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Send, Phone, Video, MoreVertical, CheckCheck, ArrowLeft, Paperclip, Smile, MapPin, Mic, Play, Image as ImageIcon, BadgeCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';

const INITIAL_MESSAGES = [
  { 
    id: 1, 
    type: 'voice',
    sender: "user", 
    time: "10:00 AM" 
  },
  { 
    id: 2, 
    text: "I've analyzed your voice note. You're looking for 'Artemether/Lumefantrine' (Malaria ACT). I've found 3 pharmacies in Nigeria with this in stock.", 
    sender: "bot", 
    time: "10:01 AM" 
  },
  {
    id: 3,
    type: 'search_result',
    sender: "bot",
    time: "10:01 AM",
    data: {
      name: "Peace Standard Pharmacy",
      price: "₦4,000",
      distance: "0.8 km",
      stock: "In Stock"
    }
  },
  { 
    id: 4, 
    type: 'image',
    sender: "user", 
    time: "10:02 AM" 
  },
  { 
    id: 5, 
    text: "Prescription received. Routing to a licensed pharmacist for verification...", 
    sender: "bot", 
    time: "10:02 AM" 
  },
];

export default function CustomerDemo() {
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = () => {
    if (!input.trim()) return;

    const newUserMsg = {
      id: Date.now(),
      text: input,
      sender: "user",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages([...messages, newUserMsg]);
    setInput("");
    setIsTyping(true);

    // Simulate bot response
    setTimeout(() => {
      setIsTyping(false);
      const botMsg = {
        id: Date.now() + 1,
        text: "Order matched with Peace Standard Pharmacy (Tanke). Delivery estimate: 20 mins.",
        sender: "bot",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, botMsg]);
    }, 3000);
  };

  return (
    <div className="flex h-screen flex-col bg-[#efeae2] font-sans">
      {/* WhatsApp Header */}
      <header className="flex items-center justify-between bg-[#008069] px-4 py-3 text-white shadow-md">
        <div className="flex items-center gap-3">
          <Link to="/" className="rounded-full p-1 hover:bg-white/10 hover:scale-105 transition-transform">
            <ArrowLeft size={24} />
          </Link>
          <div className="relative">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 font-bold shadow-inner">
              GP
            </div>
            <div className="absolute -right-1 -bottom-1 h-5 w-5 rounded-full border-2 border-[#008069] bg-white flex items-center justify-center">
              <BadgeCheck size={14} className="text-emerald-600 fill-emerald-600" />
            </div>
          </div>
          <div>
            <h1 className="text-base font-bold leading-tight flex items-center gap-1">
              GoPharma AI Assistant
            </h1>
            <p className="text-[11px] text-white/80">Online</p>
          </div>
        </div>
        <div className="flex items-center gap-5">
          <Video size={20} />
          <Phone size={20} />
          <MoreVertical size={20} />
        </div>
      </header>

      {/* Chat Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-6 space-y-4 scroll-smooth"
        style={{ backgroundImage: "url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')", backgroundSize: "contain" }}
      >
        <div className="mx-auto mb-4 flex w-fit items-center justify-center rounded-lg bg-[#d1f4ff] px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-slate-600 shadow-sm">
          Today
        </div>

        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`relative max-w-[85%] rounded-lg px-3 py-1.5 shadow-sm ${
                  msg.sender === 'user' 
                    ? 'bg-[#d9fdd3] rounded-tr-none' 
                    : 'bg-white rounded-tl-none'
                }`}
              >
                {msg.type === 'voice' ? (
                  <div className="flex items-center gap-3 py-1 pr-8">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                      <Play size={20} fill="currentColor" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-end gap-0.5 h-6">
                        {[3, 5, 2, 6, 4, 7, 3, 5, 4, 6, 2, 5].map((h, i) => (
                          <div key={i} className="w-0.5 bg-slate-400 rounded-full" style={{ height: `${h * 3}px` }}></div>
                        ))}
                      </div>
                      <span className="text-[10px] text-slate-500">0:12</span>
                    </div>
                    <div className="absolute right-2 bottom-1.5">
                      <Mic size={14} className="text-slate-400" />
                    </div>
                  </div>
                ) : msg.type === 'image' ? (
                  <div className="flex flex-col gap-1">
                    <div className="overflow-hidden rounded-md">
                      <img src="https://picsum.photos/seed/med-pack/400/300" alt="Prescription" className="h-40 w-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                    <p className="text-[14.5px] leading-relaxed text-slate-800">Here is the medicine pack.</p>
                  </div>
                ) : msg.type === 'search_result' ? (
                  <div className="flex flex-col gap-3 min-w-[240px]">
                    <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-3">
                      <h4 className="text-sm font-bold text-slate-900">{msg.data.name}</h4>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-xs font-bold text-emerald-700">{msg.data.price}</span>
                        <span className="text-[10px] font-medium text-slate-500">{msg.data.distance} away</span>
                      </div>
                      <div className="mt-2 flex items-center gap-1">
                        <BadgeCheck size={12} className="text-emerald-600" />
                        <span className="text-[10px] font-bold text-emerald-600 uppercase">{msg.data.stock}</span>
                      </div>
                    </div>
                    <Link 
                      to="/search" 
                      className="flex items-center justify-center gap-2 rounded-lg bg-emerald-600 py-2 text-xs font-bold text-white transition-transform hover:scale-105"
                    >
                      View in Med-Search
                    </Link>
                  </div>
                ) : (
                  <p className="text-[14.5px] leading-relaxed text-slate-800">{msg.text}</p>
                )}
                <div className="mt-1 flex items-center justify-end gap-1">
                  <span className="text-[10px] text-slate-500">{msg.time}</span>
                  {msg.sender === 'user' && <CheckCheck size={14} className="text-blue-500" />}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isTyping && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="rounded-lg bg-white px-4 py-3 shadow-sm border border-emerald-100">
              <div className="flex items-center gap-3">
                <div className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </div>
                <span className="text-sm font-medium text-emerald-700 animate-pulse">Checking nearby pharmacies...</span>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Input Area */}
      <div className="bg-[#f0f2f5] px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-4 text-slate-500">
            <Smile size={24} className="cursor-pointer hover:text-slate-700" />
            <Paperclip size={24} className="cursor-pointer hover:text-slate-700" />
          </div>
          <div className="flex-1">
            <input 
              type="text" 
              placeholder="Type a message"
              className="w-full rounded-lg bg-white px-4 py-2.5 text-sm outline-none placeholder:text-slate-500"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />
          </div>
          <button 
            onClick={handleSend}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-[#00a884] text-white transition-transform hover:scale-105 active:scale-95"
          >
            <Send size={20} />
          </button>
        </div>
      </div>

      {/* Floating Action for Demo Context */}
      <div className="fixed bottom-24 right-6 flex flex-col gap-3">
        <Link to="/demo/pharmacy" className="flex items-center gap-2 rounded-full bg-emerald-600 px-6 py-3 text-sm font-bold text-white shadow-xl hover:bg-emerald-700 hover:scale-105 transition-all">
          Continue to Pharmacy View <ArrowLeft size={18} className="rotate-180" />
        </Link>
      </div>
    </div>
  );
}
