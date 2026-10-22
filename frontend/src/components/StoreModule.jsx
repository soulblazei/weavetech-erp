import React, { useState, useEffect } from 'react';
import { 
  Boxes, 
  Plus, 
  Search, 
  Warehouse, 
  Scale, 
  MapPin, 
  Building2, 
  Layers, 
  IndianRupee,
  CheckCircle2,
  Calendar,
  Clock,
  ArrowRight,
  ClipboardList,
  Send,
  AlertCircle,
  FileCheck2,
  X
} from 'lucide-react';
import MasterAutoSuggest from './common/MasterAutoSuggest';
import { storeApi, mockStoreApi } from '../api/client';

export default function StoreModule({ defaultTab = 'requisition' }) {
  const [activeTab, setActiveTab] = useState(defaultTab); // 'requisition', 'issue', 'received', 'opening'
  const [requisitions, setRequisitions] = useState([]);
  const [issues, setIssues] = useState([]);
  const [receivedStock, setReceivedStock] = useState([]);
  const [openings, setOpenings] = useState([]);
  const [summary, setSummary] = useState({ total_lots: 0, total_weight_kg: 0, valuation: 0 });
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Modal States
  const [showReqModal, setShowReqModal] = useState(false);
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [showOpeningModal, setShowOpeningModal] = useState(false);

  // Form States
  const [reqForm, setReqForm] = useState({
    department: 'Weaving Shed',
    item_name: '40s Combed Cotton Yarn',
    quantity_requested: 500,
    uom: 'KG',
    urgency: 'HIGH',
    requested_by: 'Kailash Suthar',
    purpose: 'Loom L-01 warp replenishment'
  });

  const [issueForm, setIssueForm] = useState({
    requisition_no: '',
    item_name: '40s Combed Cotton Yarn',
    quantity_issued: 500,
    uom: 'KG',
    lot_number: 'LOT-20260201-001',
    issued_to_dept: 'Weaving Shed',
    issued_to_person: 'Kailash Suthar',
    issued_by: 'Suresh Choudhary',
    remarks: 'Delivered to Loom Bay 1'
  });

  const [openingForm, setOpeningForm] = useState({
    item_code: 'ITM-YRN-40C',
    item_name: '40s Combed Cotton Yarn',
    financial_year: '2026-2027',
    opening_qty: 10000,
    uom: 'KG',
    rate_per_unit: 310,
    godown_bay: 'Bay A-01'
  });

  const loadAllData = async () => {
    setIsLoading(true);
    try {
      const [sumRes, reqRes, issRes, recRes, opnRes] = await Promise.all([
        storeApi.getSummary(),
        storeApi.getRequisitions(),
        storeApi.getIssues(),
        storeApi.getReceived(),
        storeApi.getOpenings()
      ]);
      setSummary(sumRes || { total_lots: 0, total_weight_kg: 0, valuation: 0 });
      setRequisitions(reqRes || []);
      setIssues(issRes || []);
      setReceivedStock(recRes || []);
      setOpenings(opnRes || []);
    } catch (e) {
      console.error('Failed to load store data', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const handleCreateRequisition = async (e) => {
    e.preventDefault();
    await storeApi.createRequisition(reqForm);
    setShowReqModal(false);
    loadAllData();
    setReqForm({
      department: 'Weaving Shed',
      item_name: '',
      quantity_requested: 100,
      uom: 'KG',
      urgency: 'MEDIUM',
      requested_by: '',
      purpose: ''
    });
  };

  const handleCreateIssue = async (e) => {
    e.preventDefault();
    await storeApi.createIssue(issueForm);
    setShowIssueModal(false);
    loadAllData();
    setIssueForm({
      requisition_no: '',
      item_name: '',
      quantity_issued: 100,
      uom: 'KG',
      lot_number: '',
      issued_to_dept: 'Weaving Shed',
      issued_to_person: '',
      issued_by: 'Suresh Choudhary',
      remarks: ''
    });
  };

  const handleCreateOpening = async (e) => {
    e.preventDefault();
    await storeApi.createOpening(openingForm);
    setShowOpeningModal(false);
    loadAllData();
  };

  const formatRs = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

  const tabs = [
    { id: 'requisition', label: '1. Requisitions', count: requisitions.length },
    { id: 'issue', label: '2. Material Issue', count: issues.length },
    { id: 'received', label: '3. Material Received (Stock)', count: receivedStock.length },
    { id: 'opening', label: '4. Item Opening Balance', count: openings.length },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Boxes className="w-7 h-7 text-indigo-600" />
            <h1 className="text-2xl font-black text-slate-900">Store & Plant Inventory Module</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Shop-floor requisitions, stock issues, inward receipts, and session opening balances.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {activeTab === 'requisition' && (
            <button
              onClick={() => setShowReqModal(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-xs flex items-center gap-2 cursor-pointer transition"
            >
              <Plus className="w-4 h-4" /> Raise Requisition
            </button>
          )}
          {activeTab === 'issue' && (
            <button
              onClick={() => setShowIssueModal(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-xs flex items-center gap-2 cursor-pointer transition"
            >
              <Plus className="w-4 h-4" /> New Material Issue
            </button>
          )}
          {activeTab === 'opening' && (
            <button
              onClick={() => setShowOpeningModal(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-xs flex items-center gap-2 cursor-pointer transition"
            >
              <Plus className="w-4 h-4" /> Add Opening Balance
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 flex items-center gap-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
            <Boxes className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase text-slate-500 block">Active Stock Lots</span>
            <p className="text-2xl font-black font-mono text-slate-900 mt-0.5">{receivedStock.length || summary.total_lots || 2}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
            <Scale className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase text-slate-500 block">Total Yarn In Stock</span>
            <p className="text-2xl font-black font-mono text-slate-900 mt-0.5">
              {(receivedStock.reduce((s, r) => s + (Number(r.received_qty) || 0), 0) || summary.total_weight_kg || 10000).toLocaleString('en-IN')} kg
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
            <ClipboardList className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase text-slate-500 block">Pending Requisitions</span>
            <p className="text-2xl font-black font-mono text-slate-900 mt-0.5">
              {requisitions.filter(r => r.status === 'PENDING').length}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
            <IndianRupee className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase text-slate-500 block">Opening Stock Valuation</span>
            <p className="text-2xl font-black font-mono text-slate-900 mt-0.5">
              {formatRs(openings.reduce((s, o) => s + (Number(o.total_valuation) || 0), 0) || 5362500)}
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
            <span className={`text-[10px] px-2 py-0.5 rounded-full ${
              activeTab === tab.id ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-700'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Tab 1: Requisitions */}
      {activeTab === 'requisition' && (
        <div className="bg-white rounded-b-2xl border border-slate-200 border-t-0 shadow-xs p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">Internal Shop-Floor Requisitions</h2>
            <div className="relative w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Filter requisitions..."
                className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-8 pr-3 py-1.5 text-xs font-semibold"
              />
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/70 text-slate-600 font-bold border-b border-slate-200 uppercase text-[10px]">
                <tr>
                  <th className="p-3">Req No</th>
                  <th className="p-3">Department</th>
                  <th className="p-3">Item Name</th>
                  <th className="p-3">Quantity</th>
                  <th className="p-3">Urgency</th>
                  <th className="p-3">Requested By</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {requisitions.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-400 font-semibold">No requisitions logged yet.</td>
                  </tr>
                ) : (
                  requisitions.map(r => (
                    <tr key={r.id} className="hover:bg-slate-50 transition">
                      <td className="p-3 font-mono font-bold text-indigo-600">{r.req_number}</td>
                      <td className="p-3 font-semibold text-slate-900">{r.department}</td>
                      <td className="p-3 font-bold text-slate-900">{r.item_name}</td>
                      <td className="p-3 font-mono font-bold text-slate-800">{r.quantity_requested} {r.uom}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          r.urgency === 'HIGH' ? 'bg-rose-100 text-rose-800' :
                          r.urgency === 'MEDIUM' ? 'bg-amber-100 text-amber-800' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {r.urgency}
                        </span>
                      </td>
                      <td className="p-3 text-slate-600">{r.requested_by}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          r.status === 'ISSUED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {r.status}
                        </span>
                      </td>
                      <td className="p-3">
                        {r.status === 'PENDING' ? (
                          <button
                            onClick={() => {
                              setIssueForm(prev => ({
                                ...prev,
                                requisition_no: r.req_number,
                                item_name: r.item_name,
                                quantity_issued: r.quantity_requested,
                                uom: r.uom,
                                issued_to_dept: r.department,
                                issued_to_person: r.requested_by
                              }));
                              setActiveTab('issue');
                              setShowIssueModal(true);
                            }}
                            className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer"
                          >
                            Issue Material →
                          </button>
                        ) : (
                          <span className="text-emerald-600 font-bold text-[11px] flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Issued
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Material Issue */}
      {activeTab === 'issue' && (
        <div className="bg-white rounded-b-2xl border border-slate-200 border-t-0 shadow-xs p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">Store Material Issues & Allocation Log</h2>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/70 text-slate-600 font-bold border-b border-slate-200 uppercase text-[10px]">
                <tr>
                  <th className="p-3">Issue No</th>
                  <th className="p-3">Requisition Ref</th>
                  <th className="p-3">Item Issued</th>
                  <th className="p-3">Qty Issued</th>
                  <th className="p-3">Lot No</th>
                  <th className="p-3">Issued To</th>
                  <th className="p-3">Issued By</th>
                  <th className="p-3">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {issues.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-400 font-semibold">No materials issued yet.</td>
                  </tr>
                ) : (
                  issues.map(iss => (
                    <tr key={iss.id} className="hover:bg-slate-50 transition">
                      <td className="p-3 font-mono font-bold text-indigo-600">{iss.issue_number}</td>
                      <td className="p-3 font-mono text-slate-600">{iss.requisition_no || 'DIRECT_ISSUE'}</td>
                      <td className="p-3 font-bold text-slate-900">{iss.item_name}</td>
                      <td className="p-3 font-mono font-bold text-slate-800">{iss.quantity_issued} {iss.uom}</td>
                      <td className="p-3 font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold w-fit">{iss.lot_number || 'N/A'}</td>
                      <td className="p-3 font-semibold text-slate-800">{iss.issued_to_person} ({iss.issued_to_dept})</td>
                      <td className="p-3 text-slate-600">{iss.issued_by}</td>
                      <td className="p-3 text-slate-500 font-mono text-[11px]">{new Date(iss.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Material Received (Stock Log) */}
      {activeTab === 'received' && (
        <div className="bg-white rounded-b-2xl border border-slate-200 border-t-0 shadow-xs p-6 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">Inward Material Stock & Lot Directory</h2>
              <p className="text-xs text-slate-500 mt-0.5">Automated GRN sync & verified store inward stock balances.</p>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/70 text-slate-600 font-bold border-b border-slate-200 uppercase text-[10px]">
                <tr>
                  <th className="p-3">GRN No</th>
                  <th className="p-3">Lot Number</th>
                  <th className="p-3">Item Description</th>
                  <th className="p-3">Supplier Name</th>
                  <th className="p-3">Stock Quantity</th>
                  <th className="p-3">Godown Bay</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {receivedStock.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-400 font-semibold">No inward stocks recorded.</td>
                  </tr>
                ) : (
                  receivedStock.map(rec => (
                    <tr key={rec.id} className="hover:bg-slate-50 transition">
                      <td className="p-3 font-mono font-bold text-indigo-600">{rec.grn_no || 'GRN-INW'}</td>
                      <td className="p-3 font-mono font-bold text-slate-900 bg-slate-100/70 rounded px-2 py-0.5 w-fit">{rec.lot_number}</td>
                      <td className="p-3 font-bold text-slate-900">{rec.item_name}</td>
                      <td className="p-3 font-semibold text-slate-700">{rec.supplier_name}</td>
                      <td className="p-3 font-mono font-black text-emerald-700">{rec.received_qty} {rec.uom}</td>
                      <td className="p-3 font-semibold text-slate-600 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" /> {rec.godown_bay || 'Main Godown'}
                      </td>
                      <td className="p-3">
                        <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-[10px] font-bold">
                          {rec.status || 'ACTIVE_STOCK'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Item Opening Balance */}
      {activeTab === 'opening' && (
        <div className="bg-white rounded-b-2xl border border-slate-200 border-t-0 shadow-xs p-6 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">Financial Year Item Opening Balances</h2>
              <p className="text-xs text-slate-500 mt-0.5">Starting inventory balances initialized for FY 2026-2027.</p>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/70 text-slate-600 font-bold border-b border-slate-200 uppercase text-[10px]">
                <tr>
                  <th className="p-3">Item Code</th>
                  <th className="p-3">Item Name</th>
                  <th className="p-3">FY Session</th>
                  <th className="p-3">Opening Qty</th>
                  <th className="p-3">Rate / Unit</th>
                  <th className="p-3">Total Valuation</th>
                  <th className="p-3">Godown Bay</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {openings.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-400 font-semibold">No opening balances recorded.</td>
                  </tr>
                ) : (
                  openings.map(op => (
                    <tr key={op.id} className="hover:bg-slate-50 transition">
                      <td className="p-3 font-mono font-bold text-indigo-600">{op.item_code}</td>
                      <td className="p-3 font-bold text-slate-900">{op.item_name}</td>
                      <td className="p-3 font-mono text-slate-600">{op.financial_year || '2026-2027'}</td>
                      <td className="p-3 font-mono font-bold text-slate-900">{op.opening_qty} {op.uom}</td>
                      <td className="p-3 font-mono text-slate-700">{formatRs(op.rate_per_unit)}</td>
                      <td className="p-3 font-mono font-black text-emerald-700">{formatRs(op.total_valuation || (op.opening_qty * op.rate_per_unit))}</td>
                      <td className="p-3 text-slate-600">{op.godown_bay || 'Bay A-01'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Raise Requisition */}
      {showReqModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in zoom-in-95">
            <div className="p-5 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <div className="flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-indigo-600" />
                <h3 className="text-sm font-black text-slate-900">Raise Store Requisition</h3>
              </div>
              <button onClick={() => setShowReqModal(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRequisition} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Target Department</label>
                  <select
                    value={reqForm.department}
                    onChange={e => setReqForm({ ...reqForm, department: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold"
                  >
                    <option value="Weaving Shed">Weaving Shed</option>
                    <option value="Winding">Winding</option>
                    <option value="TFO Twisting">TFO Twisting</option>
                    <option value="Warping">Warping</option>
                    <option value="Sizing">Sizing</option>
                    <option value="Maintenance">Maintenance</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Urgency</label>
                  <select
                    value={reqForm.urgency}
                    onChange={e => setReqForm({ ...reqForm, urgency: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold"
                  >
                    <option value="HIGH">HIGH (Urgent)</option>
                    <option value="MEDIUM">MEDIUM (Standard)</option>
                    <option value="LOW">LOW (Replenishment)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Item Required</label>
                <MasterAutoSuggest
                  masterType="items"
                  placeholder="Select yarn count / chemical / spare..."
                  value={reqForm.item_name}
                  onChange={val => setReqForm({ ...reqForm, item_name: val })}
                  onSelect={itm => setReqForm({ ...reqForm, item_name: itm.item_name, uom: itm.unit_of_measure || 'KG' })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Quantity Requested</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={reqForm.quantity_requested}
                    onChange={e => setReqForm({ ...reqForm, quantity_requested: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">UOM</label>
                  <input
                    type="text"
                    value={reqForm.uom}
                    onChange={e => setReqForm({ ...reqForm, uom: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Requested By (Worker / Supervisor)</label>
                <MasterAutoSuggest
                  masterType="employees"
                  placeholder="Select employee name..."
                  value={reqForm.requested_by}
                  onChange={val => setReqForm({ ...reqForm, requested_by: val })}
                  onSelect={emp => setReqForm({ ...reqForm, requested_by: emp.full_name })}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Purpose / Remarks</label>
                <input
                  type="text"
                  value={reqForm.purpose}
                  onChange={e => setReqForm({ ...reqForm, purpose: e.target.value })}
                  placeholder="e.g., Loom L-03 warp replenishment"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowReqModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 shadow-xs cursor-pointer"
                >
                  Submit Requisition
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Material Issue */}
      {showIssueModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in zoom-in-95">
            <div className="p-5 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <div className="flex items-center gap-2">
                <Send className="w-5 h-5 text-indigo-600" />
                <h3 className="text-sm font-black text-slate-900">Issue Material to Floor</h3>
              </div>
              <button onClick={() => setShowIssueModal(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateIssue} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Requisition No (Optional)</label>
                  <input
                    type="text"
                    value={issueForm.requisition_no}
                    onChange={e => setIssueForm({ ...issueForm, requisition_no: e.target.value })}
                    placeholder="REQ-2026-xxx"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Stock Lot No</label>
                  <input
                    type="text"
                    required
                    value={issueForm.lot_number}
                    onChange={e => setIssueForm({ ...issueForm, lot_number: e.target.value })}
                    placeholder="LOT-20260201-001"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Item Name</label>
                <MasterAutoSuggest
                  masterType="items"
                  placeholder="Select yarn count / chemical / spare..."
                  value={issueForm.item_name}
                  onChange={val => setIssueForm({ ...issueForm, item_name: val })}
                  onSelect={itm => setIssueForm({ ...issueForm, item_name: itm.item_name, uom: itm.unit_of_measure || 'KG' })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Quantity Issued</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={issueForm.quantity_issued}
                    onChange={e => setIssueForm({ ...issueForm, quantity_issued: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Department</label>
                  <select
                    value={issueForm.issued_to_dept}
                    onChange={e => setIssueForm({ ...issueForm, issued_to_dept: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold"
                  >
                    <option value="Weaving Shed">Weaving Shed</option>
                    <option value="Winding">Winding</option>
                    <option value="TFO Twisting">TFO Twisting</option>
                    <option value="Warping">Warping</option>
                    <option value="Sizing">Sizing</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Issued To (Operator)</label>
                  <MasterAutoSuggest
                    masterType="employees"
                    placeholder="Recipient name..."
                    value={issueForm.issued_to_person}
                    onChange={val => setIssueForm({ ...issueForm, issued_to_person: val })}
                    onSelect={emp => setIssueForm({ ...issueForm, issued_to_person: emp.full_name })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Store Incharge</label>
                  <input
                    type="text"
                    value={issueForm.issued_by}
                    onChange={e => setIssueForm({ ...issueForm, issued_by: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Remarks</label>
                <input
                  type="text"
                  value={issueForm.remarks}
                  onChange={e => setIssueForm({ ...issueForm, remarks: e.target.value })}
                  placeholder="e.g., Gate Pass / Loom loading complete"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowIssueModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 shadow-xs cursor-pointer"
                >
                  Confirm Material Issue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Item Opening Balance */}
      {showOpeningModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in zoom-in-95">
            <div className="p-5 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <div className="flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-indigo-600" />
                <h3 className="text-sm font-black text-slate-900">Add Item Opening Balance</h3>
              </div>
              <button onClick={() => setShowOpeningModal(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateOpening} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Item Selection</label>
                <MasterAutoSuggest
                  masterType="items"
                  placeholder="Select yarn count / fabric..."
                  value={openingForm.item_name}
                  onChange={val => setOpeningForm({ ...openingForm, item_name: val })}
                  onSelect={itm => setOpeningForm({
                    ...openingForm,
                    item_code: itm.item_code,
                    item_name: itm.item_name,
                    uom: itm.unit_of_measure || 'KG',
                    rate_per_unit: itm.standard_cost || 310
                  })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Opening Quantity</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={openingForm.opening_qty}
                    onChange={e => setOpeningForm({ ...openingForm, opening_qty: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Rate Per Unit (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={openingForm.rate_per_unit}
                    onChange={e => setOpeningForm({ ...openingForm, rate_per_unit: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Financial Year</label>
                  <input
                    type="text"
                    value={openingForm.financial_year}
                    onChange={e => setOpeningForm({ ...openingForm, financial_year: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Godown Bay</label>
                  <input
                    type="text"
                    value={openingForm.godown_bay}
                    onChange={e => setOpeningForm({ ...openingForm, godown_bay: e.target.value })}
                    placeholder="Bay A-01"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold"
                  />
                </div>
              </div>

              <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl flex justify-between items-center">
                <span className="text-xs font-bold text-indigo-900">Total Calculated Valuation:</span>
                <span className="text-sm font-black font-mono text-indigo-700">
                  {formatRs((openingForm.opening_qty || 0) * (openingForm.rate_per_unit || 0))}
                </span>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowOpeningModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 shadow-xs cursor-pointer"
                >
                  Save Opening Balance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
