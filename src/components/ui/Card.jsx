import React from 'react';

export function Card({
  children,
  className = '',
  onClick,
  icon: Icon,
  title,
  description,
  hover = true
}) {
  const Component = onClick ? 'button' : 'div';
  
  return (
    <Component
      onClick={onClick}
      className={`
        bg-white rounded-2xl shadow-md border border-gray-100 p-6
        ${hover ? 'hover:shadow-lg hover:scale-105' : ''}
        ${onClick ? 'cursor-pointer active:scale-95' : ''}
        transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-100
        ${className}
      `}
    >
      {Icon && title ? (
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <Icon size={32} className="text-blue-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">{title}</h3>
          {description && (
            <p className="text-gray-600">{description}</p>
          )}
        </div>
      ) : (
        children
      )}
    </Component>
  );
}