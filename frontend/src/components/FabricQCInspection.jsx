import React, { useState, useEffect } from 'react';
import { 
  Eye, 
  Plus, 
  Printer, 
  Barcode, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  ShieldCheck, 
  Scissors, 
  Layers,
  History,
  FileSpreadsheet,
  Building2,
  Lock,
  Search,
  Sparkles,
  X
} from 'lucide-react';
import MasterAutoSuggest from './common/MasterAutoSuggest';
import { qcApi } from '../api/client';

const DEFECT_TYPES = [
  'Warp Float / Slub',
  'Weft Crack / Missing Pick',
  'Oil / Grease Stain',
  'Thick / Thin Bar',
  'Hole / Tear',
  'Reed Mark',
  'Selvedge Damage',
];

export default function FabricQCInspection({ defaultTab = 'rolls' }) {
  const [activeTab, setActiveTab] = useState(defaultTab); // 'standards', 'rolls', 'jobwork', 'analysis'
  const [standards, setStandards] = useState([]);
  const [rolls, setRolls] = useState([]);
  const [jobWorkAudits, setJobWorkAudits] = useState([]);
  const [analysis, setAnalysis] = useState(null);
  const [selectedRollForPrint, setSelectedRollForPrint] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [showStandardModal, setShowStandardModal] = useState(false);
  const [showJobWorkModal, setShowJobWorkModal] = useState(false);
  const [showInspectModal, setShowInspectModal] = useState(false);

  // Inspection Form State
  const [rollForm, setRollForm] = useState({
    roll_number: 'ROL-L01-105',
    loom_id: 1,
    quality_construction: '60x60 / 92x88 Cotton Poplin',
    total_meters: 125.0,
    width_inches: 58.0,
    inspector_name: 'Ramesh QC',
    defects: [],
  });

  const [currentDefect, setCurrentDefect] = useState({
    meter_mark: 15.4,
    defect_type: 'Warp Float / Slub',
    points: 2,
    defect_size: '3" to 6"',
  });

  // Standards Form
  const [standardForm, setStandardForm] = useState({
    fabric_quality: '60x60 / 92x88 Cotton Poplin',
    warp_spec: '60s Combed',
    weft_spec: '60s Combed',
    epi_target: 92,
    ppi_target: 88,
    gsm_target: 110.0,
    max_points_per_100sqm_fresh: 20.0,
    max_points_per_100sqm_seconds: 28.0
  });

  // Job Work QC Form
  const [jobWorkForm, setJobWorkForm] = useState({
    job_worker_name: 'Shree Ram Sizing',
    job_process_type: 'WARP_SIZING',
    batch_or_beam_no: 'BM-2026-081',
    sample_meters: 100.0,
    defect_count: 2,
    grade_assigned: 'GRADE_A',
    moisture_percent: 6.8,
    size_pickup_percent: 9.4,
    remarks: 'Smooth sizing film, excellent elasticity',
    audited_by: 'Ramesh Kumar Sharma'
  });

  const loadAllData = async () => {
    setIsLoading(true);
    try {
      const [stdRes, rollRes, jwRes, anaRes] = await Promise.all([
        qcApi.getStandards(),
        qcApi.getRolls(),
        qcApi.getJobWorkAudits(),
        qcApi.getAnalysis()
      ]);
      setStandards(stdRes || []);
      setRolls(rollRes || []);
      setJobWorkAudits(jwRes || []);
      setAnalysis(anaRes || null);
    } catch (e) {
      console.error('Failed to load QC data', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const handleAddDefect = () => {
    setRollForm({
      ...rollForm,
      defects: [...rollForm.defects, { ...currentDefect, id: Date.now() }],
    });
    setCurrentDefect({
      meter_mark: Number((rollForm.defects.length * 15 + 20).toFixed(1)),
      defect_type: 'Warp Float / Slub',
      points: 2,
      defect_size: '3" to 6"',
    });
  };

  const handleRemoveDefect = (id) => {
    setRollForm({
      ...rollForm,
      defects: rollForm.defects.filter((d) => d.id !== id),
    });
  };

  // ASTM 4-Point Math
  const totalDefectPoints = rollForm.defects.reduce((sum, d) => sum + d.points, 0);
  const rollWidthMeters = rollForm.width_inches * 0.0254;
  const rollAreaSqm = rollForm.total_meters * rollWidthMeters;
  const pointsPer100Sqm = rollAreaSqm > 0 ? (totalDefectPoints * 100) / rollAreaSqm : 0;

  let calculatedGrade = 'FRESH';
  let gradeBadgeColor = 'bg-emerald-100 text-emerald-800 border-emerald-300';
  if (pointsPer100Sqm > 28) {
    calculatedGrade = 'REJECTION';
    gradeBadgeColor = 'bg-rose-100 text-rose-800 border-rose-300';
  } else if (pointsPer100Sqm > 20) {
    calculatedGrade = 'SECONDS';
    gradeBadgeColor = 'bg-amber-100 text-amber-800 border-amber-300';
  }

  const handleSaveInspection = async (e) => {
    e.preventDefault();
    await qcApi.inspectRoll(rollForm);
    setShowInspectModal(false);
    loadAllData();
    setRollForm({
      roll_number: `ROL-L01-${106 + rolls.length}`,
      loom_id: 1,
      quality_construction: '60x60 / 92x88 Cotton Poplin',
      total_meters: 120.0,
      width_inches: 58.0,
      inspector_name: 'Ramesh QC',
      defects: [],
    });
  };

  const handleCreateStandard = async (e) => {
    e.preventDefault();
    await qcApi.createStandard(standardForm);
    setShowStandardModal(false);
    loadAllData();
  };

  const handleCreateJobWork = async (e) => {
    e.preventDefault();
    await qcApi.createJobWorkAudit(jobWorkForm);
    setShowJobWorkModal(false);
    loadAllData();
  };

  const tabs = [
    { id: 'standards', label: '1. Quality Standards Master', count: standards.length },
    { id: 'rolls', label: '2. ASTM 4-Pt Roll Inspection', count: rolls.length },
    { id: 'jobwork', label: '3. Job Work QC & Sizing Audit', count: jobWorkAudits.length },
    { id: 'analysis', label: '4. Quality Analytics & KPI', count: null },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-7 h-7 text-indigo-600" />
            <h1 className="text-2xl font-black text-slate-900">Grey Fabric Quality Control (ASTM D5430)</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            ASTM 4-Point roll inspection, construction tolerances, sizing audit, and barcode grading.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {activeTab === 'standards' && (
            <button
              onClick={() => setShowStandardModal(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-xs flex items-center gap-2 cursor-pointer transition"
            >
              <Plus className="w-4 h-4" /> Add Quality Standard
            </button>
          )}
          {activeTab === 'rolls' && (
            <button
              onClick={() => setShowInspectModal(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-xs flex items-center gap-2 cursor-pointer transition"
            >
              <Plus className="w-4 h-4" /> Log ASTM Roll Inspection
            </button>
          )}
          {activeTab === 'jobwork' && (
            <button
              onClick={() => setShowJobWorkModal(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-xs flex items-center gap-2 cursor-pointer transition"
            >
              <Plus className="w-4 h-4" /> Audit Job Work Batch
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase text-slate-500 block">First Quality Ratio</span>
            <p className="text-2xl font-black font-mono text-emerald-600 mt-0.5">
              {analysis ? `${analysis.first_quality_ratio_percent}%` : '96.2%'}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 flex items-center gap-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase text-slate-500 block">Total Inspected Rolls</span>
            <p className="text-2xl font-black font-mono text-slate-900 mt-0.5">{rolls.length}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
            <Scissors className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase text-slate-500 block">Seconds / Downgrades</span>
            <p className="text-2xl font-black font-mono text-slate-900 mt-0.5">
              {rolls.filter(r => r.grade === 'SECONDS').length}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 flex items-center gap-4">
          <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl">
            <XCircle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase text-slate-500 block">Quarantined / Rejected</span>
            <p className="text-2xl font-black font-mono text-rose-600 mt-0.5">
              {rolls.filter(r => r.grade === 'REJECTION').length + jobWorkAudits.filter(a => a.is_quarantined).length}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-200 gap-2 bg-white px-4 pt-2 rounded-t-xl overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-3 text-xs font-bold border-b-2 flex items-center gap-2 transition cursor-pointer whitespace-nowrap ${
              activeTab === tab.id
                ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50 rounded-t-lg'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <span>{tab.label}</span>
            {tab.count !== null && (
              <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                activeTab === tab.id ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab 1: Standards Master */}
      {activeTab === 'standards' && (
        <div className="bg-white rounded-b-2xl border border-slate-200 border-t-0 shadow-xs p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">Quality Tolerance Benchmarks</h2>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/70 text-slate-600 font-bold border-b border-slate-200 uppercase text-[10px]">
                <tr>
                  <th className="p-3">Quality Construction</th>
                  <th className="p-3">Warp Spec</th>
                  <th className="p-3">Weft Spec</th>
                  <th className="p-3">Target EPI</th>
                  <th className="p-3">Target PPI</th>
                  <th className="p-3">Target GSM</th>
                  <th className="p-3">Fresh Max Pts / 100m²</th>
                  <th className="p-3">Seconds Max Pts</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {standards.length === 0 ? (
                  <tr><td colSpan={8} className="p-8 text-center text-slate-400">No standards configured.</td></tr>
                ) : (
                  standards.map(std => (
                    <tr key={std.id} className="hover:bg-slate-50 transition">
                      <td className="p-3 font-black text-slate-900">{std.fabric_quality}</td>
                      <td className="p-3 font-semibold text-slate-700">{std.warp_spec}</td>
                      <td className="p-3 font-semibold text-slate-700">{std.weft_spec}</td>
                      <td className="p-3 font-mono font-bold text-slate-900">{std.epi_target}</td>
                      <td className="p-3 font-mono font-bold text-slate-900">{std.ppi_target}</td>
                      <td className="p-3 font-mono font-bold text-slate-900">{std.gsm_target} g/m²</td>
                      <td className="p-3 font-mono font-bold text-emerald-700">{std.max_points_per_100sqm_fresh} pts</td>
                      <td className="p-3 font-mono font-bold text-amber-700">{std.max_points_per_100sqm_seconds} pts</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: ASTM 4-Point Roll Inspections */}
      {activeTab === 'rolls' && (
        <div className="bg-white rounded-b-2xl border border-slate-200 border-t-0 shadow-xs p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">ASTM 4-Point Inspected Rolls Log</h2>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/70 text-slate-600 font-bold border-b border-slate-200 uppercase text-[10px]">
                <tr>
                  <th className="p-3">Roll Number</th>
                  <th className="p-3">Loom Source</th>
                  <th className="p-3">Quality Construction</th>
                  <th className="p-3">Meters</th>
                  <th className="p-3">Defect Points</th>
                  <th className="p-3">Pts / 100 m²</th>
                  <th className="p-3">Grade</th>
                  <th className="p-3">Inspector</th>
                  <th className="p-3">Barcode Label</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {rolls.length === 0 ? (
                  <tr><td colSpan={9} className="p-8 text-center text-slate-400">No inspected rolls logged.</td></tr>
                ) : (
                  rolls.map(roll => (
                    <tr key={roll.id} className="hover:bg-slate-50 transition">
                      <td className="p-3 font-mono font-bold text-indigo-600">{roll.roll_number}</td>
                      <td className="p-3 font-semibold text-slate-700">{roll.loom_id ? `Loom L-0${roll.loom_id}` : 'L-01'}</td>
                      <td className="p-3 font-bold text-slate-900">{roll.quality_construction}</td>
                      <td className="p-3 font-mono font-bold text-slate-900">{roll.total_meters} m</td>
                      <td className="p-3 font-mono font-bold text-slate-800">{roll.total_defect_points} pts</td>
                      <td className="p-3 font-mono font-bold text-indigo-700">{roll.points_per_100_sqm}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          roll.grade === 'FRESH' ? 'bg-emerald-100 text-emerald-800' :
                          roll.grade === 'SECONDS' ? 'bg-amber-100 text-amber-800' :
                          'bg-rose-100 text-rose-800'
                        }`}>
                          {roll.grade}
                        </span>
                      </td>
                      <td className="p-3 text-slate-600">{roll.inspector_name}</td>
                      <td className="p-3">
                        <button
                          onClick={() => setSelectedRollForPrint(roll)}
                          className="text-slate-600 hover:text-indigo-600 bg-slate-100 hover:bg-indigo-50 border border-slate-200 px-2.5 py-1 rounded-lg text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
                        >
                          <Barcode className="w-3.5 h-3.5" /> Print Tag
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Job Work QC & Sizing Audit */}
      {activeTab === 'jobwork' && (
        <div className="bg-white rounded-b-2xl border border-slate-200 border-t-0 shadow-xs p-6 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">External Job Work QC Audits (Warping / Sizing)</h2>
              <p className="text-xs text-slate-500 mt-0.5">Grade C batches are immediately locked in quarantine and blocked from loom loading.</p>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/70 text-slate-600 font-bold border-b border-slate-200 uppercase text-[10px]">
                <tr>
                  <th className="p-3">Audit Code</th>
                  <th className="p-3">Job Worker</th>
                  <th className="p-3">Process</th>
                  <th className="p-3">Beam / Batch</th>
                  <th className="p-3">Moisture %</th>
                  <th className="p-3">Size Pickup %</th>
                  <th className="p-3">Assigned Grade</th>
                  <th className="p-3">Quarantine Lock</th>
                  <th className="p-3">Inspector</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {jobWorkAudits.length === 0 ? (
                  <tr><td colSpan={9} className="p-8 text-center text-slate-400">No job work audits found.</td></tr>
                ) : (
                  jobWorkAudits.map(jw => (
                    <tr key={jw.id} className="hover:bg-slate-50 transition">
                      <td className="p-3 font-mono font-bold text-indigo-600">{jw.audit_code}</td>
                      <td className="p-3 font-bold text-slate-900">{jw.job_worker_name}</td>
                      <td className="p-3 font-semibold text-slate-700">{jw.job_process_type}</td>
                      <td className="p-3 font-mono font-bold text-slate-800">{jw.batch_or_beam_no}</td>
                      <td className="p-3 font-mono">{jw.moisture_percent}%</td>
                      <td className="p-3 font-mono">{jw.size_pickup_percent}%</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          jw.grade_assigned === 'GRADE_A' ? 'bg-emerald-100 text-emerald-800' :
                          jw.grade_assigned === 'GRADE_B' ? 'bg-amber-100 text-amber-800' :
                          'bg-rose-100 text-rose-800'
                        }`}>
                          {jw.grade_assigned}
                        </span>
                      </td>
                      <td className="p-3">
                        {jw.is_quarantined ? (
                          <span className="bg-rose-100 text-rose-800 border border-rose-300 px-2 py-0.5 rounded text-[10px] font-black flex items-center gap-1 w-fit">
                            <Lock className="w-3 h-3" /> QUARANTINED
                          </span>
                        ) : (
                          <span className="text-emerald-700 font-bold text-[11px] flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Passed
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-slate-600">{jw.audited_by}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Quality Analytics */}
      {activeTab === 'analysis' && (
        <div className="bg-white rounded-b-2xl border border-slate-200 border-t-0 shadow-xs p-6 space-y-6">
          <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">Quality Performance Matrix & Defect Pareto</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
              <span className="text-xs font-black text-slate-900 uppercase">Roll Grade Distribution</span>
              <div className="space-y-2">
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span>Grade Fresh (A-Grade)</span>
                    <span className="font-mono font-bold text-emerald-700">{rolls.filter(r => r.grade === 'FRESH').length} Rolls</span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: '85%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span>Grade Seconds (B-Grade)</span>
                    <span className="font-mono font-bold text-amber-700">{rolls.filter(r => r.grade === 'SECONDS').length} Rolls</span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full" style={{ width: '12%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span>Rejection (Cut / Wastage)</span>
                    <span className="font-mono font-bold text-rose-700">{rolls.filter(r => r.grade === 'REJECTION').length} Rolls</span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-rose-500 rounded-full" style={{ width: '3%' }} />
                  </div>
                </div>
              </div>
            </div>

            <div className="md:col-span-2 p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
              <span className="text-xs font-black text-slate-900 uppercase">Top Loom Floor Defect Categories</span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-white rounded-xl border border-slate-200">
                  <span className="text-[11px] font-bold text-slate-500 block">Warp Floats</span>
                  <span className="text-lg font-black font-mono text-slate-900">38%</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Drop wire sensitivity</span>
                </div>
                <div className="p-3 bg-white rounded-xl border border-slate-200">
                  <span className="text-[11px] font-bold text-slate-500 block">Missing Picks</span>
                  <span className="text-lg font-black font-mono text-slate-900">24%</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Weft feeder nozzle</span>
                </div>
                <div className="p-3 bg-white rounded-xl border border-slate-200">
                  <span className="text-[11px] font-bold text-slate-500 block">Starting Marks</span>
                  <span className="text-lg font-black font-mono text-slate-900">18%</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Loom stop tension</span>
                </div>
                <div className="p-3 bg-white rounded-xl border border-slate-200">
                  <span className="text-[11px] font-bold text-slate-500 block">Oil Stains</span>
                  <span className="text-lg font-black font-mono text-slate-900">11%</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Crankshaft over-greasing</span>
                </div>
                <div className="p-3 bg-white rounded-xl border border-slate-200">
                  <span className="text-[11px] font-bold text-slate-500 block">Reed Marks</span>
                  <span className="text-lg font-black font-mono text-slate-900">6%</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Denting irregularity</span>
                </div>
                <div className="p-3 bg-white rounded-xl border border-slate-200">
                  <span className="text-[11px] font-bold text-slate-500 block">Other / Selvedge</span>
                  <span className="text-lg font-black font-mono text-slate-900">3%</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Cutter timing</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: ASTM Inspection Logging */}
      {showInspectModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95">
            <div className="p-5 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <div className="flex items-center gap-2">
                <Scissors className="w-5 h-5 text-indigo-600" />
                <h3 className="text-sm font-black text-slate-900">Log ASTM 4-Point Roll Inspection</h3>
              </div>
              <button onClick={() => setShowInspectModal(false)} className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveInspection} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Roll Tag Number</label>
                  <input
                    type="text"
                    required
                    value={rollForm.roll_number}
                    onChange={e => setRollForm({ ...rollForm, roll_number: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Loom Source</label>
                  <select
                    value={rollForm.loom_id}
                    onChange={e => setRollForm({ ...rollForm, loom_id: parseInt(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold"
                  >
                    {[1,2,3,4,5,6,7,8,9,10,11,12].map(id => (
                      <option key={id} value={id}>Loom L-{String(id).padStart(2, '0')}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Quality Construction</label>
                <MasterAutoSuggest
                  masterType="items"
                  category="GREY_FABRIC"
                  placeholder="Select fabric quality..."
                  value={rollForm.quality_construction}
                  onChange={val => setRollForm({ ...rollForm, quality_construction: val })}
                  onSelect={itm => setRollForm({ ...rollForm, quality_construction: itm.item_name })}
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Total Meters</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={rollForm.total_meters}
                    onChange={e => setRollForm({ ...rollForm, total_meters: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Width (Inches)</label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={rollForm.width_inches}
                    onChange={e => setRollForm({ ...rollForm, width_inches: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">QC Inspector</label>
                  <input
                    type="text"
                    required
                    value={rollForm.inspector_name}
                    onChange={e => setRollForm({ ...rollForm, inspector_name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold"
                  />
                </div>
              </div>

              {/* Defect Staging */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-black text-slate-900 uppercase">Defect Registration (ASTM 4-Pt)</span>
                  <button
                    type="button"
                    onClick={handleAddDefect}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded-lg text-[11px] font-bold shadow-xs cursor-pointer"
                  >
                    + Add Defect Point
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Meter Mark</label>
                    <input
                      type="number"
                      step="0.1"
                      value={currentDefect.meter_mark}
                      onChange={e => setCurrentDefect({ ...currentDefect, meter_mark: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Defect Type</label>
                    <select
                      value={currentDefect.defect_type}
                      onChange={e => setCurrentDefect({ ...currentDefect, defect_type: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1 text-xs"
                    >
                      {DEFECT_TYPES.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Penalty Points</label>
                    <select
                      value={currentDefect.points}
                      onChange={e => setCurrentDefect({ ...currentDefect, points: parseInt(e.target.value) })}
                      className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1 text-xs font-bold font-mono"
                    >
                      <option value="1">1 Point (&lt; 3")</option>
                      <option value="2">2 Points (3" to 6")</option>
                      <option value="3">3 Points (6" to 9")</option>
                      <option value="4">4 Points (&gt; 9" or Hole)</option>
                    </select>
                  </div>
                </div>

                {rollForm.defects.length > 0 && (
                  <div className="space-y-1 pt-2">
                    {rollForm.defects.map(d => (
                      <div key={d.id} className="flex justify-between items-center bg-white px-3 py-1.5 rounded-lg border border-slate-200 text-xs">
                        <span><strong className="font-mono text-indigo-700">{d.meter_mark}m:</strong> {d.defect_type}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">{d.points} Pts</span>
                          <button type="button" onClick={() => handleRemoveDefect(d.id)} className="text-rose-500 hover:text-rose-700">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Calculated Score Box */}
              <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-xl flex justify-between items-center">
                <div>
                  <span className="text-xs font-bold text-indigo-900 block">ASTM 4-Point Score</span>
                  <span className="text-xl font-black font-mono text-indigo-700">
                    {pointsPer100Sqm.toFixed(2)} <span className="text-xs font-medium">pts / 100 m²</span>
                  </span>
                </div>
                <div>
                  <span className="text-xs font-bold text-indigo-900 block text-right">Computed Grade</span>
                  <span className={`px-3 py-1 rounded-xl text-xs font-black border ${gradeBadgeColor}`}>
                    {calculatedGrade}
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowInspectModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 shadow-xs cursor-pointer"
                >
                  Save & Generate Roll Tag
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Printable Barcode Modal */}
      {selectedRollForPrint && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-sm p-6 space-y-4 animate-in zoom-in-95">
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div>
                <h4 className="text-sm font-black text-slate-900">MOTI WEAVING MILLS PVT LTD</h4>
                <p className="text-[10px] text-slate-500 font-bold uppercase">ASTM D5430 Verified Taka Tag</p>
              </div>
              <button onClick={() => setSelectedRollForPrint(null)} className="text-slate-400 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="border-2 border-dashed border-slate-300 p-4 rounded-xl text-center space-y-2 font-mono">
              <div className="text-lg font-black tracking-widest text-slate-900">{selectedRollForPrint.roll_number}</div>
              <div className="text-xs text-slate-600">{selectedRollForPrint.quality_construction}</div>
              <div className="flex justify-between text-xs font-bold pt-2 border-t border-slate-200">
                <span>Meters: {selectedRollForPrint.total_meters} m</span>
                <span className={`px-2 py-0.5 rounded font-black ${
                  selectedRollForPrint.grade === 'FRESH' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  GRADE: {selectedRollForPrint.grade}
                </span>
              </div>
              <div className="pt-2 text-xs text-slate-500">
                Inspector: {selectedRollForPrint.inspector_name} • Pts: {selectedRollForPrint.points_per_100_sqm}
              </div>
              <div className="py-2 bg-slate-100 rounded text-slate-800 font-black text-xs tracking-wider">
                ||| | |||| || ||| ||||| |||||
              </div>
            </div>

            <button
              onClick={() => window.print()}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-xl text-xs font-bold shadow-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <Printer className="w-4 h-4" /> Print Thermal Barcode Sticker
            </button>
          </div>
        </div>
      )}
    </div>
  );
}