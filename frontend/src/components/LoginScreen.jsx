import React, { useState } from 'react';
import { ShieldCheck, Eye, Layers, Package, Lock, User, LogIn, AlertCircle, Loader2, Factory, Check } from 'lucide-react';
import { apiClient } from '../api/client';

const ROLE_PRESETS = [
  {
    role: 'QC_INSPECTOR',
    title: 'QC Inspection',
    defaultUser: 'qc_ramesh',
    icon: Eye,
    accentColor: 'border-indigo-500 text-indigo-700 bg-indigo-50/70',
    activeColor: 'ring-2 ring-indigo-600 border-indigo-600 bg-indigo-100 text-indigo-900',
  },
  {
    role: 'LOOM_SUPERVISOR',
    title: 'Loom Supervisor',
    defaultUser: 'sup_mahesh',
    icon: Layers,
    accentColor: 'border-amber-500 text-amber-800 bg-amber-50/70',
    activeColor: 'ring-2 ring-amber-600 border-amber-600 bg-amber-100 text-amber-900',
  },
  {
    role: 'STORE_MANAGER',
    title: 'Store & Inward',
    defaultUser: 'store_suresh',
    icon: Package,
    accentColor: 'border-emerald-500 text-emerald-800 bg-emerald-50/70',
    activeColor: 'ring-2 ring-emerald-600 border-emerald-600 bg-emerald-100 text-emerald-900',
  },
  {
    role: 'SUPER_ADMIN',
    title: 'Plant Admin',
    defaultUser: 'admin',
    icon: ShieldCheck,
    accentColor: 'border-slate-500 text-slate-800 bg-slate-50/70',
    activeColor: 'ring-2 ring-slate-800 border-slate-800 bg-slate-200 text-slate-900',
  },
];

export default function LoginScreen({ onLoginSuccess }) {
  const [selectedRole, setSelectedRole] = useState(ROLE_PRESETS[0].role);
  const [username, setUsername] = useState(ROLE_PRESETS[0].defaultUser);
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const handleSelectPreset = (preset) => {
    setSelectedRole(preset.role);
    setUsername(preset.defaultUser);
    setPassword('');
    setErrorMessage(null);
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setErrorMessage('Please enter credentials.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await apiClient.post('/auth/login', {
        username: username.trim().toLowerCase(),
        password: password.trim(),
      });

      const { access_token, user } = response.data;
      localStorage.setItem('weaving_auth_token', access_token);
      localStorage.setItem('weaving_user_profile', JSON.stringify(user));

      if (onLoginSuccess) onLoginSuccess(user);
    } catch (err) {
      setErrorMessage(err.response?.data?.detail || 'Cannot connect to local ERP server.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-center items-center p-4 font-sans select-none">
      <div className="text-center mb-6 max-w-md">
        <div className="inline-flex p-3 bg-indigo-600/20 border border-indigo-500/30 rounded-2xl mb-3">
          <Factory className="w-8 h-8 text-indigo-400" />
        </div>
        <h1 className="text-2xl font-black text-white">MOTI WEAVING MILLS</h1>
        <p className="text-xs text-slate-400 mt-1">Floor Terminal Station</p>
      </div>

      <div className="w-full max-w-xl bg-white text-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
        <div className="p-5 bg-slate-50 border-b border-slate-200">
          <label className="text-xs font-bold uppercase text-slate-500 block mb-3">Select Terminal Role</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {ROLE_PRESETS.map((preset) => {
              const Icon = preset.icon;
              const isSelected = selectedRole === preset.role;
              return (
                <button
                  key={preset.role}
                  type="button"
                  onClick={() => handleSelectPreset(preset)}
                  className={`p-3 rounded-2xl border text-left flex flex-col justify-between min-h-[85px] transition-all ${
                    isSelected ? preset.activeColor : preset.accentColor
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <Icon className="w-4 h-4" />
                    {isSelected && <Check className="w-3.5 h-3.5 text-indigo-900" />}
                  </div>
                  <div>
                    <p className="text-xs font-black leading-tight mt-1">{preset.title}</p>
                    <p className="text-[10px] opacity-75">{preset.defaultUser}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <form onSubmit={handleLoginSubmit} className="p-6 space-y-4">
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl flex items-center gap-2 text-xs font-semibold">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div>
            <label className="text-xs font-bold text-slate-600 block mb-1">Username</label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2.5 pl-9 pr-3 text-sm font-semibold"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-600 block mb-1">PIN / Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
                autoFocus
                className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2.5 pl-9 pr-3 text-sm font-semibold font-mono"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold py-3.5 rounded-xl shadow-lg flex items-center justify-center gap-2 text-sm transition-all"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
            <span>Sign In to Terminal</span>
          </button>
        </form>
      </div>
    </div>
  );
}