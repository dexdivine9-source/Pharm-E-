import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Truck, Bike, Car, Upload, CheckCircle2 } from 'lucide-react';
import { useSupabase } from '../lib/mock-db';
import { useNavigate } from 'react-router-dom';

export default function LogisticsOnboarding() {
  const { currentUser } = useSupabase();
  const navigate = useNavigate();
  const [vehicleType, setVehicleType] = useState<string>('');
  const [fileUploaded, setFileUploaded] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicleType || !fileUploaded) return;
    setSubmitted(true);
    // In a real app, this would update the user profile in Supabase
    // e.g., supabase.from('profiles').update({ vehicle_type: vehicleType }).eq('id', currentUser.id)
  };

  if (!currentUser) return null;

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="sm:mx-auto sm:w-full sm:max-w-md text-center"
        >
          <div className="mx-auto h-16 w-16 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
            <CheckCircle2 className="h-8 w-8 text-emerald-600" />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 mb-4">Application Submitted!</h2>
          <p className="text-gray-600 mb-8">
            Thank you for applying to join the Pharma-E logistics network. Our team will review your ID and vehicle details. You will receive an email once your account is verified.
          </p>
          <button
            onClick={() => navigate('/')}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700"
          >
            Return to Home
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md mb-8 text-center">
        <h2 className="text-3xl font-extrabold text-gray-900">Driver Onboarding</h2>
        <p className="mt-2 text-gray-600">Complete your profile to start receiving deliveries.</p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Vehicle Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                What is your vehicle type?
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                
                <button
                  type="button"
                  onClick={() => setVehicleType('bicycle')}
                  className={`relative flex flex-col items-center p-4 border rounded-xl focus:outline-none transition-all ${
                    vehicleType === 'bicycle' 
                      ? 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-500' 
                      : 'border-gray-200 hover:border-emerald-500'
                  }`}
                >
                  <Bike className={`w-8 h-8 mb-2 ${vehicleType === 'bicycle' ? 'text-emerald-600' : 'text-gray-400'}`} />
                  <span className="text-sm font-medium text-gray-900">Bicycle</span>
                  <span className="text-xs text-gray-500 mt-1">Short range, light</span>
                </button>

                <button
                  type="button"
                  onClick={() => setVehicleType('motorbike')}
                  className={`relative flex flex-col items-center p-4 border rounded-xl focus:outline-none transition-all ${
                    vehicleType === 'motorbike' 
                      ? 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-500' 
                      : 'border-gray-200 hover:border-emerald-500'
                  }`}
                >
                  <Truck className={`w-8 h-8 mb-2 ${vehicleType === 'motorbike' ? 'text-emerald-600' : 'text-gray-400'}`} />
                  <span className="text-sm font-medium text-gray-900">Motorbike</span>
                  <span className="text-xs text-gray-500 mt-1">Medium range, fast</span>
                </button>

                <button
                  type="button"
                  onClick={() => setVehicleType('van')}
                  className={`relative flex flex-col items-center p-4 border rounded-xl focus:outline-none transition-all ${
                    vehicleType === 'van' 
                      ? 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-500' 
                      : 'border-gray-200 hover:border-emerald-500'
                  }`}
                >
                  <Car className={`w-8 h-8 mb-2 ${vehicleType === 'van' ? 'text-emerald-600' : 'text-gray-400'}`} />
                  <span className="text-sm font-medium text-gray-900">Van / Truck</span>
                  <span className="text-xs text-gray-500 mt-1">Wholesale, large</span>
                </button>

              </div>
            </div>

            {/* Document Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Driver's License or ID
              </label>
              <div 
                className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md transition-colors ${
                  fileUploaded ? 'border-emerald-500 bg-emerald-50' : 'border-gray-300 hover:border-emerald-500'
                }`}
              >
                <div className="space-y-1 text-center">
                  {fileUploaded ? (
                    <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500" />
                  ) : (
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  )}
                  <div className="flex text-sm text-gray-600 justify-center">
                    <label
                      htmlFor="file-upload"
                      className="relative cursor-pointer rounded-md font-medium text-emerald-600 hover:text-emerald-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-emerald-500"
                    >
                      <span>{fileUploaded ? 'Change file' : 'Upload a file'}</span>
                      <input 
                        id="file-upload" 
                        name="file-upload" 
                        type="file" 
                        className="sr-only" 
                        onChange={(e) => {
                          if (e.target.files && e.target.files.length > 0) {
                            setFileUploaded(true);
                          }
                        }}
                      />
                    </label>
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG, PDF up to 10MB</p>
                </div>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={!vehicleType || !fileUploaded}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Submit Application
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
