import React, { useState, useRef, useEffect } from 'react';
import { Calendar, Download, Plus, ChevronDown, RefreshCw, Check } from 'lucide-react';
import { Button } from '../ui/Button';
import { useToast } from '../../context/ToastContext';

export const Header = ({
  title = 'Grey Fabric Costing',
  subtitle = 'Calculate, manage and analyze your fabric manufacturing costs in real time.',
  onNewCosting,
  onExport,
  onRefresh,
  selectedDays = 30,
  onDateRangeChange
}) => {
  const { addToast } = useToast();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const dropdownRef = useRef(null);

  const dateOptions = [
    { label: 'Last 7 Days', days: 7 },
    { label: 'Last 30 Days', days: 30 },
    { label: 'Last 90 Days', days: 90 },
    { label: 'This Year (365D)', days: 365 }
  ];

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectDate = (days) => {
    if (onDateRangeChange) onDateRangeChange(days);
    setDropdownOpen(false);
    addToast(`Time range updated to ${dateOptions.find(o => o.days === days)?.label}`, 'info');
  };

  const handleRefreshClick = async () => {
    if (onRefresh) {
      setRefreshing(true);
      try {
        await onRefresh();
        addToast('Data refreshed successfully', 'success');
      } catch (e) {
        addToast('Failed to refresh data', 'error');
      } finally {
        setTimeout(() => setRefreshing(false), 500);
      }
    }
  };

  const currentOptionLabel = dateOptions.find(o => o.days === selectedDays)?.label || 'Last 30 Days';

  return (
    <header className="px-8 pt-6 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-dark-border/40 bg-dark-bg/60 backdrop-blur-sm sticky top-0 z-30">
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">{title}</h2>
        {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-2.5 flex-wrap">
        {onRefresh && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefreshClick}
            disabled={refreshing}
            title="Refresh active view"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-gray-400 ${refreshing ? 'animate-spin text-orange-brand' : ''}`} />
          </Button>
        )}

        {/* Date Filter Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-dark-card border border-dark-border hover:border-orange-brand/40 text-xs text-gray-200 font-medium transition-colors"
          >
            <Calendar className="w-3.5 h-3.5 text-orange-brand" />
            <span>{currentOptionLabel}</span>
            <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-1.5 w-44 bg-[#181920] border border-dark-border rounded-xl shadow-2xl py-1 z-50 animate-in fade-in">
              {dateOptions.map((opt) => (
                <button
                  key={opt.days}
                  onClick={() => handleSelectDate(opt.days)}
                  className={`w-full px-3 py-2 text-xs text-left flex items-center justify-between hover:bg-[#22242D] transition-colors ${
                    selectedDays === opt.days ? 'text-orange-brand font-semibold bg-orange-pill' : 'text-gray-300'
                  }`}
                >
                  <span>{opt.label}</span>
                  {selectedDays === opt.days && <Check className="w-3.5 h-3.5" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {onExport && (
          <Button
            variant="secondary"
            size="sm"
            icon={Download}
            onClick={onExport}
          >
            Export
          </Button>
        )}

        {onNewCosting && (
          <Button variant="primary" size="sm" icon={Plus} onClick={onNewCosting}>
            New Costing
          </Button>
        )}
      </div>
    </header>
  );
};
