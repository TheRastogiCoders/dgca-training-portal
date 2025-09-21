import React, { createContext, useContext, useState, useEffect } from 'react';

const AdminAuthContext = createContext();

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};

export const AdminAuthProvider = ({ children }) => {
  const [adminUser, setAdminUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if admin is logged in on app start
    const adminToken = localStorage.getItem('adminToken');
    const adminData = localStorage.getItem('adminUser');
    
    if (adminToken && adminData) {
      try {
        const parsedAdminData = JSON.parse(adminData);
        // Verify this is actually an admin user
        if (parsedAdminData.isAdmin) {
          setAdminUser(parsedAdminData);
        } else {
          // Clear invalid admin data
          localStorage.removeItem('adminToken');
          localStorage.removeItem('adminUser');
        }
      } catch (error) {
        console.error('Error parsing admin data:', error);
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
      }
    }
    setLoading(false);
  }, []);

  const adminLogin = (userData, token) => {
    console.log('AdminAuthContext - adminLogin called with:', { userData, token: token ? 'Present' : 'Missing' });
    
    if (token) {
      localStorage.setItem('adminToken', token);
      console.log('AdminAuthContext - adminToken saved to localStorage');
    }
    localStorage.setItem('adminUser', JSON.stringify(userData));
    console.log('AdminAuthContext - adminUser saved to localStorage');
    
    setAdminUser(userData);
    console.log('AdminAuthContext - adminUser state updated:', userData);
  };

  const adminLogout = () => {
    console.log('AdminAuthContext logout called, current admin:', adminUser);
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    // Also clear regular tokens to prevent conflicts
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setAdminUser(null);
    console.log('AdminAuthContext logout completed, admin set to null');
  };

  const isAdminAuthenticated = !!adminUser;

  const isAdmin = () => {
    return adminUser && adminUser.isAdmin;
  };

  const value = {
    adminUser,
    adminLogin,
    adminLogout,
    isAdminAuthenticated,
    isAdmin,
    loading
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
};
