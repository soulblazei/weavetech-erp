import React, { useState, useMemo } from 'react';
import { 
  Star, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle, 
  Lock, 
  Unlock, 
  Layers, 
  Activity, 
  Loader2, 
  CheckSquare, 
  Square,
  Sparkles,
  Wifi,
  WifiOff
} from 'lucide-react';
import { useRealtimeSync } from '../hooks/useRealtimeSync';

/**
 * 13 Sequential Shop-Floor Production Stages
 */
const PRODUCTION_STAGES = [
  { id: 1, name: 'Yarn Purchase / Inward', shortCode: 'YARN_IN' },
  { id: 2, name: 'Winding & Doubling', shortCode: 'WINDING' },
  { id: 3, name: 'Warping & Creeling', shortCode: 'WARPING' },
  { id: 4, name: 'Sizing & Beam Preparation', shortCode: 'SIZING' },
  { id: 5, name: 'Drawing-in & Denting', shortCode: 'DENTING' },
  { id: 6, name: 'Loom Gaiting & Knotting', shortCode: 'GAITING' },
  { id: 7, name: 'Weaving / Loom Shed', shortCode: 'WEAVING' },
  { id: 8, name: 'Doffing & Roll Numbering', shortCode: 'DOFFING' },
  { id: 9, name: 'Grey Fabric Inspection (ASTM 4-Point)', shortCode: 'QC_INSPECT' },
  { id: 10, name: 'Mending & Cropping', shortCode: 'MENDING' },
  { id: 11, name: 'Folding, Rolling & Lapping', shortCode: 'FOLDING' },
  { id: 12, name: 'Packaging, Baling & Weighting', shortCode: 'PACKING' },
  { id: 13, name: 'Finished Warehouse / Dispatch', shortCode: 'DISPATCH' }
];

/**
 * Common Textile Defect Checklist for Handover Audits
 */
const DEFECT_CHECKLIST = [
  { id: 'count_variation', label: 'Count / Denier Variation' },
  { id: 'tension_fault', label: 'Warp Tension Fault / Slack Ends' },
  { id: 'reed_marks', label: 'Reed Marks / Streaks' },
  { id: 'broken_picks', label: 'Missing / Broken Picks' },
  { id: 'oil_stains', label: 'Loom Oil / Grease Stains' },
  { id: 'slub_floats', label: 'Slub / Weft Float' }
];

export default function StageHandoverCard({
  batch = {
    id: 'b-1001',
    batch_number: 'BATCH-2026-088',
    item_name: 'Cotton Grey 40s x 40s (60" Width)',
    current_stage_id: 7, // Weaving / Loom Shed
    current_stage: 'Weaving / Loom Shed',
    produced_meters: 450.0,
    target_meters: 1000.0,
    status: 'ACTIVE'
  },
  operatorId = '00000000-0000-0000-0000-000000000000',
  onHandoverSuccess = () => {}
}) {
  // Real-time synchronization state over factory LAN
  const { isConnected } = useRealtimeSync({
    eventTypes: ['HANDOVER_COMPLETED', 'BATCH_UPDATED'],
    onEvent: (event) => {
      if (event.delta?.batchId === batch.id) {
        // In-place refresh notification
        console.log('[LAN Realtime Delta]: Batch updated on another terminal', event.delta);
      }
    }
  });

  const [fromStageId, setFromStageId] = useState(batch.current_stage_id || 7);
  const [toStageId, setToStageId] = useState(Math.min((batch.current_stage_id || 7) + 1, 13));
  const [metersTransferred, setMetersTransferred] = useState('100.0');
  const [starRating, setStarRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [selectedDefects, setSelectedDefects] = useState([]);
  const [remarks, setRemarks] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Strict numeric decimal sanitizer (eliminates soft keyboard zero padding issues)
  const sanitizeDecimal = (val) => {
    const cleaned = val.replace(/[^0-9.]/g, '');
    const parts = cleaned.split('.');
    return parts.length > 2 ? parts[0] + '.' + parts.slice(1).join('') : cleaned;
  };

  const toggleDefect = (defectId) => {
    setSelectedDefects(prev => 
      prev.includes(defectId) ? prev.filter(id => id !== defectId) : [...prev, defectId]
    );
  };

  const handleExecuteHandover = async () => {
    if (starRating < 1 || starRating > 5) {
      setErrorMsg('Quality star rating (1 to 5) is mandatory to clear handover lock.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const payload = {
        batchId: batch.id,
        fromStage: fromStageId,
        toStage: toStageId,
        operatorId,
        rating: starRating,
        metersTransferred: parseFloat(metersTransferred) || 0,
        defectPayload: {
          checkedDefects: selectedDefects,
          inspectorRating: starRating,
          batchNumber: batch.batch_number
        },
        remarks: remarks.trim()
      };

      const res = await fetch('/api/production/handover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || json.detail || 'Handover failed');
      }

      setSuccessMsg(json.message);
      onHandoverSuccess(json.data);
      // Reset form state
      setStarRating(0);
      setSelectedDefects([]);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isUnlocked = starRating >= 1 && !isSubmitting;
  const currentStageName = PRODUCTION_STAGES.find(s => s.id === fromStageId)?.name || `Stage ${fromStageId}`;
  const targetStageName = PRODUCTION_STAGES.find(s => s.id === toStageId)?.name || `Stage ${toStageId}`;

  return (
    <div className="w-full max-w-4xl mx-auto bg-slate-50 border border-slate-300 rounded-3xl shadow-xl overflow-hidden text-slate-900">
      
      {/* Header Bar */}
      <div className="bg-white px-6 py-5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                Shop-Floor Handover &amp; Quality Gate
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800">
                13-Stage Pipeline
              </span>
            </div>
            <p className="text-xs font-medium text-slate-500">
              Batch: <span className="font-mono text-slate-800 font-bold">{batch.batch_number}</span> • {batch.item_name}
            </p>
          </div>
        </div>

        {/* Real-time LAN Sync Indicator */}
        <div className="flex items-center gap-2">
          {isConnected ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 text-xs font-bold">
              <Wifi className="w-3.5 h-3.5 text-emerald-600" />
              <span>LAN Live Sync Active</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-300 text-xs font-bold">
              <WifiOff className="w-3.5 h-3.5 text-amber-600" />
              <span>Reconnecting LAN...</span>
            </span>
          )}
        </div>
      </div>

      <div className="p-6 space-y-6">
        
        {/* Stage Advancement Stepper (48px Touch Selection) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              From Origin Stage (Current)
            </label>
            <select
              value={fromStageId}
              onChange={(e) => {
                const newFrom = parseInt(e.target.value, 10);
                setFromStageId(newFrom);
                if (toStageId <= newFrom) setToStageId(Math.min(newFrom + 1, 13));
              }}
              className="w-full min-h-[48px] h-12 px-4 rounded-xl border border-slate-300 text-slate-900 font-bold text-sm bg-slate-50 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20"
            >
              {PRODUCTION_STAGES.map((stg) => (
                <option key={stg.id} value={stg.id}>
                  Stage {stg.id}: {stg.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              To Target Stage (Handover)
            </label>
            <select
              value={toStageId}
              onChange={(e) => setToStageId(parseInt(e.target.value, 10))}
              className="w-full min-h-[48px] h-12 px-4 rounded-xl border border-indigo-300 text-indigo-900 font-bold text-sm bg-indigo-50/50 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20"
            >
              {PRODUCTION_STAGES.filter(stg => stg.id > fromStageId).map((stg) => (
                <option key={stg.id} value={stg.id}>
                  Stage {stg.id}: {stg.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Meters Transfer with Mobile Soft Keyboard Guard */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
            Meters Transferred / Doffed
          </label>
          <div className="relative max-w-sm">
            <input
              type="text"
              inputMode="decimal"
              value={metersTransferred}
              onChange={(e) => setMetersTransferred(sanitizeDecimal(e.target.value))}
              placeholder="100.0"
              className="w-full min-h-[48px] h-12 px-4 pr-16 rounded-xl border border-slate-300 text-slate-900 font-mono text-lg font-bold focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20"
            />
            <span className="absolute inset-y-0 right-0 pr-4 flex items-center text-xs font-bold text-slate-400 pointer-events-none">
              MTRS
            </span>
          </div>
        </div>

        {/* Quality Defect Checklist (48px Touch Targets) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-600" />
              <span>Visual Defect Inspection Checklist</span>
            </h3>
            <span className="text-xs font-semibold text-slate-500">
              {selectedDefects.length} Issues Flagged
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {DEFECT_CHECKLIST.map((defect) => {
              const isChecked = selectedDefects.includes(defect.id);
              return (
                <button
                  key={defect.id}
                  type="button"
                  onClick={() => toggleDefect(defect.id)}
                  className={`min-h-[48px] px-4 py-3 rounded-xl border text-left flex items-center gap-3 transition-colors select-none
                    ${isChecked 
                      ? 'bg-amber-50 border-amber-300 text-amber-900 font-bold' 
                      : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700 font-medium'}
                  `}
                >
                  {isChecked ? (
                    <CheckSquare className="w-5 h-5 text-amber-600 shrink-0" />
                  ) : (
                    <Square className="w-5 h-5 text-slate-400 shrink-0" />
                  )}
                  <span className="text-sm leading-tight">{defect.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Upstream Star Rating Gate (Mandatory 1-5 Stars) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                {starRating > 0 ? <Unlock className="w-4 h-4 text-emerald-600" /> : <Lock className="w-4 h-4 text-amber-600" />}
                <span>Mandatory Quality Rating Gate</span>
                <span className="text-red-500 font-bold">*</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Upstream rating required to authorize batch progression in database ledger.
              </p>
            </div>

            <div>
              {starRating > 0 ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Gate Unlocked ({starRating} Stars)</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-300 text-amber-800 text-xs font-bold">
                  <Lock className="w-3.5 h-3.5" />
                  <span>Gate Locked</span>
                </span>
              )}
            </div>
          </div>

          {/* Star Rating Buttons with 48px Touch Targets */}
          <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-200">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setStarRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="min-h-[48px] min-w-[48px] flex items-center justify-center rounded-xl hover:bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400"
                title={`Rate ${star} Star${star > 1 ? 's' : ''}`}
              >
                <Star
                  className={`w-8 h-8 transition-colors ${
                    (hoverRating || starRating) >= star
                      ? 'fill-amber-400 text-amber-500'
                      : 'text-slate-300 hover:text-slate-400'
                  }`}
                />
              </button>
            ))}
            <span className="text-sm font-mono font-bold text-slate-700 ml-3">
              {starRating > 0 ? `${starRating} / 5 Stars` : 'Tap star to unlock'}
            </span>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Handover Remarks (Optional)
            </label>
            <input
              type="text"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="e.g. Cleared with minor weft tension adjustment."
              className="w-full min-h-[48px] h-12 px-4 rounded-xl border border-slate-300 text-slate-900 text-sm font-medium focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          {errorMsg && (
            <div className="flex items-center gap-2 p-3 text-xs font-bold text-red-700 bg-red-50 border border-red-200 rounded-xl">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="flex items-center gap-2 p-3 text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Handover Action Button (Min 52px Touch Target) */}
          <button
            type="button"
            disabled={!isUnlocked}
            onClick={handleExecuteHandover}
            className={`w-full min-h-[52px] h-13 rounded-2xl font-bold text-base transition-colors flex items-center justify-center gap-2 shadow-md
              ${isUnlocked 
                ? 'bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white cursor-pointer' 
                : 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300 shadow-none'}
            `}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Committing DB Transaction &amp; Broadcasting Delta...</span>
              </>
            ) : (
              <>
                <span>Advance {batch.batch_number} to {targetStageName}</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
