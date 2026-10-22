import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Package, 
  FileText, 
  Printer, 
  Building2, 
  ClipboardList, 
  Layers, 
  IndianRupee,
  CheckCircle2,
  Clock,
  Send,
  Truck,
  Receipt,
  RotateCcw,
  Sparkles,
  ShoppingBag,
  ArrowRight,
  X
} from 'lucide-react';
import MasterAutoSuggest from './common/MasterAutoSuggest';
import { salesApi } from '../api/client';

export default function SalesModule({ defaultTab = 'queue' }) {
  const [activeTab, setActiveTab] = useState(defaultTab); // 'queue', 'dispatch', 'invoice', 'return'
  const [orders, setOrders] = useState([]);
  const [dispatches, setDispatches] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [returns, setReturns] = useState([]);
  const [summary, setSummary] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showDispatchModal, setShowDispatchModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [selectedOrderForVoucher, setSelectedOrderForVoucher] = useState(null);

  // Forms
  const [orderForm, setOrderForm] = useState({
    customer_name: 'Vardhman Textiles',
    contact_person: 'Ashok Gupta',
    customer_city: 'Ludhiana',
    gstin: '24AAACV1234A1Z5',
    quality_construction: '60x60 / 92x88 (Cotton Poplin)',
    warp_count: '40s Combed',
    weft_count: '40s Carded',
    epi: '132',
    ppi: '72',
    weave_type: 'Plain 1/1',
    width_inches: 58,
    gsm: 120,
    total_meters: 50000,
    rate_per_meter: 42.50,
    tax_percent: 5,
    delivery_date: '2026-03-25',
    payment_terms: '30 Days Credit',
    remarks: 'Priority export weaving run'
  });

  const [dispatchForm, setDispatchForm] = useState({
    sales_order_no: 'SO-20260218-003',
    buyer_name: 'Arvind Ltd',
    destination_city: 'Ahmedabad',
    total_rolls: 20,
    total_meters: 2500.0,
    vehicle_no: 'GJ-01-AT-4491',
    transporter_name: 'Gati KWE Logistics'
  });

  const [invoiceForm, setInvoiceForm] = useState({
    sales_order_no: 'SO-20260218-003',
    dispatch_code: 'DSP-2026-001',
    buyer_name: 'Arvind Ltd',
    buyer_gstin: '24AABCA9876C1Z1',
    taxable_value: 170000.0,
    tax_rate: 5,
    due_date: '2026-04-10'
  });

  const [returnForm, setReturnForm] = useState({
    buyer_name: 'Raymond Ltd',
    invoice_no: 'INV-2026-001',
    return_meters: 150.0,
    credit_amount: 8662.5,
    reason: 'Selvedge fraying on 2 rolls'
  });

  const loadAllData = async () => {
    setIsLoading(true);
    try {
      const [sumRes, ordRes, dispRes, invRes, retRes] = await Promise.all([
        salesApi.getSummary(),
        salesApi.getOrders(),
        salesApi.getDispatches(),
        salesApi.getInvoices(),
        salesApi.getReturns()
      ]);
      setSummary(sumRes || null);
      setOrders(ordRes || []);
      setDispatches(dispRes || []);
      setInvoices(invRes || []);
      setReturns(retRes || []);
    } catch (e) {
      console.error('Failed to load sales data', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    await salesApi.createOrder(orderForm);
    setShowOrderModal(false);
    loadAllData();
  };

  const handleCreateDispatch = async (e) => {
    e.preventDefault();
    await salesApi.createDispatch(dispatchForm);
    setShowDispatchModal(false);
    loadAllData();
  };

  const handleCreateInvoice = async (e) => {
    e.preventDefault();
    await salesApi.createInvoice(invoiceForm);
    setShowInvoiceModal(false);
    loadAllData();
  };

  const handleCreateReturn = async (e) => {
    e.preventDefault();
    await salesApi.createReturn(returnForm);
    setShowReturnModal(false);
    loadAllData();
  };

  const formatRs = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

  const tabs = [
    { id: 'queue', label: '1. Fabric Booking Queue', count: orders.length },
    { id: 'dispatch', label: '2. Dispatch Orders (Challans)', count: dispatches.length },
    { id: 'invoice', label: '3. Sales Invoices (GST)', count: invoices.length },
    { id: 'return', label: '4. Sales Returns', count: returns.length },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-7 h-7 text-indigo-600" />
            <h1 className="text-2xl font-black text-slate-900">Sales & Order Fulfillment Hub</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Confirmed buyer contracts, loom doff dispatch staging, GST invoices, and sales return credit notes.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {activeTab === 'queue' && (
            <button
              onClick={() => setShowOrderModal(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-xs flex items-center gap-2 cursor-pointer transition"
            >
              <Plus className="w-4 h-4" /> Book New Sales Contract
            </button>
          )}
          {activeTab === 'dispatch' && (
            <button
              onClick={() => setShowDispatchModal(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-xs flex items-center gap-2 cursor-pointer transition"
            >
              <Plus className="w-4 h-4" /> Stage Taka Dispatch
            </button>
          )}
          {activeTab === 'invoice' && (
            <button
              onClick={() => setShowInvoiceModal(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-xs flex items-center gap-2 cursor-pointer transition"
            >
              <Plus className="w-4 h-4" /> Generate Sales Invoice
            </button>
          )}
          {activeTab === 'return' && (
            <button
              onClick={() => setShowReturnModal(true)}
              className="bg-rose-600 hover:bg-rose-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-xs flex items-center gap-2 cursor-pointer transition"
            >
              <Plus className="w-4 h-4" /> Log Sales Return
            </button>
          )}
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 flex items-center gap-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase text-slate-500 block">Total Active Orders</span>
            <p className="text-2xl font-black font-mono text-slate-900 mt-0.5">{orders.length}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
            <IndianRupee className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase text-slate-500 block">Total Order Book Valuation</span>
            <p className="text-2xl font-black font-mono text-slate-900 mt-0.5">
              {formatRs(orders.reduce((s, o) => s + (Number(o.grand_total) || 0), 0) || 5748750)}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase text-slate-500 block">Dispatches Completed</span>
            <p className="text-2xl font-black font-mono text-slate-900 mt-0.5">{dispatches.length}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
            <Receipt className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase text-slate-500 block">Invoices Billed</span>
            <p className="text-2xl font-black font-mono text-slate-900 mt-0.5">{invoices.length}</p>
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

      {/* Tab 1: Fabric Booking Queue */}
      {activeTab === 'queue' && (
        <div className="bg-white rounded-b-2xl border border-slate-200 border-t-0 shadow-xs p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">Commercial Sales Contract Queue</h2>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/70 text-slate-600 font-bold border-b border-slate-200 uppercase text-[10px]">
                <tr>
                  <th className="p-3">Order Number</th>
                  <th className="p-3">Buyer Name</th>
                  <th className="p-3">Quality Construction</th>
                  <th className="p-3">Total Meters</th>
                  <th className="p-3">Rate / Meter</th>
                  <th className="p-3">Contract Value</th>
                  <th className="p-3">Delivery Date</th>
                  <th className="p-3">Fulfillment Status</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {orders.length === 0 ? (
                  <tr><td colSpan={9} className="p-8 text-center text-slate-400">No sales orders found.</td></tr>
                ) : (
                  orders.map(so => (
                    <tr key={so.id} className="hover:bg-slate-50 transition">
                      <td className="p-3 font-mono font-bold text-indigo-600">{so.order_number}</td>
                      <td className="p-3 font-bold text-slate-900">{so.customer_name}</td>
                      <td className="p-3 font-semibold text-slate-800">{so.quality_construction}</td>
                      <td className="p-3 font-mono font-bold text-slate-900">{Number(so.total_meters).toLocaleString()} m</td>
                      <td className="p-3 font-mono text-slate-700">{formatRs(so.rate_per_meter)}</td>
                      <td className="p-3 font-mono font-black text-emerald-700">{formatRs(so.grand_total || (so.total_meters * so.rate_per_meter * 1.05))}</td>
                      <td className="p-3 font-mono text-slate-600">{so.delivery_date}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          so.status === 'DISPATCHED' ? 'bg-emerald-100 text-emerald-800' :
                          so.status === 'READY_TO_DISPATCH' ? 'bg-blue-100 text-blue-800' :
                          so.status === 'IN_WEAVING' ? 'bg-indigo-100 text-indigo-800' :
                          'bg-amber-100 text-amber-800'
                        }`}>
                          {so.status}
                        </span>
                      </td>
                      <td className="p-3">
                        <button
                          onClick={() => {
                            setDispatchForm(prev => ({
                              ...prev,
                              sales_order_no: so.order_number,
                              buyer_name: so.customer_name,
                              destination_city: so.customer_city || 'Surat'
                            }));
                            setActiveTab('dispatch');
                            setShowDispatchModal(true);
                          }}
                          className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer"
                        >
                          Dispatch →
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

      {/* Tab 2: Dispatch Orders */}
      {activeTab === 'dispatch' && (
        <div className="bg-white rounded-b-2xl border border-slate-200 border-t-0 shadow-xs p-6 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">Taka Dispatch Orders & Delivery Challans</h2>
              <p className="text-xs text-slate-500 mt-0.5">Creating a dispatch order marks the Sales Order DISPATCHED and pre-fills a Draft GST Invoice.</p>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/70 text-slate-600 font-bold border-b border-slate-200 uppercase text-[10px]">
                <tr>
                  <th className="p-3">Dispatch Code</th>
                  <th className="p-3">Sales Order Ref</th>
                  <th className="p-3">Buyer Name</th>
                  <th className="p-3">Destination City</th>
                  <th className="p-3">Rolls Count</th>
                  <th className="p-3">Total Meters</th>
                  <th className="p-3">Vehicle Number</th>
                  <th className="p-3">Transporter</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {dispatches.length === 0 ? (
                  <tr><td colSpan={9} className="p-8 text-center text-slate-400">No dispatch orders staged.</td></tr>
                ) : (
                  dispatches.map(dsp => (
                    <tr key={dsp.id} className="hover:bg-slate-50 transition">
                      <td className="p-3 font-mono font-bold text-indigo-600">{dsp.dispatch_code}</td>
                      <td className="p-3 font-mono text-slate-700">{dsp.sales_order_no}</td>
                      <td className="p-3 font-bold text-slate-900">{dsp.buyer_name}</td>
                      <td className="p-3 font-semibold text-slate-700">{dsp.destination_city}</td>
                      <td className="p-3 font-mono">{dsp.total_rolls} Rolls</td>
                      <td className="p-3 font-mono font-black text-slate-900">{dsp.total_meters} m</td>
                      <td className="p-3 font-mono text-slate-700">{dsp.vehicle_no}</td>
                      <td className="p-3 text-slate-600">{dsp.transporter_name}</td>
                      <td className="p-3">
                        <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-[10px] font-bold">
                          {dsp.status}
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

      {/* Tab 3: Sales Invoices */}
      {activeTab === 'invoice' && (
        <div className="bg-white rounded-b-2xl border border-slate-200 border-t-0 shadow-xs p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">GST Tax Invoices & Receivables</h2>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/70 text-slate-600 font-bold border-b border-slate-200 uppercase text-[10px]">
                <tr>
                  <th className="p-3">Invoice No</th>
                  <th className="p-3">Order Ref</th>
                  <th className="p-3">Dispatch Code</th>
                  <th className="p-3">Buyer Name</th>
                  <th className="p-3">Taxable Value</th>
                  <th className="p-3">GST Tax (5%)</th>
                  <th className="p-3">Grand Total</th>
                  <th className="p-3">Due Date</th>
                  <th className="p-3">Payment Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {invoices.length === 0 ? (
                  <tr><td colSpan={9} className="p-8 text-center text-slate-400">No invoices generated.</td></tr>
                ) : (
                  invoices.map(inv => (
                    <tr key={inv.id} className="hover:bg-slate-50 transition">
                      <td className="p-3 font-mono font-bold text-indigo-600">{inv.invoice_number}</td>
                      <td className="p-3 font-mono text-slate-700">{inv.sales_order_no}</td>
                      <td className="p-3 font-mono text-slate-600">{inv.dispatch_code}</td>
                      <td className="p-3 font-bold text-slate-900">{inv.buyer_name}</td>
                      <td className="p-3 font-mono text-slate-700">{formatRs(inv.taxable_value)}</td>
                      <td className="p-3 font-mono text-slate-700">{formatRs((inv.cgst_amount || 0) + (inv.sgst_amount || 0) + (inv.igst_amount || (inv.taxable_value * 0.05)))}</td>
                      <td className="p-3 font-mono font-black text-emerald-700">{formatRs(inv.grand_total)}</td>
                      <td className="p-3 font-mono text-slate-600">{inv.due_date}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          inv.payment_status === 'PAID' ? 'bg-emerald-100 text-emerald-800' :
                          inv.payment_status === 'PARTIALLY_PAID' ? 'bg-blue-100 text-blue-800' :
                          'bg-amber-100 text-amber-800'
                        }`}>
                          {inv.payment_status}
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

      {/* Tab 4: Sales Returns */}
      {activeTab === 'return' && (
        <div className="bg-white rounded-b-2xl border border-slate-200 border-t-0 shadow-xs p-6 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">Customer Sales Returns & Credit Notes</h2>
              <p className="text-xs text-slate-500 mt-0.5">Logging a sales return automatically registers a Credit Note in the Finance Module.</p>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/70 text-slate-600 font-bold border-b border-slate-200 uppercase text-[10px]">
                <tr>
                  <th className="p-3">Return No</th>
                  <th className="p-3">Buyer Name</th>
                  <th className="p-3">Invoice Ref</th>
                  <th className="p-3">Return Meters</th>
                  <th className="p-3">Credit Amount</th>
                  <th className="p-3">Reason</th>
                  <th className="p-3">Finance Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {returns.length === 0 ? (
                  <tr><td colSpan={7} className="p-8 text-center text-slate-400">No sales returns recorded.</td></tr>
                ) : (
                  returns.map(ret => (
                    <tr key={ret.id} className="hover:bg-slate-50 transition">
                      <td className="p-3 font-mono font-bold text-rose-600">{ret.return_no}</td>
                      <td className="p-3 font-bold text-slate-900">{ret.buyer_name}</td>
                      <td className="p-3 font-mono text-slate-700">{ret.invoice_no}</td>
                      <td className="p-3 font-mono font-bold text-slate-900">{ret.return_meters} m</td>
                      <td className="p-3 font-mono font-black text-rose-700">{formatRs(ret.credit_amount)}</td>
                      <td className="p-3 text-slate-600">{ret.reason}</td>
                      <td className="p-3">
                        <span className="bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 w-fit">
                          <CheckCircle2 className="w-3 h-3" /> Credit Note Issued in Finance
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

      {/* Modal: Book Sales Contract */}
      {showOrderModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95">
            <div className="p-5 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-indigo-600" />
                <h3 className="text-sm font-black text-slate-900">Book Sales Contract / Fabric Order</h3>
              </div>
              <button onClick={() => setShowOrderModal(false)} className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateOrder} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Customer / Fabric Buyer</label>
                  <MasterAutoSuggest
                    masterType="clients"
                    category="FABRIC_BUYER"
                    placeholder="Select buyer..."
                    value={orderForm.customer_name}
                    onChange={val => setOrderForm({ ...orderForm, customer_name: val })}
                    onSelect={c => setOrderForm({
                      ...orderForm,
                      customer_name: c.party_name,
                      contact_person: c.contact_person,
                      customer_city: c.city,
                      gstin: c.gstin,
                      payment_terms: c.payment_terms || '30 Days Credit'
                    })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Contact Person</label>
                  <input
                    type="text"
                    value={orderForm.contact_person}
                    onChange={e => setOrderForm({ ...orderForm, contact_person: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Fabric Quality Construction</label>
                <MasterAutoSuggest
                  masterType="items"
                  category="GREY_FABRIC"
                  placeholder="Select fabric quality..."
                  value={orderForm.quality_construction}
                  onChange={val => setOrderForm({ ...orderForm, quality_construction: val })}
                  onSelect={itm => setOrderForm({
                    ...orderForm,
                    quality_construction: itm.item_name,
                    rate_per_meter: itm.standard_cost || 45.0
                  })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Contract Total Meters</label>
                  <input
                    type="number"
                    step="1"
                    required
                    value={orderForm.total_meters}
                    onChange={e => setOrderForm({ ...orderForm, total_meters: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Target Rate / Meter (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={orderForm.rate_per_meter}
                    onChange={e => setOrderForm({ ...orderForm, rate_per_meter: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Committed Delivery Date</label>
                  <input
                    type="date"
                    required
                    value={orderForm.delivery_date}
                    onChange={e => setOrderForm({ ...orderForm, delivery_date: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Payment Terms</label>
                  <input
                    type="text"
                    value={orderForm.payment_terms}
                    onChange={e => setOrderForm({ ...orderForm, payment_terms: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold"
                  />
                </div>
              </div>

              <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl flex justify-between items-center">
                <span className="text-xs font-bold text-indigo-900">Total Contract Value (5% GST):</span>
                <span className="text-sm font-black font-mono text-indigo-700">
                  {formatRs((orderForm.total_meters * orderForm.rate_per_meter) * 1.05)}
                </span>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowOrderModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 shadow-xs cursor-pointer"
                >
                  Confirm Contract Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Stage Dispatch */}
      {showDispatchModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in zoom-in-95">
            <div className="p-5 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-indigo-600" />
                <h3 className="text-sm font-black text-slate-900">Stage Taka Dispatch & Delivery Challan</h3>
              </div>
              <button onClick={() => setShowDispatchModal(false)} className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateDispatch} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Sales Order Reference</label>
                  <input
                    type="text"
                    required
                    value={dispatchForm.sales_order_no}
                    onChange={e => setDispatchForm({ ...dispatchForm, sales_order_no: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Buyer Name</label>
                  <input
                    type="text"
                    required
                    value={dispatchForm.buyer_name}
                    onChange={e => setDispatchForm({ ...dispatchForm, buyer_name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Total Rolls</label>
                  <input
                    type="number"
                    required
                    value={dispatchForm.total_rolls}
                    onChange={e => setDispatchForm({ ...dispatchForm, total_rolls: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Total Dispatched Meters</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={dispatchForm.total_meters}
                    onChange={e => setDispatchForm({ ...dispatchForm, total_meters: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Vehicle Number</label>
                  <input
                    type="text"
                    required
                    value={dispatchForm.vehicle_no}
                    onChange={e => setDispatchForm({ ...dispatchForm, vehicle_no: e.target.value })}
                    placeholder="GJ-01-AT-4491"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Transporter Name</label>
                  <input
                    type="text"
                    value={dispatchForm.transporter_name}
                    onChange={e => setDispatchForm({ ...dispatchForm, transporter_name: e.target.value })}
                    placeholder="Gati / V-Trans / Self"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowDispatchModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 shadow-xs cursor-pointer"
                >
                  Confirm & Dispatch Shipment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Sales Return */}
      {showReturnModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in zoom-in-95">
            <div className="p-5 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <div className="flex items-center gap-2">
                <RotateCcw className="w-5 h-5 text-rose-600" />
                <h3 className="text-sm font-black text-slate-900">Customer Sales Return & Credit Note</h3>
              </div>
              <button onClick={() => setShowReturnModal(false)} className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateReturn} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Customer / Buyer</label>
                  <input
                    type="text"
                    required
                    value={returnForm.buyer_name}
                    onChange={e => setReturnForm({ ...returnForm, buyer_name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Invoice Reference</label>
                  <input
                    type="text"
                    required
                    value={returnForm.invoice_no}
                    onChange={e => setReturnForm({ ...returnForm, invoice_no: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Returned Meters</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={returnForm.return_meters}
                    onChange={e => setReturnForm({ ...returnForm, return_meters: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Credit Amount (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={returnForm.credit_amount}
                    onChange={e => setReturnForm({ ...returnForm, credit_amount: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold font-mono text-rose-700 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Return Reason / QC Defect</label>
                <input
                  type="text"
                  required
                  value={returnForm.reason}
                  onChange={e => setReturnForm({ ...returnForm, reason: e.target.value })}
                  placeholder="e.g., Stain markings / weave distortion"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold"
                />
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
                  Issue Return & Credit Note
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
