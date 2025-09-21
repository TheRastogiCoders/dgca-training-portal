import React from 'react';

const variants = {
  primary: 'btn btn-primary',
  secondary: 'btn btn-secondary',
  outline: 'btn btn-outline',
  ghost: 'px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 focus:ring-2 focus:ring-offset-2 focus:ring-gray-400',
};

const sizes = {
  sm: 'text-sm px-3 py-2',
  md: '',
  lg: 'text-lg px-7 py-4',
};

const Button = ({ children, variant = 'primary', size = 'md', className = '', ...props }) => {
  const base = variants[variant] || variants.primary;
  const sizeCls = sizes[size] || sizes.md;
  return (
    <button className={`${base} ${sizeCls} ${className}`.trim()} {...props}>
      {children}
    </button>
  );
};

export default Button;


