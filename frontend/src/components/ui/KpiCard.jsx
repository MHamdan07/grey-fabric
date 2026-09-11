import React from 'react';
import { ArrowUpRight, ArrowDownRight, Info } from 'lucide-react';

export const KpiCard = ({
  title,
  value,
  subtitle,
  change,
  isPositive = true,
  sparkline,
  infoText,
  className = ''
}) => {
  return (
    <div className={`bg-dark-card border border-dark-border hover:border-[#333744] rounded-xl p-5 transition-all duration-200 shadow-card ${className}`}>
      <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
        <span className="font-medium text-gray-300 flex items-center gap-1.5">
          {title}
          {infoText && <Info className="w-3.5 h-3.5 text-gray-500 cursor-pointer hover:text-gray-300" />}
        </span>
        {sparkline && <div className="text-orange-brand">{sparkline}</div>}
      </div>

      <div className="flex items-baseline justify-between mt-1">
        <div className="text-2xl font-bold text-white tracking-tight font-sans">
          {value}
        </div>
      </div>

      <div className="flex items-center gap-2 mt-3 text-xs">
        {change && (
          <span className={`inline-flex items-center font-semibold ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
            {isPositive ? <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> : <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />}
            {change}
          </span>
        )}
        {subtitle && <span className="text-gray-500">{subtitle}</span>}
      </div>
    </div>
  );
};
