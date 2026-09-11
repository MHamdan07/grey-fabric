import React, { useState } from 'react';
import { Lock, Mail, ArrowRight, AlertCircle } from 'lucide-react';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';

export const Login = ({ onLoginSuccess }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('admin@greycost.com');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      await login(email, password);
      if (onLoginSuccess) onLoginSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    try {
      setLoading(true);
      setError(null);
      await login(demoEmail, demoPass);
      if (onLoginSuccess) onLoginSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Quick login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-dark-bg flex items-center justify-center p-4">
      {/* Background glow circle */}
      <div className="absolute w-96 h-96 rounded-full bg-orange-brand/10 blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-dark-card border border-dark-border rounded-2xl p-8 shadow-2xl relative z-10 space-y-6">
        {/* Brand */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-brand to-[#B84000] flex items-center justify-center text-white font-black text-xl shadow-glow-md mx-auto">
            GF
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            GREY FABRIC COSTING
          </h1>
          <p className="text-xs text-gray-400">
            Sign in to access your manufacturing cost engine
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            icon={Mail}
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@greycost.com"
          />

          <Input
            label="Password"
            type="password"
            icon={Lock}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={loading}
            className="w-full mt-2"
          >
            Sign In to Dashboard <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </form>

        {/* Quick Demo Login Shortcut */}
        <div className="pt-4 border-t border-dark-border space-y-2">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block text-center">
            One-Click Test Accounts
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin('admin@greycost.com', 'admin123')}
              className="p-2.5 rounded-lg bg-[#14151B] hover:bg-[#1E2029] border border-dark-border text-xs text-left transition-colors"
            >
              <span className="font-semibold text-orange-brand block">Administrator</span>
              <span className="text-[10px] text-gray-400">admin@greycost.com</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('staff@greycost.com', 'staff123')}
              className="p-2.5 rounded-lg bg-[#14151B] hover:bg-[#1E2029] border border-dark-border text-xs text-left transition-colors"
            >
              <span className="font-semibold text-gray-200 block">Staff User</span>
              <span className="text-[10px] text-gray-400">staff@greycost.com</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
