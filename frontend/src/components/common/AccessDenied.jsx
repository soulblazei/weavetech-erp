import React from 'react';
import { ShieldAlert, ArrowLeft, Lock, CheckCircle2 } from 'lucide-react';
import { getRoleMeta, getDefaultModule } from '../../config/rbac';

export default function AccessDenied({ role, requestedModule, onNavigate }) {
  const meta = getRoleMeta(role);
  const fallbackModule = getDefaultModule(role);

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl border border-rose-200 shadow-xl p-8 text-center animate-in fade-in zoom-in-95 duration-200">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 shadow-sm">
          <ShieldAlert className="w-9 h-9" />
        </div>

        <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-100 text-rose-800 border border-rose-300 mb-3">
          403 • Access Restricted by RBAC
        </span>

        <h2 className="text-xl font-black text-slate-900 tracking-tight mb-2">
          Module Access Denied
        </h2>

        <p className="text-xs text-slate-600 mb-6 leading-relaxed">
          Your account is registered as <strong className="text-slate-900">{meta.name}</strong> (<code className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-800 font-mono text-[11px] font-bold">{role}</code>).
          Security policy limits access only to authorized factory modules.
        </p>

        {/* Permitted Modules Summary */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 mb-6 text-left">
          <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
            Authorized Modules For Your Role:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {meta.allowedModules.map((mod) => (
              <span
                key={mod}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 capitalize"
              >
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                {mod}
              </span>
            ))}
          </div>
        </div>

        <button
          onClick={() => onNavigate(fallbackModule)}
          className="w-full flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white font-bold text-xs shadow-md transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Authorized Module ({fallbackModule.toUpperCase()})</span>
        </button>
      </div>
    </div>
  );
}
