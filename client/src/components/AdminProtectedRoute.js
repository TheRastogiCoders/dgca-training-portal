import React from 'react';
import { useAdminAuth } from '../context/AdminAuthContext';

const AdminProtectedRoute = ({ children }) => {
  const { isAdminAuthenticated, adminUser } = useAdminAuth();

  if (!isAdminAuthenticated || !adminUser) {
    return null; // Will be redirected by AdminDashboard component
  }

  return children;
};

export default AdminProtectedRoute;
