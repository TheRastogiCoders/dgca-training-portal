import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const RailItem = ({ to, label, icon, active, isAdmin = false, disabled = false }) => (
  <div className="flex flex-col items-center gap-1">
    {disabled ? (
      <div
        title={label}
        className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl md:rounded-3xl flex items-center justify-center transition-all duration-200 border backdrop-blur-sm opacity-50 cursor-not-allowed ${
          active
            ? isAdmin 
              ? 'bg-gradient-to-br from-red-500/80 to-pink-600/80 text-white shadow-lg border-red-400/50'
              : 'bg-gradient-to-br from-purple-500/80 to-indigo-600/80 text-white shadow-lg border-purple-400/50'
            : 'bg-white/30 text-gray-800 shadow-md border-white/40'
        }`}
      >
        <span className="text-xl md:text-2xl" aria-hidden>{icon}</span>
      </div>
    ) : (
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
    )}
    <span className={`text-[10px] leading-tight text-center px-1 font-medium transition-colors ${active ? 'text-white' : 'text-white/80'}`}>
      {label}
    </span>
  </div>
);

// Desktop boxed navigation item with label inside the box - responsive width
const BoxNavItem = ({ to, label, icon, active, isAdmin = false, disabled = false }) => {
  if (disabled) {
    return (
      <div
        title={label}
        className={`w-full max-w-[176px] md:w-44 lg:w-52 xl:w-56 h-12 rounded-2xl flex items-center gap-3 px-3 transition-all duration-200 border backdrop-blur-sm opacity-50 cursor-not-allowed ${
          active
            ? isAdmin
              ? 'bg-gradient-to-br from-red-500/85 to-pink-600/85 text-white shadow-xl border-red-400/60'
              : 'bg-gradient-to-br from-purple-500/85 to-indigo-600/85 text-white shadow-xl border-purple-400/60'
            : 'bg-white/30 text-gray-800 shadow-md border-white/40'
        }`}
      >
        <span className={`flex items-center justify-center w-8 h-8 rounded-xl flex-shrink-0 ${active
          ? 'bg-white/20 text-white'
          : 'bg-white/60 text-gray-800'}`} aria-hidden>
          <span className="text-lg">{icon}</span>
        </span>
        <span className={`text-xs md:text-sm font-semibold tracking-wide truncate ${active ? 'text-white' : 'text-gray-800'}`}>
          {label}
        </span>
      </div>
    );
  }
  return (
    <Link
      to={to}
      title={label}
      className={`w-full max-w-[176px] md:w-44 lg:w-52 xl:w-56 h-12 rounded-2xl flex items-center gap-3 px-3 transition-all duration-200 border backdrop-blur-sm ${active
        ? isAdmin
          ? 'bg-gradient-to-br from-red-500/85 to-pink-600/85 text-white shadow-xl border-red-400/60'
          : 'bg-gradient-to-br from-purple-500/85 to-indigo-600/85 text-white shadow-xl border-purple-400/60'
        : 'bg-white/30 text-gray-800 hover:bg-white/50 shadow-md border-white/40 hover:shadow-lg'}
      `}
    >
      <span className={`flex items-center justify-center w-8 h-8 rounded-xl flex-shrink-0 ${active
        ? 'bg-white/20 text-white'
        : 'bg-white/60 text-gray-800'}`} aria-hidden>
        <span className="text-lg">{icon}</span>
      </span>
      <span className={`text-xs md:text-sm font-semibold tracking-wide truncate ${active ? 'text-white' : 'text-gray-800'}`}>
        {label}
      </span>
    </Link>
  );
};

const SiteSidebar = () => {
  // Call all hooks unconditionally at the top level
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const auth = useAuth();
  
  // Destructure after the hook call
  const currentUser = auth?.user;
  const currentIsAuthenticated = auth?.isAuthenticated;
  const currentLogout = auth?.logout;
  
  const getUserDisplayName = () => {
    if (!currentUser) return '';
    return currentUser.username || currentUser.email || 'User';
  };

  const getUserInitials = () => {
    const name = getUserDisplayName();
    return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
  };

  // Check if we're in a practice test (should disable navigation and show Question Bank as active)
  const isInPracticeTest = pathname.startsWith('/pyq/book/');
  
  // Active path helper: exact match for '/', prefix match for others
  // When in a practice test, show Question Bank as active instead of PYQ
  const isActivePath = (to) => {
    if (isInPracticeTest) {
      // During practice test, only show Question Bank as active
      return to === '/question-bank';
    }
    return (to === '/' ? pathname === '/' : pathname.startsWith(to));
  };
  
  // Check if we're on the home page
  const isHomePage = pathname === '/';

  // Check if current user is admin
  const isAdminUser = currentUser && currentUser.isAdmin;

  // Regular user navigation items
  const userNavItems = [
    { to: '/', label: 'Home', icon: '🏠' },
    { to: '/question-bank', label: 'Question Bank', icon: '📚' },
    { to: '/pyq', label: 'PYQ', icon: '🎯' },
    { to: '/library', label: 'Library', icon: '📄' }
  ];

  // Admin navigation items (shown only when admin is logged in)
  const adminNavItems = [
    { to: '/admin/students-logins', label: 'Students Logins', icon: '👥' },
    { to: '/admin/question-upload', label: 'Question Upload', icon: '📤' }
  ];

  // Contact support item (shown for all users)
  const contactSupportItem = { to: '/support/contact', label: 'Connect Support', icon: '💬' };

  return (
    <>

      {/* Desktop/Laptop: Vertical rail - responsive width */}
      <aside className="hidden md:flex md:flex-col md:items-center md:gap-4 md:w-56 lg:w-64 xl:w-72 h-[calc(100vh-4rem)] fixed left-0 top-16 py-4 bg-gradient-to-b from-blue-600/5 to-purple-600/5 backdrop-blur-sm z-40 transition-all duration-300">
        <nav className="mt-2 flex flex-col items-center gap-3 md:gap-4">
          {userNavItems.map((item) => (
            <BoxNavItem
              key={item.to}
              to={item.to}
              label={item.label}
              icon={item.icon}
              active={isActivePath(item.to)}
              isAdmin={isAdminUser}
              disabled={isInPracticeTest}
            />
          ))}
          {/* Admin navigation items - shown only when admin is logged in */}
          {isAdminUser && adminNavItems.map((item) => (
            <BoxNavItem
              key={item.to}
              to={item.to}
              label={item.label}
              icon={item.icon}
              active={isActivePath(item.to)}
              isAdmin={true}
              disabled={isInPracticeTest}
            />
          ))}
          {/* Desktop: show Login as a boxed item when not authenticated (non-admin area) */}
          {!currentIsAuthenticated && (
            <BoxNavItem
              to="/login"
              label="Login"
              icon="👤"
              active={isActivePath('/login')}
              isAdmin={false}
              disabled={isInPracticeTest}
            />
          )}
          {/* Desktop: Contact Support button - only show on home page */}
          {isHomePage && (
            <BoxNavItem
              to={contactSupportItem.to}
              label={contactSupportItem.label}
              icon={contactSupportItem.icon}
              active={isActivePath(contactSupportItem.to)}
              isAdmin={false}
              disabled={isInPracticeTest}
            />
          )}
        </nav>
        <div className="flex-1" />
        
        {/* User Profile Section */}
        {currentIsAuthenticated ? (
          <div className="mb-3 flex flex-col items-center gap-2">
            {/* User Avatar - Clickable */}
            <button
              onClick={() => navigate('/profile')}
              className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl md:rounded-3xl flex items-center justify-center shadow-lg backdrop-blur-sm border transition-all hover:scale-105 cursor-pointer ${
                'bg-gradient-to-br from-blue-500/80 to-purple-600/80 border-blue-400/50'
              }`}
              title="View Profile"
            >
              <span className="text-white font-semibold text-sm md:text-base">
                {getUserInitials()}
              </span>
            </button>
            {/* User Name */}
            <div className="text-center">
              <p className="text-xs text-white/80 font-medium">
                {'Hey,'}
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

      {/* Mobile/Tablet: Bottom horizontal bar - responsive padding */}
      <nav className="md:hidden fixed inset-x-0 bottom-0 z-[100]" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <div className="relative bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-xl border-t border-white/30 px-2 sm:px-3 pt-2.5 pb-3 sm:pb-4 flex items-center justify-around gap-1 shadow-2xl" style={{ paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom))' }}>
          {/* Show admin navigation if user is admin, otherwise show regular navigation */}
          <>
            {userNavItems.map((item) => (
              <div key={item.to} className="flex flex-col items-center justify-center min-w-0 flex-1 max-w-[20%]">
                {isInPracticeTest ? (
                  <div
                    title={item.label}
                    className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center border backdrop-blur-sm transition-all duration-200 opacity-50 cursor-not-allowed touch-none ${
                      isActivePath(item.to)
                        ? isAdminUser
                          ? 'bg-gradient-to-br from-red-500/90 to-pink-600/90 text-white border-red-400/60 shadow-xl'
                          : 'bg-gradient-to-br from-purple-500/90 to-indigo-600/90 text-white border-purple-400/60 shadow-xl'
                        : 'bg-white/40 text-gray-800 border-white/50 shadow-lg'
                    }`}
                  >
                    <span className="text-base sm:text-lg" aria-hidden="true">{item.icon}</span>
                  </div>
                ) : (
                  <Link
                    to={item.to}
                    title={item.label}
                    className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center border backdrop-blur-sm transition-all duration-200 active:scale-95 ${
                      isActivePath(item.to)
                        ? isAdminUser
                          ? 'bg-gradient-to-br from-red-500/90 to-pink-600/90 text-white border-red-400/60 shadow-xl scale-105'
                          : 'bg-gradient-to-br from-purple-500/90 to-indigo-600/90 text-white border-purple-400/60 shadow-xl scale-105'
                        : 'bg-white/40 text-gray-800 border-white/50 shadow-lg active:bg-white/60 active:scale-95'
                    }`}
                    aria-label={item.label}
                  >
                    <span className="text-base sm:text-lg" aria-hidden="true">{item.icon}</span>
                  </Link>
                )}
                <span className="text-[9px] sm:text-[10px] text-white/90 mt-1 font-medium leading-tight text-center w-full px-0.5 truncate">
                  {item.label}
                </span>
              </div>
            ))}
            {/* Admin navigation items on mobile - shown only when admin is logged in */}
            {isAdminUser && adminNavItems.map((item) => (
              <div key={item.to} className="flex flex-col items-center justify-center min-w-0 flex-1 max-w-[20%]">
                <Link
                  to={item.to}
                  title={item.label}
                  className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center border backdrop-blur-sm transition-all duration-200 active:scale-95 ${
                    isActivePath(item.to)
                      ? 'bg-gradient-to-br from-red-500/90 to-pink-600/90 text-white border-red-400/60 shadow-xl scale-105'
                      : 'bg-white/40 text-gray-800 border-white/50 shadow-lg active:bg-white/60 active:scale-95'
                  }`}
                  aria-label={item.label}
                >
                  <span className="text-base sm:text-lg" aria-hidden="true">{item.icon}</span>
                </Link>
                <span className="text-[9px] sm:text-[10px] text-white/90 mt-1 font-medium leading-tight text-center w-full px-0.5 truncate">
                  {item.label.length > 10 ? item.label.substring(0, 10) + '...' : item.label}
                </span>
              </div>
            ))}
          </>

          
          {/* Mobile User Profile or Login */}
          {currentIsAuthenticated ? (
            <button
              onClick={() => navigate('/profile')}
              className="flex flex-col items-center justify-center transition-all duration-200 active:scale-95 min-w-0 flex-1 max-w-[20%] touch-manipulation"
              title="View Profile"
              aria-label="View Profile"
            >
              <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center shadow-xl backdrop-blur-sm border ${
                'bg-gradient-to-br from-blue-500/90 to-purple-600/90 border-blue-400/60'
              }`}>
                <span className="text-white font-semibold text-xs sm:text-sm" aria-hidden="true">
                  {getUserInitials()}
                </span>
              </div>
              <span className="text-[9px] sm:text-[10px] text-white/90 mt-1 font-medium leading-tight text-center w-full truncate px-0.5">
                Profile
              </span>
            </button>
          ) : (
              <Link 
                to="/login" 
              onClick={(e) => {
                // Ensure navigation works
                e.stopPropagation();
                navigate('/login');
              }}
                title="Login" 
              className="flex flex-col items-center justify-center min-w-0 flex-1 max-w-[20%] touch-manipulation active:scale-95 transition-all duration-200 cursor-pointer"
              aria-label="Login"
            >
              <div 
                className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center border backdrop-blur-sm transition-all duration-200 ${
                  isActivePath('/login') 
                    ? 'bg-gradient-to-br from-purple-500/90 to-indigo-600/90 text-white border-purple-400/60 shadow-xl scale-105' 
                    : 'bg-white/40 text-gray-800 border-white/50 shadow-lg'
                }`}
              >
                <span className="text-base sm:text-lg pointer-events-none" aria-hidden="true">👤</span>
              </div>
              <span className="text-[9px] sm:text-[10px] text-white/90 mt-1 font-medium leading-tight text-center w-full truncate px-0.5 pointer-events-none">
                Login
              </span>
            </Link>
          )}
        </div>
      </nav>
    </>
  );
};

export default SiteSidebar;


