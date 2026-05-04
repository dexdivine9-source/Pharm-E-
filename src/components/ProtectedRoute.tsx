import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSupabase, Role } from '../lib/mock-db';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireRole?: Role;
  requireVerified?: boolean;
  requireAdmin?: boolean;
}

export default function ProtectedRoute({ children, requireRole, requireVerified, requireAdmin }: ProtectedRouteProps) {
  const { currentUser, isAdmin } = useSupabase();
  const location = useLocation();

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  if (requireRole && currentUser.role !== requireRole) {
    if (currentUser.role === 'customer') {
      return <Navigate to="/dashboard" replace />;
    }
    if (currentUser.role === 'pharmacy') {
      return <Navigate to={currentUser.is_verified ? "/portal" : "/pending-verification"} replace />;
    }
    if (currentUser.role === 'logistics') {
      return <Navigate to={currentUser.is_verified ? "/logistics" : "/logistics-onboarding"} replace />;
    }
  }

  // Handle Verification specific routing for pharmacies and logistics
  if ((requireRole === 'pharmacy' || requireRole === 'logistics') && requireVerified !== undefined) {
    if (requireVerified && !currentUser.is_verified) {
      return <Navigate to={requireRole === 'pharmacy' ? "/pending-verification" : "/logistics-onboarding"} replace />;
    }
    if (!requireVerified && currentUser.is_verified) {
      return <Navigate to={requireRole === 'pharmacy' ? "/portal" : "/logistics"} replace />;
    }
  }

  return <>{children}</>;
}

export function PublicOnlyRoute({ children }: { children: React.ReactNode }) {
  const { currentUser } = useSupabase();

  if (currentUser) {
    if (currentUser.role === 'customer') {
      return <Navigate to="/dashboard" replace />;
    }
    if (currentUser.role === 'pharmacy') {
      return <Navigate to={currentUser.is_verified ? "/portal" : "/pending-verification"} replace />;
    }
    if (currentUser.role === 'logistics') {
      return <Navigate to={currentUser.is_verified ? "/logistics" : "/logistics-onboarding"} replace />;
    }
  }

  return <>{children}</>;
}
