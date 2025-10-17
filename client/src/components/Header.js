import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-transparent border-0">
      <div className="max-w-7xl mx-auto px-3 md:px-6">
        <div className="h-16 flex items-center justify-center">
          <Link to="/" className="flex items-center hover:opacity-90 transition-opacity" aria-label="VIMAANNA home">
            <img src="/logo.png" alt="VIMAANNA Logo" className="h-16 md:h-20 w-auto" />
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;