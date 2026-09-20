import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Plus, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Search, 
  Building2, 
  IndianRupee, 
  CheckCircle2, 
  FileSpreadsheet,
  Clock
} from 'lucide-react';
import PartyAutoCompleteInput from './common/PartyAutoCompleteInput';
import MasterDirectoryPanel from './MasterDirectoryPanel';
import { apiClient, mockPaymentsApi } from '../api/client';

export default function PaymentsModule() {
  const [activeSubTab, setActiveSubTab] = useState('ledger'); // 'ledger', 'record', 'masters'
  const [txns, setTxns] = useState([]);
  const [summary, setSummary] = useState({ total_transactions: 0, total_inward: 0, total_outward: 0, net_cashflow: 0 });
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);

  // Payment Form
  const [form, setForm] = useState({
    party_name: '',
    transaction_type: 'INWARD',
    amount: 250000,
    payment_mode: 'NEFT/RTGS',
    reference_no: 'UTR2026028899',
    remarks: 'Balance clearance against invoice',
  });

  const loadData = async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get('/payments/summary');
      setTxns(res.data.data || []);
      setSummary({
        total_transactions: res.data.total_transactions || 0,
        total_inward: res.data.total_inward || 0,
        total_outward: res.data.total_outward || 0,
        net_cashflow: res.data.net_cashflow || 0,
      });
    } catch (e) {
      const mock = mockPaymentsApi.getSummary();
      setTxns(mock.data);
      setSummary({
        total_transactions: mock.total_transactions,
        total_inward: mock.total_inward,
        total_outward: mock.total_outward,
        net_cashflow: mock.net_cashflow,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    try {
      await apiClient.post('/payments/create', form);
    } catch (e) {
      mockPaymentsApi.createPayment(form);
    }
    loadData();
    setActiveSubTab('ledger');
    setForm({
      party_name: '',
      transaction_type: 'INWARD',
      amount: 250000,
      payment_mode: 'NEFT/RTGS',
      reference_no: '',
      remarks: '',
    });
  };

  const filteredTxns = txns.filter(t => {
    const matchesType = typeFilter === 'ALL' || t.transaction_type === typeFilter;
    const q = searchQuery.toLowerCase();
    const matchesSearch = !q ||
      t.voucher_number.toLowerCase().includes(q) ||
      t.party_name.toLowerCase().includes(q) ||
      (t.reference_no || '').toLowerCase().includes(q);
    return matchesType && matchesSearch;
  });

  const formatRs = (n) => `Rs. ${Number(n || 0).toLocaleString('en-IN')}`;

  const tabs = [
    { id: 'ledger', label: 'Voucher Transaction Ledger', icon: CreditCard },
    { id: 'record', label: 'Record Inward / Outward Voucher', icon: Plus },
    { id: 'masters', label: 'Client / Supplier Master', icon: Building2 },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Sub Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-2 flex flex-wrap gap-1.5">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* SUB-VIEW 1: LEDGER */}
      {activeSubTab === 'ledger' && (
        <div className="space-y-4">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 flex items-center gap-4">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
                <ArrowDownLeft className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase text-slate-500 block">Total Inward Collections</span>
                <p className="text-2xl font-black font-mono text-emerald-700 mt-0.5">{formatRs(summary.total_inward)}</p>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 flex items-center gap-4">
              <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl">
                <ArrowUpRight className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase text-slate-500 block">Total Outward Remittances</span>
                <p className="text-2xl font-black font-mono text-rose-700 mt-0.5">{formatRs(summary.total_outward)}</p>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 flex items-center gap-4">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                <IndianRupee className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase text-slate-500 block">Net Realized Cashflow</span>
                <p className="text-2xl font-black font-mono text-indigo-700 mt-0.5">{formatRs(summary.net_cashflow)}</p>
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search voucher#, party, UTR..."
                className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-600">Type:</span>
              <select
                value={typeFilter}
                onChange={e => setTypeFilter(e.target.value)}
                className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold text-slate-900"
              >
                <option value="ALL">All Vouchers</option>
                <option value="INWARD">Inward Receipts Only</option>
                <option value="OUTWARD">Outward Payments Only</option>
              </select>
            </div>
          </div>

          {/* Vouchers Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                    <th className="p-3.5">Voucher #</th>
                    <th className="p-3.5">Party / Beneficiary</th>
                    <th className="p-3.5">Type</th>
                    <th className="p-3.5 text-right">Amount</th>
                    <th className="p-3.5">Payment Mode</th>
                    <th className="p-3.5">Reference / UTR</th>
                    <th className="p-3.5">Remarks</th>
                    <th className="p-3.5">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredTxns.map(t => {
                    const isIn = t.transaction_type === 'INWARD';
                    return (
                      <tr key={t.id} className="hover:bg-slate-50">
                        <td className="p-3.5 font-mono font-bold text-slate-800">{t.voucher_number}</td>
                        <td className="p-3.5 font-bold text-slate-900">{t.party_name}</td>
                        <td className="p-3.5">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isIn ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}>
                            {isIn ? 'INWARD (Receipt)' : 'OUTWARD (Payment)'}
                          </span>
                        </td>
                        <td className={`p-3.5 text-right font-mono font-bold ${isIn ? 'text-emerald-700' : 'text-rose-700'}`}>
                          {isIn ? '+' : '-'}{formatRs(t.amount)}
                        </td>
                        <td className="p-3.5 text-slate-700">{t.payment_mode || 'NEFT/RTGS'}</td>
                        <td className="p-3.5 font-mono text-slate-600">{t.reference_no || '—'}</td>
                        <td className="p-3.5 text-slate-500">{t.remarks || '—'}</td>
                        <td className="p-3.5 font-mono text-slate-400">{t.transaction_date?.slice(0, 10)}</td>
                      </tr>
                    );
                  })}
                  {filteredTxns.length === 0 && (
                    <tr>
                      <td colSpan="8" className="p-8 text-center text-slate-400">
                        No payment vouchers found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-VIEW 2: RECORD PAYMENT */}
      {activeSubTab === 'record' && (
        <form onSubmit={handleRecordPayment} className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
          <div className="border-b border-slate-200 pb-4">
            <h3 className="text-lg font-bold text-slate-900">Record Payment & Collection Voucher</h3>
            <p className="text-xs text-slate-500">Log inward client bank transfers or outward raw material supplier remittances.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <PartyAutoCompleteInput
                label="Party / Beneficiary Name"
                value={form.party_name}
                onChange={v => setForm({ ...form, party_name: v })}
                onSelectParty={p => setForm({ ...form, party_name: p.party_name })}
                partyType={form.transaction_type === 'INWARD' ? 'FABRIC_BUYER' : 'YARN_SUPPLIER'}
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Transaction Voucher Type *</label>
              <select
                value={form.transaction_type}
                onChange={e => setForm({ ...form, transaction_type: e.target.value })}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm font-bold text-slate-900"
              >
                <option value="INWARD">INWARD (Client Receipt / Collection)</option>
                <option value="OUTWARD">OUTWARD (Supplier / Sizing Payment)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Payment Amount (Rs.) *</label>
              <input
                type="number"
                step="0.01"
                required
                value={form.amount}
                onChange={e => setForm({ ...form, amount: parseFloat(e.target.value) || 0 })}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm font-bold font-mono text-slate-900"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Payment Channel / Mode</label>
              <select
                value={form.payment_mode}
                onChange={e => setForm({ ...form, payment_mode: e.target.value })}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900"
              >
                <option value="NEFT/RTGS">Bank NEFT / RTGS / IMPS</option>
                <option value="Cheque">Bank Clearing Cheque</option>
                <option value="UPI">Corporate UPI Transfer</option>
                <option value="Cash">Cash Receipt / Voucher</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Bank Reference / UTR Number</label>
              <input
                type="text"
                value={form.reference_no}
                onChange={e => setForm({ ...form, reference_no: e.target.value })}
                placeholder="UTR or Cheque No"
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm font-mono text-slate-900"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Voucher Remarks</label>
              <input
                type="text"
                value={form.remarks}
                onChange={e => setForm({ ...form, remarks: e.target.value })}
                placeholder="e.g. Part payment for Invoice 104"
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setActiveSubTab('ledger')}
              className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-sm font-semibold hover:bg-slate-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold shadow-xs cursor-pointer"
            >
              Post Payment Voucher
            </button>
          </div>
        </form>
      )}

      {/* SUB-VIEW 3: MASTERS */}
      {activeSubTab === 'masters' && <MasterDirectoryPanel defaultCategory="ALL" />}
    </div>
  );
}
