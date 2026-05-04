import React, { useState } from 'react';
import { useSupabase, Profile } from '../lib/mock-db';
import { ShieldCheck, XCircle, Search, FileText, CheckCircle2, Clock, Building2, Truck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  const { allProfiles, verifyProfile, rejectProfile } = useSupabase();
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [isLocked, setIsLocked] = useState(true);
  const [accessKey, setAccessKey] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Filter unverified pharmacies and logistics
  const pendingProfiles = allProfiles.filter(p => !p.is_verified && (p.role === 'pharmacy' || p.role === 'logistics'));

  const handleVerify = (id: string) => {
    verifyProfile(id);
    setSelectedProfile(null);
  };

  const handleReject = (id: string) => {
    rejectProfile(id);
    setSelectedProfile(null);
  };

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (accessKey === 'dex_divine') {
      setIsLocked(false);
      setError('');
    } else {
      setError('Invalid Access Key');
      setAccessKey('');
    }
  };

  if (isLocked) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex justify-center mb-6">
            <div className="h-16 w-16 bg-gray-800 rounded-full flex items-center justify-center border border-gray-700 shadow-xl">
              <ShieldCheck className="h-8 w-8 text-emerald-400" />
            </div>
          </div>
          <h2 className="text-center text-2xl font-bold text-white tracking-tight mb-8">
            Admin Command Center
          </h2>
          <div className="bg-gray-800 py-8 px-4 shadow-xl sm:rounded-lg sm:px-10 border border-gray-700">
            <form onSubmit={handleUnlock} className="space-y-6">
              <div>
                <label htmlFor="accessKey" className="block text-sm font-medium text-gray-300">
                  Enter Access Key
                </label>
                <div className="mt-2">
                  <input
                    id="accessKey"
                    type="password"
                    required
                    value={accessKey}
                    onChange={(e) => setAccessKey(e.target.value)}
                    className="appearance-none block w-full px-3 py-3 border border-gray-600 rounded-md shadow-sm placeholder-gray-500 bg-gray-700 text-white focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm transition-colors"
                    placeholder="••••••••••••"
                  />
                </div>
                {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
              </div>

              <div>
                <button
                  type="submit"
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-bold text-gray-900 bg-emerald-400 hover:bg-emerald-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 focus:ring-offset-gray-900 transition-colors"
                >
                  Unlock Portal
                </button>
              </div>

              <div className="mt-4 text-center">
                <button 
                  type="button"
                  onClick={() => alert("Recovery: The master key is your designated username with an underscore. Check the internal network docs if you still can't log in.")}
                  className="text-xs text-gray-500 hover:text-emerald-400 transition-colors"
                >
                  Forgot Access Key?
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Admin Header */}
      <header className="bg-gray-900 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-8 w-8 text-emerald-400" />
            <span className="text-xl font-bold tracking-tight">Network Command Center</span>
          </div>
          <div className="flex gap-4">
            <button onClick={() => navigate('/')} className="text-sm text-gray-300 hover:text-white transition-colors">
              Exit Admin
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row gap-8">
        
        {/* Left Col - Queue */}
        <div className="flex-1">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Verification Queue</h1>
            <div className="bg-amber-100 text-amber-800 text-sm font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              {pendingProfiles.length} Pending
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {pendingProfiles.length === 0 ? (
              <div className="p-12 text-center text-gray-500">
                <CheckCircle2 className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                <p className="text-lg font-medium text-gray-900">Inbox Zero</p>
                <p>All network partners are verified.</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {pendingProfiles.map(profile => (
                  <li 
                    key={profile.id} 
                    className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${selectedProfile?.id === profile.id ? 'bg-emerald-50 hover:bg-emerald-50' : ''}`}
                    onClick={() => setSelectedProfile(profile)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center ${profile.role === 'pharmacy' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'}`}>
                          {profile.role === 'pharmacy' ? <Building2 className="h-5 w-5" /> : <Truck className="h-5 w-5" />}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{profile.full_name}</p>
                          <p className="text-xs text-gray-500">{profile.email}</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 capitalize">
                          {profile.role}
                        </span>
                        <span className="text-xs text-gray-400 mt-1">Submitted recently</span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Right Col - Review Panel */}
        <div className="w-full md:max-w-md">
          <AnimatePresence mode="wait">
            {selectedProfile ? (
              <motion.div 
                key="panel"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="bg-white rounded-xl shadow-lg border border-gray-200 sticky top-8 overflow-hidden"
              >
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-bold text-gray-900">Review Application</h3>
                  <p className="text-sm text-gray-500">{selectedProfile.full_name}</p>
                </div>
                
                <div className="p-6 space-y-6 bg-gray-50">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Uploaded Document</h4>
                    <div className="aspect-[4/3] bg-gray-200 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-500">
                      <FileText className="h-12 w-12 mb-2 text-gray-400" />
                      <p className="text-sm font-medium">Mock_{selectedProfile.role}_Document.pdf</p>
                      <button className="mt-2 text-xs text-emerald-600 font-medium hover:underline">View Full Size</button>
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-lg border border-gray-200 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Account Type</span>
                      <span className="font-medium text-gray-900 capitalize">{selectedProfile.role}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Email</span>
                      <span className="font-medium text-gray-900">{selectedProfile.email}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">System ID</span>
                      <span className="font-mono text-xs text-gray-500">{selectedProfile.id}</span>
                    </div>
                  </div>
                </div>

                <div className="p-6 border-t border-gray-200 flex gap-3">
                  <button
                    onClick={() => handleReject(selectedProfile.id)}
                    className="flex-1 bg-white text-red-600 border border-red-200 hover:bg-red-50 hover:border-red-300 font-bold py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <XCircle className="h-5 w-5" />
                    Reject
                  </button>
                  <button
                    onClick={() => handleVerify(selectedProfile.id)}
                    className="flex-1 bg-emerald-600 text-white hover:bg-emerald-700 font-bold py-2.5 px-4 rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="h-5 w-5" />
                    Approve
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 h-full min-h-[400px] flex flex-col items-center justify-center text-gray-400 p-8 text-center"
              >
                <Search className="h-12 w-12 mb-4 text-gray-300" />
                <p className="text-lg font-medium text-gray-600 mb-1">Select an application</p>
                <p className="text-sm">Click on a pending profile from the queue to review their documents.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
