import React, { createContext, useContext, useState, useEffect } from 'react';
import debugLog from '../utils/debug';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on app start
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = (userData, token) => {
    if (token) {
      localStorage.setItem('token', token);
    }
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    debugLog('AuthContext logout called, current user:', user);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Also clear admin tokens to prevent conflicts
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    setUser(null);
    debugLog('AuthContext logout completed, user set to null');
  };

  const isAuthenticated = !!user;

  const isAdmin = () => {
    return user && user.isAdmin;
  };

  const value = {
    user,
    login,
    logout,
    isAuthenticated,
    isAdmin,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
