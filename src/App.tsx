/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import CustomerDemo from './pages/CustomerDemo';
import PharmacyDemo from './pages/PharmacyDemo';
import DeliveryDemo from './pages/DeliveryDemo';
import MedSearch from './pages/MedSearch';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/search" element={<MedSearch />} />
        <Route path="/demo/customer" element={<CustomerDemo />} />
        <Route path="/demo/pharmacy" element={<PharmacyDemo />} />
        <Route path="/demo/delivery" element={<DeliveryDemo />} />
      </Routes>
    </Router>
  );
}

