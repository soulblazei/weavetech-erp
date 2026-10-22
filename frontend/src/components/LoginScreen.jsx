import React, { useState } from 'react';
import { 
  ShieldCheck, 
  TrendingUp, 
  Package, 
  Users, 
  Landmark, 
  CreditCard, 
  Eye, 
  Gauge, 
  Lock, 
  User, 
  LogIn, 
  AlertCircle, 
  Loader2, 
  Factory, 
  Check 
} from 'lucide-react';
import { apiClient, mockAuthApi } from '../api/client';

const ROLE_PRESETS = [
  {
    role: 'OWNER',
    title: 'Plant Owner',
    defaultUser: 'owner',
    defaultPass: 'owner@123',
    icon: ShieldCheck,
    tag: 'Full Access & MIS',
    accentColor: 'border-indigo-200 text-indigo-800 bg-indigo-50/60 hover:bg-indigo-50',
    activeColor: 'ring-2 ring-indigo-600 border-indigo-600 bg-indigo-100/80 text-indigo-950',
  },
  {
    role: 'SALES_EXECUTIVE',
    title: 'Sales & Booking',
    defaultUser: 'sales_user',
    defaultPass: 'sales@123',
    icon: TrendingUp,
    tag: 'Contracts & Tasks',
    accentColor: 'border-emerald-200 text-emerald-800 bg-emerald-50/60 hover:bg-emerald-50',
    activeColor: 'ring-2 ring-emerald-600 border-emerald-600 bg-emerald-100/80 text-emerald-950',
  },
  {
    role: 'STORE_MANAGER',
    title: 'Store & Inward',
    defaultUser: 'store_user',
    defaultPass: 'store@123',
    icon: Package,
    tag: 'Yarn & Beams',
    accentColor: 'border-amber-200 text-amber-800 bg-amber-50/60 hover:bg-amber-50',
    activeColor: 'ring-2 ring-amber-600 border-amber-600 bg-amber-100/80 text-amber-950',
  },
  {
    role: 'LOOM_SUPERVISOR',
    title: 'Loom Supervisor',
    defaultUser: 'loom_user',
    defaultPass: 'loom@123',
    icon: Gauge,
    tag: 'Efficiency & Picks',
    accentColor: 'border-blue-200 text-blue-800 bg-blue-50/60 hover:bg-blue-50',
    activeColor: 'ring-2 ring-blue-600 border-blue-600 bg-blue-100/80 text-blue-950',
  },
  {
    role: 'QC_INSPECTOR',
    title: 'QC Inspection',
    defaultUser: 'qc_user',
    defaultPass: 'qc@123',
    icon: Eye,
    tag: 'ASTM 4-Point Grading',
    accentColor: 'border-purple-200 text-purple-800 bg-purple-50/60 hover:bg-purple-50',
    activeColor: 'ring-2 ring-purple-600 border-purple-600 bg-purple-100/80 text-purple-950',
  },
  {
    role: 'PAYMENT_OFFICER',
    title: 'Payments & Cash',
    defaultUser: 'payment_user',
    defaultPass: 'pay@123',
    icon: CreditCard,
    tag: 'Receipts & Vouchers',
    accentColor: 'border-rose-200 text-rose-800 bg-rose-50/60 hover:bg-rose-50',
    activeColor: 'ring-2 ring-rose-600 border-rose-600 bg-rose-100/80 text-rose-950',
  },
  {
    role: 'CRM_EXECUTIVE',
    title: 'CRM & Pipeline',
    defaultUser: 'crm_user',
    defaultPass: 'crm@123',
    icon: Users,
    tag: 'Leads & Agencies',
    accentColor: 'border-cyan-200 text-cyan-800 bg-cyan-50/60 hover:bg-cyan-50',
    activeColor: 'ring-2 ring-cyan-600 border-cyan-600 bg-cyan-100/80 text-cyan-950',
  },
  {
    role: 'FINANCE_ACCOUNTANT',
    title: 'Finance & Ledger',
    defaultUser: 'finance_user',
    defaultPass: 'fin@123',
    icon: Landmark,
    tag: 'Double Entry P&L',
    accentColor: 'border-slate-300 text-slate-800 bg-slate-100/70 hover:bg-slate-100',
    activeColor: 'ring-2 ring-slate-800 border-slate-800 bg-slate-200 text-slate-950',
  },
];

export default function LoginScreen({ onLoginSuccess }) {
  const [selectedRole, setSelectedRole] = useState(ROLE_PRESETS[0].role);
  const [username, setUsername] = useState(ROLE_PRESETS[0].defaultUser);
  const [password, setPassword] = useState(ROLE_PRESETS[0].defaultPass);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const handleSelectPreset = (preset) => {
    setSelectedRole(preset.role);
    setUsername(preset.defaultUser);
    setPassword(preset.defaultPass);
    setErrorMessage(null);
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setErrorMessage('Please enter valid plant credentials.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      // 1. Try Live FastAPI Backend
      const formData = new FormData();
      formData.append('username', username.trim().toLowerCase());
      formData.append('password', password.trim());

      const response = await apiClient.post('/auth/token', formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });

      const { access_token, role, full_name, username: uname } = response.data;
      const user = { username: uname, full_name, role };
      localStorage.setItem('weaving_auth_token', access_token);
      localStorage.setItem('weaving_user_profile', JSON.stringify(user));

      if (onLoginSuccess) onLoginSuccess(user);
    } catch (err) {
      // 2. Fallback to Local Offline Mock DB
      try {
        const mockAuth = mockAuthApi.login(username.trim().toLowerCase(), password.trim());
        localStorage.setItem('weaving_auth_token', mockAuth.access_token);
        localStorage.setItem('weaving_user_profile', JSON.stringify(mockAuth.user));
        if (onLoginSuccess) onLoginSuccess(mockAuth.user);
      } catch (mockErr) {
        setErrorMessage('Invalid username or password. Select a role above to autofill demo credentials.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-indigo-50/30 text-slate-900 flex flex-col justify-center items-center p-4 font-sans select-none">
      {/* Brand Header */}
      <div className="text-center mb-6 max-w-lg">
        <div className="inline-flex p-3 bg-indigo-600 text-white rounded-2xl shadow-md mb-3">
          <Factory className="w-8 h-8" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">WEAVE-TECH ERP</h1>
        <p className="text-xs sm:text-sm font-semibold text-slate-500 mt-1">
          Modern On-Premise Textile Weaving Plant Operating System
        </p>
      </div>

      {/* Main Login Card */}
      <div className="w-full max-w-2xl bg-white text-slate-900 rounded-3xl shadow-xl overflow-hidden border border-slate-200">
        {/* Touch Role Presets */}
        <div className="p-5 bg-slate-50/80 border-b border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Touch-Select Station Role
            </label>
            <span className="text-[11px] font-semibold text-indigo-600">Preset Demo Credentials Loaded</span>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {ROLE_PRESETS.map((preset) => {
              const Icon = preset.icon;
              const isSelected = selectedRole === preset.role;
              return (
                <button
                  key={preset.role}
                  type="button"
                  onClick={() => handleSelectPreset(preset)}
                  className={`p-3 rounded-xl border text-left flex flex-col justify-between min-h-[88px] transition-all cursor-pointer ${
                    isSelected ? preset.activeColor : preset.accentColor
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <Icon className="w-4 h-4" />
                    {isSelected && <Check className="w-4 h-4 text-indigo-700 font-bold" />}
                  </div>
                  <div>
                    <p className="text-xs font-black leading-tight mt-2">{preset.title}</p>
                    <p className="text-[10px] opacity-75 font-mono">{preset.tag}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLoginSubmit} className="p-6 space-y-4">
          {errorMessage && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl flex items-center gap-2 text-xs font-semibold">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">Username / Login ID</label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="w-full bg-white border border-slate-300 rounded-xl py-2.5 pl-10 pr-3 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600 transition"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">Password / Station PIN</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-white border border-slate-300 rounded-xl py-2.5 pl-10 pr-3 text-sm font-semibold font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600 transition"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold py-3.5 rounded-xl shadow-md flex items-center justify-center gap-2 text-sm transition cursor-pointer"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
            <span>Sign In to Plant Terminal</span>
          </button>
        </form>
      </div>

      {/* Footer Info */}
      <div className="text-center text-xs text-slate-400 mt-6">
        <span>WEAVE-TECH ERP v2.0 • Secured Local LAN & Cloud Sync</span>
      </div>
    </div>
  );
}