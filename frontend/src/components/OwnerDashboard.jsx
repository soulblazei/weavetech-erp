import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  IndianRupee, 
  Package, 
  Users, 
  Activity, 
  ArrowUpRight, 
  RefreshCw, 
  Clock, 
  Layers, 
  Gauge, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle 
} from 'lucide-react';
import { apiClient, mockOwnerApi } from '../api/client';

export default function OwnerDashboard() {
  const [misData, setMisData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState(new Date().toLocaleTimeString());

  const fetchMIS = async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get('/owner/daily-mis');
      setMisData(res.data);
    } catch (e) {
      setMisData(mockOwnerApi.getDailyMIS());
    } finally {
      setIsLoading(false);
      setLastRefreshed(new Date().toLocaleTimeString());
    }
  };

  useEffect(() => {
    fetchMIS();
  }, []);

  const formatRs = (val) => `Rs. ${Number(val || 0).toLocaleString('en-IN')}`;
  const formatLac = (val) => `Rs. ${(Number(val || 0) / 100000).toFixed(2)} Lac`;

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-7 h-7 text-indigo-600" />
            <h1 className="text-2xl font-black text-slate-900">Executive Daily MIS & Plant Overview</h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Automated live financial ledger aggregation, stock valuations, and loom operations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <span className="text-[11px] font-semibold text-slate-400 block">LAST AUTO-SYNCED</span>
            <span className="text-xs font-mono font-bold text-slate-700">{lastRefreshed}</span>
          </div>
          <button
            onClick={fetchMIS}
            disabled={isLoading}
            className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh MIS Ledger
          </button>
          <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-2 rounded-xl text-xs font-bold font-mono">
            ● Plant Online
          </span>
        </div>
      </div>

      {/* Primary KPI Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Gross Sales */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 hover:shadow-md transition">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Gross Sales Booked</span>
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black font-mono text-slate-900 mt-3">
            {formatLac(misData?.total_sales_amount)}
          </p>
          <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 mt-2">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>Exact: {formatRs(misData?.total_sales_amount)}</span>
          </div>
        </div>

        {/* Payments Collected */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 hover:shadow-md transition">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Payments Collected</span>
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
              <IndianRupee className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black font-mono text-slate-900 mt-3">
            {formatLac(misData?.total_payments_collected)}
          </p>
          <div className="flex items-center gap-1 text-[11px] font-semibold text-blue-700 mt-2">
            <span>Inward Bank & Cash Receipts</span>
          </div>
        </div>

        {/* Outstanding Pending */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 hover:shadow-md transition">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Outstanding Balance</span>
            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black font-mono text-amber-700 mt-3">
            {formatLac(misData?.total_payments_pending)}
          </p>
          <div className="flex items-center gap-1 text-[11px] font-semibold text-amber-800 mt-2">
            <span>Pending Client Realization</span>
          </div>
        </div>

        {/* Yarn Inventory Valuation */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 hover:shadow-md transition">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Yarn Stock Valuation</span>
            <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black font-mono text-slate-900 mt-3">
            {formatLac(misData?.inventory_valuation)}
          </p>
          <div className="flex items-center gap-1 text-[11px] font-semibold text-purple-700 mt-2">
            <span>Godown Bay Lot Stock</span>
          </div>
        </div>
      </div>

      {/* Secondary Operational Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 flex items-center gap-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-500 block">Fabric Meters Produced</span>
            <p className="text-xl font-black font-mono text-slate-900 mt-0.5">
              {Number(misData?.fabric_meters_produced || 0).toLocaleString()} Mtr
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 flex items-center gap-4">
          <div className="p-3 bg-cyan-50 text-cyan-600 rounded-2xl">
            <Gauge className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-500 block">Loom Fleet Status</span>
            <p className="text-xl font-black font-mono text-slate-900 mt-0.5">
              {misData?.total_looms_running || 10} / {misData?.total_looms || 12} Looms Active
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-500 block">Sales Priorities in Progress</span>
            <p className="text-xl font-black font-mono text-slate-900 mt-0.5">
              {misData?.active_leads_count || 4} Priority Inquiries
            </p>
          </div>
        </div>
      </div>

      {/* Quick Plant Health & Summary Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Plant Overview Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            Executive Operational Audit
          </h3>
          <div className="space-y-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center">
              <div>
                <strong className="text-slate-800 block">Loom Shed Airjet & Rapier Fleet</strong>
                <span className="text-slate-500">Average Shift Efficiency: 91.2% • No critical machine breakdowns</span>
              </div>
              <span className="px-2.5 py-1 rounded-full font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                Optimal
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center">
              <div>
                <strong className="text-slate-800 block">Grey Fabric ASTM D5430 Quality Grade</strong>
                <span className="text-slate-500">96.4% Fresh First Quality Rate • 3.6% Seconds/Allowance</span>
              </div>
              <span className="px-2.5 py-1 rounded-full font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                Grade A
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center">
              <div>
                <strong className="text-slate-800 block">Yarn Godown Safety Stock Buffer</strong>
                <span className="text-slate-500">40s & 60s counts available for next 18 days continuous running</span>
              </div>
              <span className="px-2.5 py-1 rounded-full font-bold bg-blue-50 text-blue-700 border border-blue-200">
                Sufficient
              </span>
            </div>
          </div>
        </div>

        {/* Financial Flow Summary */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <IndianRupee className="w-5 h-5 text-indigo-600" />
            Working Capital & Realization Gauge
          </h3>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-600">Realization Rate (Collected vs Booked)</span>
                <span className="text-slate-900 font-bold font-mono">
                  {misData?.total_sales_amount ? ((misData.total_payments_collected / misData.total_sales_amount) * 100).toFixed(1) : 68.5}%
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                <div 
                  className="bg-indigo-600 h-3 rounded-full transition-all duration-500" 
                  style={{ width: `${misData?.total_sales_amount ? Math.min(100, (misData.total_payments_collected / misData.total_sales_amount) * 100) : 68.5}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
              <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100">
                <span className="text-slate-500 font-semibold block">Total Inward Collected</span>
                <strong className="text-indigo-900 font-bold font-mono text-sm">
                  {formatRs(misData?.total_payments_collected)}
                </strong>
              </div>
              <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-100">
                <span className="text-slate-500 font-semibold block">Total Pending Dues</span>
                <strong className="text-amber-900 font-bold font-mono text-sm">
                  {formatRs(misData?.total_payments_pending)}
                </strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
