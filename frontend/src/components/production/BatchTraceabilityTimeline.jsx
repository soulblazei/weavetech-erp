import React, { useState, useEffect } from 'react';
import { 
  GitCommit, 
  Search, 
  Layers, 
  CheckCircle2, 
  Star, 
  AlertTriangle, 
  Calendar, 
  Clock, 
  User, 
  Scale, 
  Factory, 
  Truck, 
  FileText, 
  Loader2,
  ChevronDown,
  Sparkles,
  ArrowDown
} from 'lucide-react';
import { shopFloorApi } from '../../api/client';

export default function BatchTraceabilityTimeline() {
  const [searchQuery, setSearchQuery] = useState('LOT-2026-CTN40');
  const [traceResult, setTraceResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const executeTrace = async (queryToSearch) => {
    const q = (queryToSearch || searchQuery).trim();
    if (!q) return;
    setIsLoading(true);
    setErrorMessage('');
    try {
      const data = await shopFloorApi.getTraceability(q);
      setTraceResult(data);
    } catch (err) {
      setErrorMessage(err.message || `No batch lineage found for '${q}'.`);
      setTraceResult(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    executeTrace('LOT-2026-CTN40');
  }, []);

  const sampleLots = [
    { label: 'Yarn Inward: LOT-2026-CTN40', code: 'LOT-2026-CTN40' },
    { label: 'Warp Beam: BM-2026-081', code: 'BM-2026-081' },
    { label: 'Woven Taka: TK-2026-101', code: 'TK-2026-101' },
    { label: 'Challan: CHL-2026-0042', code: 'CHL-2026-0042' },
  ];

  return (
    <div className="space-y-6">
      
      {/* Search & Lot Selector Header */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <GitCommit className="w-5 h-5 text-indigo-600" />
              End-to-End Batch Lineage & Traceability Explorer
            </h3>
            <p className="text-xs text-slate-500">
              Query any Yarn Lot, Beam No, Taka Roll No, or Challan No to trace the full 13-stage journey.
            </p>
          </div>

          {/* Quick Preset Buttons */}
          <div className="flex flex-wrap gap-1.5">
            {sampleLots.map(item => (
              <button
                key={item.code}
                type="button"
                onClick={() => {
                  setSearchQuery(item.code);
                  executeTrace(item.code);
                }}
                className={`text-[11px] px-3 py-1.5 rounded-xl font-bold transition cursor-pointer border ${
                  searchQuery === item.code 
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs' 
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Search Bar */}
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            executeTrace();
          }} 
          className="flex gap-2"
        >
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by Yarn Lot, Winding Batch, Beam No, Taka Roll, or Challan..."
              className="w-full h-11 pl-10 pr-4 bg-slate-50 border border-slate-300 rounded-2xl text-xs font-mono font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-100 outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 h-11 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-2xl shadow-xs transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <GitCommit className="w-4 h-4" />}
            Trace Lineage
          </button>
        </form>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs font-bold text-rose-700 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Trace Timeline Results */}
      {traceResult && (
        <div className="space-y-6">
          
          {/* Summary Banner */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-indigo-300 bg-white/10 px-2.5 py-0.5 rounded-full">
                Lineage Tree Verified
              </span>
              <h2 className="text-xl font-black mt-1 font-mono tracking-tight">
                Root Yarn Origin: {traceResult.root_yarn_lot}
              </h2>
              <p className="text-xs text-slate-300 mt-0.5">
                Target Query: <strong className="text-white font-mono">{traceResult.queried_batch_code}</strong> • {traceResult.total_lineage_steps} Sequential Process Steps Logged
              </p>
            </div>

            <div className="flex items-center gap-3 bg-white/10 p-3 rounded-2xl border border-white/10">
              <div className="text-center px-2">
                <span className="text-[10px] uppercase block text-slate-300">Start Process</span>
                <strong className="text-xs font-bold text-emerald-400">Yarn Inward</strong>
              </div>
              <span className="text-slate-400">➔</span>
              <div className="text-center px-2">
                <span className="text-[10px] uppercase block text-slate-300">Final Destination</span>
                <strong className="text-xs font-bold text-indigo-300">Delivery Challan</strong>
              </div>
            </div>
          </div>

          {/* Stepper Timeline Tree */}
          <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 sm:before:left-4 before:top-4 before:bottom-4 before:w-0.5 before:bg-indigo-200">
            {traceResult.timeline.map((step, index) => {
              const isTargetStep = step.batch_code === traceResult.queried_batch_code;
              
              return (
                <div 
                  key={step.id} 
                  className={`relative bg-white rounded-3xl border transition-all p-5 space-y-3 ${
                    isTargetStep 
                      ? 'border-indigo-600 ring-2 ring-indigo-500 shadow-md bg-indigo-50/20' 
                      : 'border-slate-200 shadow-xs hover:border-slate-300'
                  }`}
                >
                  {/* Stepper Node Marker */}
                  <div className={`absolute -left-9 sm:-left-10 top-5 w-6 h-6 rounded-full border-2 flex items-center justify-center text-[10px] font-black ${
                    step.is_quality_alert
                      ? 'bg-rose-500 border-rose-200 text-white'
                      : isTargetStep
                      ? 'bg-indigo-600 border-indigo-200 text-white'
                      : 'bg-emerald-500 border-emerald-200 text-white'
                  }`}>
                    {step.stage_number}
                  </div>

                  {/* Step Header */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-800">
                        Stage {step.stage_number}
                      </span>
                      <h4 className="text-sm font-black text-slate-900">
                        {step.stage_name}
                      </h4>
                      {isTargetStep && (
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-300">
                          ★ Queried Batch
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{new Date(step.created_at).toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Batch Codes and Lineage Linkage */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-3 rounded-2xl text-xs">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">Generated Batch Code</span>
                      <strong className="font-mono text-indigo-700 text-sm">{step.batch_code}</strong>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">Consumed Preceding Batch</span>
                      <strong className="font-mono text-slate-700">
                        {step.preceding_batch_code || 'Root Inward Origin'}
                      </strong>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">Operator & Role</span>
                      <strong className="text-slate-800">
                        {step.operator_name} <span className="text-[10px] text-slate-500">({step.operator_role})</span>
                      </strong>
                    </div>
                  </div>

                  {/* Upstream Handover Quality Rating */}
                  {step.incoming_rating && (
                    <div className={`p-3 rounded-xl border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs ${
                      step.incoming_rating < 3
                        ? 'bg-rose-50 border-rose-200 text-rose-900'
                        : 'bg-amber-50/50 border-amber-200 text-amber-950'
                    }`}>
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5 font-bold">
                          <span>Upstream Acceptance Score:</span>
                          <span className="text-amber-600 font-black">
                            {'★'.repeat(step.incoming_rating)}{'☆'.repeat(5 - step.incoming_rating)} ({step.incoming_rating}/5 Stars)
                          </span>
                        </div>
                        {step.incoming_notes && (
                          <div className="italic text-slate-600">"{step.incoming_notes}"</div>
                        )}
                      </div>

                      {(step.incoming_defects || []).length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {step.incoming_defects.map((d, i) => (
                            <span key={i} className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-800">
                              {d}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Weights & Yield */}
                  {(step.input_weight_kg > 0 || step.output_weight_kg > 0) && (
                    <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-slate-600 pt-1">
                      <span>Input: <strong>{step.input_weight_kg} kg</strong></span>
                      <span>• Output: <strong className="text-slate-900">{step.output_weight_kg} kg</strong></span>
                      {step.waste_weight_kg > 0 && <span>• Waste: <strong className="text-rose-600">{step.waste_weight_kg} kg</strong></span>}
                      {step.input_weight_kg > 0 && step.output_weight_kg > 0 && (
                        <span className="font-bold text-emerald-700">
                          • Yield: {((step.output_weight_kg / step.input_weight_kg) * 100).toFixed(1)}%
                        </span>
                      )}
                    </div>
                  )}

                  {/* Stage-Specific Key Parameter Pills */}
                  {step.stage_data && Object.keys(step.stage_data).length > 0 && (
                    <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-2 text-[11px]">
                      {Object.entries(step.stage_data).map(([key, val]) => (
                        <span key={key} className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-medium">
                          <strong className="capitalize">{key.replace(/_/g, ' ')}:</strong> {typeof val === 'object' ? JSON.stringify(val) : String(val)}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
}
