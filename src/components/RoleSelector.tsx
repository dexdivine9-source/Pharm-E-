import React from 'react';
import { Building2, User } from 'lucide-react';
import { useSupabase, Role } from '../lib/mock-db';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';

export default function RoleSelector() {
  const { setRole, currentUser } = useSupabase();
  const navigate = useNavigate();

  const handleSelectRole = (role: Role) => {
    setRole(role);
    if (role === 'customer') {
      navigate('/dashboard');
    } else {
      navigate('/pending-verification');
    }
  };

  if (!currentUser) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="mx-auto h-12 w-12 bg-emerald-100 rounded-full flex items-center justify-center">
          <Building2 className="h-6 w-6 text-emerald-600" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Welcome to Pharma-E
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Hello, {currentUser.full_name}. How will you be using the network?
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-2xl">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            
            {/* Customer Card */}
            <button
              onClick={() => handleSelectRole('customer')}
              className={cn(
                "relative block w-full border-2 border-gray-200 rounded-xl p-8 text-center",
                "hover:border-emerald-500 hover:bg-emerald-50 transition-all duration-200",
                "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
              )}
            >
              <User className="mx-auto h-12 w-12 text-emerald-600 mb-4" />
              <span className="block text-lg font-semibold text-gray-900">I am a Customer</span>
              <span className="mt-2 block text-sm text-gray-500">
                I want to find and order medications from verified local pharmacies.
              </span>
            </button>

            {/* Pharmacy Card */}
            <button
              onClick={() => handleSelectRole('pharmacy')}
              className={cn(
                "relative block w-full border-2 border-gray-200 rounded-xl p-8 text-center",
                "hover:border-emerald-500 hover:bg-emerald-50 transition-all duration-200",
                "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
              )}
            >
              <Building2 className="mx-auto h-12 w-12 text-emerald-600 mb-4" />
              <span className="block text-lg font-semibold text-gray-900">I am a Pharmacy</span>
              <span className="mt-2 block text-sm text-gray-500">
                I want to list my inventory and fulfill orders in the network.
              </span>
            </button>

          </div>
        </div>
      </div>
    </div>
  );
}
