import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-blue-600/10 to-purple-600/10 backdrop-blur-md border-b border-white/20">
      <div className="flex items-center justify-center px-4 py-4">
        <Link to="/" className="hover:opacity-80 transition-opacity">
          <img 
            src="/vimaanna-logo.png" 
            alt="VIMAANNA" 
            className="h-10 md:h-12 object-contain select-none" 
            draggable="false" 
          />
        </Link>
      </div>
    </header>
  );
};

export default Header;