import React from 'react';
import { Navigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user } = useAuthStore();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to their appropriate home dashboard
    switch (user.role) {
      case 'ADMIN': return <Navigate to="/admin" replace />;
      case 'PRODUCER': return <Navigate to="/producer" replace />;
      case 'DRIVER': return <Navigate to="/driver" replace />;
      case 'RETAILER': return <Navigate to="/retailer" replace />;
      default: return <Navigate to="/login" replace />;
    }
  }

  return children;
}
