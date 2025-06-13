import React from 'react';

export function Card({
  children,
  className = '',
  onClick,
  icon: Icon,
  title,
  description,
  hover = true,
  variant = 'default', // Options: default, elevated, outline, accent
  fullWidth = false
}) {
  const Component = onClick ? 'button' : 'div';
  
  const variantClasses = {
    default: 'bg-white border border-gray-100 shadow-md',
    elevated: 'bg-white border-none shadow-xl',
    outline: 'bg-transparent border-2 border-gray-200',
    accent: 'bg-blue-50 border border-blue-100'
  };
  
  return (
    <Component
      onClick={onClick}
      className={`
        ${variantClasses[variant]}
        rounded-2xl p-5 md:p-6 lg:p-7
        ${fullWidth ? 'w-full' : ''}
        ${hover ? 'hover:shadow-lg hover:transform hover:scale-102' : ''}
        ${onClick ? 'cursor-pointer active:scale-98 focus:outline-none focus:ring-4 focus:ring-blue-100' : ''}
        transition-all duration-300 ${className}
      `}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {Icon && title ? (
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 md:w-20 bg-blue-100 rounded-full mb-4 md:mb-5">
            <Icon size={variant === 'elevated' ? 36 : 32} className="text-blue-600" />
          </div>          <h3 className="text-xl md:text-2xl font-semibold text-gray-800 mb-3">{title}</h3>
          {description && (
            <p className="text-gray-600 text-base md:text-lg">{description}</p>
          )}
          {children && <div className="mt-4">{children}</div>}
        </div>
      ) : (
        children
      )}
    </Component>
  );
}