import React, { useState, useEffect } from 'react';
import { 
  Gauge, 
  Activity, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Play, 
  Pause, 
  RefreshCw, 
  User, 
  Layers,
  History
} from 'lucide-react';
import { apiClient, mockProductionApi } from '../api/client';

export default function LoomSupervisor() {
  const [looms, setLooms] = useState([]);
  const [shiftLogs, setShiftLogs] = useState([]);
  const [selectedLoomId, setSelectedLoomId] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // Shift Log Form
  const [form, setForm] = useState({
    loom_id: 1,
    shift_name: 'Shift A (Day)',
    operator_name: '',
    start_picks: 100000,
    end_picks: 388000,
    shift_runtime_minutes: 480,
    downtime_minutes: 20,
    downtime_reason: 'Warp Stop',
  });

  const loadData = async () => {
    setIsLoading(true);
    try {
      const lRes = await apiClient.get('/production/looms');
      const sRes = await apiClient.get('/production/shift-logs');
      setLooms(lRes.data || []);
      setShiftLogs(sRes.data || []);
    } catch (e) {
      setLooms(mockProductionApi.getLooms());
      setShiftLogs(mockProductionApi.getShiftLogs());
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const selectedLoom = looms.find(l => l.id === parseInt(form.loom_id)) || looms[0];
  const ratedRpm = selectedLoom ? selectedLoom.rated_rpm : 650;
  const runtime = form.shift_runtime_minutes || 480;
  const totalPicks = Math.max(0, (form.end_picks || 0) - (form.start_picks || 0));
  const expectedPicks = ratedRpm * runtime;
  const computedEfficiency = expectedPicks > 0 ? ((totalPicks / expectedPicks) * 100).toFixed(2) : '0.00';
  const computedActualRpm = runtime > 0 ? (totalPicks / runtime).toFixed(1) : '0.0';

  const handleLogShift = async (e) => {
    e.preventDefault();
    try {
      await apiClient.post('/production/log-shift', form);
    } catch (e) {
      mockProductionApi.logShift(form);
    }
    loadData();
    alert("Shift Production & Efficiency logged successfully!");
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Gauge className="w-7 h-7 text-indigo-600" />
            <h1 className="text-2xl font-black text-slate-900">Loom Shed Supervisor Terminal</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time pick counter logging, loom RPM calculation, downtime auditing, and shift efficiency formulas.
          </p>
        </div>
        <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-3.5 py-1.5 rounded-xl font-bold font-mono text-xs">
          ● Shift Active: 8-Hour Runtime
        </span>
      </div>

      {/* Loom Fleet Touch Matrix */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
          Touch-Select Loom Machine
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2.5">
          {looms.map(loom => {
            const isSelected = parseInt(form.loom_id) === loom.id;
            return (
              <button
                key={loom.id}
                type="button"
                onClick={() => setForm({ ...form, loom_id: loom.id })}
                className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md ring-2 ring-indigo-200'
                    : 'bg-slate-50 text-slate-800 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-mono font-bold text-sm">{loom.loom_number}</span>
                  <span className={`w-2 h-2 rounded-full ${loom.status === 'RUNNING' ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                </div>
                <div className="text-[11px] opacity-80 mt-1">
                  {loom.loom_type} • {loom.rated_rpm} RPM
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Shift Log Entry & Live Formula Engine */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Entry Form */}
        <form onSubmit={handleLogShift} className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex justify-between items-center border-b border-slate-200 pb-3">
            <h3 className="font-bold text-slate-900 text-base">
              Shift Pick Counter Entry for {selectedLoom?.loom_number}
            </h3>
            <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
              Rated: {ratedRpm} RPM
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Shift Name</label>
              <select
                value={form.shift_name}
                onChange={e => setForm({ ...form, shift_name: e.target.value })}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900"
              >
                <option value="Shift A (Day)">Shift A (Day: 08:00 to 16:00)</option>
                <option value="Shift B (Evening)">Shift B (Evening: 16:00 to 00:00)</option>
                <option value="Shift C (Night)">Shift C (Night: 00:00 to 08:00)</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Weaver / Operator Name *</label>
              <input
                type="text"
                required
                value={form.operator_name}
                onChange={e => setForm({ ...form, operator_name: e.target.value })}
                placeholder="e.g. Kailash Suthar"
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Start Pick Counter *</label>
              <input
                type="number"
                required
                value={form.start_picks}
                onChange={e => setForm({ ...form, start_picks: parseInt(e.target.value) || 0 })}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm font-bold font-mono text-slate-900"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">End Pick Counter *</label>
              <input
                type="number"
                required
                value={form.end_picks}
                onChange={e => setForm({ ...form, end_picks: parseInt(e.target.value) || 0 })}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm font-bold font-mono text-slate-900"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Downtime Minutes</label>
              <input
                type="number"
                value={form.downtime_minutes}
                onChange={e => setForm({ ...form, downtime_minutes: parseInt(e.target.value) || 0 })}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm font-mono text-slate-900"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Primary Downtime Reason</label>
              <select
                value={form.downtime_reason}
                onChange={e => setForm({ ...form, downtime_reason: e.target.value })}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900"
              >
                <option value="None">None / Smooth Running</option>
                <option value="Warp Stop">Warp Yarn Breakage</option>
                <option value="Weft Stop">Weft Insertion Failure</option>
                <option value="Beam Change">Beam Exhausted / Gaiting</option>
                <option value="Mechanical Jam">Mechanical / Selvedge Jam</option>
                <option value="Electrical Failure">Electrical / Power Outage</option>
              </select>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 flex justify-end">
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-2.5 rounded-xl shadow-xs text-sm cursor-pointer"
            >
              Submit Shift Log & Calculate
            </button>
          </div>
        </form>

        {/* Live Efficiency Gauge Card */}
        <div className="bg-slate-900 text-white rounded-2xl shadow-xl p-6 flex flex-col justify-between space-y-6">
          <div>
            <div className="flex justify-between items-center">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400">Live Mathematical Formula</span>
              <Activity className="w-5 h-5 text-indigo-400 animate-pulse" />
            </div>

            <div className="mt-6 text-center">
              <span className="text-xs text-slate-400 font-semibold uppercase">Computed Shift Efficiency</span>
              <div className="text-5xl font-black font-mono text-emerald-400 mt-2">
                {computedEfficiency}%
              </div>
              <div className="text-xs text-slate-400 mt-2">
                Actual Avg Speed: <strong className="text-white font-mono">{computedActualRpm} RPM</strong>
              </div>
            </div>

            <div className="mt-6 space-y-2 text-xs font-mono bg-slate-800/80 p-3.5 rounded-xl border border-slate-700">
              <div className="flex justify-between text-slate-300">
                <span>Total Shift Picks:</span>
                <span className="font-bold text-white">{totalPicks.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>100% Theoretical Target:</span>
                <span>{expectedPicks.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Shift Runtime:</span>
                <span>{runtime} Minutes</span>
              </div>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 leading-relaxed italic text-center">
            Formula: (Picks Produced) ÷ (Rated RPM × Runtime) × 100
          </p>
        </div>
      </div>

      {/* Shift Logs History Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center gap-2">
          <History className="w-5 h-5 text-indigo-600" />
          <h3 className="font-bold text-sm text-slate-900">Recent Shift Production Logs</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                <th className="p-3.5">Loom #</th>
                <th className="p-3.5">Shift & Date</th>
                <th className="p-3.5">Operator</th>
                <th className="p-3.5 text-right">Start Picks</th>
                <th className="p-3.5 text-right">End Picks</th>
                <th className="p-3.5 text-right">Total Picks</th>
                <th className="p-3.5 text-right">Actual RPM</th>
                <th className="p-3.5 text-right">Efficiency %</th>
                <th className="p-3.5">Downtime</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {shiftLogs.map(log => (
                <tr key={log.id} className="hover:bg-slate-50">
                  <td className="p-3.5 font-mono font-bold text-indigo-700">
                    Loom L-{String(log.loom_id).padStart(2,'0')}
                  </td>
                  <td className="p-3.5">
                    <strong className="text-slate-900 block">{log.shift_name}</strong>
                    <span className="text-[10px] text-slate-400 font-mono">{log.logged_at?.slice(0, 10)}</span>
                  </td>
                  <td className="p-3.5 font-semibold text-slate-700">{log.operator_name}</td>
                  <td className="p-3.5 text-right font-mono">{Number(log.start_picks).toLocaleString()}</td>
                  <td className="p-3.5 text-right font-mono">{Number(log.end_picks).toLocaleString()}</td>
                  <td className="p-3.5 text-right font-mono font-bold text-slate-900">{Number(log.total_picks).toLocaleString()}</td>
                  <td className="p-3.5 text-right font-mono">{log.actual_rpm}</td>
                  <td className="p-3.5 text-right font-mono font-bold">
                    <span className={`px-2 py-0.5 rounded-full ${
                      log.efficiency_percent >= 90 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                      log.efficiency_percent >= 80 ? 'bg-amber-50 text-amber-800 border border-amber-200' :
                      'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}>
                      {log.efficiency_percent}%
                    </span>
                  </td>
                  <td className="p-3.5 text-slate-600">
                    {log.downtime_minutes > 0 ? (
                      <span>{log.downtime_minutes}m ({log.downtime_reason})</span>
                    ) : '0m'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
