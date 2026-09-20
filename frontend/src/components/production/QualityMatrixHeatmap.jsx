import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  AlertTriangle, 
  CheckCircle2, 
  Star, 
  ShieldAlert, 
  TrendingUp, 
  Sparkles, 
  Layers, 
  Check, 
  X, 
  Loader2, 
  RefreshCw,
  Clock,
  ArrowRight,
  UserCheck
} from 'lucide-react';
import { shopFloorApi } from '../../api/client';

export default function QualityMatrixHeatmap() {
  const [matrixData, setMatrixData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [resolvingAlert, setResolvingAlert] = useState(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [isSubmittingResolution, setIsSubmittingResolution] = useState(false);

  const loadMatrix = async () => {
    setIsLoading(true);
    try {
      const data = await shopFloorApi.getQualityMatrix();
      setMatrixData(data);
    } catch (err) {
      console.error("Error loading quality matrix:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMatrix();
  }, []);

  const handleResolveAlert = async (e) => {
    e.preventDefault();
    if (!resolvingAlert || !resolutionNotes.trim()) return;
    setIsSubmittingResolution(true);
    try {
      await shopFloorApi.resolveAlert(resolvingAlert.id, resolutionNotes);
      setResolvingAlert(null);
      setResolutionNotes('');
      loadMatrix();
    } catch (err) {
      alert("Error resolving quality alert: " + (err.message || 'Unknown error'));
    } finally {
      setIsSubmittingResolution(false);
    }
  };

  const getHeatmapColor = (score) => {
    if (!score || score >= 4.5) return 'bg-emerald-500 text-white';
    if (score >= 4.0) return 'bg-emerald-400 text-slate-900';
    if (score >= 3.0) return 'bg-amber-400 text-slate-900';
    return 'bg-rose-500 text-white animate-pulse';
  };

  if (isLoading && !matrixData) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-500 flex items-center justify-center gap-2">
        <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
        <span>Computing Plant-Wide Handover Quality Ratings Matrix...</span>
      </div>
    );
  }

  if (!matrixData) return null;

  return (
    <div className="space-y-6">
      
      {/* Top Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-2">
          <span className="text-xs font-bold text-slate-500 uppercase">Overall Plant Health</span>
          <div className="text-2xl font-black text-emerald-600 font-mono">
            {matrixData.overall_health_score}%
          </div>
          <span className="text-[11px] text-emerald-700 font-bold block">Passing Handover Gates</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-2">
          <span className="text-xs font-bold text-slate-500 uppercase">Total Logged Handovers</span>
          <div className="text-2xl font-black text-slate-900 font-mono">
            {matrixData.total_handovers}
          </div>
          <span className="text-[11px] text-indigo-600 font-bold block">{matrixData.high_rating_count} Rated 4-5 Stars</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-2">
          <span className="text-xs font-bold text-slate-500 uppercase">Unresolved Low-Score Alerts</span>
          <div className="text-2xl font-black text-rose-600 font-mono">
            {matrixData.unresolved_alerts.length}
          </div>
          <span className="text-[11px] text-rose-700 font-bold block">Ratings &lt; 3.0 Stars</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-2">
          <span className="text-xs font-bold text-slate-500 uppercase">Top Defect Root</span>
          <div className="text-lg font-black text-slate-900 truncate">
            {matrixData.top_defects[0]?.defect || 'None Reported'}
          </div>
          <span className="text-[11px] text-slate-500 font-bold block">
            {matrixData.top_defects[0]?.count ? `${matrixData.top_defects[0].count} Instances` : 'Zero Defect Run'}
          </span>
        </div>
      </div>

      {/* Stage-to-Stage Handover Quality Heatmap */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden p-6 space-y-5">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-indigo-600" />
              Stage-to-Stage Material Handover Rating Heatmap
            </h3>
            <p className="text-xs text-slate-500">
              Average internal acceptance scores (1.0 - 5.0) logged by downstream operators before starting work.
            </p>
          </div>
          <button
            onClick={loadMatrix}
            className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition cursor-pointer"
            title="Refresh Matrix"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Heatmap Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
          {matrixData.stage_ratings.map(stg => (
            <div 
              key={stg.stage_number} 
              className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3 hover:shadow-md transition"
            >
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-slate-200 text-slate-700">
                  Stage {stg.stage_number} Gate
                </span>
                <div className={`px-2.5 py-1 rounded-xl text-xs font-black font-mono shadow-xs ${getHeatmapColor(stg.avg_rating)}`}>
                  ★ {stg.avg_rating} / 5.0
                </div>
              </div>

              <div>
                <strong className="text-xs font-bold text-slate-900 block leading-snug">
                  {stg.stage_name}
                </strong>
                <span className="text-[10px] text-slate-500 block line-clamp-1 mt-0.5">
                  {stg.rating_subject}
                </span>
              </div>

              <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-[11px]">
                <span className="text-slate-600">Handovers: <strong>{stg.total_ratings}</strong></span>
                {stg.alerts_count > 0 ? (
                  <span className="text-[10px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full">
                    {stg.alerts_count} Alerts
                  </span>
                ) : (
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                    ✓ Clean
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Unresolved Quality Alerts Queue */}
      {matrixData.unresolved_alerts.length > 0 && (
        <div className="bg-rose-50/60 border-2 border-rose-200 rounded-3xl p-6 space-y-4 shadow-sm">
          <div className="flex items-center gap-2 text-rose-950">
            <ShieldAlert className="w-5 h-5 text-rose-600" />
            <h3 className="text-base font-black">
              Flagged Handover Quality Alerts ({matrixData.unresolved_alerts.length} Requiring Supervisor Sign-Off)
            </h3>
          </div>

          <div className="space-y-3">
            {matrixData.unresolved_alerts.map(alert => (
              <div 
                key={alert.id}
                className="bg-white rounded-2xl border border-rose-300 p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-black text-rose-700 bg-rose-100 px-2 py-0.5 rounded-md">
                      {alert.batch_code}
                    </span>
                    <span className="text-xs font-bold text-slate-900">
                      {alert.stage_name} (Stage {alert.stage_number})
                    </span>
                    <span className="text-xs font-black text-rose-600">
                      {'★'.repeat(alert.incoming_rating)} ({alert.incoming_rating}/5 Stars)
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 italic">
                    "{alert.incoming_notes || 'No remarks provided'}"
                  </p>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {(alert.incoming_defects || []).map((d, i) => (
                      <span key={i} className="text-[10px] font-bold px-2 py-0.5 bg-rose-50 text-rose-800 rounded-md border border-rose-200">
                        • {d}
                      </span>
                    ))}
                    <span className="text-[11px] text-slate-500 ml-2">
                      Reported by: <strong>{alert.operator_name}</strong> ({alert.operator_role})
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setResolvingAlert(alert)}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer flex items-center gap-1.5 shrink-0"
                >
                  <UserCheck className="w-4 h-4" />
                  Supervisor Sign-Off & Resolve
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Defect Pareto Frequency List */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-indigo-600" />
          Plant-Wide Defect Frequency Breakdown
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {matrixData.top_defects.map((item, idx) => (
            <div key={idx} className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex justify-between items-center">
              <span className="text-xs font-semibold text-slate-800">{item.defect}</span>
              <span className="text-xs font-mono font-bold px-2 py-0.5 bg-rose-100 text-rose-800 rounded-md">
                {item.count}
              </span>
            </div>
          ))}
          {matrixData.top_defects.length === 0 && (
            <div className="col-span-4 text-center text-xs text-slate-400 py-3 italic">
              Zero defects logged across all handovers.
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL: SUPERVISOR RESOLUTION SIGN-OFF */}
      {/* ========================================================================= */}
      {resolvingAlert && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="bg-rose-600 px-6 py-4 text-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-rose-200" />
                <h3 className="text-base font-bold">Supervisor Quality Alert Resolution</h3>
              </div>
              <button 
                type="button" 
                onClick={() => setResolvingAlert(null)}
                className="text-white/80 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleResolveAlert} className="p-6 space-y-4">
              <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-xs text-rose-900 space-y-1">
                <div>Batch: <strong>{resolvingAlert.batch_code}</strong> ({resolvingAlert.stage_name})</div>
                <div>Operator Feedback: <em>"{resolvingAlert.incoming_notes}"</em></div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Supervisor Corrective Action & Authorization Notes *
                </label>
                <textarea
                  rows={3}
                  required
                  value={resolutionNotes}
                  onChange={e => setResolutionNotes(e.target.value)}
                  placeholder="Detail machine adjustments, speed throttling, or corrective measures taken before releasing batch..."
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-rose-100"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setResolvingAlert(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingResolution}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  {isSubmittingResolution && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Authorize & Close Alert
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
