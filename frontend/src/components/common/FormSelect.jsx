import React from 'react';
import { ChevronDown } from 'lucide-react';

const FormSelect = ({ 
  options = [], // Add default empty array to prevent undefined errors
  value, 
  onChange, 
  label,
  name,
  placeholder = 'Select an option', 
  className = '',
  disabled = false,
  error = null,
  required = false
}) => {
  return (
    <div className="form-field">
      {label && (
        <label 
          htmlFor={name} 
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      
      <div className="relative">
        <select
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={`
            block w-full pl-3 pr-10 py-2 text-base border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm
            ${error ? 'border-red-300 text-red-900 focus:ring-red-500 focus:border-red-500' : ''}
            ${disabled ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}
            ${className}
          `}
        >
          {placeholder && <option value="">{placeholder}</option>}
          
          {/* Add a check to ensure options is an array before mapping */}
          {Array.isArray(options) && options.map((option) => (
            <option 
              key={option.value} 
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>
        
        {/* Custom arrow icon - this replaces the default black arrow */}
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
          <ChevronDown size={16} />
        </div>
      </div>
      
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default FormSelect;