import React from 'react';
import { useSupabase } from '../lib/mock-db';
import { 
  LogOut, 
  Search, 
  Clock, 
  QrCode, 
  Bike, 
  Bell, 
  ChevronRight,
  Activity,
  User,
  MessageCircle,
  Phone
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';

export default function CustomerDashboard() {
  const { currentUser, logout } = useSupabase();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const dashboardCards = [
    {
      title: "Find & Buy",
      description: "Search across all verified pharmacies in Ilorin and purchase securely online.",
      icon: <Search className="w-8 h-8 text-emerald-600" />,
      link: "/search",
      linkText: "Start Searching",
      bgColor: "bg-emerald-50",
    },
    {
      title: "Scan to Collect",
      description: "Use your unique QR code for instant, queue-free pickup at your chosen pharmacy.",
      icon: <QrCode className="w-8 h-8 text-blue-600" />,
      action: () => alert("QR Scanner coming soon!"),
      actionText: "Open QR Scanner",
      secondaryLink: "#",
      secondaryText: "View My Codes",
      bgColor: "bg-blue-50",
    },
    {
      title: "Track My Rider",
      description: "Monitor your medication delivery in real-time. Average delivery time: 15 mins.",
      icon: <Bike className="w-8 h-8 text-orange-600" />,
      link: "#",
      linkText: "View Active Deliveries",
      bgColor: "bg-orange-50",
    },
    {
      title: "Chat on WhatsApp",
      description: "Instantly chat with our AI assistant to find drugs, get prices, or initiate an order.",
      icon: <MessageCircle className="w-8 h-8 text-[#25D366]" />,
      action: () => window.open("https://wa.me/yournumber", "_blank"),
      actionText: "Chat Now",
      bgColor: "bg-green-50",
    },
    {
      title: "Talk with a Pharmacist",
      description: "Get professional medical advice and drug consultations from certified pharmacists.",
      icon: <Phone className="w-8 h-8 text-purple-600" />,
      action: () => alert("Connecting you with a health professional..."),
      actionText: "Call Pharmacist",
      bgColor: "bg-purple-50",
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-lg shadow-emerald-200">
              <Activity size={24} />
            </div>
            <span className="text-2xl font-black tracking-tighter text-slate-900 font-sans">Pharma-E</span>
          </Link>
          <div className="flex items-center space-x-4">
            <button className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-full transition-colors relative">
              <Bell className="h-6 w-6" />
              <span className="absolute top-2 right-2 h-2 w-2 bg-emerald-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 border border-slate-200 overflow-hidden shadow-sm">
                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser?.full_name}`} alt="Avatar" className="w-full h-full object-cover" />
            </div>
            <button onClick={handleLogout} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors">
              <LogOut className="h-6 w-6" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-4xl font-extrabold text-slate-900">
            Welcome back, <span className="text-emerald-600">{currentUser?.full_name?.split(' ')[0]}</span>
          </h1>
          <p className="mt-2 text-lg text-slate-500">What would you like to do today?</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {dashboardCards.map((card, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white rounded-3xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 flex flex-col group"
            >
              <div className={`w-16 h-16 ${card.bgColor} rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300`}>
                {card.icon}
              </div>
              
              <h3 className="text-2xl font-bold text-slate-900 mb-4">{card.title}</h3>
              <p className="text-slate-500 mb-8 flex-grow leading-relaxed">
                {card.description}
              </p>

              <div className="space-y-4">
                {card.actionText ? (
                  <button 
                    onClick={card.action}
                    className="w-full py-4 px-6 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200 flex items-center justify-center gap-2"
                  >
                    <QrCode className="w-5 h-5" />
                    {card.actionText}
                  </button>
                ) : null}

                {card.link ? (
                  <Link 
                    to={card.link}
                    className="flex items-center text-emerald-600 font-bold hover:text-emerald-700 transition-colors group/link"
                  >
                    {card.linkText} <ChevronRight className="w-5 h-5 ml-1 group-hover/link:translate-x-1 transition-transform" />
                  </Link>
                ) : null}

                {card.secondaryLink ? (
                  <Link 
                    to={card.secondaryLink}
                    className="block w-full text-center py-4 px-6 bg-transparent border border-slate-200 text-slate-700 rounded-2xl font-bold hover:bg-slate-50 transition-colors"
                  >
                    {card.secondaryText}
                  </Link>
                ) : null}
              </div>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
}
