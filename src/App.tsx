/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'motion/react';
import Landing from './pages/Landing';
import MedSearch from './pages/MedSearch';
import Checkout from './pages/Checkout';
import Fulfillment from './pages/Fulfillment';
import Pickup from './pages/Pickup';

// New Production Pages
import Login from './pages/Login';
import CustomerDashboard from './pages/CustomerDashboard';
import PharmacyPortal from './pages/PharmacyPortal';
import PendingVerification from './pages/PendingVerification';
import AISearch from './pages/AISearch';
import RiderTracking from './pages/RiderTracking';
import ProtectedRoute, { PublicOnlyRoute } from './components/ProtectedRoute';
import RoleModal from './components/onboarding/RoleModal';

function AnimatedRoutes() {
  const location = useLocation();
  
  return (
    <>
    <AnimatePresence mode="wait">
      {/* @ts-expect-error framer-motion requires key for page transitions */}
      <Routes location={location} key={location.pathname}>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
        
        {/* Customer Routes */}
        <Route path="/search" element={<ProtectedRoute requireRole="customer"><MedSearch /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute requireRole="customer"><CustomerDashboard /></ProtectedRoute>} />
        <Route path="/ai-search" element={<ProtectedRoute requireRole="customer"><AISearch /></ProtectedRoute>} />
        <Route path="/track/:id" element={<ProtectedRoute requireRole="customer"><RiderTracking /></ProtectedRoute>} />
        
        {/* Pharmacy Routes */}
        <Route path="/portal" element={<ProtectedRoute requireRole="pharmacy" requireVerified={true}><PharmacyPortal /></ProtectedRoute>} />
        <Route path="/pending-verification" element={<ProtectedRoute requireRole="pharmacy" requireVerified={false}><PendingVerification /></ProtectedRoute>} />

        {/* Legacy Routes (Keep for compatibility if used) */}
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/fulfillment" element={<Fulfillment />} />
        <Route path="/pickup" element={<Pickup />} />
      </Routes>
    </AnimatePresence>
    <RoleModal />
    </>
  );
}

export default function App() {
  return (
    <Router>
      <AnimatedRoutes />
    </Router>
  );
}

