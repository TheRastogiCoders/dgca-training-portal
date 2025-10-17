import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAdminAuth } from '../context/AdminAuthContext';

const RailItem = ({ to, label, icon, active, isAdmin = false }) => (
  <div className="flex flex-col items-center">
    <Link
      to={to}
      title={label}
      className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl md:rounded-3xl flex items-center justify-center transition-all duration-200 border backdrop-blur-sm ${active
        ? isAdmin 
          ? 'bg-gradient-to-br from-red-500/80 to-pink-600/80 text-white shadow-lg border-red-400/50'
          : 'bg-gradient-to-br from-purple-500/80 to-indigo-600/80 text-white shadow-lg border-purple-400/50'
        : 'bg-white/30 text-gray-800 hover:bg-white/50 shadow-md border-white/40 hover:shadow-lg'}
      `}
    >
      <span className="text-xl md:text-2xl" aria-hidden>{icon}</span>
    </Link>
    <span className={`text-xs mt-2 font-medium transition-colors ${active ? 'text-white' : 'text-white/80'}`}>
      {label}
    </span>
  </div>
);

// Desktop boxed navigation item with label inside the box
const BoxNavItem = ({ to, label, icon, active, isAdmin = false }) => (
  <Link
    to={to}
    title={label}
    className={`w-44 h-12 rounded-2xl flex items-center gap-3 px-3 transition-all duration-200 border backdrop-blur-sm ${active
      ? isAdmin
        ? 'bg-gradient-to-br from-red-500/85 to-pink-600/85 text-white shadow-xl border-red-400/60'
        : 'bg-gradient-to-br from-purple-500/85 to-indigo-600/85 text-white shadow-xl border-purple-400/60'
      : 'bg-white/30 text-gray-800 hover:bg-white/50 shadow-md border-white/40 hover:shadow-lg'}
    `}
  >
    <span className={`flex items-center justify-center w-8 h-8 rounded-xl ${active
      ? 'bg-white/20 text-white'
      : 'bg-white/60 text-gray-800'}`} aria-hidden>
      <span className="text-lg">{icon}</span>
    </span>
    <span className={`text-sm font-semibold tracking-wide ${active ? 'text-white' : 'text-gray-800'}`}>
      {label}
    </span>
  </Link>
);

const SiteSidebar = () => {
  const { pathname } = useLocation();
  const { user, isAuthenticated, logout, isAdmin } = useAuth();
  const { adminUser, isAdminAuthenticated, adminLogout, isAdmin: isAdminUser } = useAdminAuth();
  
  // Determine if we're in admin area
  const isAdminArea = pathname.startsWith('/admin') || pathname.startsWith('/admin-');
  
  // Use admin auth if in admin area, otherwise use regular auth
  const currentUser = isAdminArea ? adminUser : user;
  const currentIsAuthenticated = isAdminArea ? isAdminAuthenticated : isAuthenticated;
  const currentLogout = isAdminArea ? adminLogout : logout;
  const currentIsAdmin = isAdminArea ? isAdminUser : isAdmin;
  
  const getUserDisplayName = () => {
    if (!currentUser) return '';
    return currentUser.username || currentUser.email || 'User';
  };

  const getUserInitials = () => {
    const name = getUserDisplayName();
    return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
  };

  // Active path helper: exact match for '/', prefix match for others
  const isActivePath = (to) => (to === '/' ? pathname === '/' : pathname.startsWith(to));

  // Admin navigation items
  const adminNavItems = [
    { to: '/admin-dashboard', label: 'Dashboard', icon: '📊' },
    { to: '/admin-questions', label: 'Questions', icon: '❓' },
    { to: '/admin-results', label: 'Results', icon: '📈' },
    { to: '/admin/users', label: 'Users', icon: '👥' }
  ];

  // Regular user navigation items
  const userNavItems = [
    { to: '/', label: 'Home', icon: '🏠' },
    { to: '/question-bank', label: 'Question Bank', icon: '📚' },
    { to: '/practice-test', label: 'PYQ', icon: '🎯' },
    { to: '/library', label: 'Library', icon: '📄' }
  ];

  return (
    <>

      {/* Desktop/Laptop: Vertical rail */}
      <aside className="hidden md:flex md:flex-col md:items-center md:gap-4 md:w-56 h-[calc(100vh-4rem)] fixed left-0 top-16 py-4 bg-gradient-to-b from-blue-600/5 to-purple-600/5 backdrop-blur-sm z-40">
        <nav className="mt-2 flex flex-col items-center gap-3 md:gap-4">
          {/* Show admin navigation if user is admin, otherwise show regular navigation */}
          {currentIsAdmin() ? (
            adminNavItems.map((item) => (
              <BoxNavItem
                key={item.to}
                to={item.to}
                label={item.label}
                icon={item.icon}
                active={isActivePath(item.to)}
                isAdmin={true}
              />
            ))
          ) : (
            userNavItems.map((item) => (
              <BoxNavItem
                key={item.to}
                to={item.to}
                label={item.label}
                icon={item.icon}
                active={isActivePath(item.to)}
                isAdmin={false}
              />
            ))
          )}
          {/* Desktop: show Login as a boxed item when not authenticated (non-admin area) */}
          {(!currentIsAuthenticated && !currentIsAdmin()) && (
            <BoxNavItem
              to="/login"
              label="Login"
              icon="👤"
              active={isActivePath('/login')}
              isAdmin={false}
            />
          )}
        </nav>
        <div className="flex-1" />
        
        {/* User Profile Section */}
        {currentIsAuthenticated ? (
          <div className="mb-3 flex flex-col items-center gap-2">
            {/* User Avatar */}
            <div className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl md:rounded-3xl flex items-center justify-center shadow-lg backdrop-blur-sm border ${
              currentIsAdmin() 
                ? 'bg-gradient-to-br from-red-500/80 to-pink-600/80 border-red-400/50' 
                : 'bg-gradient-to-br from-blue-500/80 to-purple-600/80 border-blue-400/50'
            }`}>
              <span className="text-white font-semibold text-sm md:text-base">
                {getUserInitials()}
              </span>
            </div>
            {/* User Name */}
            <div className="text-center">
              <p className="text-xs text-white/80 font-medium">
                {currentIsAdmin() ? 'Admin' : 'Hey,'}
              </p>
              <p className="text-xs text-white font-semibold truncate max-w-[80px]">
                {getUserDisplayName()}
              </p>
            </div>
            {/* Logout Button */}
            <button
              onClick={currentLogout}
              className="text-xs text-white/70 hover:text-red-400 transition-colors cursor-pointer"
              title="Logout"
            >
              Logout
            </button>
          </div>
        ) : null}
      </aside>

      {/* Mobile/Tablet: Bottom horizontal bar */}
      <nav className="md:hidden fixed inset-x-0 bottom-0 z-50">
        <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-xl border-t border-white/30 px-4 py-3 flex items-center justify-between shadow-2xl">
          {/* Show admin navigation if user is admin, otherwise show regular navigation */}
          {currentIsAdmin() ? (
            adminNavItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                title={item.label}
                className={`w-12 h-12 rounded-2xl flex items-center justify-center border backdrop-blur-sm transition-all duration-200 ${
                  isActivePath(item.to)
                    ? 'bg-gradient-to-br from-red-500/90 to-pink-600/90 text-white border-red-400/60 shadow-xl scale-105'
                    : 'bg-white/40 text-gray-800 border-white/50 shadow-lg hover:bg-white/60 hover:scale-105'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
              </Link>
            ))
          ) : (
            userNavItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                title={item.label}
                className={`w-12 h-12 rounded-2xl flex items-center justify-center border backdrop-blur-sm transition-all duration-200 ${
                  isActivePath(item.to)
                    ? 'bg-gradient-to-br from-purple-500/90 to-indigo-600/90 text-white border-purple-400/60 shadow-xl scale-105'
                    : 'bg-white/40 text-gray-800 border-white/50 shadow-lg hover:bg-white/60 hover:scale-105'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
              </Link>
            ))
          )}
          
          {/* Mobile User Profile */}
          {currentIsAuthenticated ? (
            <div className="flex flex-col items-center">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-xl backdrop-blur-sm border transition-all duration-200 ${
                currentIsAdmin() 
                  ? 'bg-gradient-to-br from-red-500/90 to-pink-600/90 border-red-400/60' 
                  : 'bg-gradient-to-br from-blue-500/90 to-purple-600/90 border-blue-400/60'
              }`}>
                <span className="text-white font-semibold text-sm">
                  {getUserInitials()}
                </span>
              </div>
              <span className="text-xs text-white/90 mt-1 truncate max-w-[60px] font-medium">
                {currentIsAdmin() ? 'Admin' : getUserDisplayName()}
              </span>
            </div>
          ) : (
            <Link 
              to="/login" 
              title="Account" 
              className={`w-12 h-12 rounded-2xl flex items-center justify-center border backdrop-blur-sm transition-all duration-200 ${
                isActivePath('/login') 
                  ? 'bg-gradient-to-br from-purple-500/90 to-indigo-600/90 text-white border-purple-400/60 shadow-xl scale-105' 
                  : 'bg-white/40 text-gray-800 border-white/50 shadow-lg hover:bg-white/60 hover:scale-105'
              }`}
            >
              <span className="text-lg">👤</span>
            </Link>
          )}
        </div>
      </nav>
    </>
  );
};

export default SiteSidebar;


