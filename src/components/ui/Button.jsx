import React from 'react';

export function Button({
  children,
  onClick,
  variant = 'primary',
  size = 'lg',
  icon: Icon,
  disabled = false,
  type = 'button',
  className = ''
}) {
  const baseClasses = 'font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-4 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3';
  
  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-200',
    secondary: 'bg-green-600 hover:bg-green-700 text-white focus:ring-green-200',
    danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-200',
    outline: 'border-2 border-gray-300 hover:border-gray-400 text-gray-700 bg-white focus:ring-gray-200'
  };
  
  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
    xl: 'px-10 py-5 text-xl'
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
    >
      {Icon && <Icon size={size === 'xl' ? 24 : size === 'lg' ? 20 : 16} />}
      {children}
    </button>
  );
}