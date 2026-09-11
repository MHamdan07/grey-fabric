import React from 'react';

export const Badge = ({
  children,
  variant = 'neutral', // 'orange', 'success', 'warning', 'danger', 'neutral'
  size = 'md',
  className = ''
}) => {
  const sizeStyles = {
    sm: 'px-2 py-0.5 text-[11px]',
    md: 'px-2.5 py-1 text-xs'
  };

  const variantStyles = {
    orange: 'bg-orange-brand/15 text-orange-brand border border-orange-brand/30',
    success: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20',
    warning: 'bg-amber-500/15 text-amber-400 border border-amber-500/20',
    danger: 'bg-rose-500/15 text-rose-400 border border-rose-500/20',
    neutral: 'bg-[#22242D] text-gray-300 border border-[#2D303B]'
  };

  return (
    <span className={`inline-flex items-center font-medium rounded-full ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}>
      {children}
    </span>
  );
};
