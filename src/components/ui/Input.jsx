import React, { forwardRef } from 'react';

export const Input = forwardRef(({
  label,
  error,
  icon: Icon,
  helperText,
  className = '',
  ...props
}, ref) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-lg font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Icon className="h-6 w-6 text-gray-400" />
          </div>
        )}
        <input
          ref={ref}
          className={`
            w-full px-4 py-4 text-lg border-2 rounded-xl
            focus:outline-none focus:ring-4 focus:border-blue-500 focus:ring-blue-100
            disabled:bg-gray-50 disabled:cursor-not-allowed
            ${Icon ? 'pl-12' : ''}
            ${error ? 'border-red-500' : 'border-gray-300'}
            ${className}
          `}
          {...props}
        />
      </div>
      {error && (
        <p className="mt-2 text-red-600 text-base">{error}</p>
      )}
      {helperText && !error && (
        <p className="mt-2 text-gray-500 text-base">{helperText}</p>
      )}
    </div>
  );
});