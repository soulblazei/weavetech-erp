import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Search, 
  Plus, 
  Phone, 
  Mail, 
  MapPin, 
  ShieldCheck, 
  Filter, 
  Layers,
  IndianRupee,
  CheckCircle2,
  X
} from 'lucide-react';
import { mastersApi, apiClient } from '../api/client';

export default function MasterDirectoryPanel({ defaultCategory = "ALL" }) {
  const [parties, setParties] = useState([]);
  const [activeFilter, setActiveFilter] = useState(defaultCategory);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Form State
  const [form, setForm] = useState({
    party_name: '',
    party_type: 'FABRIC_BUYER',
    contact_person: '',
    phone: '',
    email: '',
    billing_address: '',
    city: '',
    state: '',
    gstin: '',
    payment_terms: '30 Days Credit',
    credit_limit: 2000000
  });

  const loadData = async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get('/masters/clients');
      setParties(res.data);
    } catch (e) {
      setParties(mastersApi.getClients());
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await apiClient.post('/masters/clients', form);
    } catch (e) {
      mastersApi.createClient(form);
    }
    setShowAddModal(false);
    setForm({
      party_name: '',
      party_type: 'FABRIC_BUYER',
      contact_person: '',
      phone: '',
      email: '',
      billing_address: '',
      city: '',
      state: '',
      gstin: '',
      payment_terms: '30 Days Credit',
      credit_limit: 2000000
    });
    loadData();
  };

  const filtered = parties.filter(p => {
    const matchesCat = activeFilter === 'ALL' || p.party_type === activeFilter;
    const q = searchQuery.toLowerCase();
    const matchesSearch = !q ||
      p.party_name.toLowerCase().includes(q) ||
      (p.contact_person || '').toLowerCase().includes(q) ||
      (p.city || '').toLowerCase().includes(q) ||
      (p.gstin || '').toLowerCase().includes(q);
    return matchesCat && matchesSearch;
  });

  const formatRs = (n) => `Rs. ${Number(n || 0).toLocaleString('en-IN')}`;

  const categoryPills = [
    { id: 'ALL', label: 'All Master Records' },
    { id: 'FABRIC_BUYER', label: 'Fabric Buyers' },
    { id: 'YARN_SUPPLIER', label: 'Yarn Suppliers' },
    { id: 'JOB_WORKER', label: 'Job Workers / Sizing' },
    { id: 'BROKER', label: 'Textile Brokers' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Top Header Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Building2 className="w-6 h-6 text-indigo-600" />
            <h2 className="text-xl font-bold text-slate-900">Master Directory Management</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Global verified directory of clients, spinning mills, sizing units, and commission brokers.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-lg text-sm font-bold shadow-xs flex items-center gap-2 transition"
        >
          <Plus className="w-4 h-4" /> Add Master Party
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
        {/* Category Tabs */}
        <div className="flex flex-wrap gap-1.5 bg-slate-100 p-1 rounded-lg">
          {categoryPills.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition ${
                activeFilter === tab.id
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search party, city, GSTIN..."
            className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600 transition"
          />
        </div>
      </div>

      {/* Directory Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-700 text-xs font-semibold border-b border-slate-200">
                <th className="p-3.5">Party Name</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5">Key Contact</th>
                <th className="p-3.5">City & State</th>
                <th className="p-3.5">GSTIN</th>
                <th className="p-3.5">Payment Terms</th>
                <th className="p-3.5 text-right">Credit Limit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filtered.map(p => (
                <tr key={p.id} className="hover:bg-slate-50 transition">
                  <td className="p-3.5 font-bold text-slate-900">
                    <div className="flex items-center gap-2">
                      <span>{p.party_name}</span>
                    </div>
                  </td>
                  <td className="p-3.5">
                    <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                      p.party_type === 'FABRIC_BUYER' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' :
                      p.party_type === 'YARN_SUPPLIER' ? 'bg-amber-50 text-amber-800 border border-amber-200' :
                      p.party_type === 'JOB_WORKER' ? 'bg-cyan-50 text-cyan-800 border border-cyan-200' :
                      'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    }`}>
                      {p.party_type.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="p-3.5 text-slate-700">
                    <div className="font-semibold">{p.contact_person || '—'}</div>
                    <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1 mt-0.5">
                      {p.phone && <span className="flex items-center gap-0.5"><Phone className="w-2.5 h-2.5" />{p.phone}</span>}
                    </div>
                  </td>
                  <td className="p-3.5 text-slate-600">
                    <div className="font-semibold text-slate-800">{p.city || '—'}</div>
                    <div className="text-[11px] text-slate-400">{p.state || ''}</div>
                  </td>
                  <td className="p-3.5 font-mono text-[11px] text-slate-700">
                    {p.gstin ? <span className="bg-slate-100 px-1.5 py-0.5 rounded">{p.gstin}</span> : '—'}
                  </td>
                  <td className="p-3.5">
                    <span className="font-semibold text-slate-700 bg-slate-100 px-2 py-1 rounded">
                      {p.payment_terms || 'Standard'}
                    </span>
                  </td>
                  <td className="p-3.5 text-right font-bold font-mono text-slate-900">
                    {p.credit_limit ? formatRs(p.credit_limit) : 'N/A'}
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-slate-400">
                    No master records matching filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal to Add New Party */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-900">Register Master Party</h3>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="text-xs font-bold text-slate-700 block mb-1">Company / Mill Name *</label>
                  <input
                    type="text"
                    required
                    value={form.party_name}
                    onChange={e => setForm({ ...form, party_name: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600"
                    placeholder="e.g. Vardhman Textiles Ltd"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Party Category</label>
                  <select
                    value={form.party_type}
                    onChange={e => setForm({ ...form, party_type: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600"
                  >
                    <option value="FABRIC_BUYER">Fabric Buyer</option>
                    <option value="YARN_SUPPLIER">Yarn Supplier</option>
                    <option value="JOB_WORKER">Job Worker / Sizing</option>
                    <option value="BROKER">Textile Broker</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Key Contact Person</label>
                  <input
                    type="text"
                    value={form.contact_person}
                    onChange={e => setForm({ ...form, contact_person: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900"
                    placeholder="Key Person Name"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={e => setForm({ ...form, phone: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900"
                    placeholder="10-digit Phone"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Email Address</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900"
                    placeholder="official@company.com"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">City</label>
                  <input
                    type="text"
                    value={form.city}
                    onChange={e => setForm({ ...form, city: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900"
                    placeholder="e.g. Surat"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">State</label>
                  <input
                    type="text"
                    value={form.state}
                    onChange={e => setForm({ ...form, state: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900"
                    placeholder="e.g. Gujarat"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">GSTIN Number</label>
                  <input
                    type="text"
                    value={form.gstin}
                    onChange={e => setForm({ ...form, gstin: e.target.value.toUpperCase() })}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 font-mono"
                    placeholder="24AAACV1234A1Z5"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Credit Limit (Rs.)</label>
                  <input
                    type="number"
                    value={form.credit_limit}
                    onChange={e => setForm({ ...form, credit_limit: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 font-mono"
                  />
                </div>

                <div className="col-span-2">
                  <label className="text-xs font-bold text-slate-700 block mb-1">Payment Terms</label>
                  <select
                    value={form.payment_terms}
                    onChange={e => setForm({ ...form, payment_terms: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900"
                  >
                    <option value="Against Delivery">Against Delivery (Advance/COD)</option>
                    <option value="15 Days Credit">15 Days Credit</option>
                    <option value="30 Days Credit">30 Days Credit</option>
                    <option value="45 Days Credit">45 Days Credit</option>
                    <option value="60 Days Credit">60 Days Credit</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 text-sm font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold shadow-xs"
                >
                  Save Master Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
