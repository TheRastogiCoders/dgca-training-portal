import React, { useEffect } from 'react';

const Modal = ({ open, onClose, title, children, footer }) => {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    if (open) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg mx-4 card p-6">
        {title && <h3 className="text-xl font-bold text-gray-900 mb-4">{title}</h3>}
        <div>{children}</div>
        {footer && <div className="mt-6 flex justify-end space-x-3">{footer}</div>}
      </div>
    </div>
  );
};

export default Modal;


