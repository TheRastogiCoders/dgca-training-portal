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
    <span className={`text-xs mt-2 font-medium transition-colors ${active ? 'text-gray-800' : 'text-gray-600'}`}>
      {label}
    </span>
  </div>
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
    { to: '/practice-test', label: 'Practice', icon: '🎯' },
    { to: '/question-bank', label: 'Question Bank', icon: '📚' },
    { to: '/library', label: 'Library', icon: '📄' }
  ];

  return (
    <>
      {/* Mobile: Top header with logo */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-blue-600/10 to-purple-600/10 backdrop-blur-md border-b border-white/20">
        <div className="flex items-center justify-between px-4 py-4">
          <div className="flex items-center justify-center flex-1">
            <Link to="/" className="hover:opacity-80 transition-opacity p-2">
              <img src="/vimaanna-logo.png" alt="VIMAANNA" className="h-8 object-contain select-none rounded-2xl shadow-lg" draggable="false" />
            </Link>
          </div>
          {currentIsAuthenticated && (
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg backdrop-blur-sm border ${
                currentIsAdmin() 
                  ? 'bg-gradient-to-br from-red-500/80 to-pink-600/80 border-red-400/50' 
                  : 'bg-gradient-to-br from-blue-500/80 to-purple-600/80 border-blue-400/50'
              }`}>
                <span className="text-white font-semibold text-sm">
                  {getUserInitials()}
                </span>
              </div>
              <button
                onClick={currentLogout}
                className="text-sm text-gray-700 hover:text-gray-900 transition-colors font-medium px-2 py-1 rounded-lg hover:bg-white/20 backdrop-blur-sm"
                title="Logout"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Desktop/Laptop: Vertical rail */}
      <aside className="hidden md:flex md:flex-col md:items-center md:gap-4 md:w-24 min-h-screen sticky top-0 py-4 bg-gradient-to-b from-blue-600/5 to-purple-600/5 backdrop-blur-sm">
        <Link to="/" className="w-12 h-12 md:w-14 md:h-14 rounded-2xl md:rounded-3xl bg-white/30 backdrop-blur-sm border border-white/40 shadow-lg flex items-center justify-center hover:bg-white/40 transition-colors">
          <img src="/vimaanna-logo.png" alt="VIMAANNA" className="w-9 h-9 md:w-11 md:h-11 object-contain select-none" draggable="false" />
        </Link>
        <nav className="mt-2 flex flex-col items-center gap-3 md:gap-4">
          {/* Show admin navigation if user is admin, otherwise show regular navigation */}
          {currentIsAdmin() ? (
            adminNavItems.map((item) => (
              <RailItem
                key={item.to}
                to={item.to}
                label={item.label}
                icon={item.icon}
                active={pathname.startsWith(item.to)}
                isAdmin={true}
              />
            ))
          ) : (
            userNavItems.map((item) => (
              <RailItem
                key={item.to}
                to={item.to}
                label={item.label}
                icon={item.icon}
                active={pathname.startsWith(item.to)}
                isAdmin={false}
              />
            ))
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
              <p className="text-xs text-gray-600 font-medium">
                {currentIsAdmin() ? 'Admin' : 'Hey,'}
              </p>
              <p className="text-xs text-gray-800 font-semibold truncate max-w-[80px]">
                {getUserDisplayName()}
              </p>
            </div>
            {/* Logout Button */}
            <button
              onClick={currentLogout}
              className="text-xs text-gray-500 hover:text-red-600 transition-colors cursor-pointer"
              title="Logout"
            >
              Logout
            </button>
          </div>
        ) : (
          <Link to="/login" title="Account" className="mb-3 w-12 h-12 md:w-14 md:h-14 rounded-2xl md:rounded-3xl overflow-hidden border border-white/40 bg-white/30 backdrop-blur-sm flex items-center justify-center shadow-lg">
            <span className="text-2xl md:text-3xl">👤</span>
          </Link>
        )}
      </aside>

      {/* Mobile/Tablet: Bottom horizontal bar */}
      <nav className="md:hidden fixed inset-x-0 bottom-0 z-50">
        <div className="bg-gradient-to-r from-blue-600/10 to-purple-600/10 backdrop-blur-md border-t border-white/20 px-4 py-3 flex items-center justify-between">
          {/* Show admin navigation if user is admin, otherwise show regular navigation */}
          {currentIsAdmin() ? (
            adminNavItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                title={item.label}
                className={`w-12 h-12 rounded-2xl flex items-center justify-center border backdrop-blur-sm ${
                  pathname.startsWith(item.to)
                    ? 'bg-gradient-to-br from-red-500/80 to-pink-600/80 text-white border-red-400/50 shadow-lg'
                    : 'bg-white/30 text-gray-800 border-white/40 shadow-md'
                }`}
              >
                {item.icon}
              </Link>
            ))
          ) : (
            userNavItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                title={item.label}
                className={`w-12 h-12 rounded-2xl flex items-center justify-center border backdrop-blur-sm ${
                  pathname.startsWith(item.to)
                    ? 'bg-gradient-to-br from-purple-500/80 to-indigo-600/80 text-white border-purple-400/50 shadow-lg'
                    : 'bg-white/30 text-gray-800 border-white/40 shadow-md'
                }`}
              >
                {item.icon}
              </Link>
            ))
          )}
          
          {/* Mobile User Profile */}
          {currentIsAuthenticated ? (
            <div className="flex flex-col items-center">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg backdrop-blur-sm border ${
                currentIsAdmin() 
                  ? 'bg-gradient-to-br from-red-500/80 to-pink-600/80 border-red-400/50' 
                  : 'bg-gradient-to-br from-blue-500/80 to-purple-600/80 border-blue-400/50'
              }`}>
                <span className="text-white font-semibold text-sm">
                  {getUserInitials()}
                </span>
              </div>
              <span className="text-xs text-gray-600 mt-1 truncate max-w-[60px]">
                {currentIsAdmin() ? 'Admin' : getUserDisplayName()}
              </span>
            </div>
          ) : (
            <Link to="/login" title="Account" className={`w-12 h-12 rounded-2xl flex items-center justify-center border backdrop-blur-sm ${pathname.startsWith('/login') ? 'bg-gradient-to-br from-purple-500/80 to-indigo-600/80 text-white border-purple-400/50 shadow-lg' : 'bg-white/30 text-gray-800 border-white/40 shadow-md'}`}>👤</Link>
          )}
        </div>
      </nav>
    </>
  );
};

export default SiteSidebar;


