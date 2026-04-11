import React from 'react';
import { useSupabase, Role } from '../../lib/mock-db';
import { User, Store, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';

export default function RoleModal() {
  const { currentUser, setRole } = useSupabase();
  const navigate = useNavigate();

  // Only show the modal if the user is logged in but hasn't picked a role yet.
  const isVisible = currentUser && currentUser.role === '';

  const handleSelectRole = (role: Role) => {
    setRole(role);
    // The "Boom Redirect"
    if (role === 'customer') {
      navigate('/dashboard');
    } else if (role === 'pharmacy') {
      navigate('/portal'); // Will route to /pending-verification inherently due to our app's ProtectedRoute rules!
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/80 backdrop-blur-sm"
        >
          <motion.div 
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden"
          >
            <div className="bg-emerald-600 p-6 text-center text-white">
              <Activity className="w-12 h-12 mx-auto mb-4 text-emerald-100" />
              <h2 className="text-3xl font-extrabold tracking-tight">What are you?</h2>
              <p className="mt-2 text-emerald-100">Welcome to Pharma-E. Please select how you will use the network.</p>
            </div>
            
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Customer Card */}
              <button
                onClick={() => handleSelectRole('customer')}
                className="group relative flex flex-col items-center justify-center p-8 text-center rounded-xl border-2 border-gray-100 hover:border-emerald-500 hover:bg-emerald-50 transition-all focus:outline-none focus:ring-4 focus:ring-emerald-500/20"
              >
                <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-4 group-hover:bg-emerald-600 group-hover:text-white transition-colors text-emerald-600">
                  <User className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Customer</h3>
                <p className="text-sm text-gray-500">I want to find and buy medication instantly from verified pharmacies.</p>
              </button>

              {/* Pharmacy Card */}
              <button
                onClick={() => handleSelectRole('pharmacy')}
                className="group relative flex flex-col items-center justify-center p-8 text-center rounded-xl border-2 border-gray-100 hover:border-emerald-500 hover:bg-emerald-50 transition-all focus:outline-none focus:ring-4 focus:ring-emerald-500/20"
              >
                <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-4 group-hover:bg-emerald-600 group-hover:text-white transition-colors text-emerald-600">
                  <Store className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Pharmacy</h3>
                <p className="text-sm text-gray-500">I own a licensed pharmacy and want to fulfill network orders.</p>
              </button>

            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
