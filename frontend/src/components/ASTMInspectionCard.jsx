import React, { useState, useMemo } from 'react';
import { 
  Star, 
  ShieldCheck, 
  ShieldAlert, 
  AlertTriangle, 
  Plus, 
  Trash2, 
  ArrowRight, 
  Lock, 
  Unlock, 
  CheckCircle2, 
  Loader2,
  FileSpreadsheet,
  Ruler,
  Layers,
  Activity
} from 'lucide-react';

/**
 * Standard ASTM 4-Point Defect Penalty Definitions
 */
const DEFECT_TYPES = [
  { id: 'slub', label: 'Slub / Thick Yarn', defaultSeverity: 2 },
  { id: 'broken_end', label: 'Broken End (Warp)', defaultSeverity: 4 },
  { id: 'broken_pick', label: 'Missing / Broken Pick', defaultSeverity: 4 },
  { id: 'reed_mark', label: 'Reed Mark / Streak', defaultSeverity: 3 },
  { id: 'oil_stain', label: 'Oil / Loom Grease Stain', defaultSeverity: 2 },
  { id: 'starting_mark', label: 'Starting / Stop Mark', defaultSeverity: 3 },
  { id: 'hole', label: 'Hole / Float / Tear', defaultSeverity: 4 },
  { id: 'selvedge_defect', label: 'Wavy / Tight Selvedge', defaultSeverity: 2 }
];

export default function ASTMInspectionCard({
  batch = {
    id: 'b-9901',
    batch_number: 'BATCH-2026-904',
    item_name: 'Cotton Grey 40s x 40s (60" Width)',
    current_stage_id: 9, // Grey Fabric Inspection
    target_stage_id: 10, // Mending & Cropping
    lot_length_meters: 100,
    width_inches: 60
  },
  operatorId = '00000000-0000-0000-0000-000000000000',
  onHandoverSuccess = () => {}
}) {
  // Roll Parameters
  const [rollNumber, setRollNumber] = useState('ROLL-01');
  const [rollLengthMeters, setRollLengthMeters] = useState('100');
  const [fabricWidthInches, setFabricWidthInches] = useState('60');

  // Defect Log
  const [defects, setDefects] = useState([
    { id: 1, meterMarker: '14.5', defectType: 'slub', penaltyPoints: 2, sizeDesc: '3" to 6" length' },
    { id: 2, meterMarker: '42.0', defectType: 'reed_mark', penaltyPoints: 3, sizeDesc: '6" to 9" streak' }
  ]);

  // Form State for Adding New Defect
  const [newMeterMarker, setNewMeterMarker] = useState('');
  const [newDefectType, setNewDefectType] = useState('slub');
  const [newPenaltyPoints, setNewPenaltyPoints] = useState(2);
  const [markerError, setMarkerError] = useState('');

  // Star Rating (1 to 5) - Strictly required for handover
  const [starRating, setStarRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);

  // Inspector Remarks
  const [remarks, setRemarks] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState(null);
  const [submissionSuccess, setSubmissionSuccess] = useState(null);

  // Strict Decimal Input Guard (Blocking non-numerics and negative numbers)
  const sanitizeDecimal = (val) => {
    // Only allow digits and a single decimal point
    const cleaned = val.replace(/[^0-9.]/g, '');
    const parts = cleaned.split('.');
    if (parts.length > 2) {
      return parts[0] + '.' + parts.slice(1).join('');
    }
    return cleaned;
  };

  // Safe numeric parsing
  const numericLength = Math.max(parseFloat(rollLengthMeters) || 1, 1);
  const numericWidthInches = Math.max(parseFloat(fabricWidthInches) || 1, 1);
  const fabricWidthCm = numericWidthInches * 2.54;

  // Calculate Total Defect Points and ASTM 4-Point Score per 100 sq meters
  const totalPenaltyPoints = useMemo(() => {
    return defects.reduce((acc, d) => acc + (parseInt(d.penaltyPoints, 10) || 0), 0);
  }, [defects]);

  // Points per 100 sq meters = (Total Points * 10000) / (Length in meters * Width in cm)
  const pointsPer100SqM = useMemo(() => {
    const areaFactor = numericLength * fabricWidthCm;
    if (areaFactor <= 0) return 0;
    return Math.round(((totalPenaltyPoints * 10000) / areaFactor) * 100) / 100;
  }, [totalPenaltyPoints, numericLength, fabricWidthCm]);

  // Quality Grade Determination
  const qualityGrade = useMemo(() => {
    if (pointsPer100SqM <= 20) {
      return { grade: 'Grade A', status: 'PASS', color: 'emerald', badge: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
    } else if (pointsPer100SqM <= 40) {
      return { grade: 'Grade B', status: 'CONDITIONAL_PASS', color: 'amber', badge: 'bg-amber-100 text-amber-800 border-amber-300' };
    } else {
      return { grade: 'Grade C / Reject', status: 'FAIL', color: 'red', badge: 'bg-red-100 text-red-800 border-red-300' };
    }
  }, [pointsPer100SqM]);

  // Add Defect Entry Handler
  const handleAddDefect = (e) => {
    e.preventDefault();
    const meterVal = parseFloat(newMeterMarker);

    if (isNaN(meterVal) || meterVal < 0) {
      setMarkerError('Meter marker must be a non-negative number.');
      return;
    }

    if (meterVal > numericLength) {
      setMarkerError(`Meter marker cannot exceed roll length (${numericLength}m).`);
      return;
    }

    setMarkerError('');
    const matchedDefect = DEFECT_TYPES.find(d => d.id === newDefectType);

    setDefects(prev => [
      ...prev,
      {
        id: Date.now(),
        meterMarker: meterVal.toFixed(2),
        defectType: newDefectType,
        penaltyPoints: parseInt(newPenaltyPoints, 10),
        sizeDesc: matchedDefect?.label || 'Defect'
      }
    ]);

    setNewMeterMarker('');
  };

  const handleRemoveDefect = (id) => {
    setDefects(prev => prev.filter(d => d.id !== id));
  };

  // Handover Execution
  const handleExecuteHandover = async () => {
    if (starRating < 1 || starRating > 5) {
      setSubmissionError('Quality star rating (1 to 5) is strictly required to unlock stage handover.');
      return;
    }

    setIsSubmitting(true);
    setSubmissionError(null);
    setSubmissionSuccess(null);

    try {
      const payload = {
        batchId: batch.id,
        fromStage: batch.current_stage_id || 9,
        toStage: batch.target_stage_id || 10,
        operatorId,
        rating: starRating,
        metersTransferred: numericLength,
        defectPayload: {
          rollNumber,
          rollLengthMeters: numericLength,
          fabricWidthInches: numericWidthInches,
          totalPoints: totalPenaltyPoints,
          pointsPer100SqM,
          grade: qualityGrade.grade,
          defectsList: defects
        },
        remarks: remarks || `ASTM 4-Point Roll Inspection: ${qualityGrade.grade} (${pointsPer100SqM} pts/100m²)`
      };

      const response = await fetch('/api/production/handover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || data.detail || 'Stage handover transaction failed');
      }

      setSubmissionSuccess(data.message);
      onHandoverSuccess(data.data);
    } catch (err) {
      setSubmissionError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isHandoverUnlocked = starRating >= 1 && !isSubmitting;

  return (
    <div className="w-full max-w-4xl mx-auto bg-slate-50 border border-slate-200 rounded-3xl shadow-xl overflow-hidden font-sans text-slate-900">
      
      {/* Header Bar */}
      <div className="bg-white px-6 py-5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-indigo-50 text-indigo-600 shadow-sm">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                ASTM 4-Point Roll Inspection
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800">
                Stage 9 → Stage 10
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Batch: <span className="font-mono text-slate-700 font-bold">{batch.batch_number}</span> • {batch.item_name}
            </p>
          </div>
        </div>

        {/* ASTM Grade Pill */}
        <div className="flex items-center gap-3">
          <div className={`px-4 py-2 rounded-2xl border ${qualityGrade.badge} flex items-center gap-2 shadow-sm`}>
            {qualityGrade.status === 'PASS' ? (
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
            ) : qualityGrade.status === 'CONDITIONAL_PASS' ? (
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            ) : (
              <ShieldAlert className="w-5 h-5 text-red-600" />
            )}
            <div>
              <div className="text-xs uppercase font-bold tracking-wider">{qualityGrade.grade}</div>
              <div className="text-[11px] font-mono">{pointsPer100SqM} pts / 100m²</div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        
        {/* Roll Dimensions Section */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              Roll / Piece Tag
            </label>
            <input
              type="text"
              value={rollNumber}
              onChange={(e) => setRollNumber(e.target.value)}
              className="w-full min-h-[48px] px-3.5 rounded-xl border border-slate-300 text-slate-900 font-mono text-sm font-semibold focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              Length (Meters)
            </label>
            <div className="relative">
              <input
                type="text"
                inputMode="decimal"
                value={rollLengthMeters}
                onChange={(e) => setRollLengthMeters(sanitizeDecimal(e.target.value))}
                placeholder="100.0"
                className="w-full min-h-[48px] px-3.5 pr-12 rounded-xl border border-slate-300 text-slate-900 font-mono text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
              <span className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-xs font-bold text-slate-400 pointer-events-none">
                MTRS
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              Width (Inches)
            </label>
            <div className="relative">
              <input
                type="text"
                inputMode="decimal"
                value={fabricWidthInches}
                onChange={(e) => setFabricWidthInches(sanitizeDecimal(e.target.value))}
                placeholder="60"
                className="w-full min-h-[48px] px-3.5 pr-12 rounded-xl border border-slate-300 text-slate-900 font-mono text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
              <span className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-xs font-bold text-slate-400 pointer-events-none">
                INCH
              </span>
            </div>
          </div>
        </div>

        {/* Defect Logger Form */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-indigo-600" />
              <span>Log Visual Defect (ASTM 4-Point System)</span>
            </h3>
            <span className="text-xs text-slate-500 font-medium">Total Points Logged: <strong className="font-mono text-slate-900 text-sm">{totalPenaltyPoints}</strong></span>
          </div>

          <form onSubmit={handleAddDefect} className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Meter Marker (0 - {numericLength}m)
              </label>
              <input
                type="text"
                inputMode="decimal"
                required
                value={newMeterMarker}
                onChange={(e) => {
                  setNewMeterMarker(sanitizeDecimal(e.target.value));
                  setMarkerError('');
                }}
                placeholder="e.g. 34.5"
                className="w-full min-h-[48px] px-3.5 rounded-xl border border-slate-300 text-slate-900 font-mono text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Defect Classification
              </label>
              <select
                value={newDefectType}
                onChange={(e) => {
                  setNewDefectType(e.target.value);
                  const matched = DEFECT_TYPES.find(d => d.id === e.target.value);
                  if (matched) setNewPenaltyPoints(matched.defaultSeverity);
                }}
                className="w-full min-h-[48px] px-3.5 rounded-xl border border-slate-300 text-slate-900 text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              >
                {DEFECT_TYPES.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ASTM Penalty Points
              </label>
              <select
                value={newPenaltyPoints}
                onChange={(e) => setNewPenaltyPoints(parseInt(e.target.value, 10))}
                className="w-full min-h-[48px] px-3.5 rounded-xl border border-slate-300 text-slate-900 text-sm font-bold font-mono focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              >
                <option value={1}>1 Point (Length ≤ 3")</option>
                <option value={2}>2 Points (Length &gt; 3" &amp; ≤ 6")</option>
                <option value={3}>3 Points (Length &gt; 6" &amp; ≤ 9")</option>
                <option value={4}>4 Points (Length &gt; 9" or Hole)</option>
              </select>
            </div>

            <div>
              <button
                type="submit"
                className="w-full min-h-[48px] px-4 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                <span>Add Defect</span>
              </button>
            </div>
          </form>

          {markerError && (
            <p className="text-xs font-semibold text-red-600 flex items-center gap-1">
              <AlertTriangle className="w-4 h-4" />
              <span>{markerError}</span>
            </p>
          )}

          {/* Defect List Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-200 mt-3">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/75 text-slate-700 font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Meter Marker</th>
                  <th className="px-4 py-3">Defect Category</th>
                  <th className="px-4 py-3 text-center">ASTM Penalty</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {defects.length > 0 ? (
                  defects.map((d) => (
                    <tr key={d.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-slate-900">
                        {d.meterMarker} M
                      </td>
                      <td className="px-4 py-3 text-slate-800">
                        {DEFECT_TYPES.find(t => t.id === d.defectType)?.label || d.defectType}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full font-mono font-bold text-xs
                          ${d.penaltyPoints === 4 ? 'bg-red-100 text-red-800' :
                            d.penaltyPoints === 3 ? 'bg-amber-100 text-amber-800' :
                            'bg-indigo-100 text-indigo-800'}
                        `}>
                          {d.penaltyPoints} Pts
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => handleRemoveDefect(d.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                          title="Remove Defect"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-4 py-6 text-center text-slate-400 font-medium">
                      No defects recorded. Roll is zero-defect (Grade A).
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quality Audit & Mandatory Star Rating Handover Section */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                {starRating > 0 ? <Unlock className="w-4 h-4 text-emerald-600" /> : <Lock className="w-4 h-4 text-amber-600" />}
                <span>Stage Handover Quality Gate</span>
                <span className="text-red-500 font-bold">*</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Operator Star Rating is mandatory to unlock the inter-stage handover transaction.
              </p>
            </div>

            {/* Live Lock Pill */}
            <div>
              {starRating > 0 ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Handover Unlocked ({starRating} Stars)</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold">
                  <Lock className="w-3.5 h-3.5" />
                  <span>Locked: Rate Upstream Quality</span>
                </span>
              )}
            </div>
          </div>

          {/* Star Rating Selector */}
          <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">
              Inspector Quality Rating:
            </span>
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setStarRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="min-h-[48px] min-w-[48px] flex items-center justify-center rounded-xl hover:bg-white transition-all focus:outline-none focus:ring-2 focus:ring-amber-400"
                  title={`Rate ${star} Star${star > 1 ? 's' : ''}`}
                >
                  <Star
                    className={`w-7 h-7 transition-colors ${
                      (hoverRating || starRating) >= star
                        ? 'fill-amber-400 text-amber-500'
                        : 'text-slate-300 hover:text-slate-400'
                    }`}
                  />
                </button>
              ))}
            </div>
            <span className="text-xs font-bold font-mono text-slate-600 ml-2">
              {starRating > 0 ? `${starRating} / 5 Stars` : 'Rating Required'}
            </span>
          </div>

          {/* Inspector Remarks */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              Handover Remarks / Defect Notes
            </label>
            <input
              type="text"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="e.g. Mild starting mark at 42m; passed under conditional tolerance."
              className="w-full min-h-[48px] px-3.5 rounded-xl border border-slate-300 text-slate-900 text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
            />
          </div>

          {/* Alerts */}
          {submissionError && (
            <div className="flex items-center gap-2 p-3 text-xs text-red-700 bg-red-50 border border-red-200 rounded-xl">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{submissionError}</span>
            </div>
          )}

          {submissionSuccess && (
            <div className="flex items-center gap-2 p-3 text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{submissionSuccess}</span>
            </div>
          )}

          {/* Transactional Handover Action Button */}
          <button
            type="button"
            disabled={!isHandoverUnlocked}
            onClick={handleExecuteHandover}
            className={`w-full min-h-[52px] rounded-2xl font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2
              ${isHandoverUnlocked 
                ? 'bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white cursor-pointer' 
                : 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300 shadow-none'}
            `}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Executing DB Transaction (BEGIN...COMMIT)...</span>
              </>
            ) : (
              <>
                <span>Commit ASTM Inspection &amp; Transfer to Stage 10</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
