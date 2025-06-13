import React, { forwardRef, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export const Input = forwardRef(function Input({
  label,
  error,
  icon: Icon,
  helperText,
  className = '',
  type = 'text',
  id,
  required = false,
  ...props
}, ref) {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const inputId = id || `input-${Math.random().toString(36).substring(2, 9)}`;
  
  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const inputType = type === 'password' && showPassword ? 'text' : type;
  
  return (
    <div className="w-full mb-4">
      {label && (
        <label 
          htmlFor={inputId} 
          className={`block text-lg md:text-xl font-medium mb-2 ${error ? 'text-red-600' : 'text-gray-700'}`}
        >
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Icon className={`w-6 ${error ? 'text-red-500' : isFocused ? 'text-blue-500' : 'text-gray-400'}`} />
          </div>
        )}
        <input
          ref={ref}
          id={inputId}
          type={inputType}
          required={required}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          aria-invalid={error ? 'true' : 'false'}
          className={`
            w-full px-5 py-4 text-lg md:text-xl border-2 rounded-xl
            focus:outline-none focus:ring-4 
            disabled:bg-gray-50 disabled:cursor-not-allowed
            ${error 
              ? 'border-red-500 focus:border-red-500 focus:ring-red-100 text-red-800' 
              : 'border-gray-300 focus:border-blue-500 focus:ring-blue-100'
            }
            ${Icon ? 'pl-12' : ''}
            ${type === 'password' ? 'pr-12' : ''}
            ${className}
          `}
          {...props}
        />

        {type === 'password' && (
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff size={24} /> : <Eye size={24} />}
          </button>
        )}
      </div>
      
      {error && (
        <p className="mt-2 text-red-600 text-base font-medium" role="alert">{error}</p>
      )}      {helperText && !error && (
        <p className="mt-2 text-gray-500 text-base">{helperText}</p>
      )}
    </div>
  );
});