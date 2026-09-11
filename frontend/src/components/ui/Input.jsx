import React from 'react';

export const Input = ({
  label,
  sublabel,
  error,
  icon: Icon,
  suffix,
  className = '',
  wrapperClassName = '',
  required = false,
  ...props
}) => {
  return (
    <div className={`flex flex-col gap-1.5 ${wrapperClassName}`}>
      {label && (
        <div className="flex items-center justify-between text-xs">
          <label className="font-medium text-gray-300">
            {label} {required && <span className="text-orange-brand">*</span>}
          </label>
          {sublabel && <span className="text-gray-500">{sublabel}</span>}
        </div>
      )}
      <div className="relative flex items-center">
        {Icon && (
          <div className="absolute left-3 text-gray-400 pointer-events-none">
            <Icon className="w-4 h-4" />
          </div>
        )}
        <input
          className={`w-full bg-[#131419] border ${
            error ? 'border-red-500' : 'border-[#262832] focus:border-orange-brand/70'
          } rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-orange-brand/50 transition-colors py-2 ${
            Icon ? 'pl-9' : 'pl-3'
          } ${suffix ? 'pr-12' : 'pr-3'} ${className}`}
          {...props}
        />
        {suffix && (
          <div className="absolute right-3 text-xs text-gray-400 pointer-events-none font-medium">
            {suffix}
          </div>
        )}
      </div>
      {error && <span className="text-xs text-red-400 mt-0.5">{error}</span>}
    </div>
  );
};
