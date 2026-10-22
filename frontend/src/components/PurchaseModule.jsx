import React, { useState, useEffect } from 'react';
import { 
  ShoppingCart, 
  Plus, 
  Search, 
  Building2, 
  Package, 
  IndianRupee, 
  FileText, 
  CheckCircle2, 
  Clock, 
  Truck,
  AlertTriangle,
  Receipt,
  RotateCcw,
  ArrowRight,
  ClipboardCheck,
  BadgeAlert,
  X
} from 'lucide-react';
import MasterAutoSuggest from './common/MasterAutoSuggest';
import { purchaseApi } from '../api/client';

export default function PurchaseModule({ defaultTab = 'po' }) {
  const [activeTab, setActiveTab] = useState(defaultTab); // 'indent', 'po', 'inward', 'grn', 'bills', 'returns'
  const [indents, setIndents] = useState([]);
  const [orders, setOrders] = useState([]);
  const [inwards, setInwards] = useState([]);
  const [grns, setGrns] = useState([]);
  const [bills, setBills] = useState([]);
  const [returns, setReturns] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [showIndentModal, setShowIndentModal] = useState(false);
  const [showPOModal, setShowPOModal] = useState(false);
  const [showInwardModal, setShowInwardModal] = useState(false);
  const [showGRNModal, setShowGRNModal] = useState(false);
  const [showBillModal, setShowBillModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);

  // Forms
  const [indentForm, setIndentForm] = useState({
    department: 'Weaving Shed',
    item_name: '40s Combed Cotton Yarn',
    required_qty: 10000,
    uom: 'KG',
    estimated_rate: 310,
    urgency: 'HIGH',
    remarks: 'For bulk fabric export run'
  });

  const [poForm, setPoForm] = useState({
    supplier_name: 'Nahar Spinning',
    item_name: '40s Combed Cotton Yarn',
    item_category: 'RAW_YARN',
    ordered_qty: 10000,
    uom: 'KG',
    rate_per_unit: 310,
    tax_percent: 5,
    payment_terms: '15 Days Credit',
    delivery_date: '2026-03-25',
    remarks: 'Pre-shipment yarn test certificate required'
  });

  const [inwardForm, setInwardForm] = useState({
    po_number: 'PO-2026-001',
    supplier_name: 'Nahar Spinning',
    vehicle_number: 'PB-10-CZ-4412',
    challan_number: 'CH-98124',
    received_qty: 6000,
    uom: 'KG',
    bags_count: 120,
    gross_weight: 6060,
    net_weight: 6000,
    condition_remarks: 'All bags undamaged and sealed'
  });

  const [grnForm, setGrnForm] = useState({
    po_number: 'PO-2026-001',
    inward_number: 'INW-2026-001',
    supplier_name: 'Nahar Spinning',
    item_name: '40s Combed Cotton Yarn',
    lot_number: 'LOT-20260201-001',
    accepted_qty: 6000,
    rejected_qty: 0,
    uom: 'KG',
    qc_remarks: 'Moisture 6.5%, CSP 2350 passed standard'
  });

  const [billForm, setBillForm] = useState({
    supplier_name: 'Nahar Spinning',
    supplier_invoice_no: 'INV-SPIN-8891',
    po_number: 'PO-2026-001',
    grn_number: 'GRN-2026-001',
    taxable_amount: 1860000,
    due_date: '2026-03-15'
  });

  const [returnForm, setReturnForm] = useState({
    supplier_name: 'Alok Industries',
    po_number: 'PO-2026-003',
    lot_number: 'LOT-20260215-003',
    return_qty: 500,
    uom: 'KG',
    rate_per_unit: 280,
    reason: 'Count variation beyond tolerance (CV% > 2.8)'
  });

  const loadAllData = async () => {
    setIsLoading(true);
    try {
      const [indRes, poRes, inwRes, grnRes, billRes, retRes] = await Promise.all([
        purchaseApi.getIndents(),
        purchaseApi.getOrders(),
        purchaseApi.getInwards(),
        purchaseApi.getGRNs(),
        purchaseApi.getBills(),
        purchaseApi.getReturns()
      ]);
      setIndents(indRes || []);
      setOrders(poRes || []);
      setInwards(inwRes || []);
      setGrns(grnRes || []);
      setBills(billRes || []);
      setReturns(retRes || []);
    } catch (e) {
      console.error('Failed to load purchase data', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const handleCreateIndent = async (e) => {
    e.preventDefault();
    await purchaseApi.createIndent(indentForm);
    setShowIndentModal(false);
    loadAllData();
  };

  const handleCreatePO = async (e) => {
    e.preventDefault();
    await purchaseApi.createOrder(poForm);
    setShowPOModal(false);
    loadAllData();
  };

  const handleCreateInward = async (e) => {
    e.preventDefault();
    await purchaseApi.createInward(inwardForm);
    setShowInwardModal(false);
    loadAllData();
  };

  const handleCreateGRN = async (e) => {
    e.preventDefault();
    await purchaseApi.createGRN(grnForm);
    setShowGRNModal(false);
    loadAllData();
  };

  const handleCreateBill = async (e) => {
    e.preventDefault();
    await purchaseApi.createBill(billForm);
    setShowBillModal(false);
    loadAllData();
  };

  const handleCreateReturn = async (e) => {
    e.preventDefault();
    await purchaseApi.createReturn({
      ...returnForm,
      debit_amount: (returnForm.return_qty * returnForm.rate_per_unit) * 1.05
    });
    setShowReturnModal(false);
    loadAllData();
  };

  const formatRs = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

  const tabs = [
    { id: 'indent', label: '1. Indents', count: indents.length },
    { id: 'po', label: '2. Purchase Orders (PO)', count: orders.length },
    { id: 'inward', label: '3. Gate Inward', count: inwards.length },
    { id: 'grn', label: '4. GRN (Receipt & QC)', count: grns.length },
    { id: 'bills', label: '5. Purchase Bills', count: bills.length },
    { id: 'returns', label: '6. Purchase Returns', count: returns.length },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-7 h-7 text-indigo-600" />
            <h1 className="text-2xl font-black text-slate-900">Purchase & Procurement Module</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Supplier purchase orders, gate inward verification, GRN store sync, vendor bills, and debit note returns.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {activeTab === 'indent' && (
            <button
              onClick={() => setShowIndentModal(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-xs flex items-center gap-2 cursor-pointer transition"
            >
              <Plus className="w-4 h-4" /> Raise Purchase Indent
            </button>
          )}
          {activeTab === 'po' && (
            <button
              onClick={() => setShowPOModal(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-xs flex items-center gap-2 cursor-pointer transition"
            >
              <Plus className="w-4 h-4" /> Create Purchase Order
            </button>
          )}
          {activeTab === 'inward' && (
            <button
              onClick={() => setShowInwardModal(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-xs flex items-center gap-2 cursor-pointer transition"
            >
              <Plus className="w-4 h-4" /> Gate Inward Entry
            </button>
          )}
          {activeTab === 'grn' && (
            <button
              onClick={() => setShowGRNModal(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-xs flex items-center gap-2 cursor-pointer transition"
            >
              <Plus className="w-4 h-4" /> Generate GRN
            </button>
          )}
          {activeTab === 'bills' && (
            <button
              onClick={() => setShowBillModal(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-xs flex items-center gap-2 cursor-pointer transition"
            >
              <Plus className="w-4 h-4" /> Add Purchase Bill
            </button>
          )}
          {activeTab === 'returns' && (
            <button
              onClick={() => setShowReturnModal(true)}
              className="bg-rose-600 hover:bg-rose-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-xs flex items-center gap-2 cursor-pointer transition"
            >
              <Plus className="w-4 h-4" /> Create Purchase Return
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 flex items-center gap-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
            <ShoppingCart className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase text-slate-500 block">Total POs Raised</span>
            <p className="text-2xl font-black font-mono text-slate-900 mt-0.5">{orders.length}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
            <IndianRupee className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase text-slate-500 block">PO Commitment Value</span>
            <p className="text-2xl font-black font-mono text-slate-900 mt-0.5">
              {formatRs(orders.reduce((s, o) => s + (Number(o.grand_total) || 0), 0) || 5901000)}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
            <ClipboardCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase text-slate-500 block">GRNs Accepted</span>
            <p className="text-2xl font-black font-mono text-slate-900 mt-0.5">{grns.length}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 flex items-center gap-4">
          <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl">
            <RotateCcw className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase text-slate-500 block">Debit Notes Raised</span>
            <p className="text-2xl font-black font-mono text-slate-900 mt-0.5">{returns.length}</p>
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

      {/* Tab 1: Indents */}
      {activeTab === 'indent' && (
        <div className="bg-white rounded-b-2xl border border-slate-200 border-t-0 shadow-xs p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">Internal Purchase Indents</h2>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/70 text-slate-600 font-bold border-b border-slate-200 uppercase text-[10px]">
                <tr>
                  <th className="p-3">Indent No</th>
                  <th className="p-3">Department</th>
                  <th className="p-3">Item Name</th>
                  <th className="p-3">Required Qty</th>
                  <th className="p-3">Est. Rate</th>
                  <th className="p-3">Urgency</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {indents.length === 0 ? (
                  <tr><td colSpan={8} className="p-8 text-center text-slate-400">No purchase indents found.</td></tr>
                ) : (
                  indents.map(ind => (
                    <tr key={ind.id} className="hover:bg-slate-50 transition">
                      <td className="p-3 font-mono font-bold text-indigo-600">{ind.indent_number}</td>
                      <td className="p-3 font-semibold text-slate-800">{ind.department}</td>
                      <td className="p-3 font-bold text-slate-900">{ind.item_name}</td>
                      <td className="p-3 font-mono font-bold text-slate-900">{ind.required_qty} {ind.uom}</td>
                      <td className="p-3 font-mono text-slate-700">{formatRs(ind.estimated_rate)}</td>
                      <td className="p-3">
                        <span className="bg-rose-100 text-rose-800 px-2 py-0.5 rounded text-[10px] font-bold">{ind.urgency}</span>
                      </td>
                      <td className="p-3">
                        <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-[10px] font-bold">{ind.status}</span>
                      </td>
                      <td className="p-3">
                        <button
                          onClick={() => {
                            setPoForm(prev => ({
                              ...prev,
                              item_name: ind.item_name,
                              ordered_qty: ind.required_qty,
                              rate_per_unit: ind.estimated_rate,
                              uom: ind.uom
                            }));
                            setActiveTab('po');
                            setShowPOModal(true);
                          }}
                          className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer"
                        >
                          Convert to PO →
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

      {/* Tab 2: Purchase Orders */}
      {activeTab === 'po' && (
        <div className="bg-white rounded-b-2xl border border-slate-200 border-t-0 shadow-xs p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">Purchase Order (PO) Register</h2>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/70 text-slate-600 font-bold border-b border-slate-200 uppercase text-[10px]">
                <tr>
                  <th className="p-3">PO Number</th>
                  <th className="p-3">Supplier Name</th>
                  <th className="p-3">Item Description</th>
                  <th className="p-3">Ordered Qty</th>
                  <th className="p-3">Rate / Unit</th>
                  <th className="p-3">Grand Total</th>
                  <th className="p-3">Delivery Date</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Inward Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {orders.length === 0 ? (
                  <tr><td colSpan={9} className="p-8 text-center text-slate-400">No purchase orders recorded.</td></tr>
                ) : (
                  orders.map(po => (
                    <tr key={po.id} className="hover:bg-slate-50 transition">
                      <td className="p-3 font-mono font-bold text-indigo-600">{po.po_number}</td>
                      <td className="p-3 font-bold text-slate-900">{po.supplier_name}</td>
                      <td className="p-3 font-semibold text-slate-800">{po.item_name}</td>
                      <td className="p-3 font-mono font-bold text-slate-900">{po.ordered_qty} {po.uom || 'KG'}</td>
                      <td className="p-3 font-mono text-slate-700">{formatRs(po.rate_per_unit)}</td>
                      <td className="p-3 font-mono font-black text-emerald-700">{formatRs(po.grand_total || (po.ordered_qty * po.rate_per_unit * 1.05))}</td>
                      <td className="p-3 font-mono text-slate-600">{po.delivery_date}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          po.status === 'CLOSED' ? 'bg-emerald-100 text-emerald-800' :
                          po.status === 'PARTIALLY_RECEIVED' ? 'bg-blue-100 text-blue-800' :
                          'bg-amber-100 text-amber-800'
                        }`}>
                          {po.status}
                        </span>
                      </td>
                      <td className="p-3">
                        {po.status !== 'CLOSED' && (
                          <button
                            onClick={() => {
                              setInwardForm(prev => ({
                                ...prev,
                                po_number: po.po_number,
                                supplier_name: po.supplier_name,
                                received_qty: po.ordered_qty,
                                uom: po.uom || 'KG'
                              }));
                              setActiveTab('inward');
                              setShowInwardModal(true);
                            }}
                            className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer"
                          >
                            Gate Inward →
                          </button>
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

      {/* Tab 3: Gate Inwards */}
      {activeTab === 'inward' && (
        <div className="bg-white rounded-b-2xl border border-slate-200 border-t-0 shadow-xs p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">Gate Inward Log & Delivery Challans</h2>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/70 text-slate-600 font-bold border-b border-slate-200 uppercase text-[10px]">
                <tr>
                  <th className="p-3">Inward No</th>
                  <th className="p-3">PO Number</th>
                  <th className="p-3">Supplier Name</th>
                  <th className="p-3">Challan No</th>
                  <th className="p-3">Vehicle No</th>
                  <th className="p-3">Net Weight</th>
                  <th className="p-3">Bags Count</th>
                  <th className="p-3">GRN Generation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {inwards.length === 0 ? (
                  <tr><td colSpan={8} className="p-8 text-center text-slate-400">No gate inward entries logged.</td></tr>
                ) : (
                  inwards.map(inw => (
                    <tr key={inw.id} className="hover:bg-slate-50 transition">
                      <td className="p-3 font-mono font-bold text-indigo-600">{inw.inward_number}</td>
                      <td className="p-3 font-mono text-slate-700">{inw.po_number}</td>
                      <td className="p-3 font-bold text-slate-900">{inw.supplier_name}</td>
                      <td className="p-3 font-mono text-slate-800">{inw.challan_number}</td>
                      <td className="p-3 font-mono text-slate-600">{inw.vehicle_number}</td>
                      <td className="p-3 font-mono font-black text-slate-900">{inw.net_weight} {inw.uom}</td>
                      <td className="p-3 font-mono">{inw.bags_count} Bags</td>
                      <td className="p-3">
                        <button
                          onClick={() => {
                            setGrnForm(prev => ({
                              ...prev,
                              po_number: inw.po_number,
                              inward_number: inw.inward_number,
                              supplier_name: inw.supplier_name,
                              accepted_qty: inw.net_weight,
                              uom: inw.uom
                            }));
                            setActiveTab('grn');
                            setShowGRNModal(true);
                          }}
                          className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer"
                        >
                          Generate GRN →
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

      {/* Tab 4: GRNs */}
      {activeTab === 'grn' && (
        <div className="bg-white rounded-b-2xl border border-slate-200 border-t-0 shadow-xs p-6 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">Goods Receipt Notes (GRN) & QC Handoff</h2>
              <p className="text-xs text-slate-500 mt-0.5">Approved GRNs automatically credit Store stock and update PO status.</p>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/70 text-slate-600 font-bold border-b border-slate-200 uppercase text-[10px]">
                <tr>
                  <th className="p-3">GRN No</th>
                  <th className="p-3">PO Ref</th>
                  <th className="p-3">Lot Number</th>
                  <th className="p-3">Supplier Name</th>
                  <th className="p-3">Accepted Qty</th>
                  <th className="p-3">Rejected Qty</th>
                  <th className="p-3">QC Status</th>
                  <th className="p-3">Inter-Module Sync</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {grns.length === 0 ? (
                  <tr><td colSpan={8} className="p-8 text-center text-slate-400">No GRNs posted.</td></tr>
                ) : (
                  grns.map(grn => (
                    <tr key={grn.id} className="hover:bg-slate-50 transition">
                      <td className="p-3 font-mono font-bold text-indigo-600">{grn.grn_number}</td>
                      <td className="p-3 font-mono text-slate-600">{grn.po_number}</td>
                      <td className="p-3 font-mono font-bold text-slate-900 bg-slate-100/70 rounded px-2 py-0.5 w-fit">{grn.lot_number}</td>
                      <td className="p-3 font-bold text-slate-900">{grn.supplier_name}</td>
                      <td className="p-3 font-mono font-black text-emerald-700">{grn.accepted_qty} {grn.uom}</td>
                      <td className="p-3 font-mono font-bold text-rose-600">{grn.rejected_qty || 0} {grn.uom}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          grn.qc_status === 'ACCEPTED' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {grn.qc_status}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 w-fit">
                          <CheckCircle2 className="w-3 h-3" /> Store Stock Credited
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

      {/* Tab 5: Purchase Bills */}
      {activeTab === 'bills' && (
        <div className="bg-white rounded-b-2xl border border-slate-200 border-t-0 shadow-xs p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">Vendor Purchase Bills & GST Invoices</h2>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/70 text-slate-600 font-bold border-b border-slate-200 uppercase text-[10px]">
                <tr>
                  <th className="p-3">Bill Number</th>
                  <th className="p-3">Supplier Invoice</th>
                  <th className="p-3">Supplier Name</th>
                  <th className="p-3">GRN Reference</th>
                  <th className="p-3">Taxable Amount</th>
                  <th className="p-3">GST Amount</th>
                  <th className="p-3">Grand Total</th>
                  <th className="p-3">Due Date</th>
                  <th className="p-3">Payment Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {bills.length === 0 ? (
                  <tr><td colSpan={9} className="p-8 text-center text-slate-400">No purchase bills recorded.</td></tr>
                ) : (
                  bills.map(b => (
                    <tr key={b.id} className="hover:bg-slate-50 transition">
                      <td className="p-3 font-mono font-bold text-indigo-600">{b.bill_number}</td>
                      <td className="p-3 font-mono font-bold text-slate-900">{b.supplier_invoice_no}</td>
                      <td className="p-3 font-bold text-slate-900">{b.supplier_name}</td>
                      <td className="p-3 font-mono text-slate-600">{b.grn_number}</td>
                      <td className="p-3 font-mono text-slate-700">{formatRs(b.taxable_amount)}</td>
                      <td className="p-3 font-mono text-slate-700">{formatRs(b.gst_amount || (b.taxable_amount * 0.05))}</td>
                      <td className="p-3 font-mono font-black text-emerald-700">{formatRs(b.grand_total || (b.taxable_amount * 1.05))}</td>
                      <td className="p-3 font-mono text-slate-600">{b.due_date}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          b.payment_status === 'PAID' ? 'bg-emerald-100 text-emerald-800' :
                          b.payment_status === 'PARTIALLY_PAID' ? 'bg-blue-100 text-blue-800' :
                          'bg-amber-100 text-amber-800'
                        }`}>
                          {b.payment_status}
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

      {/* Tab 6: Purchase Returns */}
      {activeTab === 'returns' && (
        <div className="bg-white rounded-b-2xl border border-slate-200 border-t-0 shadow-xs p-6 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">Purchase Returns & Supplier Debit Notes</h2>
              <p className="text-xs text-slate-500 mt-0.5">Raising a purchase return automatically registers a Debit Note in the Finance Module.</p>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/70 text-slate-600 font-bold border-b border-slate-200 uppercase text-[10px]">
                <tr>
                  <th className="p-3">Return No</th>
                  <th className="p-3">Supplier Name</th>
                  <th className="p-3">Lot No</th>
                  <th className="p-3">Return Qty</th>
                  <th className="p-3">Debit Amount</th>
                  <th className="p-3">Rejection Reason</th>
                  <th className="p-3">Finance Integration</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {returns.length === 0 ? (
                  <tr><td colSpan={7} className="p-8 text-center text-slate-400">No purchase returns recorded.</td></tr>
                ) : (
                  returns.map(ret => (
                    <tr key={ret.id} className="hover:bg-slate-50 transition">
                      <td className="p-3 font-mono font-bold text-rose-600">{ret.return_number}</td>
                      <td className="p-3 font-bold text-slate-900">{ret.supplier_name}</td>
                      <td className="p-3 font-mono text-slate-700">{ret.lot_number}</td>
                      <td className="p-3 font-mono font-bold text-slate-900">{ret.return_qty} {ret.uom}</td>
                      <td className="p-3 font-mono font-black text-rose-700">{formatRs(ret.debit_amount)}</td>
                      <td className="p-3 text-slate-600">{ret.reason}</td>
                      <td className="p-3">
                        <span className="bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 w-fit">
                          <CheckCircle2 className="w-3 h-3" /> Debit Note Active in Accounts
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

      {/* Modal: Create Indent */}
      {showIndentModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in zoom-in-95">
            <div className="p-5 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-indigo-600" />
                <h3 className="text-sm font-black text-slate-900">Raise Purchase Indent</h3>
              </div>
              <button onClick={() => setShowIndentModal(false)} className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateIndent} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Department</label>
                  <select
                    value={indentForm.department}
                    onChange={e => setIndentForm({ ...indentForm, department: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold"
                  >
                    <option value="Weaving Shed">Weaving Shed</option>
                    <option value="Winding">Winding</option>
                    <option value="Sizing">Sizing</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Urgency</label>
                  <select
                    value={indentForm.urgency}
                    onChange={e => setIndentForm({ ...indentForm, urgency: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold"
                  >
                    <option value="HIGH">HIGH (Urgent)</option>
                    <option value="MEDIUM">MEDIUM (Standard)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Item Required</label>
                <MasterAutoSuggest
                  masterType="items"
                  placeholder="Select yarn count / raw material..."
                  value={indentForm.item_name}
                  onChange={val => setIndentForm({ ...indentForm, item_name: val })}
                  onSelect={itm => setIndentForm({ ...indentForm, item_name: itm.item_name, estimated_rate: itm.standard_cost || 310 })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Required Quantity</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={indentForm.required_qty}
                    onChange={e => setIndentForm({ ...indentForm, required_qty: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Estimated Rate (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={indentForm.estimated_rate}
                    onChange={e => setIndentForm({ ...indentForm, estimated_rate: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Remarks</label>
                <input
                  type="text"
                  value={indentForm.remarks}
                  onChange={e => setIndentForm({ ...indentForm, remarks: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowIndentModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 shadow-xs cursor-pointer"
                >
                  Submit Indent
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Create PO */}
      {showPOModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in zoom-in-95">
            <div className="p-5 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-indigo-600" />
                <h3 className="text-sm font-black text-slate-900">Create Purchase Order (PO)</h3>
              </div>
              <button onClick={() => setShowPOModal(false)} className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePO} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Supplier / Spinning Mill</label>
                <MasterAutoSuggest
                  masterType="clients"
                  category="YARN_SUPPLIER"
                  placeholder="Select yarn supplier..."
                  value={poForm.supplier_name}
                  onChange={val => setPoForm({ ...poForm, supplier_name: val })}
                  onSelect={s => setPoForm({ ...poForm, supplier_name: s.party_name, payment_terms: s.payment_terms || '15 Days Credit' })}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Item Description</label>
                <MasterAutoSuggest
                  masterType="items"
                  placeholder="Select yarn count..."
                  value={poForm.item_name}
                  onChange={val => setPoForm({ ...poForm, item_name: val })}
                  onSelect={itm => setPoForm({ ...poForm, item_name: itm.item_name, rate_per_unit: itm.standard_cost || 310 })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Ordered Quantity (KG)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={poForm.ordered_qty}
                    onChange={e => setPoForm({ ...poForm, ordered_qty: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Rate Per KG (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={poForm.rate_per_unit}
                    onChange={e => setPoForm({ ...poForm, rate_per_unit: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Expected Delivery Date</label>
                  <input
                    type="date"
                    required
                    value={poForm.delivery_date}
                    onChange={e => setPoForm({ ...poForm, delivery_date: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Payment Terms</label>
                  <input
                    type="text"
                    value={poForm.payment_terms}
                    onChange={e => setPoForm({ ...poForm, payment_terms: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold"
                  />
                </div>
              </div>

              <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl flex justify-between items-center">
                <span className="text-xs font-bold text-indigo-900">Total Commercial Valuation (5% GST):</span>
                <span className="text-sm font-black font-mono text-indigo-700">
                  {formatRs((poForm.ordered_qty * poForm.rate_per_unit) * 1.05)}
                </span>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowPOModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 shadow-xs cursor-pointer"
                >
                  Confirm Purchase Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Gate Inward */}
      {showInwardModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in zoom-in-95">
            <div className="p-5 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-indigo-600" />
                <h3 className="text-sm font-black text-slate-900">Gate Inward Shipment Entry</h3>
              </div>
              <button onClick={() => setShowInwardModal(false)} className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateInward} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">PO Reference</label>
                  <input
                    type="text"
                    required
                    value={inwardForm.po_number}
                    onChange={e => setInwardForm({ ...inwardForm, po_number: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Supplier Name</label>
                  <input
                    type="text"
                    required
                    value={inwardForm.supplier_name}
                    onChange={e => setInwardForm({ ...inwardForm, supplier_name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Vehicle Number</label>
                  <input
                    type="text"
                    required
                    value={inwardForm.vehicle_number}
                    onChange={e => setInwardForm({ ...inwardForm, vehicle_number: e.target.value })}
                    placeholder="PB-10-CZ-4412"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Challan Number</label>
                  <input
                    type="text"
                    required
                    value={inwardForm.challan_number}
                    onChange={e => setInwardForm({ ...inwardForm, challan_number: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Net Wt (KG)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={inwardForm.net_weight}
                    onChange={e => setInwardForm({ ...inwardForm, net_weight: parseFloat(e.target.value) || 0, received_qty: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Gross Wt (KG)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={inwardForm.gross_weight}
                    onChange={e => setInwardForm({ ...inwardForm, gross_weight: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Bags Count</label>
                  <input
                    type="number"
                    required
                    value={inwardForm.bags_count}
                    onChange={e => setInwardForm({ ...inwardForm, bags_count: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowInwardModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 shadow-xs cursor-pointer"
                >
                  Confirm Gate Inward
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Generate GRN */}
      {showGRNModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in zoom-in-95">
            <div className="p-5 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <div className="flex items-center gap-2">
                <ClipboardCheck className="w-5 h-5 text-emerald-600" />
                <h3 className="text-sm font-black text-slate-900">Goods Receipt Note (GRN) Creation</h3>
              </div>
              <button onClick={() => setShowGRNModal(false)} className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateGRN} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">PO Reference</label>
                  <input
                    type="text"
                    required
                    value={grnForm.po_number}
                    onChange={e => setGrnForm({ ...grnForm, po_number: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Assigned Lot Number</label>
                  <input
                    type="text"
                    required
                    value={grnForm.lot_number}
                    onChange={e => setGrnForm({ ...grnForm, lot_number: e.target.value })}
                    placeholder="LOT-20260201-xxx"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Accepted Qty (KG)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={grnForm.accepted_qty}
                    onChange={e => setGrnForm({ ...grnForm, accepted_qty: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold font-mono text-emerald-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Rejected Qty (KG)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={grnForm.rejected_qty}
                    onChange={e => setGrnForm({ ...grnForm, rejected_qty: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold font-mono text-rose-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">QC Verification Notes</label>
                <input
                  type="text"
                  value={grnForm.qc_remarks}
                  onChange={e => setGrnForm({ ...grnForm, qc_remarks: e.target.value })}
                  placeholder="Count & CSP report verified..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold"
                />
              </div>

              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-[11px] text-emerald-900 font-semibold space-y-1">
                <div className="flex items-center gap-1.5 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Automated Cross-Module Triggers:</span>
                </div>
                <p>1. Accepted weight ({grnForm.accepted_qty} kg) will immediately credit Store received stock under lot <code className="font-mono">{grnForm.lot_number}</code>.</p>
                <p>2. Purchase Order status will automatically update to PARTIALLY_RECEIVED / CLOSED.</p>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowGRNModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 shadow-xs cursor-pointer"
                >
                  Confirm & Post GRN
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Purchase Bill */}
      {showBillModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in zoom-in-95">
            <div className="p-5 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-indigo-600" />
                <h3 className="text-sm font-black text-slate-900">Record Vendor Purchase Bill</h3>
              </div>
              <button onClick={() => setShowBillModal(false)} className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateBill} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Supplier Name</label>
                  <input
                    type="text"
                    required
                    value={billForm.supplier_name}
                    onChange={e => setBillForm({ ...billForm, supplier_name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Supplier Tax Invoice No</label>
                  <input
                    type="text"
                    required
                    value={billForm.supplier_invoice_no}
                    onChange={e => setBillForm({ ...billForm, supplier_invoice_no: e.target.value })}
                    placeholder="INV-SPIN-xxxx"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">PO Number</label>
                  <input
                    type="text"
                    value={billForm.po_number}
                    onChange={e => setBillForm({ ...billForm, po_number: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">GRN Number</label>
                  <input
                    type="text"
                    value={billForm.grn_number}
                    onChange={e => setBillForm({ ...billForm, grn_number: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Taxable Amount (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={billForm.taxable_amount}
                    onChange={e => setBillForm({ ...billForm, taxable_amount: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Due Date</label>
                  <input
                    type="date"
                    required
                    value={billForm.due_date}
                    onChange={e => setBillForm({ ...billForm, due_date: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold"
                  />
                </div>
              </div>

              <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl flex justify-between items-center">
                <span className="text-xs font-bold text-indigo-900">Grand Total with 5% GST:</span>
                <span className="text-sm font-black font-mono text-indigo-700">
                  {formatRs(billForm.taxable_amount * 1.05)}
                </span>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowBillModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 shadow-xs cursor-pointer"
                >
                  Post Purchase Bill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Purchase Return */}
      {showReturnModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in zoom-in-95">
            <div className="p-5 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <div className="flex items-center gap-2">
                <RotateCcw className="w-5 h-5 text-rose-600" />
                <h3 className="text-sm font-black text-slate-900">Purchase Return & Debit Note</h3>
              </div>
              <button onClick={() => setShowReturnModal(false)} className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateReturn} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Supplier Name</label>
                <MasterAutoSuggest
                  masterType="clients"
                  category="YARN_SUPPLIER"
                  placeholder="Select yarn supplier..."
                  value={returnForm.supplier_name}
                  onChange={val => setReturnForm({ ...returnForm, supplier_name: val })}
                  onSelect={s => setReturnForm({ ...returnForm, supplier_name: s.party_name })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">PO Reference</label>
                  <input
                    type="text"
                    value={returnForm.po_number}
                    onChange={e => setReturnForm({ ...returnForm, po_number: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Lot Number to Return</label>
                  <input
                    type="text"
                    required
                    value={returnForm.lot_number}
                    onChange={e => setReturnForm({ ...returnForm, lot_number: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Return Quantity (KG)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={returnForm.return_qty}
                    onChange={e => setReturnForm({ ...returnForm, return_qty: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Rate Per KG (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={returnForm.rate_per_unit}
                    onChange={e => setReturnForm({ ...returnForm, rate_per_unit: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Rejection Reason</label>
                <input
                  type="text"
                  required
                  value={returnForm.reason}
                  onChange={e => setReturnForm({ ...returnForm, reason: e.target.value })}
                  placeholder="e.g., Slub count / excessive moisture"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold"
                />
              </div>

              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex justify-between items-center">
                <span className="text-xs font-bold text-rose-900">Calculated Debit Note Amount:</span>
                <span className="text-sm font-black font-mono text-rose-700">
                  {formatRs((returnForm.return_qty * returnForm.rate_per_unit) * 1.05)}
                </span>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowReturnModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold hover:bg-rose-700 shadow-xs cursor-pointer"
                >
                  Confirm Return & Debit Note
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
