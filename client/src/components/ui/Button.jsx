import React from 'react';

export function Button({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  disabled = false,
  type = 'button',
  fullWidth = false,
  className = ''
}) {
  const baseClasses = 'font-semibold rounded-2xl transition-all duration-200 focus:outline-none focus:ring-4 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm';

  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-200',
    secondary: 'bg-green-600 hover:bg-green-700 text-white focus:ring-green-200',
    danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-200',
    outline: 'border-2 border-gray-300 hover:border-blue-400 text-gray-700 bg-white focus:ring-blue-100',
    subtle: 'bg-gray-100 hover:bg-gray-200 text-gray-800 focus:ring-gray-200'
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-5 py-2.5 text-base',
    lg: 'px-7 py-3 text-lg',
    xl: 'px-9 py-4 text-xl'
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
      {Icon && <Icon size={size === 'xl' ? 28 : size === 'lg' ? 24 : size === 'md' ? 20 : 16} className={disabled ? 'opacity-50' : ''} />}
      <span className={Icon ? 'ml-2 truncate' : 'truncate'}>{children}</span>
    </button>
  );
}