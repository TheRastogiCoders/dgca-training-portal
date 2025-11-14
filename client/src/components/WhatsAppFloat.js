import React from 'react';

const WhatsAppFloat = () => {
  const handleWhatsAppClick = () => {
    window.open(
      'https://whatsapp.com/channel/0029VbBDiE40gcfF04q94G44',
      '_blank',
      'noopener,noreferrer'
    );
  };

  return (
    <>
      {/* ✅ Inline global style for safe-area support */}
      <style>
        {`
          html,
          body {
            height: 100%;
            overflow-x: hidden;
          }

          @supports (padding: max(0px)) {
            :root {
              --safe-bottom: env(safe-area-inset-bottom, 0px);
              --safe-right: env(safe-area-inset-right, 0px);
              --safe-left: env(safe-area-inset-left, 0px);
            }
          }
        `}
      </style>

      {/* ✅ Floating Button Container */}
      <style>
        {`
          /* Floating Action Buttons: responsive layout */
          .fab-container {
            position: fixed;
            z-index: 60; /* above most UI */
            display: flex;
            flex-direction: column;
            align-items: flex-end;
            gap: 16px; /* base spacing */
            right: calc(var(--safe-right, 0px) + 16px);
            bottom: calc(var(--safe-bottom, 0px) + 20px);
          }

          /* Mobile: position WhatsApp on right side, tucked above bottom nav */
          @media (max-width: 767px) {
            .fab-container {
              left: auto;
              right: calc(var(--safe-right, 0px) + 12px);
              bottom: calc(var(--safe-bottom, 0px) + 30px);
              align-items: flex-end;
              gap: 8px;
            }
          }

          /* Small tablets: maintain right alignment with slight spacing */
          @media (min-width: 480px) and (max-width: 767px) {
            .fab-container { 
              right: calc(var(--safe-right, 0px) + 16px);
              bottom: calc(var(--safe-bottom, 0px) + 80px);
              gap: 16px;
            }
          }

          /* On >=768px (desktop): keep vertical stack on right, increase offset */
          @media (min-width: 768px) {
            .fab-container {
              right: calc(var(--safe-right, 0px) + 24px);
              left: auto;
              bottom: calc(var(--safe-bottom, 0px) + 28px);
              gap: 24px;
              align-items: flex-end;
            }
          }

          /* Ensure buttons never overlap due to transforms */
          .fab-btn { will-change: transform; }
        `}
      </style>

      <div className="fab-container">
        {/* 💬 WhatsApp Floating Button */}
        <button
          onClick={handleWhatsAppClick}
          className="fab-btn whatsapp-float group relative flex items-center justify-center w-12 h-12 md:w-14 md:h-14 bg-gradient-to-r from-green-500 to-green-600 rounded-full shadow-2xl hover:shadow-green-500/25 transition-transform duration-300 hover:scale-110 focus:outline-none focus:ring-4 focus:ring-green-500/30"
          aria-label="Follow us on WhatsApp"
          title="Follow us on WhatsApp Channel"
        >
          <svg
            className="w-5 h-5 md:w-7 md:h-7 text-white transition-transform duration-300 group-hover:scale-110 animate-pulse"
            fill="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
          </svg>

          {/* Pulsing Rings */}
          <div className="hidden md:block absolute inset-0 rounded-full bg-green-500 animate-ping opacity-60"></div>
          <div
            className="hidden md:block absolute inset-0 rounded-full bg-green-400 animate-ping opacity-40"
            style={{ animationDelay: '0.5s' }}
          ></div>
          <div
            className="hidden md:block absolute inset-0 rounded-full bg-green-300 animate-ping opacity-25"
            style={{ animationDelay: '1s' }}
          ></div>

          {/* Notification Dot */}
          <div className="hidden md:flex absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full items-center justify-center shadow-lg">
            <div className="w-2 h-2 bg-white rounded-full"></div>
          </div>

          {/* Tooltip */}
          <div className="absolute -left-24 top-1/2 transform -translate-y-1/2 bg-gray-900/90 backdrop-blur-sm text-white text-sm font-medium px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap pointer-events-none">
            Follow Us! ✨
            <div className="absolute right-0 top-1/2 transform translate-x-1 -translate-y-1/2 w-0 h-0 border-l-4 border-l-gray-900/90 border-t-4 border-t-transparent border-b-4 border-b-transparent"></div>
          </div>
        </button>
      </div>
    </>
  );
};

export default WhatsAppFloat;
