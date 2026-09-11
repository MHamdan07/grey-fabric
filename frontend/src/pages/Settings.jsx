import React from 'react';
import { Settings as SettingsIcon, Database, Cpu, ShieldCheck, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Badge } from '../components/ui/Badge';

export const Settings = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <SettingsIcon className="w-5 h-5 text-orange-brand" />
          System Settings & Textile Engine
        </h2>
        <p className="text-xs text-gray-400 mt-0.5">
          Configuration parameters, calculation constants, and active operator profile.
        </p>
      </div>

      {/* User Card */}
      <div className="p-5 bg-dark-card border border-dark-border rounded-xl shadow-card space-y-4">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-orange-brand" /> Operator Profile
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-3 bg-[#14151B] rounded-lg border border-dark-border">
            <span className="text-gray-500 block mb-0.5">Signed-in User</span>
            <strong className="text-white text-sm">{user?.name || 'Taylor Morgan'}</strong>
          </div>
          <div className="p-3 bg-[#14151B] rounded-lg border border-dark-border">
            <span className="text-gray-500 block mb-0.5">Email</span>
            <strong className="text-white font-mono">{user?.email || 'admin@greycost.com'}</strong>
          </div>
          <div className="p-3 bg-[#14151B] rounded-lg border border-dark-border">
            <span className="text-gray-500 block mb-0.5">Assigned Role</span>
            <strong className="text-orange-brand uppercase font-mono">{user?.role || 'Admin'}</strong>
          </div>
        </div>
      </div>

      {/* Textile Calculation Engine Constants */}
      <div className="p-5 bg-dark-card border border-dark-border rounded-xl shadow-card space-y-4">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <Cpu className="w-4 h-4 text-orange-brand" /> Textile Calculation Engine Parameters
        </h3>
        <div className="space-y-3 text-xs">
          <div className="flex items-center justify-between p-3 bg-[#14151B] rounded-lg border border-dark-border">
            <div>
              <p className="font-semibold text-white">Calculation Method & Constant</p>
              <p className="text-gray-500 text-[11px]">English Cotton Count Ne (K = 1693.35) with dynamic normalization</p>
            </div>
            <span className="font-mono text-orange-brand font-bold text-sm bg-orange-pill px-2.5 py-1 rounded border border-orange-border">
              Standard Cotton v1.0
            </span>
          </div>

          <div className="flex items-center justify-between p-3 bg-[#14151B] rounded-lg border border-dark-border">
            <div>
              <p className="font-semibold text-white">Supported Yarn Count Systems</p>
              <p className="text-gray-500 text-[11px]">Indirect (Ne, Nm) and Direct (Tex, Denier) linear density conversion</p>
            </div>
            <span className="font-mono text-gray-200 font-medium">
              Ne, Nm, Tex, Denier
            </span>
          </div>

          <div className="flex items-center justify-between p-3 bg-[#14151B] rounded-lg border border-dark-border">
            <div>
              <p className="font-semibold text-white">Wastage & Crimp Modeling</p>
              <p className="text-gray-500 text-[11px]">Crimp/Take-up % (interlacing) and Wastage % (fiber loss) calculated separately</p>
            </div>
            <Badge variant="success" size="sm">Separated</Badge>
          </div>

          <div className="flex items-center justify-between p-3 bg-[#14151B] rounded-lg border border-dark-border">
            <div>
              <p className="font-semibold text-white">Process Tariffs</p>
              <p className="text-gray-500 text-[11px]">Dynamic bases: Rs./m, Rs./kg sized warp, Rs./kg total yarn, and fixed</p>
            </div>
            <span className="font-mono text-gray-300 font-medium">Configurable</span>
          </div>

          <div className="flex items-center justify-between p-3 bg-[#14151B] rounded-lg border border-dark-border">
            <div>
              <p className="font-semibold text-white">Accounting & Tariff Currency</p>
              <p className="text-gray-500 text-[11px]">National standard manufacturing currency</p>
            </div>
            <span className="font-mono text-orange-brand font-bold bg-orange-pill px-2.5 py-1 rounded border border-orange-border">
              PKR (Pakistani Rupee - Rs.)
            </span>
          </div>

          <div className="flex items-center justify-between p-3 bg-[#14151B] rounded-lg border border-dark-border">
            <div>
              <p className="font-semibold text-white">Phase 1 Boundary Enforcement</p>
              <p className="text-gray-500 text-[11px]">Selling prices, profit margins, quotations, and billing strictly disabled</p>
            </div>
            <Badge variant="success" size="sm">Enforced</Badge>
          </div>
        </div>
      </div>

      {/* Database & Persistence */}
      <div className="p-5 bg-dark-card border border-dark-border rounded-xl shadow-card space-y-4">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <Database className="w-4 h-4 text-orange-brand" /> Database Architecture
        </h3>
        <div className="p-3 bg-[#14151B] rounded-lg border border-dark-border text-xs space-y-1">
          <div className="flex justify-between text-gray-300">
            <span>Primary Local Storage:</span>
            <span className="font-mono text-emerald-400 font-bold">SQLite (WAL Mode Enabled)</span>
          </div>
          <div className="flex justify-between text-gray-400">
            <span>PostgreSQL Compatibility:</span>
            <span className="font-mono text-gray-300">Ready via schema.sql & docker-compose.yml</span>
          </div>
        </div>
      </div>
    </div>
  );
};
