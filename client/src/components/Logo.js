import React from 'react';

const Logo = ({ className = 'h-10' }) => {
  return (
    <div className={`flex items-center ${className}`} style={{ lineHeight: 0 }}>
      <svg
        viewBox="0 0 120 120"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-auto mr-2 drop-shadow-sm"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="wingGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#2563eb" />
            <stop offset="100%" stopColor="#7c3aed" />
          </linearGradient>
        </defs>
        {/* Simple modern wing mark */}
        <g fill="url(#wingGrad)">
          <path d="M20 70c12-18 34-28 60-28-10 10-24 18-40 22 12-1 24 2 35 7-16 8-35 10-55 7z" />
          <path d="M22 50c10-12 24-20 42-22-8 7-16 13-28 18 8-1 16 0 24 3-12 6-25 7-38 1z" opacity="0.9" />
          <circle cx="65" cy="36" r="6" opacity="0.95" />
        </g>
      </svg>
      <span className="font-extrabold tracking-wider text-[18px] md:text-[20px] select-none"
            style={{ color: '#0f172a' }}>
        VIMAANNA
      </span>
    </div>
  );
};

export default Logo;


