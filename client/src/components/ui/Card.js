import React from 'react';

const Card = ({ children, className = '', ...props }) => (
  <div className={`card ${className}`.trim()} {...props}>{children}</div>
);

export const CardHeader = ({ title, subtitle, actions }) => (
  <div className="flex items-start justify-between mb-4">
    <div>
      {title && <h3 className="text-xl font-bold text-gray-900">{title}</h3>}
      {subtitle && <p className="text-gray-600 text-sm mt-1">{subtitle}</p>}
    </div>
    {actions && <div className="flex items-center space-x-2">{actions}</div>}
  </div>
);

export default Card;


