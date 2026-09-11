import React from 'react';

export const Select = ({
  label,
  sublabel,
  options = [],
  error,
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
      <select
        className={`w-full bg-[#131419] border ${
          error ? 'border-red-500' : 'border-[#262832] focus:border-orange-brand/70'
        } rounded-lg text-sm text-white focus:outline-none focus:ring-1 focus:ring-orange-brand/50 transition-colors py-2 px-3 ${className}`}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-[#18191E] text-white">
            {opt.label}
          </option>
        ))}
      </select>
      {error && <span className="text-xs text-red-400 mt-0.5">{error}</span>}
    </div>
  );
};
