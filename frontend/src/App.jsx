import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Boxes, 
  TrendingUp, 
  Users, 
  Landmark, 
  CreditCard, 
  FileSpreadsheet,
  LogOut
} from 'lucide-react';

const MODULE_REGISTRY = [
  { id: 'owner', label: 'Owner & Daily MIS', icon: ShieldCheck, roles: ['OWNER'] },
  { id: 'store', label: 'Store & Inventory', icon: Boxes, roles: ['OWNER', 'STORE_MANAGER'] },
  { id: 'sales', label: 'Sales Management', icon: TrendingUp, roles: ['OWNER', 'SALES_EXECUTIVE'] },
  { id: 'crm', label: 'Customer Relationship (CRM)', icon: Users, roles: ['OWNER', 'CRM_EXECUTIVE'] },
  { id: 'finance', label: 'Finance & Ledger', icon: Landmark, roles: ['OWNER', 'FINANCE_ACCOUNTANT'] },
  { id: 'payments', label: 'Payments & Collections', icon: CreditCard, roles: ['OWNER', 'PAYMENT_OFFICER'] }
];

export default function App() {
  // Replace with dynamic user from your auth state/JWT
  const [currentUser, setCurrentUser] = useState({
    username: 'owner_rahul',
    full_name: 'Rahul Patel (Owner)',
    role: 'OWNER' 
  });

  const [activeTab, setActiveTab] = useState('owner');

  // Filter modules by user role (Owner sees all)
  const accessibleModules = MODULE_REGISTRY.filter(
    (mod) => currentUser.role === 'OWNER' || mod.roles.includes(currentUser.role)
  );

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between">
        <div>
          <div className="p-5 border-b border-slate-800">
            <h1 className="text-xl font-black tracking-wide text-emerald-400">WEAVE-TECH ERP</h1>
            <span className="text-xs font-semibold px-2 py-0.5 mt-2 inline-block rounded bg-slate-800 text-slate-400">
              Role: {currentUser.role}
            </span>
          </div>

          <nav className="p-3 space-y-1">
            {accessibleModules.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                    isActive 
                      ? 'bg-emerald-600 text-white' 
                      : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-slate-800">
          <div className="text-xs text-slate-400 mb-2 truncate">{currentUser.full_name}</div>
          <button className="w-full flex items-center gap-2 text-rose-400 hover:text-rose-300 text-sm font-medium">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Dynamic Content Frame */}
      <main className="flex-1 overflow-y-auto p-8">
        {activeTab === 'owner' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-2xl font-bold">Executive MIS Overview</h2>
                <p className="text-slate-400 text-sm">Automated daily summary across all plant divisions</p>
              </div>
              <span className="text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-3 py-1 rounded text-sm font-mono">
                Live Plant Snapshot
              </span>
            </div>

            {/* Quick Metrics Grid for Owner */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
                <span className="text-xs text-slate-400 font-semibold uppercase">Daily Sales Closed</span>
                <p className="text-3xl font-extrabold font-mono text-emerald-400 mt-2">₹0.00</p>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
                <span className="text-xs text-slate-400 font-semibold uppercase">Payments Collected Today</span>
                <p className="text-3xl font-extrabold font-mono text-cyan-400 mt-2">₹0.00</p>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
                <span className="text-xs text-slate-400 font-semibold uppercase">Total Current Stock Value</span>
                <p className="text-3xl font-extrabold font-mono text-amber-400 mt-2">₹0.00</p>
              </div>
            </div>
          </div>
        )}

        {activeTab !== 'owner' && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center">
            <h3 className="text-xl font-bold capitalize">{activeTab} Module Active</h3>
            <p className="text-slate-400 text-sm mt-2">
              Ready for detailed fields, tables, and transactional forms.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}