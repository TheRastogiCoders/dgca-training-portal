import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import GLOBAL_ASSETS from '../config/globalAssets';
import './Header.css';

const NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About Us' },
  { to: '/question-bank', label: 'Question Bank' },
  { to: '/pyq', label: 'PYQ' },
  { to: '/library', label: 'Library' },
];

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { pathname } = useLocation();
  const { user, isAuthenticated, logout } = useAuth();

  useEffect(() => setMobileMenuOpen(false), [pathname]);

  const isActive = (to) => (to === '/' ? pathname === '/' : pathname.startsWith(to));

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-sm">
      <div className="header-accent" aria-hidden />
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 sm:h-[4.25rem] gap-4">
          <Link
            to="/"
            className="flex items-center shrink-0 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg transition-transform hover:scale-[1.02]"
            aria-label="VIMAANNA home"
          >
            <img
              src={GLOBAL_ASSETS.LOGO}
              alt="VIMAANNA - DGCA Exam Preparation"
              className="h-9 sm:h-10 w-auto max-w-[160px] object-contain"
            />
          </Link>

          <nav className="hidden md:flex items-center justify-center gap-0.5 flex-1 max-w-2xl">
            {NAV_LINKS.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className={`header-nav-link px-4 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 ${isActive(to) ? 'active' : ''}`}
              >
                {label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3 shrink-0">
            <Link
              to="/question-bank"
              className="header-cta-outline px-4 py-2.5 rounded-xl text-sm font-semibold text-blue-700 bg-transparent border-2 border-blue-200 hover:border-blue-400 hover:bg-blue-50/80"
            >
              Get Started
            </Link>
            {isAuthenticated && user ? (
              <>
                <Link
                  to="/profile"
                  className={`header-nav-link px-4 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 ${pathname.startsWith('/profile') ? 'active' : ''}`}
                >
                  Profile
                </Link>
                <button
                  type="button"
                  onClick={logout}
                  className="px-4 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="header-cta-primary px-5 py-2.5 rounded-xl text-sm font-semibold text-white shadow-md"
              >
                Login
              </Link>
            )}
          </div>

          <div className="flex md:hidden items-center gap-2">
            <Link
              to="/question-bank"
              className="px-3 py-2 rounded-lg text-xs font-semibold text-blue-700 border border-blue-200 hover:bg-blue-50"
            >
              Get Started
            </Link>
            {!isAuthenticated && (
              <Link
                to="/login"
                className="px-3 py-2 rounded-lg text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700"
              >
                Login
              </Link>
            )}
            <button
              type="button"
              onClick={() => setMobileMenuOpen((o) => !o)}
              className="p-2.5 rounded-xl text-slate-600 hover:bg-slate-100 transition"
              aria-label="Toggle menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="header-mobile-panel md:hidden border-t border-slate-200 bg-white">
          <nav className="px-4 py-4 flex flex-col gap-0.5 max-h-[70vh] overflow-y-auto">
            {NAV_LINKS.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className={`px-4 py-3.5 rounded-xl text-sm font-medium transition ${isActive(to) ? 'bg-blue-50 text-blue-800 font-semibold' : 'text-slate-700 hover:bg-slate-50'}`}
              >
                {label}
              </Link>
            ))}
            {isAuthenticated && user && (
              <>
                <Link
                  to="/profile"
                  className={`px-4 py-3.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 ${pathname.startsWith('/profile') ? 'bg-blue-50 text-blue-800' : ''}`}
                >
                  Profile
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="px-4 py-3.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 text-left w-full"
                >
                  Logout
                </button>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
