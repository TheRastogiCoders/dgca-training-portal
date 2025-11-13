import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 8);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-0 backdrop-blur-md ${
        scrolled
          ? 'bg-white/60 shadow-md border-b border-white/20'
          : 'bg-white/20'
      }`}
    >
      <div className="max-w-7xl mx-auto px-3 md:px-6">
        <div className="h-16 md:h-20 flex items-center justify-center">
          <Link to="/" className="flex items-center hover:opacity-90 transition-opacity" aria-label="VIMAANNA home">
            <img src="/logo.png" alt="VIMAANNA Logo" className="h-16 md:h-20 w-auto" />
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;