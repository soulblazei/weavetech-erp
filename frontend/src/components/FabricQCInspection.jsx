import React, { useState, useMemo } from 'react';
import { CheckCircle, AlertTriangle, XCircle, Printer, Plus, Trash2, Layers, Ruler, Scale, QrCode, RefreshCw, Eye, Sparkles, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useQCInspection } from '../hooks/useQCInspection';

const WEAVING_DEFECT_TYPES = [
  { id: 'warp_float', name: 'Warp Float / Flaw' },
  { id: 'missing_end', name: 'Missing End / Broken Warp' },
  { id: 'weft_crack', name: 'Crack / Starting Mark' },
  { id: 'slub_knot', name: 'Thick Slub / Big Knot' },
  { id: 'reed_mark', name: 'Reed Mark / Dent Mark' },
  { id: 'oil_stain', name: 'Loom Oil / Grease Spot' },
  { id: 'hole_tear', name: 'Hole / Torn Selvage' },
  { id: 'double_pick', name: 'Double Pick / Mispick' },
];

export default function FabricQCInspection() {
  const { submitRollInspection, isSubmitting, submitError, clearError } = useQCInspection();
  const [saveSuccessNotification, setSaveSuccessNotification] = useState(false);

  const [rollData, setRollData] = useState({
    pieceNumber: `G-L04-${Date.now().toString().slice(-5)}`,
    loomNumber: 'L-04',
    sortNumber: 'SORT-60x60-92x88-63',
    beamNumber: 'BM-2026-881',
    grossLengthMeters: 102.5,
    widthInches: 63.0,
    netWeightKg: 14.8,
    inspectorName: 'Ramesh Patel (QC-02)',
  });

  const [defects, setDefects] = useState([]);
  const [currentDefectType, setCurrentDefectType] = useState(WEAVING_DEFECT_TYPES[0].name);
  const [selectedPoints, setSelectedPoints] = useState(1);
  const [defectMeterLocation, setDefectMeterLocation] = useState(12.0);

  const qcMetrics = useMemo(() => {
    const totalPoints = defects.reduce((sum, d) => sum + d.points, 0);
    const lengthM = Number(rollData.grossLengthMeters) || 1;
    const widthM = (Number(rollData.widthInches) || 63) * 0.0254;
    const totalSqMeters = lengthM * widthM;
    
    const pointsPer100SqM = totalSqMeters > 0 
      ? Number(((totalPoints * 100) / totalSqMeters).toFixed(2))
      : 0;

    let grade = 'FRESH';
    let gradeColor = 'text-emerald-700 bg-emerald-100 border-emerald-300';
    
    if (pointsPer100SqM > 28.0 && pointsPer100SqM <= 45.0) {
      grade = 'SECONDS';
      gradeColor = 'text-amber-700 bg-amber-100 border-amber-300';
    } else if (pointsPer100SqM > 45.0) {
      grade = 'REJECTION';
      gradeColor = 'text-rose-700 bg-rose-100 border-rose-300';
    }

    const calculatedGsm = ((Number(rollData.netWeightKg) * 1000) / totalSqMeters).toFixed(1);

    return { totalPoints, totalSqMeters: totalSqMeters.toFixed(2), pointsPer100SqM, grade, gradeColor, calculatedGsm };
  }, [defects, rollData]);

  const handleAddDefect = () => {
    if (!currentDefectType) return;
    setDefects([{
      id: Date.now(),
      type: currentDefectType,
      meterLocation: Number(defectMeterLocation) || 0,
      points: Number(selectedPoints),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }, ...defects]);
  };

  const handleRemoveDefect = (id) => {
    setDefects(defects.filter((d) => d.id !== id));
  };

  const handlePrintTagAndSave = async () => {
    clearError();
    setSaveSuccessNotification(false);

    const result = await submitRollInspection(rollData, qcMetrics, defects);
    if (result.success) {
      setSaveSuccessNotification(true);
      setTimeout(() => window.print(), 250);
      setTimeout(() => setSaveSuccessNotification(false), 4000);
    }
  };

  const handleResetForNextRoll = () => {
    setRollData({
      ...rollData,
      pieceNumber: `G-L04-${Date.now().toString().slice(-5)}`,
      grossLengthMeters: 100.0,
      netWeightKg: 14.5,
    });
    setDefects([]);
    setDefectMeterLocation(0);
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 p-3 sm:p-5 font-sans select-none">
      {submitError && (
        <div className="mb-4 bg-rose-50 border border-rose-200 text-rose-800 px-4 py-3 rounded-xl flex items-center justify-between text-xs font-semibold">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600" />
            <span>Sync Error: {submitError}</span>
          </div>
          <button onClick={handlePrintTagAndSave} className="bg-rose-600 text-white px-2.5 py-1 rounded">Retry</button>
        </div>
      )}

      {saveSuccessNotification && (
        <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl flex items-center gap-2 text-xs font-semibold">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Roll {rollData.pieceNumber} saved and queued for print!</span>
        </div>
      )}

      {/* HEADER */}
      <header className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className="bg-indigo-600 text-white text-[10px] font-bold px-2 py-0.5 rounded">FLOOR QC</span>
          <h1 className="text-lg font-black text-slate-800 mt-1">Grey 4-Point Roll Inspection</h1>
          <p className="text-xs text-slate-500">Inspector: <strong>{rollData.inspectorName}</strong></p>
        </div>

        <div className="flex items-center gap-3">
          <div className={`px-3 py-1.5 rounded-xl border flex items-center gap-2 ${qcMetrics.gradeColor}`}>
            {qcMetrics.grade === 'FRESH' && <CheckCircle className="w-5 h-5" />}
            {qcMetrics.grade === 'SECONDS' && <AlertTriangle className="w-5 h-5" />}
            {qcMetrics.grade === 'REJECTION' && <XCircle className="w-5 h-5" />}
            <div>
              <p className="text-[10px] font-bold uppercase">Grade</p>
              <p className="text-lg font-black">{qcMetrics.grade}</p>
            </div>
          </div>
          <div className="bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-center">
            <p className="text-[10px] font-bold text-slate-500 uppercase">Pts / 100m²</p>
            <p className="text-lg font-black text-indigo-700">{qcMetrics.pointsPer100SqM}</p>
          </div>
        </div>
      </header>

      {/* TWO COLUMN WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* LEFT COLUMN: Inputs */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4">
            <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-indigo-600" /> Roll Specifications
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div>
                <label className="text-[11px] font-semibold text-slate-500">Barcode</label>
                <input type="text" value={rollData.pieceNumber} readOnly className="w-full bg-slate-100 font-mono text-xs font-bold p-2 rounded-lg border border-slate-200" />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-500">Loom No</label>
                <input type="text" value={rollData.loomNumber} onChange={(e) => setRollData({...rollData, loomNumber: e.target.value})} className="w-full font-bold text-xs p-2 rounded-lg border border-slate-300" />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-500">Sort No</label>
                <input type="text" value={rollData.sortNumber} onChange={(e) => setRollData({...rollData, sortNumber: e.target.value})} className="w-full font-bold text-xs p-2 rounded-lg border border-slate-300" />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-500">Beam No</label>
                <input type="text" value={rollData.beamNumber} onChange={(e) => setRollData({...rollData, beamNumber: e.target.value})} className="w-full font-bold text-xs p-2 rounded-lg border border-slate-300" />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2.5 mt-3 pt-3 border-t border-slate-100">
              <div>
                <label className="text-[11px] font-semibold text-slate-500 flex items-center gap-1"><Ruler className="w-3 h-3" /> Length (m)</label>
                <input type="number" step="0.1" value={rollData.grossLengthMeters} onChange={(e) => setRollData({...rollData, grossLengthMeters: parseFloat(e.target.value) || 0})} className="w-full text-sm font-bold p-2 bg-indigo-50/50 rounded-lg border border-indigo-200" />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-500">Width (in)</label>
                <input type="number" step="0.5" value={rollData.widthInches} onChange={(e) => setRollData({...rollData, widthInches: parseFloat(e.target.value) || 0})} className="w-full text-sm font-bold p-2 bg-indigo-50/50 rounded-lg border border-indigo-200" />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-500 flex items-center gap-1"><Scale className="w-3 h-3" /> Weight (kg)</label>
                <input type="number" step="0.1" value={rollData.netWeightKg} onChange={(e) => setRollData({...rollData, netWeightKg: parseFloat(e.target.value) || 0})} className="w-full text-sm font-bold p-2 bg-indigo-50/50 rounded-lg border border-indigo-200" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4">
            <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-indigo-600" /> Log Defect
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
              {WEAVING_DEFECT_TYPES.map((d) => (
                <button
                  key={d.id}
                  onClick={() => setCurrentDefectType(d.name)}
                  className={`p-2.5 text-xs font-bold rounded-xl border text-left ${
                    currentDefectType === d.name ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                >
                  {d.name}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-end">
              <div className="sm:col-span-8">
                <label className="text-[11px] font-bold text-slate-600 block mb-1">ASTM Demerit Points</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {[1, 2, 3, 4].map((pt) => (
                    <button
                      key={pt}
                      type="button"
                      onClick={() => setSelectedPoints(pt)}
                      className={`py-2 rounded-xl font-bold border text-center ${
                        selectedPoints === pt ? 'bg-amber-500 text-white border-amber-600' : 'bg-slate-50 text-slate-800 border-slate-200'
                      }`}
                    >
                      {pt} PT
                    </button>
                  ))}
                </div>
              </div>
              <div className="sm:col-span-4">
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Meter Mark</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    step="0.5"
                    value={defectMeterLocation}
                    onChange={(e) => setDefectMeterLocation(e.target.value)}
                    className="w-full text-base font-bold p-2 rounded-xl border border-slate-300"
                  />
                  <button onClick={handleAddDefect} className="bg-indigo-600 text-white p-2 rounded-xl"><Plus className="w-5 h-5" /></button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Logs & Printable Sticker */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 flex flex-col h-[260px]">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xs font-bold text-slate-700 uppercase">Defect Log ({defects.length})</h2>
              <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">Total: {qcMetrics.totalPoints} pts</span>
            </div>
            <div className="overflow-y-auto flex-1 divide-y divide-slate-100 pr-1 text-xs">
              {defects.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400"><Sparkles className="w-6 h-6 mb-1" /> No defects logged.</div>
              ) : (
                defects.map((d) => (
                  <div key={d.id} className="py-1.5 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-800">{d.type}</p>
                      <p className="text-[10px] text-slate-500">At {d.meterLocation}m • {d.timestamp}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold px-1.5 py-0.5 bg-amber-100 text-amber-800 rounded">+{d.points} pt</span>
                      <button onClick={() => handleRemoveDefect(d.id)} className="text-slate-400 hover:text-rose-600"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4">
            {/* THERMAL TAG */}
            <div id="printable-thermal-tag" className="border-2 border-dashed border-slate-300 rounded-lg p-3 bg-slate-50 font-mono text-xs mb-3">
              <div className="flex justify-between border-b pb-1 border-slate-300 font-bold">
                <span>MOTI WEAVING MILLS</span>
                <span className="border px-1 bg-white">{qcMetrics.grade}</span>
              </div>
              <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 mt-2 text-[11px]">
                <div>PCE: <strong>{rollData.pieceNumber}</strong></div>
                <div>LOOM: <strong>{rollData.loomNumber}</strong></div>
                <div>SORT: <strong>{rollData.sortNumber.split('-')[1]}</strong></div>
                <div>GSM: <strong>{qcMetrics.calculatedGsm}</strong></div>
                <div>LEN: <strong>{rollData.grossLengthMeters} M</strong></div>
                <div>WT: <strong>{rollData.netWeightKg} KG</strong></div>
              </div>
              <div className="mt-2 text-center border-t pt-1 border-slate-200 flex items-center justify-center gap-2">
                <QrCode className="w-4 h-4 text-slate-700" />
                <span className="tracking-widest font-bold text-[10px]">{rollData.pieceNumber}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handlePrintTagAndSave}
                disabled={isSubmitting}
                className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-bold py-3 rounded-xl shadow-md flex items-center justify-center gap-2 text-xs"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Printer className="w-4 h-4" />}
                <span>Save & Print</span>
              </button>
              <button
                onClick={handleResetForNextRoll}
                disabled={isSubmitting}
                className="bg-slate-800 hover:bg-slate-900 text-white font-bold py-3 rounded-xl shadow-md flex items-center justify-center gap-2 text-xs"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Next Roll</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}