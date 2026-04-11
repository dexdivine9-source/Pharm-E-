import React from 'react';
import { ShieldAlert, CheckCircle2, LogOut } from 'lucide-react';
import { useSupabase } from '../lib/mock-db';
import { useNavigate } from 'react-router-dom';

export default function PendingVerification() {
  const { currentUser, isAdmin, verifyPharmacy, logout } = useSupabase();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleAdminVerify = () => {
    if (currentUser && isAdmin) {
      verifyPharmacy(currentUser.id);
      navigate('/portal');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 text-center border-t-4 border-amber-500">
          <ShieldAlert className="mx-auto h-16 w-16 text-amber-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Verification Pending</h2>
          <p className="text-gray-600 mb-6">
            Your pharmacy account (<span className="font-semibold">{currentUser?.full_name}</span>) is currently under review. 
            For the safety of the Pharma-E network, all pharmacies must be manually verified before accessing the portal.
          </p>
          
          <div className="bg-amber-50 rounded-md p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <ShieldAlert className="h-5 w-5 text-amber-400" aria-hidden="true" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-amber-800">What happens next?</h3>
                <div className="mt-2 text-sm text-amber-700">
                  <p>Our team will review your credentials within 24-48 hours. You will receive an email once approved.</p>
                </div>
              </div>
            </div>
          </div>

          {isAdmin && (
            <div className="mb-6 p-4 border border-emerald-200 bg-emerald-50 rounded-md">
              <p className="text-sm text-emerald-800 font-medium mb-3">
                <CheckCircle2 className="inline h-4 w-4 mr-1" />
                Admin Override Available
              </p>
              <button
                onClick={handleAdminVerify}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700"
              >
                Verify This Pharmacy Now
              </button>
            </div>
          )}

          <button
            onClick={handleLogout}
            className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
