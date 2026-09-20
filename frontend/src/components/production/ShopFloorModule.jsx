import React, { useState, useEffect } from 'react';
import { 
  Factory, 
  BarChart3, 
  GitCommit, 
  ListOrdered, 
  ShieldCheck, 
  Users, 
  Layers, 
  AlertTriangle, 
  Search, 
  Filter, 
  RefreshCw,
  Plus
} from 'lucide-react';
import OperatorStageWizard from './OperatorStageWizard';
import QualityMatrixHeatmap from './QualityMatrixHeatmap';
import BatchTraceabilityTimeline from './BatchTraceabilityTimeline';
import { shopFloorApi, SHOPFLOOR_STAGES } from '../../api/client';

export default function ShopFloorModule({ currentUser }) {
  const [activeTab, setActiveTab] = useState('wizard'); // 'wizard', 'matrix', 'timeline', 'records'
  const [records, setRecords] = useState([]);
  const [stageFilter, setStageFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoadingRecords, setIsLoadingRecords] = useState(false);

  const loadRecords = async () => {
    setIsLoadingRecords(true);
    try {
      const params = {};
      if (stageFilter !== 'ALL') params.stage_number = Number(stageFilter);
      if (searchQuery.trim()) params.search = searchQuery.trim();
      const data = await shopFloorApi.getRecords(params);
      setRecords(data || []);
    } catch (err) {
      console.error("Error loading records:", err);
    } finally {
      setIsLoadingRecords(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'records') {
      loadRecords();
    }
  }, [activeTab, stageFilter, searchQuery]);

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      
      {/* Top Main Tab Navigation */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-1.5 flex flex-wrap gap-1.5">
        <button
          onClick={() => setActiveTab('wizard')}
          className={`flex-1 min-w-[160px] px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
            activeTab === 'wizard'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Factory className="w-4 h-4" />
          <span>1. Operator Process Wizard</span>
        </button>

        <button
          onClick={() => setActiveTab('matrix')}
          className={`flex-1 min-w-[160px] px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
            activeTab === 'matrix'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>2. Supervisor Quality Matrix</span>
        </button>

        <button
          onClick={() => setActiveTab('timeline')}
          className={`flex-1 min-w-[160px] px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
            activeTab === 'timeline'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <GitCommit className="w-4 h-4" />
          <span>3. Traceability Timeline</span>
        </button>

        <button
          onClick={() => setActiveTab('records')}
          className={`flex-1 min-w-[160px] px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
            activeTab === 'records'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <ListOrdered className="w-4 h-4" />
          <span>4. Shop-Floor Ledger</span>
        </button>
      </div>

      {/* View 1: Operator Production Wizard */}
      {activeTab === 'wizard' && (
        <OperatorStageWizard 
          currentUser={currentUser} 
          onRecordCreated={() => {
            if (activeTab === 'records') loadRecords();
          }} 
        />
      )}

      {/* View 2: Supervisor Quality Matrix */}
      {activeTab === 'matrix' && <QualityMatrixHeatmap />}

      {/* View 3: Batch Traceability Timeline */}
      {activeTab === 'timeline' && <BatchTraceabilityTimeline />}

      {/* View 4: Complete Shop-Floor Process Records Feed */}
      {activeTab === 'records' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden space-y-4 p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <ListOrdered className="w-5 h-5 text-indigo-600" />
                Shop-Floor Transformation Ledger ({records.length} Records)
              </h3>
              <p className="text-xs text-slate-500">
                All 13-stage material handovers, operator submissions, and quality ratings.
              </p>
            </div>

            {/* Filter and Search Bar */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={stageFilter}
                onChange={e => setStageFilter(e.target.value)}
                className="h-10 px-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold"
              >
                <option value="ALL">All 13 Stages</option>
                {SHOPFLOOR_STAGES.map(s => (
                  <option key={s.stage_number} value={s.stage_number}>
                    Stage {s.stage_number}: {s.stage_name}
                  </option>
                ))}
              </select>

              <button
                onClick={loadRecords}
                className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
                title="Refresh Records"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="p-3.5">Stage & Number</th>
                  <th className="p-3.5">Batch Code & Root Lot</th>
                  <th className="p-3.5">Preceding Batch</th>
                  <th className="p-3.5">Operator</th>
                  <th className="p-3.5">Incoming Rating</th>
                  <th className="p-3.5">Weights (In/Out/Waste)</th>
                  <th className="p-3.5">Logged At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {records.map(rec => (
                  <tr key={rec.id} className="hover:bg-slate-50 transition">
                    <td className="p-3.5">
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-800">
                        Stage {rec.stage_number}
                      </span>
                      <strong className="text-slate-900 block mt-1">{rec.stage_name}</strong>
                    </td>

                    <td className="p-3.5">
                      <span className="font-mono font-bold text-indigo-700 block">{rec.batch_code}</span>
                      <span className="text-[10px] text-slate-500 font-mono">Lot: {rec.root_yarn_lot}</span>
                    </td>

                    <td className="p-3.5 font-mono text-slate-700">
                      {rec.preceding_batch_code || <span className="text-slate-400 italic">Root Inward</span>}
                    </td>

                    <td className="p-3.5">
                      <strong className="text-slate-900 block">{rec.operator_name}</strong>
                      <span className="text-[10px] text-slate-500">{rec.operator_role}</span>
                    </td>

                    <td className="p-3.5">
                      {rec.incoming_rating ? (
                        <div className="flex items-center gap-1">
                          <span className={`font-bold text-xs ${rec.incoming_rating < 3 ? 'text-rose-600' : 'text-amber-600'}`}>
                            {'★'.repeat(rec.incoming_rating)} ({rec.incoming_rating}/5)
                          </span>
                          {rec.is_quality_alert && (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-rose-100 text-rose-800 ml-1">
                              ALERT
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Initial Gate</span>
                      )}
                    </td>

                    <td className="p-3.5 font-mono text-slate-800">
                      <div>In: {rec.input_weight_kg || 0} kg</div>
                      <div className="text-[11px] text-slate-500">Out: {rec.output_weight_kg || 0} kg • W: {rec.waste_weight_kg || 0} kg</div>
                    </td>

                    <td className="p-3.5 text-slate-500 text-[11px]">
                      {new Date(rec.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
                {records.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-400 italic">
                      No shop-floor transformation records matching criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
