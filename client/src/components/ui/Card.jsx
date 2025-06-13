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
    default: 'bg-white border border-gray-200 shadow-sm',
    elevated: 'bg-white border-none shadow-lg',
    outline: 'bg-transparent border-2 border-blue-200',
    accent: 'bg-blue-50 border border-blue-200'
  };

  return (
    <Component
      onClick={onClick}
      className={`
        ${variantClasses[variant]}
        rounded-2xl p-5 md:p-6 lg:p-7
        ${fullWidth ? 'w-full' : ''}
        ${hover ? 'hover:shadow-md hover:scale-[1.02]' : ''}
        ${onClick ? 'cursor-pointer active:scale-95 focus:outline-none focus:ring-4 focus:ring-blue-100' : ''}
        transition-all duration-200 ${className}
      `}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {Icon && title ? (
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-14 md:w-16 bg-blue-100 rounded-full mb-4 md:mb-5">
            <Icon size={variant === 'elevated' ? 36 : 28} className="text-blue-600" />
          </div>
          <h3 className="text-lg md:text-xl font-semibold text-gray-800 mb-2 truncate">{title}</h3>
          {description && (
            <p className="text-gray-600 text-sm md:text-base truncate">{description}</p>
          )}
          {children && <div className="mt-4">{children}</div>}
        </div>
      ) : (
        children
      )}
    </Component>
  );
}