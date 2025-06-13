import React from 'react';

export function Button({
  children,
  onClick,
  variant = 'primary',
  size = 'lg',
  icon: Icon,
  disabled = false,
  type = 'button',
  fullWidth = false,
  className = ''
}) {
  const baseClasses = 'font-semibold rounded-xl transition-all duration-300 focus:outline-none focus:ring-4 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-md';
  
  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-200 dark:bg-blue-700 dark:hover:bg-blue-800 dark:focus:ring-blue-600',
    secondary: 'bg-green-600 hover:bg-green-700 text-white focus:ring-green-200 dark:bg-green-700 dark:hover:bg-green-800 dark:focus:ring-green-600',
    danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-200 dark:bg-red-700 dark:hover:bg-red-800 dark:focus:ring-red-600',
    outline: 'border-3 border-gray-300 hover:border-gray-400 text-gray-700 bg-white focus:ring-gray-200 dark:border-gray-600 dark:text-gray-200 dark:bg-gray-800 dark:hover:border-gray-500',
    subtle: 'bg-gray-100 hover:bg-gray-200 text-gray-800 focus:ring-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
  };
  
  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg md:text-xl',
    xl: 'px-10 py-5 text-xl md:text-2xl'
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      aria-disabled={disabled}
      className={`
        ${baseClasses} 
        ${variantClasses[variant]} 
        ${sizeClasses[size]} 
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
    >
      {Icon && <Icon size={size === 'xl' ? 28 : size === 'lg' ? 24 : size === 'md' ? 20 : 16} 
                className={disabled ? 'opacity-50' : ''} />}
      <span className={Icon ? 'ml-2' : ''}>{children}</span>
    </button>
  );
}