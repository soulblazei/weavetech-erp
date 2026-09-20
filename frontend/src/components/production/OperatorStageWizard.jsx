import React, { useState, useEffect } from 'react';
import { 
  Factory, 
  Layers, 
  ArrowRight, 
  ArrowLeft, 
  Star, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldCheck, 
  User, 
  Package, 
  Clock, 
  Scale, 
  Sparkles, 
  Check, 
  X, 
  Loader2, 
  Info,
  Calendar,
  Truck,
  FileText
} from 'lucide-react';
import { shopFloorApi, SHOPFLOOR_STAGES } from '../../api/client';

export default function OperatorStageWizard({ currentUser, onRecordCreated }) {
  const [selectedStageNumber, setSelectedStageNumber] = useState(2); // default to Stage 2 (Winding)
  const [wizardStep, setWizardStep] = useState(1); // 1: Select Stage & Preceding Batch, 2: Upstream Rating, 3: Stage Data Entry, 4: Success
  const [precedingBatches, setPrecedingBatches] = useState([]);
  const [selectedPrecedingBatch, setSelectedPrecedingBatch] = useState(null);
  const [isLoadingBatches, setIsLoadingBatches] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [createdRecord, setCreatedRecord] = useState(null);

  // Form State
  const [operatorName, setOperatorName] = useState(currentUser?.full_name || 'Kailash Suthar');
  const [operatorRole, setOperatorRole] = useState(currentUser?.role || 'Winding Worker');
  
  // Upstream Rating State
  const [incomingRating, setIncomingRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [selectedDefects, setSelectedDefects] = useState([]);
  const [incomingNotes, setIncomingNotes] = useState('');

  // Material Weights
  const [inputWeightKg, setInputWeightKg] = useState(100.0);
  const [outputWeightKg, setOutputWeightKg] = useState(98.5);
  const [wasteWeightKg, setWasteWeightKg] = useState(1.5);

  // Stage Specific Fields State
  const [stageFormData, setStageFormData] = useState({});

  const activeStage = SHOPFLOOR_STAGES.find(s => s.stage_number === selectedStageNumber) || SHOPFLOOR_STAGES[0];

  // Fetch preceding batches whenever selected stage changes
  useEffect(() => {
    setErrorMessage('');
    setSelectedPrecedingBatch(null);
    setIncomingRating(5);
    setSelectedDefects([]);
    setIncomingNotes('');

    if (activeStage.stage_number > 1) {
      setIsLoadingBatches(true);
      shopFloorApi.getPrecedingBatches(activeStage.stage_number)
        .then(batches => {
          setPrecedingBatches(batches || []);
          if (batches && batches.length > 0) {
            setSelectedPrecedingBatch(batches[0]);
            setInputWeightKg(batches[0].output_weight_kg || 100.0);
            setOutputWeightKg(batches[0].output_weight_kg ? Number((batches[0].output_weight_kg * 0.98).toFixed(1)) : 98.0);
            setWasteWeightKg(batches[0].output_weight_kg ? Number((batches[0].output_weight_kg * 0.02).toFixed(1)) : 2.0);
          }
        })
        .catch(err => {
          console.error("Error loading preceding batches:", err);
          setPrecedingBatches([]);
        })
        .finally(() => setIsLoadingBatches(false));
    } else {
      setPrecedingBatches([]);
      setSelectedPrecedingBatch(null);
    }
  }, [selectedStageNumber]);

  const handleDefectToggle = (defect) => {
    if (selectedDefects.includes(defect)) {
      setSelectedDefects(selectedDefects.filter(d => d !== defect));
    } else {
      setSelectedDefects([...selectedDefects, defect]);
    }
  };

  // Weight Balance Calculation & Validation
  const totalOut = (Number(outputWeightKg) || 0) + (Number(wasteWeightKg) || 0);
  const weightBalanceDiff = totalOut - (Number(inputWeightKg) || 0);
  const isWeightValid = inputWeightKg <= 0 || totalOut <= (inputWeightKg * 1.05);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (activeStage.stage_number > 1 && !selectedPrecedingBatch) {
      setErrorMessage(`Please select a received batch from ${activeStage.preceding_stage_name}.`);
      return;
    }

    if (activeStage.stage_number > 1 && (!incomingRating || incomingRating < 1)) {
      setErrorMessage("Please provide an Incoming Handover Quality Rating (1 to 5 stars).");
      return;
    }

    if (inputWeightKg > 0 && !isWeightValid) {
      setErrorMessage(`Material Balance Warning: Output (${outputWeightKg}kg) + Waste (${wasteWeightKg}kg) exceeds Input (${inputWeightKg}kg) beyond 5% tolerance.`);
      return;
    }

    setIsSubmitting(true);
    try {
      const finalStageData = { ...stageFormData };
      const generatedRootLot = selectedPrecedingBatch ? selectedPrecedingBatch.root_yarn_lot : (finalStageData.lot_number || `LOT-${Date.now().toString().slice(-6)}`);

      if (activeStage.stage_number === 1) {
        if (!finalStageData.po_no) finalStageData.po_no = "PO-2026-089";
        if (!finalStageData.vendor_name) finalStageData.vendor_name = "Nahar Spinning Mills";
        if (!finalStageData.yarn_count) finalStageData.yarn_count = "40s Combed Cotton";
        if (!finalStageData.lot_number) finalStageData.lot_number = generatedRootLot;
      }

      const payload = {
        stage_number: activeStage.stage_number,
        batch_code: activeStage.stage_number === 1 ? (finalStageData.lot_number || generatedRootLot) : undefined,
        preceding_record_id: selectedPrecedingBatch ? selectedPrecedingBatch.id : null,
        preceding_batch_code: selectedPrecedingBatch ? selectedPrecedingBatch.batch_code : null,
        root_yarn_lot: selectedPrecedingBatch ? selectedPrecedingBatch.root_yarn_lot : (finalStageData.lot_number || generatedRootLot),
        operator_name: operatorName || 'Operator',
        operator_role: operatorRole || 'Worker',
        incoming_rating: activeStage.stage_number > 1 ? (incomingRating || null) : null,
        incoming_defects: activeStage.stage_number > 1 ? (selectedDefects || []) : [],
        incoming_notes: incomingNotes || '',
        input_weight_kg: Number(inputWeightKg) || 0.0,
        output_weight_kg: Number(outputWeightKg) || 0.0,
        waste_weight_kg: Number(wasteWeightKg) || 0.0,
        stage_data: finalStageData
      };

      const record = await shopFloorApi.createRecord(payload);
      setCreatedRecord(record);
      setWizardStep(4);
      if (onRecordCreated) onRecordCreated(record);
    } catch (err) {
      setErrorMessage(err.message || "Failed to submit shop-floor record.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetWizard = () => {
    setWizardStep(1);
    setCreatedRecord(null);
    setErrorMessage('');
    setStageFormData({});
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
      
      {/* Wizard Header Bar */}
      <div className="bg-slate-900 text-white p-6 border-b border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-500 text-white">
              Sequential Process Engine
            </span>
            <span className="text-xs text-slate-400">Stage {activeStage.stage_number} of 13</span>
          </div>
          <h2 className="text-xl font-black mt-1 text-white tracking-tight flex items-center gap-2">
            <Factory className="w-5 h-5 text-indigo-400" />
            {activeStage.stage_name}
          </h2>
          <p className="text-xs text-slate-300 font-medium mt-0.5">
            {activeStage.phase} • Strict RBAC & Upstream Acceptance Verification
          </p>
        </div>

        {/* Step Progress Pills */}
        <div className="flex items-center gap-2 bg-slate-800/80 p-1.5 rounded-2xl border border-slate-700">
          <span className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
            wizardStep === 1 ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400'
          }`}>
            1. Stage & Batch
          </span>
          <span className="text-slate-600">➔</span>
          <span className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
            wizardStep === 2 ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400'
          }`}>
            2. Upstream Rating
          </span>
          <span className="text-slate-600">➔</span>
          <span className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
            wizardStep === 3 ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400'
          }`}>
            3. Process Entry
          </span>
        </div>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="mx-6 mt-4 p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs font-bold text-rose-700 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 1: SELECT STAGE & PRECEDING BATCH */}
      {/* ========================================================================= */}
      {wizardStep === 1 && (
        <div className="p-6 space-y-6">
          
          {/* Stage Selector Grid */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
              Select Current Shop-Floor Stage (1 to 13):
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
              {SHOPFLOOR_STAGES.map(s => {
                const isSelected = s.stage_number === selectedStageNumber;
                return (
                  <button
                    key={s.stage_number}
                    type="button"
                    onClick={() => setSelectedStageNumber(s.stage_number)}
                    className={`p-3 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/80 ring-2 ring-indigo-500 shadow-xs'
                        : 'border-slate-200 bg-slate-50 hover:bg-slate-100/80 text-slate-700'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${
                        isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-700'
                      }`}>
                        Stage {s.stage_number}
                      </span>
                      {isSelected && <Check className="w-4 h-4 text-indigo-600 font-bold" />}
                    </div>
                    <div className="mt-2">
                      <strong className={`text-xs font-bold block leading-snug ${isSelected ? 'text-indigo-950' : 'text-slate-900'}`}>
                        {s.stage_name}
                      </strong>
                      <span className="text-[10px] text-slate-500 block truncate mt-0.5">
                        {s.phase.split(':')[0]}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Operator Role & Identity */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4.5 space-y-4">
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <User className="w-4 h-4 text-indigo-600" />
              Operator & Role Attribution (RBAC)
            </span>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Operator Name *</label>
                <input
                  type="text"
                  required
                  value={operatorName}
                  onChange={e => setOperatorName(e.target.value)}
                  placeholder="e.g. Kailash Suthar"
                  className="w-full h-11 px-3.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-indigo-100"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Designated Role *</label>
                <select
                  value={operatorRole}
                  onChange={e => setOperatorRole(e.target.value)}
                  className="w-full h-11 px-3.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-indigo-100"
                >
                  <option value="Winding Worker">Winding Worker</option>
                  <option value="TFO Worker">TFO Worker</option>
                  <option value="Warper">Warper / Warping Operator</option>
                  <option value="Getter">Getter / Knotting Incharge</option>
                  <option value="Loom Master">Loom Master</option>
                  <option value="Loom Worker">Loom Worker / Weaver</option>
                  <option value="Mender">Mender / Grey QC</option>
                  <option value="Folder">Folder / Packing Incharge</option>
                  <option value="Supervisor">General Shift Supervisor</option>
                  <option value="Store Manager">Store Incharge</option>
                  <option value="Manager">Plant Production Manager</option>
                  <option value="Owner">Plant Owner</option>
                </select>
              </div>
            </div>
          </div>

          {/* Sequential Handoff Preceding Batch Selection */}
          {activeStage.stage_number > 1 ? (
            <div className="bg-indigo-50/50 border border-indigo-200 rounded-2xl p-4.5 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-indigo-950 uppercase tracking-wider flex items-center gap-2">
                  <Layers className="w-4 h-4 text-indigo-600" />
                  Select Received Input Batch from: {activeStage.preceding_stage_name}
                </span>
                <span className="text-[11px] font-bold text-indigo-700">
                  {precedingBatches.length} Available Batches
                </span>
              </div>

              {isLoadingBatches ? (
                <div className="p-8 text-center text-slate-500 flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                  <span>Loading preceding stage output batches...</span>
                </div>
              ) : precedingBatches.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {precedingBatches.map(batch => {
                    const isSelected = selectedPrecedingBatch?.id === batch.id;
                    return (
                      <div
                        key={batch.id}
                        onClick={() => {
                          setSelectedPrecedingBatch(batch);
                          if (batch.output_weight_kg) {
                            setInputWeightKg(batch.output_weight_kg);
                            setOutputWeightKg(Number((batch.output_weight_kg * 0.98).toFixed(1)));
                            setWasteWeightKg(Number((batch.output_weight_kg * 0.02).toFixed(1)));
                          }
                        }}
                        className={`p-3.5 rounded-xl border transition cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? 'bg-white border-indigo-600 ring-2 ring-indigo-500 shadow-md'
                            : 'bg-white/80 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div>
                          <div className="flex justify-between items-center">
                            <span className="font-mono text-xs font-black text-indigo-700">
                              {batch.batch_code}
                            </span>
                            <span className="text-[10px] font-bold text-slate-500">
                              {new Date(batch.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-700 mt-1 font-semibold">
                            Root Lot: <span className="font-mono text-slate-900">{batch.root_yarn_lot}</span>
                          </div>
                          <div className="text-[11px] text-slate-500">
                            By: {batch.operator_name} ({batch.operator_role})
                          </div>
                        </div>

                        <div className="mt-2 pt-2 border-t border-slate-100 flex justify-between items-center text-[11px]">
                          <span className="text-slate-600">Output Wt:</span>
                          <strong className="font-mono text-slate-900">{batch.output_weight_kg || 'N/A'} kg</strong>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-6 bg-white rounded-xl text-center text-slate-500 border border-dashed border-slate-300">
                  <p className="text-xs font-semibold">
                    No completed batches found from <strong>{activeStage.preceding_stage_name}</strong>.
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Complete the preceding stage first to maintain unbroken sequential traceability.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>
                <strong>Stage 1 (Initial Entry):</strong> Generates the root Yarn Lot number that tracks the entire life-cycle. No preceding batch required.
              </span>
            </div>
          )}

          {/* Action Bar */}
          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                if (activeStage.stage_number > 1 && !selectedPrecedingBatch) {
                  setErrorMessage(`Please select a batch from ${activeStage.preceding_stage_name} to continue.`);
                  return;
                }
                setErrorMessage('');
                setWizardStep(activeStage.stage_number > 1 ? 2 : 3);
              }}
              className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md flex items-center gap-2 transition cursor-pointer"
            >
              <span>{activeStage.stage_number > 1 ? "Next: Upstream Quality Rating" : "Next: Enter Inward Data"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 2: UPSTREAM INCOMING QUALITY RATING & DEFECT CHECKLIST */}
      {/* ========================================================================= */}
      {wizardStep === 2 && activeStage.stage_number > 1 && (
        <div className="p-6 space-y-6">
          <div className="bg-amber-50/70 border border-amber-300 rounded-2xl p-5 space-y-2">
            <span className="text-xs font-black text-amber-950 uppercase tracking-wider flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-600 fill-amber-500" />
              Mandatory Incoming Quality Gate: Rate {activeStage.preceding_stage_name}
            </span>
            <p className="text-xs text-amber-900 font-medium">
              {activeStage.rating_subject}
            </p>
            {selectedPrecedingBatch && (
              <div className="text-[11px] font-mono text-amber-800 bg-white/60 p-2 rounded-lg border border-amber-200 flex justify-between">
                <span>Batch Code: <strong>{selectedPrecedingBatch.batch_code}</strong></span>
                <span>Root Lot: <strong>{selectedPrecedingBatch.root_yarn_lot}</strong></span>
              </div>
            )}
          </div>

          {/* Interactive 5-Star Rating Selector */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-center space-y-3">
            <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
              Rate Received Material Quality (1 to 5 Stars) *
            </label>
            <div className="flex items-center justify-center gap-2">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  type="button"
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setIncomingRating(star)}
                  className="p-1.5 transition transform hover:scale-110 cursor-pointer"
                >
                  <Star
                    className={`w-9 h-9 ${
                      (hoverRating || incomingRating) >= star
                        ? 'text-amber-500 fill-amber-400'
                        : 'text-slate-300'
                    }`}
                  />
                </button>
              ))}
            </div>

            <div className="text-xs font-bold">
              {incomingRating === 5 && <span className="text-emerald-700">★★★★★ 5/5 - Perfect Quality / Zero Defects</span>}
              {incomingRating === 4 && <span className="text-emerald-600">★★★★☆ 4/5 - Good Quality / Minor Acceptable Variations</span>}
              {incomingRating === 3 && <span className="text-amber-700">★★★☆☆ 3/5 - Average / Requires Close Operator Attention</span>}
              {incomingRating === 2 && <span className="text-rose-600">★★☆☆☆ 2/5 - Poor Quality / Alert Triggered for Supervisor</span>}
              {incomingRating === 1 && <span className="text-rose-700">★☆☆☆☆ 1/5 - Severe Defect / Production Quality Alert Flagged</span>}
            </div>

            {incomingRating < 3 && (
              <div className="p-3 bg-rose-50 border border-rose-300 rounded-xl text-xs text-rose-800 font-bold flex items-center gap-2 justify-center">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>⚠️ Low Rating ({incomingRating} Stars) will automatically broadcast an alert on the Supervisor Quality Radar!</span>
              </div>
            )}
          </div>

          {/* Common Defect Checklist */}
          {activeStage.defect_options.length > 0 && (
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                Observed Defect Checklist (Click all that apply):
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {activeStage.defect_options.map(defect => {
                  const isChecked = selectedDefects.includes(defect);
                  return (
                    <button
                      key={defect}
                      type="button"
                      onClick={() => handleDefectToggle(defect)}
                      className={`px-3.5 py-2.5 rounded-xl border text-xs font-bold text-left transition cursor-pointer flex items-center justify-between ${
                        isChecked
                          ? 'border-rose-500 bg-rose-50 text-rose-900 shadow-xs'
                          : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <span>{defect}</span>
                      {isChecked && <Check className="w-3.5 h-3.5 text-rose-600 font-bold" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Notes / Remarks */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Operator Acceptance Remarks / Inspection Notes
            </label>
            <textarea
              rows={2}
              value={incomingNotes}
              onChange={e => setIncomingNotes(e.target.value)}
              placeholder="Detail any moisture, snags, package build, or drawing abnormalities observed..."
              className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setWizardStep(1)}
              className="px-5 py-2.5 rounded-2xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-100 flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Step 1
            </button>
            <button
              type="button"
              onClick={() => setWizardStep(3)}
              className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md flex items-center gap-2 cursor-pointer"
            >
              <span>Next: Stage Data Entry</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 3: STAGE-SPECIFIC DATA ENTRY & WEIGHT BALANCE */}
      {/* ========================================================================= */}
      {wizardStep === 3 && (
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          
          {/* Material Balances Section */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4.5 space-y-3">
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Scale className="w-4 h-4 text-indigo-600" />
              Material Balance & Weight Accounting (Kg)
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Input Weight Issued (Kg) *</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={inputWeightKg}
                  onChange={e => setInputWeightKg(parseFloat(e.target.value) || 0)}
                  className="w-full h-11 px-3 bg-white border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Output Good Weight (Kg) *</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={outputWeightKg}
                  onChange={e => setOutputWeightKg(parseFloat(e.target.value) || 0)}
                  className="w-full h-11 px-3 bg-white border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Waste / Scrap Weight (Kg)</label>
                <input
                  type="number"
                  step="0.1"
                  value={wasteWeightKg}
                  onChange={e => setWasteWeightKg(parseFloat(e.target.value) || 0)}
                  className="w-full h-11 px-3 bg-white border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900"
                />
              </div>
            </div>

            {/* Live Weight Tolerance Badge */}
            <div className={`p-2.5 rounded-xl text-xs font-bold flex justify-between items-center ${
              isWeightValid ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}>
              <span>Total Accounted: <strong>{totalOut.toFixed(1)} kg</strong> (Diff: {weightBalanceDiff >= 0 ? `+${weightBalanceDiff.toFixed(1)}` : weightBalanceDiff.toFixed(1)} kg)</span>
              <span>{isWeightValid ? '✓ Within Material Tolerance' : '⚠️ Exceeds 5% Input Weight Tolerance'}</span>
            </div>
          </div>

          {/* Dynamic Stage-Specific Fields */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4.5 space-y-4">
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-600" />
              Stage {activeStage.stage_number} Technical Parameters ({activeStage.stage_name})
            </span>

            {/* STAGE 1: Yarn Inward */}
            {activeStage.stage_number === 1 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Purchase Order No *</label>
                  <input
                    type="text"
                    required
                    defaultValue="PO-2026-089"
                    onChange={e => setStageFormData({ ...stageFormData, po_no: e.target.value })}
                    className="w-full h-10 px-3 bg-white border border-slate-300 rounded-xl text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Yarn Supplier / Mill *</label>
                  <input
                    type="text"
                    required
                    defaultValue="Nahar Spinning Mills"
                    onChange={e => setStageFormData({ ...stageFormData, vendor_name: e.target.value })}
                    className="w-full h-10 px-3 bg-white border border-slate-300 rounded-xl text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Yarn Count / Type *</label>
                  <input
                    type="text"
                    required
                    defaultValue="40s Combed Cotton"
                    onChange={e => setStageFormData({ ...stageFormData, yarn_count: e.target.value })}
                    className="w-full h-10 px-3 bg-white border border-slate-300 rounded-xl text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Lot / Heat No *</label>
                  <input
                    type="text"
                    required
                    defaultValue={`LOT-${Date.now().toString().slice(-6)}`}
                    onChange={e => setStageFormData({ ...stageFormData, lot_number: e.target.value })}
                    className="w-full h-10 px-3 bg-white border border-slate-300 rounded-xl text-xs font-mono font-bold"
                  />
                </div>
              </div>
            )}

            {/* STAGE 2: Winding */}
            {activeStage.stage_number === 2 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Winding Machine No *</label>
                  <input
                    type="text"
                    required
                    defaultValue="WIND-01"
                    onChange={e => setStageFormData({ ...stageFormData, machine_no: e.target.value })}
                    className="w-full h-10 px-3 bg-white border border-slate-300 rounded-xl text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Output Bobbin Count</label>
                  <input
                    type="number"
                    defaultValue={480}
                    onChange={e => setStageFormData({ ...stageFormData, bobbins_produced: parseInt(e.target.value) || 0 })}
                    className="w-full h-10 px-3 bg-white border border-slate-300 rounded-xl text-xs font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Active Spindles</label>
                  <input
                    type="number"
                    defaultValue={60}
                    onChange={e => setStageFormData({ ...stageFormData, spindles_run: parseInt(e.target.value) || 0 })}
                    className="w-full h-10 px-3 bg-white border border-slate-300 rounded-xl text-xs font-mono font-bold"
                  />
                </div>
              </div>
            )}

            {/* STAGE 3: TFO */}
            {activeStage.stage_number === 3 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">TFO Machine No *</label>
                  <input
                    type="text"
                    required
                    defaultValue="TFO-02"
                    onChange={e => setStageFormData({ ...stageFormData, tfo_machine_no: e.target.value })}
                    className="w-full h-10 px-3 bg-white border border-slate-300 rounded-xl text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Target TPM (Twists/m) *</label>
                  <input
                    type="number"
                    required
                    defaultValue={450}
                    onChange={e => setStageFormData({ ...stageFormData, target_tpm: parseInt(e.target.value) || 0 })}
                    className="w-full h-10 px-3 bg-white border border-slate-300 rounded-xl text-xs font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Spindles Active</label>
                  <input
                    type="number"
                    defaultValue={128}
                    onChange={e => setStageFormData({ ...stageFormData, spindles_active: parseInt(e.target.value) || 0 })}
                    className="w-full h-10 px-3 bg-white border border-slate-300 rounded-xl text-xs font-mono font-bold"
                  />
                </div>
              </div>
            )}

            {/* STAGE 6: Beam Making */}
            {activeStage.stage_number === 6 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Total Warp Ends *</label>
                  <input
                    type="number"
                    required
                    defaultValue={4800}
                    onChange={e => setStageFormData({ ...stageFormData, total_ends: parseInt(e.target.value) || 0 })}
                    className="w-full h-10 px-3 bg-white border border-slate-300 rounded-xl text-xs font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Measured Warp Length (m) *</label>
                  <input
                    type="number"
                    required
                    defaultValue={3500}
                    onChange={e => setStageFormData({ ...stageFormData, measured_warp_meters: parseFloat(e.target.value) || 0 })}
                    className="w-full h-10 px-3 bg-white border border-slate-300 rounded-xl text-xs font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Flange Width (Inches)</label>
                  <input
                    type="number"
                    defaultValue={58.0}
                    onChange={e => setStageFormData({ ...stageFormData, beam_flange_width: parseFloat(e.target.value) || 0 })}
                    className="w-full h-10 px-3 bg-white border border-slate-300 rounded-xl text-xs font-mono font-bold"
                  />
                </div>
              </div>
            )}

            {/* STAGE 8 & 9: Loom Operations */}
            {(activeStage.stage_number === 8 || activeStage.stage_number === 9) && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Loom Number *</label>
                  <select
                    defaultValue="Loom L-01"
                    onChange={e => setStageFormData({ ...stageFormData, loom_number: e.target.value })}
                    className="w-full h-10 px-3 bg-white border border-slate-300 rounded-xl text-xs font-bold"
                  >
                    {[...Array(12)].map((_, i) => (
                      <option key={i} value={`Loom L-${String(i + 1).padStart(2, '0')}`}>
                        Loom L-{String(i + 1).padStart(2, '0')} (Airjet/Rapier)
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    {activeStage.stage_number === 8 ? "Starting Pick Counter" : "Cut Meters (Taka Length)"}
                  </label>
                  <input
                    type="number"
                    defaultValue={activeStage.stage_number === 8 ? 120000 : 120.5}
                    onChange={e => setStageFormData({ ...stageFormData, [activeStage.stage_number === 8 ? 'starting_picks' : 'cut_meters']: parseFloat(e.target.value) || 0 })}
                    className="w-full h-10 px-3 bg-white border border-slate-300 rounded-xl text-xs font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Shift</label>
                  <select
                    defaultValue="Shift A"
                    onChange={e => setStageFormData({ ...stageFormData, shift: e.target.value })}
                    className="w-full h-10 px-3 bg-white border border-slate-300 rounded-xl text-xs font-bold"
                  >
                    <option value="Shift A">Shift A (Day: 08:00 - 16:00)</option>
                    <option value="Shift B">Shift B (Eve: 16:00 - 00:00)</option>
                    <option value="Shift C">Shift C (Night: 00:00 - 08:00)</option>
                  </select>
                </div>
              </div>
            )}

            {/* STAGE 10: Taka Checking */}
            {activeStage.stage_number === 10 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Inspected Length (Meters) *</label>
                  <input
                    type="number"
                    step="0.5"
                    defaultValue={120.5}
                    onChange={e => setStageFormData({ ...stageFormData, inspected_meters: parseFloat(e.target.value) || 0 })}
                    className="w-full h-10 px-3 bg-white border border-slate-300 rounded-xl text-xs font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">ASTM Defect Points</label>
                  <input
                    type="number"
                    defaultValue={14}
                    onChange={e => setStageFormData({ ...stageFormData, total_defect_points: parseInt(e.target.value) || 0 })}
                    className="w-full h-10 px-3 bg-white border border-slate-300 rounded-xl text-xs font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Fabric Grade *</label>
                  <select
                    defaultValue="FRESH"
                    onChange={e => setStageFormData({ ...stageFormData, grade: e.target.value })}
                    className="w-full h-10 px-3 bg-white border border-slate-300 rounded-xl text-xs font-bold"
                  >
                    <option value="FRESH">Fresh / Export Quality</option>
                    <option value="SECONDS">Seconds (Minor Flaws)</option>
                    <option value="REJECTION">Rejection / Rag</option>
                  </select>
                </div>
              </div>
            )}

            {/* STAGE 13: Challan Making */}
            {activeStage.stage_number === 13 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Consignee Client Name *</label>
                  <input
                    type="text"
                    required
                    defaultValue="Vardhman Textiles"
                    onChange={e => setStageFormData({ ...stageFormData, consignee_name: e.target.value })}
                    className="w-full h-10 px-3 bg-white border border-slate-300 rounded-xl text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">E-Way Bill No *</label>
                  <input
                    type="text"
                    required
                    defaultValue="341890124567"
                    onChange={e => setStageFormData({ ...stageFormData, eway_bill_no: e.target.value })}
                    className="w-full h-10 px-3 bg-white border border-slate-300 rounded-xl text-xs font-mono font-bold"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Navigation & Submit Bar */}
          <div className="flex justify-between items-center pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setWizardStep(activeStage.stage_number > 1 ? 2 : 1)}
              className="px-5 py-2.5 rounded-2xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-100 flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>

            <button
              type="submit"
              disabled={isSubmitting || !isWeightValid}
              className="px-8 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md hover:shadow-lg flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating Lineage Record...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Submit Stage {activeStage.stage_number} & Log Lineage
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* ========================================================================= */}
      {/* STEP 4: SUCCESS CONFIRMATION & BARCODE TAG */}
      {/* ========================================================================= */}
      {wizardStep === 4 && createdRecord && (
        <div className="p-8 text-center space-y-6 animate-in zoom-in-95 duration-150">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-3xl mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-1">
            <h3 className="text-xl font-black text-slate-900">
              Stage {createdRecord.stage_number} Successfully Logged!
            </h3>
            <p className="text-xs text-slate-500">
              Sequential handoff verification and lineage record created in database.
            </p>
          </div>

          {/* Batch Tag Card */}
          <div className="max-w-md mx-auto bg-slate-50 border-2 border-indigo-200 rounded-3xl p-6 text-left space-y-3 shadow-sm">
            <div className="flex justify-between items-center pb-2 border-b border-slate-200">
              <span className="text-[10px] font-black uppercase text-indigo-700 bg-indigo-100 px-2.5 py-0.5 rounded-full">
                {createdRecord.stage_name}
              </span>
              <span className="text-xs font-mono font-bold text-slate-500">
                {new Date(createdRecord.created_at).toLocaleTimeString()}
              </span>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-400 block uppercase">Generated Batch Code</span>
              <strong className="text-lg font-black font-mono text-indigo-900 block">
                {createdRecord.batch_code}
              </strong>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs pt-1">
              <div>
                <span className="text-[10px] font-bold text-slate-400 block">Root Yarn Lot</span>
                <strong className="font-mono text-slate-800">{createdRecord.root_yarn_lot}</strong>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 block">Operator</span>
                <strong className="text-slate-800">{createdRecord.operator_name}</strong>
              </div>
            </div>

            {createdRecord.incoming_rating && (
              <div className="bg-white p-2.5 rounded-xl border border-slate-200 text-xs flex justify-between items-center">
                <span className="text-slate-600">Upstream Acceptance:</span>
                <span className="font-bold text-amber-600">
                  {'★'.repeat(createdRecord.incoming_rating)}{'☆'.repeat(5 - createdRecord.incoming_rating)} ({createdRecord.incoming_rating}/5)
                </span>
              </div>
            )}
          </div>

          <div className="flex justify-center gap-3">
            <button
              type="button"
              onClick={resetWizard}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-bold cursor-pointer shadow-xs"
            >
              + Log Another Process Stage
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
