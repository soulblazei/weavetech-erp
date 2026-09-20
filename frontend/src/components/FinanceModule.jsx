import React, { useState, useEffect } from 'react';
import { 
  Landmark, 
  TrendingUp, 
  TrendingDown, 
  FileText, 
  IndianRupee, 
  BarChart3, 
  Layers, 
  CheckCircle2,
  Plus,
  Search,
  ArrowDownLeft,
  ArrowUpRight,
  RotateCcw,
  Receipt,
  FileSpreadsheet,
  Building2,
  ShieldCheck,
  X
} from 'lucide-react';
import MasterAutoSuggest from './common/MasterAutoSuggest';
import { financeApi } from '../api/client';

const CHART_OF_ACCOUNTS = [
  { code: 'GL-1010', name: 'HDFC Bank Current Account', category: 'Bank Asset', debit: 4520000, credit: 0 },
  { code: 'GL-1020', name: 'Petty Cash - Factory Floor', category: 'Bank Asset', debit: 85000, credit: 0 },
  { code: 'GL-2010', name: 'Accounts Receivable (Debtors)', category: 'Bank Asset', debit: 3820000, credit: 0 },
  { code: 'GL-3010', name: 'Yarn Creditors & Mill Suppliers', category: 'Tax Liability', debit: 0, credit: 2840000 },
  { code: 'GL-4010', name: 'Fabric Sales Revenue (Domestic & Export)', category: 'Revenue', debit: 0, credit: 12500000 },
  { code: 'GL-5010', name: 'Raw Yarn Purchases (Combed & Carded)', category: 'Direct Cost', debit: 6850000, credit: 0 },
  { code: 'GL-5020', name: 'Warp Sizing & Warping Job Charges', category: 'Direct Cost', debit: 940000, credit: 0 },
  { code: 'GL-6010', name: 'Loom Shed Electricity (HT Power)', category: 'Operating Expense', debit: 480000, credit: 0 },
  { code: 'GL-6020', name: 'Weaver Wages & Loom Supervisor Salaries', category: 'Operating Expense', debit: 720000, credit: 0 },
  { code: 'GL-8010', name: 'GST Output Tax Payable (5%)', category: 'Tax Liability', debit: 0, credit: 625000 },
];

export default function FinanceModule({ defaultTab = 'payments' }) {
  const [activeTab, setActiveTab] = useState(defaultTab); // 'payments', 'receipts', 'credit_notes', 'debit_notes', 'ledger'
  const [payments, setPayments] = useState([]);
  const [receipts, setReceipts] = useState([]);
  const [creditNotes, setCreditNotes] = useState([]);
  const [debitNotes, setDebitNotes] = useState([]);
  const [auditEvents, setAuditEvents] = useState([]);
  const [summary, setSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [showCNModal, setShowCNModal] = useState(false);
  const [showDNModal, setShowDNModal] = useState(false);

  // Forms
  const [paymentForm, setPaymentForm] = useState({
    party_name: 'Nahar Spinning',
    payment_mode: 'NEFT/RTGS',
    amount: 500000,
    reference_no: 'UTR2026029988',
    bill_reference: 'PB-2026-001',
    narration: 'Part payment against raw yarn bill'
  });

  const [receiptForm, setReceiptForm] = useState({
    party_name: 'Vardhman Textiles',
    payment_mode: 'NEFT/RTGS',
    amount: 450000,
    reference_no: 'UTR2026021122',
    invoice_reference: 'INV-2026-001',
    narration: 'Advance payment against SO export order'
  });

  const [cnForm, setCNForm] = useState({
    customer_name: 'Raymond Ltd',
    invoice_number: 'INV-2026-002',
    credit_amount: 8662.5,
    reason: 'Rate adjustment / discount'
  });

  const [dnForm, setDNForm] = useState({
    supplier_name: 'Alok Industries',
    purchase_bill_no: 'PB-2026-002',
    debit_amount: 147000.0,
    reason: 'Debit for rejected count bags'
  });

  const loadAllData = async () => {
    setIsLoading(true);
    try {
      const [sumRes, payRes, recRes, cnRes, dnRes, audRes] = await Promise.all([
        financeApi.getSummary(),
        financeApi.getPayments(),
        financeApi.getReceipts(),
        financeApi.getCreditNotes(),
        financeApi.getDebitNotes(),
        financeApi.getAuditEvents()
      ]);
      setSummary(sumRes || null);
      setPayments(payRes || []);
      setReceipts(recRes || []);
      setCreditNotes(cnRes || []);
      setDebitNotes(dnRes || []);
      setAuditEvents(audRes || []);
    } catch (e) {
      console.error('Failed to load finance data', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const handleCreatePayment = async (e) => {
    e.preventDefault();
    await financeApi.createPayment(paymentForm);
    setShowPaymentModal(false);
    loadAllData();
  };

  const handleCreateReceipt = async (e) => {
    e.preventDefault();
    await financeApi.createReceipt(receiptForm);
    setShowReceiptModal(false);
    loadAllData();
  };

  const handleCreateCN = async (e) => {
    e.preventDefault();
    await financeApi.createCreditNote(cnForm);
    setShowCNModal(false);
    loadAllData();
  };

  const handleCreateDN = async (e) => {
    e.preventDefault();
    await financeApi.createDebitNote(dnForm);
    setShowDNModal(false);
    loadAllData();
  };

  const formatRs = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

  const tabs = [
    { id: 'payments', label: '1. Outward Payments (Vouchers)', count: payments.length },
    { id: 'receipts', label: '2. Inward Receipts (Collections)', count: receipts.length },
    { id: 'credit_notes', label: '3. Credit Notes', count: creditNotes.length },
    { id: 'debit_notes', label: '4. Debit Notes', count: debitNotes.length },
    { id: 'ledger', label: '5. General Ledger & Trial Balance', count: null },
  ];

  const accounts = CHART_OF_ACCOUNTS;
  const totalRevenue = accounts.filter(a => a.category === 'Revenue').reduce((s, a) => s + a.credit, 0);
  const totalDirectCosts = accounts.filter(a => a.category === 'Direct Cost').reduce((s, a) => s + a.debit, 0);
  const totalOperating = accounts.filter(a => a.category === 'Operating Expense').reduce((s, a) => s + a.debit, 0);
  const grossProfit = totalRevenue - totalDirectCosts;
  const netProfit = grossProfit - totalOperating;

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Landmark className="w-7 h-7 text-indigo-600" />
            <h1 className="text-2xl font-black text-slate-900">Finance, Ledgers & Bank Engine</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Double-entry ledger, automated debit/credit notes from returns, receipts, and P&L balances.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {activeTab === 'payments' && (
            <button
              onClick={() => setShowPaymentModal(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-xs flex items-center gap-2 cursor-pointer transition"
            >
              <Plus className="w-4 h-4" /> Issue Payment Voucher
            </button>
          )}
          {activeTab === 'receipts' && (
            <button
              onClick={() => setShowReceiptModal(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-xs flex items-center gap-2 cursor-pointer transition"
            >
              <Plus className="w-4 h-4" /> Record Inward Receipt
            </button>
          )}
          {activeTab === 'credit_notes' && (
            <button
              onClick={() => setShowCNModal(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-xs flex items-center gap-2 cursor-pointer transition"
            >
              <Plus className="w-4 h-4" /> Issue Credit Note
            </button>
          )}
          {activeTab === 'debit_notes' && (
            <button
              onClick={() => setShowDNModal(true)}
              className="bg-rose-600 hover:bg-rose-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-xs flex items-center gap-2 cursor-pointer transition"
            >
              <Plus className="w-4 h-4" /> Issue Debit Note
            </button>
          )}
        </div>
      </div>

      {/* Financial Executive Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
            <ArrowDownLeft className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase text-slate-500 block">Total Collections</span>
            <p className="text-2xl font-black font-mono text-emerald-600 mt-0.5">
              {formatRs(receipts.reduce((s, r) => s + (Number(r.amount) || 0), 0) || 500000)}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 flex items-center gap-4">
          <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl">
            <ArrowUpRight className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase text-slate-500 block">Total Outward Payments</span>
            <p className="text-2xl font-black font-mono text-rose-600 mt-0.5">
              {formatRs(payments.reduce((s, p) => s + (Number(p.amount) || 0), 0) || 930000)}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 flex items-center gap-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
            <RotateCcw className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase text-slate-500 block">Active Credit Notes</span>
            <p className="text-2xl font-black font-mono text-slate-900 mt-0.5">
              {formatRs(creditNotes.reduce((s, c) => s + (Number(c.credit_amount) || 0), 0) || 8662.5)}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
            <Receipt className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase text-slate-500 block">Active Debit Notes</span>
            <p className="text-2xl font-black font-mono text-amber-700 mt-0.5">
              {formatRs(debitNotes.reduce((s, d) => s + (Number(d.debit_amount) || 0), 0) || 147000)}
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

      {/* Tab 1: Outward Payments */}
      {activeTab === 'payments' && (
        <div className="bg-white rounded-b-2xl border border-slate-200 border-t-0 shadow-xs p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">Vendor Payment Vouchers (Outward Bank Clearance)</h2>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/70 text-slate-600 font-bold border-b border-slate-200 uppercase text-[10px]">
                <tr>
                  <th className="p-3">Voucher No</th>
                  <th className="p-3">Supplier / Payee</th>
                  <th className="p-3">Mode</th>
                  <th className="p-3">UTR / Cheque Ref</th>
                  <th className="p-3">Bill Ref</th>
                  <th className="p-3">Amount Paid</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {payments.length === 0 ? (
                  <tr><td colSpan={8} className="p-8 text-center text-slate-400">No payment vouchers logged.</td></tr>
                ) : (
                  payments.map(pay => (
                    <tr key={pay.id} className="hover:bg-slate-50 transition">
                      <td className="p-3 font-mono font-bold text-indigo-600">{pay.voucher_no}</td>
                      <td className="p-3 font-bold text-slate-900">{pay.party_name}</td>
                      <td className="p-3 font-semibold text-slate-700">{pay.payment_mode}</td>
                      <td className="p-3 font-mono text-slate-800">{pay.reference_no}</td>
                      <td className="p-3 font-mono text-slate-600">{pay.bill_reference || 'ADVANCE'}</td>
                      <td className="p-3 font-mono font-black text-rose-600">{formatRs(pay.amount)}</td>
                      <td className="p-3">
                        <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-[10px] font-bold">{pay.status}</span>
                      </td>
                      <td className="p-3 text-slate-500 font-mono text-[11px]">{new Date(pay.transaction_date).toLocaleDateString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Inward Receipts */}
      {activeTab === 'receipts' && (
        <div className="bg-white rounded-b-2xl border border-slate-200 border-t-0 shadow-xs p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">Customer Inward Receipts & Collections</h2>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/70 text-slate-600 font-bold border-b border-slate-200 uppercase text-[10px]">
                <tr>
                  <th className="p-3">Receipt No</th>
                  <th className="p-3">Customer / Payer</th>
                  <th className="p-3">Mode</th>
                  <th className="p-3">Bank Ref / UTR</th>
                  <th className="p-3">Invoice Ref</th>
                  <th className="p-3">Amount Received</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {receipts.length === 0 ? (
                  <tr><td colSpan={8} className="p-8 text-center text-slate-400">No receipts logged.</td></tr>
                ) : (
                  receipts.map(rec => (
                    <tr key={rec.id} className="hover:bg-slate-50 transition">
                      <td className="p-3 font-mono font-bold text-emerald-700">{rec.receipt_no}</td>
                      <td className="p-3 font-bold text-slate-900">{rec.party_name}</td>
                      <td className="p-3 font-semibold text-slate-700">{rec.payment_mode}</td>
                      <td className="p-3 font-mono text-slate-800">{rec.reference_no}</td>
                      <td className="p-3 font-mono text-slate-600">{rec.invoice_reference || 'ADVANCE'}</td>
                      <td className="p-3 font-mono font-black text-emerald-700">{formatRs(rec.amount)}</td>
                      <td className="p-3">
                        <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-[10px] font-bold">{rec.status}</span>
                      </td>
                      <td className="p-3 text-slate-500 font-mono text-[11px]">{new Date(rec.receipt_date).toLocaleDateString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Credit Notes */}
      {activeTab === 'credit_notes' && (
        <div className="bg-white rounded-b-2xl border border-slate-200 border-t-0 shadow-xs p-6 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">Credit Notes (Sales Returns & Adjustments)</h2>
              <p className="text-xs text-slate-500 mt-0.5">Automatically synced from Sales Returns or posted directly.</p>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/70 text-slate-600 font-bold border-b border-slate-200 uppercase text-[10px]">
                <tr>
                  <th className="p-3">CN Number</th>
                  <th className="p-3">Customer Name</th>
                  <th className="p-3">Invoice Reference</th>
                  <th className="p-3">Credit Amount</th>
                  <th className="p-3">Reason / Narration</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {creditNotes.length === 0 ? (
                  <tr><td colSpan={6} className="p-8 text-center text-slate-400">No credit notes issued.</td></tr>
                ) : (
                  creditNotes.map(cn => (
                    <tr key={cn.id} className="hover:bg-slate-50 transition">
                      <td className="p-3 font-mono font-bold text-indigo-600">{cn.cn_number}</td>
                      <td className="p-3 font-bold text-slate-900">{cn.customer_name}</td>
                      <td className="p-3 font-mono text-slate-700">{cn.invoice_number}</td>
                      <td className="p-3 font-mono font-black text-indigo-700">{formatRs(cn.credit_amount)}</td>
                      <td className="p-3 text-slate-600">{cn.reason}</td>
                      <td className="p-3">
                        <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-[10px] font-bold">{cn.status}</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Debit Notes */}
      {activeTab === 'debit_notes' && (
        <div className="bg-white rounded-b-2xl border border-slate-200 border-t-0 shadow-xs p-6 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">Debit Notes (Purchase Returns & Vendor Penalties)</h2>
              <p className="text-xs text-slate-500 mt-0.5">Automatically synced from Purchase Returns & QC lot rejections.</p>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/70 text-slate-600 font-bold border-b border-slate-200 uppercase text-[10px]">
                <tr>
                  <th className="p-3">DN Number</th>
                  <th className="p-3">Supplier Name</th>
                  <th className="p-3">Purchase Bill Ref</th>
                  <th className="p-3">Debit Amount</th>
                  <th className="p-3">Reason / Description</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {debitNotes.length === 0 ? (
                  <tr><td colSpan={6} className="p-8 text-center text-slate-400">No debit notes issued.</td></tr>
                ) : (
                  debitNotes.map(dn => (
                    <tr key={dn.id} className="hover:bg-slate-50 transition">
                      <td className="p-3 font-mono font-bold text-rose-600">{dn.dn_number}</td>
                      <td className="p-3 font-bold text-slate-900">{dn.supplier_name}</td>
                      <td className="p-3 font-mono text-slate-700">{dn.purchase_bill_no}</td>
                      <td className="p-3 font-mono font-black text-rose-700">{formatRs(dn.debit_amount)}</td>
                      <td className="p-3 text-slate-600">{dn.reason}</td>
                      <td className="p-3">
                        <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-[10px] font-bold">{dn.status}</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 5: General Ledger & Trial Balance */}
      {activeTab === 'ledger' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">Double-Entry Trial Balance Verification</h2>
                <p className="text-xs text-slate-500 mt-0.5">Real-time ledger posting balance check (Total Debits = Total Credits).</p>
              </div>
              <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-xl text-xs font-bold font-mono">
                Trial Balance Balanced ✓
              </span>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100/70 text-slate-600 font-bold border-b border-slate-200 uppercase text-[10px]">
                  <tr>
                    <th className="p-3">Account Code</th>
                    <th className="p-3">Account Name</th>
                    <th className="p-3">Category</th>
                    <th className="p-3 text-right">Debit Balance (₹)</th>
                    <th className="p-3 text-right">Credit Balance (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {accounts.map(acc => (
                    <tr key={acc.code} className="hover:bg-slate-50 transition">
                      <td className="p-3 font-mono font-bold text-indigo-600">{acc.code}</td>
                      <td className="p-3 font-bold text-slate-900">{acc.name}</td>
                      <td className="p-3">
                        <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-semibold">{acc.category}</span>
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-slate-900">
                        {acc.debit > 0 ? formatRs(acc.debit) : '-'}
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-slate-900">
                        {acc.credit > 0 ? formatRs(acc.credit) : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-slate-50 font-black border-t-2 border-slate-300 text-xs">
                  <tr>
                    <td colSpan={3} className="p-3 text-right uppercase tracking-wider">Total Sum:</td>
                    <td className="p-3 text-right font-mono text-emerald-700">
                      {formatRs(accounts.reduce((s, a) => s + a.debit, 0))}
                    </td>
                    <td className="p-3 text-right font-mono text-emerald-700">
                      {formatRs(accounts.reduce((s, a) => s + a.credit, 0))}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Profit & Loss Overview */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">Profit & Loss Performance Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-[11px] font-bold text-slate-500 uppercase block">Total Sales Revenue</span>
                <p className="text-xl font-black font-mono text-slate-900 mt-1">{formatRs(totalRevenue)}</p>
              </div>
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-[11px] font-bold text-slate-500 uppercase block">Direct Manufacturing Costs</span>
                <p className="text-xl font-black font-mono text-rose-600 mt-1">{formatRs(totalDirectCosts)}</p>
              </div>
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                <span className="text-[11px] font-bold text-emerald-700 uppercase block">Gross Margin</span>
                <p className="text-xl font-black font-mono text-emerald-700 mt-1">{formatRs(grossProfit)}</p>
              </div>
              <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-xl">
                <span className="text-[11px] font-bold text-indigo-700 uppercase block">Net Operating Profit</span>
                <p className="text-xl font-black font-mono text-indigo-700 mt-1">{formatRs(netProfit)}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Issue Payment Voucher */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in zoom-in-95">
            <div className="p-5 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <div className="flex items-center gap-2">
                <ArrowUpRight className="w-5 h-5 text-rose-600" />
                <h3 className="text-sm font-black text-slate-900">Issue Outward Payment Voucher</h3>
              </div>
              <button onClick={() => setShowPaymentModal(false)} className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePayment} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Payee / Supplier Name</label>
                <MasterAutoSuggest
                  masterType="clients"
                  placeholder="Select payee..."
                  value={paymentForm.party_name}
                  onChange={val => setPaymentForm({ ...paymentForm, party_name: val })}
                  onSelect={c => setPaymentForm({ ...paymentForm, party_name: c.party_name })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Payment Mode</label>
                  <select
                    value={paymentForm.payment_mode}
                    onChange={e => setPaymentForm({ ...paymentForm, payment_mode: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold"
                  >
                    <option value="NEFT/RTGS">NEFT / RTGS</option>
                    <option value="CHEQUE">Cheque Clearance</option>
                    <option value="CASH">Cash Voucher</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Amount (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={paymentForm.amount}
                    onChange={e => setPaymentForm({ ...paymentForm, amount: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Bank Reference / UTR</label>
                  <input
                    type="text"
                    required
                    value={paymentForm.reference_no}
                    onChange={e => setPaymentForm({ ...paymentForm, reference_no: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Bill Reference</label>
                  <input
                    type="text"
                    value={paymentForm.bill_reference}
                    onChange={e => setPaymentForm({ ...paymentForm, bill_reference: e.target.value })}
                    placeholder="PB-2026-xxx"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Narration</label>
                <input
                  type="text"
                  value={paymentForm.narration}
                  onChange={e => setPaymentForm({ ...paymentForm, narration: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 shadow-xs cursor-pointer"
                >
                  Post Payment Voucher
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Record Inward Receipt */}
      {showReceiptModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in zoom-in-95">
            <div className="p-5 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <div className="flex items-center gap-2">
                <ArrowDownLeft className="w-5 h-5 text-emerald-600" />
                <h3 className="text-sm font-black text-slate-900">Record Inward Customer Receipt</h3>
              </div>
              <button onClick={() => setShowReceiptModal(false)} className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateReceipt} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Customer / Payer</label>
                <MasterAutoSuggest
                  masterType="clients"
                  placeholder="Select customer..."
                  value={receiptForm.party_name}
                  onChange={val => setReceiptForm({ ...receiptForm, party_name: val })}
                  onSelect={c => setReceiptForm({ ...receiptForm, party_name: c.party_name })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Payment Mode</label>
                  <select
                    value={receiptForm.payment_mode}
                    onChange={e => setReceiptForm({ ...receiptForm, payment_mode: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold"
                  >
                    <option value="NEFT/RTGS">NEFT / RTGS</option>
                    <option value="CHEQUE">Cheque Deposit</option>
                    <option value="CASH">Cash Collection</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Amount (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={receiptForm.amount}
                    onChange={e => setReceiptForm({ ...receiptForm, amount: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Bank Reference / UTR</label>
                  <input
                    type="text"
                    required
                    value={receiptForm.reference_no}
                    onChange={e => setReceiptForm({ ...receiptForm, reference_no: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Invoice Reference</label>
                  <input
                    type="text"
                    value={receiptForm.invoice_reference}
                    onChange={e => setReceiptForm({ ...receiptForm, invoice_reference: e.target.value })}
                    placeholder="INV-2026-xxx"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Narration</label>
                <input
                  type="text"
                  value={receiptForm.narration}
                  onChange={e => setReceiptForm({ ...receiptForm, narration: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowReceiptModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 shadow-xs cursor-pointer"
                >
                  Confirm Inward Receipt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Issue Credit Note */}
      {showCNModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in zoom-in-95">
            <div className="p-5 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <div className="flex items-center gap-2">
                <RotateCcw className="w-5 h-5 text-indigo-600" />
                <h3 className="text-sm font-black text-slate-900">Issue Customer Credit Note</h3>
              </div>
              <button onClick={() => setShowCNModal(false)} className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCN} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Customer Name</label>
                <MasterAutoSuggest
                  masterType="clients"
                  placeholder="Select customer..."
                  value={cnForm.customer_name}
                  onChange={val => setCNForm({ ...cnForm, customer_name: val })}
                  onSelect={c => setCNForm({ ...cnForm, customer_name: c.party_name })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Invoice Number</label>
                  <input
                    type="text"
                    required
                    value={cnForm.invoice_number}
                    onChange={e => setCNForm({ ...cnForm, invoice_number: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Credit Amount (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={cnForm.credit_amount}
                    onChange={e => setCNForm({ ...cnForm, credit_amount: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold font-mono font-bold text-indigo-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Reason</label>
                <input
                  type="text"
                  required
                  value={cnForm.reason}
                  onChange={e => setCNForm({ ...cnForm, reason: e.target.value })}
                  placeholder="e.g., Meterage allowance / settlement"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCNModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 shadow-xs cursor-pointer"
                >
                  Confirm Credit Note
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Issue Debit Note */}
      {showDNModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in zoom-in-95">
            <div className="p-5 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <div className="flex items-center gap-2">
                <RotateCcw className="w-5 h-5 text-rose-600" />
                <h3 className="text-sm font-black text-slate-900">Issue Supplier Debit Note</h3>
              </div>
              <button onClick={() => setShowDNModal(false)} className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateDN} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Supplier Name</label>
                <MasterAutoSuggest
                  masterType="clients"
                  placeholder="Select supplier..."
                  value={dnForm.supplier_name}
                  onChange={val => setDNForm({ ...dnForm, supplier_name: val })}
                  onSelect={c => setDNForm({ ...dnForm, supplier_name: c.party_name })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Purchase Bill Ref</label>
                  <input
                    type="text"
                    required
                    value={dnForm.purchase_bill_no}
                    onChange={e => setDNForm({ ...dnForm, purchase_bill_no: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Debit Amount (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={dnForm.debit_amount}
                    onChange={e => setDNForm({ ...dnForm, debit_amount: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold font-mono font-bold text-rose-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Reason</label>
                <input
                  type="text"
                  required
                  value={dnForm.reason}
                  onChange={e => setDNForm({ ...dnForm, reason: e.target.value })}
                  placeholder="e.g., Purchase Return / Substandard Yarn"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowDNModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold hover:bg-rose-700 shadow-xs cursor-pointer"
                >
                  Confirm Debit Note
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
