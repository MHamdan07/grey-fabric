import React from 'react';
import {
  LayoutDashboard,
  Calculator,
  History,
  GitCompare,
  Layers,
  Sparkles,
  Sliders,
  FileSpreadsheet,
  FileText,
  Scale,
  Users,
  Settings,
  RefreshCw,
  LogOut,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Sidebar = ({ activeTab, onTabChange }) => {
  const { user, logout, isAdmin } = useAuth();

  const navSections = [
    {
      label: null,
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard }
      ]
    },
    {
      label: 'COSTING',
      items: [
        { id: 'new-costing', label: 'New Costing', icon: Calculator, highlight: true },
        { id: 'costing-history', label: 'Costing History', icon: History },
        { id: 'comparison', label: 'Comparison', icon: GitCompare }
      ]
    },
    {
      label: 'PRODUCTION PLANNING',
      items: [
        { id: 'yarn-to-fabric', label: 'Yarn → Fabric', icon: Scale },
        { id: 'fabric-to-yarn', label: 'Fabric → Yarn', icon: Layers },
        { id: 'production-plans', label: 'Production Plans', icon: FileSpreadsheet }
      ]
    },
    {
      label: 'MASTER DATA',
      items: [
        { id: 'yarn-master', label: 'Yarn Master', icon: Layers },
        { id: 'fabric-master', label: 'Fabric Master', icon: Sparkles },
        { id: 'charges', label: 'Charges Management', icon: Sliders }
      ]
    },
    {
      label: 'REPORTS',
      items: [
        { id: 'reports', label: 'Costing Reports', icon: FileSpreadsheet },
        { id: 'production-reports', label: 'Production Reports', icon: FileText }
      ]
    },
    {
      label: 'ADMINISTRATION',
      items: [
        ...(isAdmin ? [{ id: 'users', label: 'Users & Roles', icon: Users }] : []),
        { id: 'settings', label: 'Settings', icon: Settings }
      ]
    }
  ];

  return (
    <aside className="w-64 bg-dark-sidebar border-r border-dark-border flex flex-col h-screen select-none shrink-0 sticky top-0">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-5 gap-3 border-b border-dark-border bg-[#101115]">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-orange-brand to-[#B84000] flex items-center justify-center text-white font-black text-base shadow-glow-sm">
          GF
        </div>
        <div>
          <h1 className="text-sm font-bold text-white tracking-wide flex items-center gap-1.5">
            GREY COSTING
            <span className="text-[10px] bg-orange-brand/20 text-orange-brand px-1.5 py-0.5 rounded font-mono font-bold">
              v1.0
            </span>
          </h1>
          <p className="text-[11px] text-gray-400 font-medium">Textile Cost Engine</p>
        </div>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {navSections.map((section, idx) => (
          <div key={idx} className="space-y-1">
            {section.label && (
              <div className="px-3 pb-1.5 text-[10px] font-bold tracking-wider text-gray-500 uppercase">
                {section.label}
              </div>
            )}
            {section.items.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150 relative ${
                    isActive
                      ? 'bg-orange-pill text-orange-brand border border-orange-border shadow-sm font-semibold'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-[#181A21]'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-colors ${
                      isActive ? 'text-orange-brand' : 'text-gray-400'
                    }`}
                  />
                  <span className="flex-1 text-left">{item.label}</span>
                  {isActive && (
                    <div className="w-1.5 h-1.5 rounded-full bg-orange-brand shadow-glow-sm" />
                  )}
                  {item.highlight && !isActive && (
                    <span className="w-2 h-2 rounded-full bg-orange-brand/70" />
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Status & User Footer */}
      <div className="p-3 border-t border-dark-border bg-[#101115] space-y-3">
        <div className="flex items-center justify-between px-2 text-[11px] text-gray-400">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Engine online</span>
          </div>
          <span className="text-gray-500 text-[10px] font-mono">Ne 840 Std</span>
        </div>

        {/* User Card */}
        <div className="flex items-center justify-between p-2 rounded-lg bg-[#161820] border border-[#242630]">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-orange-brand/20 border border-orange-brand/40 flex items-center justify-center text-xs font-bold text-orange-brand uppercase">
              {user?.name ? user.name.slice(0, 2) : 'TM'}
            </div>
            <div className="overflow-hidden text-left">
              <p className="text-xs font-semibold text-white truncate">
                {user?.name || 'Taylor Morgan'}
              </p>
              <p className="text-[10px] text-gray-400 capitalize truncate">
                {user?.role || 'Costing Analyst'}
              </p>
            </div>
          </div>
          <button
            onClick={logout}
            title="Sign out"
            className="p-1.5 text-gray-400 hover:text-rose-400 hover:bg-[#20222C] rounded transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
