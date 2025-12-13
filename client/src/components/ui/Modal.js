import React, { useEffect } from 'react';

const Modal = ({ open, onClose, title, children, footer }) => {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };

    if (open) {
      document.addEventListener('keydown', onKey);
      const previousOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.removeEventListener('keydown', onKey);
        document.body.style.overflow = previousOverflow;
      };
    }

    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-3 sm:px-4 py-4 sm:py-6">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative z-10 w-full max-w-[95vw] sm:max-w-[90vw] md:max-w-lg card p-4 sm:p-5 md:p-6 max-h-[90vh] sm:max-h-[85vh] overflow-y-auto">
        {title && <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">{title}</h3>}
        <div className="pb-1">{children}</div>
        {footer && <div className="mt-4 sm:mt-6 flex flex-col gap-2.5 sm:gap-3 sm:flex-row sm:justify-end sm:space-x-3">
          {footer}
        </div>}
      </div>
    </div>
  );
};

export default Modal;


