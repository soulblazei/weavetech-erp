import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Users, 
  Package, 
  Settings, 
  FileSpreadsheet, 
  Plus, 
  Search, 
  Filter, 
  MapPin, 
  Phone, 
  Mail, 
  ShieldCheck, 
  IndianRupee, 
  Check, 
  X, 
  Layers, 
  Activity, 
  BadgePercent,
  Factory
} from 'lucide-react';
import { apiClient, mastersApi } from '../../api/client';

export default function MasterPanel({ defaultTab = 'clients', onTabChange = () => {} }) {
  const [activeTab, setActiveTab] = useState(defaultTab); // 'clients', 'employees', 'items', 'company', 'parameters', 'mis'
  
  // Synchronize internal activeTab when external defaultTab prop changes (e.g. from sidebar clicks)
  useEffect(() => {
    if (defaultTab) {
      setActiveTab(defaultTab);
      setSearchQuery('');
      setCategoryFilter('ALL');
    }
  }, [defaultTab]);
  
  // Data lists
  const [clients, setClients] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [items, setItems] = useState([]);
  const [company, setCompany] = useState(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [showClientModal, setShowClientModal] = useState(false);
  const [showEmpModal, setShowEmpModal] = useState(false);
  const [showItemModal, setShowItemModal] = useState(false);

  // Client Form
  const [clientForm, setClientForm] = useState({
    party_code: '',
    party_name: '',
    party_type: 'FABRIC_BUYER',
    contact_person: '',
    phone: '',
    email: '',
    billing_address: '',
    city: '',
    state: '',
    pincode: '',
    gstin: '',
    pan_number: '',
    payment_terms: '30 Days Credit',
    credit_limit: 2000000
  });

  // Employee Form
  const [empForm, setEmpForm] = useState({
    employee_code: '',
    full_name: '',
    designation: 'Weaver / Operator',
    department: 'Weaving Shed',
    shift_preference: 'Shift A',
    phone: '',
    emergency_contact: '',
    id_proof_number: '',
    date_of_joining: new Date().toISOString().slice(0, 10),
    monthly_salary_or_rate: 28000,
    is_active: true
  });

  // Item Form
  const [itemForm, setItemForm] = useState({
    item_code: '',
    item_name: '',
    item_category: 'GREY_FABRIC',
    hsn_code: '5208',
    unit_of_measure: 'MTR',
    standard_cost: 45.0,
    reorder_level: 5000,
    gst_rate_percent: 5.0,
    warp_count: '40s Combed',
    weft_count: '40s Carded',
    epi: 132,
    ppi: 72,
    width_inches: 58.0,
    gsm: 120.0
  });

  const loadAllMasters = async () => {
    setIsLoading(true);
    try {
      const [cRes, eRes, iRes] = await Promise.all([
        apiClient.get('/masters/list/clients').catch(() => ({ data: mastersApi.getList('clients') })),
        apiClient.get('/masters/list/employees').catch(() => ({ data: mastersApi.getList('employees') })),
        apiClient.get('/masters/list/items').catch(() => ({ data: mastersApi.getList('items') })),
      ]);
      setClients(cRes.data || []);
      setEmployees(eRes.data || []);
      setItems(iRes.data || []);
    } catch (e) {
      setClients(mastersApi.getList('clients'));
      setEmployees(mastersApi.getList('employees'));
      setItems(mastersApi.getList('items'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAllMasters();
  }, []);

  const handleSaveClient = async (e) => {
    e.preventDefault();
    try {
      await apiClient.post('/masters/clients', clientForm);
    } catch (e) {
      mastersApi.createClient(clientForm);
    }
    setShowClientModal(false);
    loadAllMasters();
  };

  const handleSaveEmployee = async (e) => {
    e.preventDefault();
    try {
      await apiClient.post('/masters/employees', empForm);
    } catch (e) {
      mastersApi.createEmployee(empForm);
    }
    setShowEmpModal(false);
    loadAllMasters();
  };

  const handleSaveItem = async (e) => {
    e.preventDefault();
    try {
      await apiClient.post('/masters/items', itemForm);
    } catch (e) {
      mastersApi.createItem(itemForm);
    }
    setShowItemModal(false);
    loadAllMasters();
  };

  const formatRs = (n) => `Rs. ${Number(n || 0).toLocaleString('en-IN')}`;

  const masterNav = [
    { id: 'clients', label: 'Client / Party Master', icon: Building2, count: clients.length },
    { id: 'employees', label: 'Employee Master', icon: Users, count: employees.length },
    { id: 'items', label: 'Item & Fabric Master', icon: Package, count: items.length },
    { id: 'company', label: 'Company Master', icon: Factory, count: 1 },
    { id: 'parameters', label: 'Categories & Parameters', icon: Settings, count: 18 },
    { id: 'mis', label: 'Master MIS Analytics', icon: FileSpreadsheet, count: 3 },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-7 h-7 text-indigo-600" />
            <h1 className="text-2xl font-black text-slate-900">Master Data Management Suite</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Global verified directory of Clients, Weaving Workforce, Fabric Construction Specs, and Mill Parameters.
          </p>
        </div>

        {activeTab === 'clients' && (
          <button
            onClick={() => {
              setClientForm({ ...clientForm, party_code: `CLI-${1001 + clients.length}` });
              setShowClientModal(true);
            }}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-xs flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add Client Master
          </button>
        )}
        {activeTab === 'employees' && (
          <button
            onClick={() => {
              setEmpForm({ ...empForm, employee_code: `EMP-${1001 + employees.length}` });
              setShowEmpModal(true);
            }}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-xs flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add Employee Master
          </button>
        )}
        {activeTab === 'items' && (
          <button
            onClick={() => {
              setItemForm({ ...itemForm, item_code: `ITM-FAB-${100 + items.length}` });
              setShowItemModal(true);
            }}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-xs flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add Item / Spec Master
          </button>
        )}
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-2 flex flex-wrap gap-1.5">
        {masterNav.map(nav => {
          const Icon = nav.icon;
          const isActive = activeTab === nav.id;
          return (
            <button
              key={nav.id}
              onClick={() => {
                setActiveTab(nav.id);
                setSearchQuery('');
                setCategoryFilter('ALL');
                if (onTabChange) onTabChange(nav.id);
              }}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{nav.label}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${isActive ? 'bg-indigo-700 text-white' : 'bg-slate-200 text-slate-700'}`}>
                {nav.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: CLIENT / PARTY MASTER */}
      {activeTab === 'clients' && (
        <div className="space-y-4">
          {/* Filter and Search Bar */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3">
            <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-lg">
              {[
                { id: 'ALL', label: 'All Parties' },
                { id: 'FABRIC_BUYER', label: 'Fabric Buyers' },
                { id: 'YARN_SUPPLIER', label: 'Yarn Mills' },
                { id: 'JOB_WORKER', label: 'Sizing Units' },
                { id: 'BROKER', label: 'Textile Brokers' },
              ].map(pill => (
                <button
                  key={pill.id}
                  onClick={() => setCategoryFilter(pill.id)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-md transition ${
                    categoryFilter === pill.id ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>

            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search party code, name, GSTIN..."
                className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600"
              />
            </div>
          </div>

          {/* Client Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                    <th className="p-3.5">Code</th>
                    <th className="p-3.5">Party / Mill Name</th>
                    <th className="p-3.5">Type</th>
                    <th className="p-3.5">Contact Person</th>
                    <th className="p-3.5">City & State</th>
                    <th className="p-3.5">GSTIN / PAN</th>
                    <th className="p-3.5">Terms</th>
                    <th className="p-3.5 text-right">Credit Limit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {clients
                    .filter(c => (categoryFilter === 'ALL' || c.party_type === categoryFilter) && (!searchQuery || c.party_name.toLowerCase().includes(searchQuery.toLowerCase()) || (c.city || '').toLowerCase().includes(searchQuery.toLowerCase()) || (c.gstin || '').toLowerCase().includes(searchQuery.toLowerCase())))
                    .map(c => (
                      <tr key={c.id} className="hover:bg-slate-50">
                        <td className="p-3.5 font-mono font-bold text-slate-700">{c.party_code || `CLI-${1000 + c.id}`}</td>
                        <td className="p-3.5 font-bold text-slate-900">{c.party_name}</td>
                        <td className="p-3.5">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            c.party_type === 'FABRIC_BUYER' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' :
                            c.party_type === 'YARN_SUPPLIER' ? 'bg-amber-50 text-amber-800 border border-amber-200' :
                            c.party_type === 'JOB_WORKER' ? 'bg-cyan-50 text-cyan-800 border border-cyan-200' :
                            'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          }`}>
                            {c.party_type.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="p-3.5 font-semibold text-slate-800">
                          <div>{c.contact_person || '—'}</div>
                          <div className="text-[10px] text-slate-400">{c.phone}</div>
                        </td>
                        <td className="p-3.5 text-slate-600">
                          {c.city ? `${c.city}, ${c.state || ''}` : '—'}
                        </td>
                        <td className="p-3.5 font-mono text-[11px] text-slate-700">
                          {c.gstin ? <span className="bg-slate-100 px-1.5 py-0.5 rounded">{c.gstin}</span> : '—'}
                        </td>
                        <td className="p-3.5 text-slate-700 font-semibold">{c.payment_terms || 'Standard'}</td>
                        <td className="p-3.5 text-right font-mono font-bold text-slate-900">
                          {c.credit_limit ? formatRs(c.credit_limit) : 'N/A'}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: EMPLOYEE MASTER */}
      {activeTab === 'employees' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3">
            <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-lg">
              {['ALL', 'Weaving Shed', 'Store', 'Quality Control', 'Sales', 'Accounts'].map(dept => (
                <button
                  key={dept}
                  onClick={() => setCategoryFilter(dept)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-md transition ${
                    categoryFilter === dept ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {dept === 'ALL' ? 'All Staff' : dept}
                </button>
              ))}
            </div>

            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search employee code, name, role..."
                className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600"
              />
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                    <th className="p-3.5">Emp ID</th>
                    <th className="p-3.5">Full Name</th>
                    <th className="p-3.5">Designation</th>
                    <th className="p-3.5">Department</th>
                    <th className="p-3.5">Shift</th>
                    <th className="p-3.5">Phone & Emergency</th>
                    <th className="p-3.5">Joining Date</th>
                    <th className="p-3.5 text-right">Monthly Pay</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {employees
                    .filter(e => (categoryFilter === 'ALL' || e.department === categoryFilter) && (!searchQuery || e.full_name.toLowerCase().includes(searchQuery.toLowerCase()) || e.employee_code.toLowerCase().includes(searchQuery.toLowerCase()) || e.designation.toLowerCase().includes(searchQuery.toLowerCase())))
                    .map(e => (
                      <tr key={e.id} className="hover:bg-slate-50">
                        <td className="p-3.5 font-mono font-bold text-indigo-700">{e.employee_code}</td>
                        <td className="p-3.5 font-bold text-slate-900">{e.full_name}</td>
                        <td className="p-3.5 font-semibold text-slate-800">{e.designation}</td>
                        <td className="p-3.5">
                          <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-semibold text-[11px]">
                            {e.department}
                          </span>
                        </td>
                        <td className="p-3.5 font-mono text-slate-600">{e.shift_preference || 'Shift A'}</td>
                        <td className="p-3.5 text-slate-600">
                          <div>{e.phone || '—'}</div>
                          <div className="text-[10px] text-slate-400">Emg: {e.emergency_contact || '—'}</div>
                        </td>
                        <td className="p-3.5 font-mono text-slate-500">{e.date_of_joining || '—'}</td>
                        <td className="p-3.5 text-right font-mono font-bold text-slate-900">
                          {formatRs(e.monthly_salary_or_rate)}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: ITEM & FABRIC SPEC MASTER */}
      {activeTab === 'items' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3">
            <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-lg">
              {[
                { id: 'ALL', label: 'All Items' },
                { id: 'GREY_FABRIC', label: 'Grey Fabrics' },
                { id: 'RAW_YARN', label: 'Raw Yarn Counts' },
                { id: 'SIZING_MATERIAL', label: 'Sizing Chemicals' },
                { id: 'LOOM_SPARE', label: 'Loom Spares' },
              ].map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setCategoryFilter(cat.id)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-md transition ${
                    categoryFilter === cat.id ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search item code, quality, HSN..."
                className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600"
              />
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                    <th className="p-3.5">Item Code</th>
                    <th className="p-3.5">Item / Quality Name</th>
                    <th className="p-3.5">Category</th>
                    <th className="p-3.5">HSN Code</th>
                    <th className="p-3.5">UOM</th>
                    <th className="p-3.5">Textile Specs (Warp/Weft/EPI/PPI)</th>
                    <th className="p-3.5 text-right">Std Cost</th>
                    <th className="p-3.5 text-right">Reorder Level</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items
                    .filter(i => (categoryFilter === 'ALL' || i.item_category === categoryFilter) && (!searchQuery || i.item_name.toLowerCase().includes(searchQuery.toLowerCase()) || i.item_code.toLowerCase().includes(searchQuery.toLowerCase()) || (i.hsn_code || '').toLowerCase().includes(searchQuery.toLowerCase())))
                    .map(i => (
                      <tr key={i.id} className="hover:bg-slate-50">
                        <td className="p-3.5 font-mono font-bold text-indigo-700">{i.item_code}</td>
                        <td className="p-3.5 font-bold text-slate-900">{i.item_name}</td>
                        <td className="p-3.5">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            i.item_category === 'GREY_FABRIC' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' :
                            i.item_category === 'RAW_YARN' ? 'bg-amber-50 text-amber-800 border border-amber-200' :
                            'bg-slate-100 text-slate-700'
                          }`}>
                            {i.item_category.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="p-3.5 font-mono text-slate-600">{i.hsn_code || '—'}</td>
                        <td className="p-3.5 font-bold text-slate-700">{i.unit_of_measure}</td>
                        <td className="p-3.5 text-slate-600">
                          {i.item_category === 'GREY_FABRIC' ? (
                            <span className="font-mono text-[11px]">
                              {i.warp_count} × {i.weft_count} | {i.epi}×{i.ppi} | {i.width_inches}"
                            </span>
                          ) : i.warp_count ? (
                            <span className="font-mono text-[11px]">{i.warp_count}</span>
                          ) : '—'}
                        </td>
                        <td className="p-3.5 text-right font-mono font-bold text-slate-900">
                          Rs. {Number(i.standard_cost).toFixed(2)}
                        </td>
                        <td className="p-3.5 text-right font-mono text-slate-600">
                          {Number(i.reorder_level).toLocaleString()} {i.unit_of_measure}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: COMPANY MASTER */}
      {activeTab === 'company' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
          <div className="border-b border-slate-200 pb-4">
            <h3 className="text-lg font-bold text-slate-900">Plant & Legal Entity Profile</h3>
            <p className="text-xs text-slate-500">Statutory GST, PAN, banking accounts, and factory physical address.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div className="space-y-4 p-5 bg-slate-50 rounded-xl border border-slate-200">
              <h4 className="font-bold text-sm text-slate-900">Entity Details</h4>
              <div className="space-y-2">
                <div><span className="text-slate-500">Company Name:</span> <strong className="text-slate-900 block text-sm">Moti Weaving Mills Pvt Ltd</strong></div>
                <div><span className="text-slate-500">Active Financial Year:</span> <strong className="text-slate-900 block font-mono">2026 - 2027</strong></div>
                <div><span className="text-slate-500">GSTIN Registration:</span> <strong className="text-slate-900 block font-mono">24AAACW9876K1Z9</strong></div>
                <div><span className="text-slate-500">Corporate PAN:</span> <strong className="text-slate-900 block font-mono">AAACW9876K</strong></div>
                <div><span className="text-slate-500">Factory Shed Address:</span> <strong className="text-slate-900 block">Plot No. 42-45, GIDC Industrial Estate, Sachin, Surat - 394230, Gujarat</strong></div>
              </div>
            </div>

            <div className="space-y-4 p-5 bg-slate-50 rounded-xl border border-slate-200">
              <h4 className="font-bold text-sm text-slate-900">Statutory Banking & Tax Accounts</h4>
              <div className="space-y-2">
                <div><span className="text-slate-500">Primary Bank:</span> <strong className="text-slate-900 block">HDFC Bank Ltd (Current Account)</strong></div>
                <div><span className="text-slate-500">Account Number:</span> <strong className="text-slate-900 block font-mono">50200088991122</strong></div>
                <div><span className="text-slate-500">IFSC Code:</span> <strong className="text-slate-900 block font-mono">HDFC0000240</strong></div>
                <div><span className="text-slate-500">Email for Invoices:</span> <strong className="text-slate-900 block">billing@motiweaving.com</strong></div>
                <div><span className="text-slate-500">Plant Contact Phone:</span> <strong className="text-slate-900 block font-mono">+91 98790 12345</strong></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: CATEGORIES & PARAMETERS */}
      {activeTab === 'parameters' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-3">
            <h4 className="font-bold text-sm text-slate-900 border-b border-slate-200 pb-2">Standard Yarn Counts</h4>
            <ul className="space-y-1.5 text-xs text-slate-700">
              {['20s Carded Cotton', '30s Carded Cotton', '40s Carded Cotton', '40s Combed Cotton', '60s Combed Cotton', '60s Compact Cotton', '80s Compact Cotton'].map(c => (
                <li key={c} className="p-2 bg-slate-50 rounded-lg flex items-center justify-between">
                  <span>{c}</span>
                  <span className="text-[10px] font-mono text-slate-400">Ne</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-3">
            <h4 className="font-bold text-sm text-slate-900 border-b border-slate-200 pb-2">Weave Patterns</h4>
            <ul className="space-y-1.5 text-xs text-slate-700">
              {['Plain 1/1', 'Twill 2/1', 'Twill 3/1', 'Satin 4/1', 'Dobby Oxford', 'Ripstop Grid'].map(w => (
                <li key={w} className="p-2 bg-slate-50 rounded-lg flex items-center justify-between">
                  <span>{w}</span>
                  <span className="text-[10px] text-indigo-600 font-bold">Standard</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-3">
            <h4 className="font-bold text-sm text-slate-900 border-b border-slate-200 pb-2">Godown Stacking Bays</h4>
            <ul className="space-y-1.5 text-xs text-slate-700">
              {['Bay A-01 (40s Section)', 'Bay A-02 (40s Section)', 'Bay B-01 (60s Compact)', 'Bay B-02 (60s Compact)', 'Bay C-01 (Carded / Coarse)', 'Bay D-01 (Sizing Starch)'].map(b => (
                <li key={b} className="p-2 bg-slate-50 rounded-lg flex items-center justify-between">
                  <span>{b}</span>
                  <span className="text-[10px] text-emerald-600 font-bold">Active</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* TAB 6: MASTER MIS ANALYTICS */}
      {activeTab === 'mis' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5">
              <span className="text-xs font-bold uppercase text-slate-500">Total Registered Parties</span>
              <p className="text-3xl font-black font-mono text-slate-900 mt-2">{clients.length}</p>
              <span className="text-[11px] text-indigo-600 font-semibold mt-1 block">
                {clients.filter(c => c.party_type === 'FABRIC_BUYER').length} Buyers • {clients.filter(c => c.party_type === 'YARN_SUPPLIER').length} Mills
              </span>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5">
              <span className="text-xs font-bold uppercase text-slate-500">Active Workforce</span>
              <p className="text-3xl font-black font-mono text-slate-900 mt-2">{employees.length}</p>
              <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">
                {employees.filter(e => e.department === 'Weaving Shed').length} Weavers/Supervisors
              </span>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5">
              <span className="text-xs font-bold uppercase text-slate-500">Item Master SKUs</span>
              <p className="text-3xl font-black font-mono text-slate-900 mt-2">{items.length}</p>
              <span className="text-[11px] text-amber-600 font-semibold mt-1 block">
                {items.filter(i => i.item_category === 'GREY_FABRIC').length} Woven Fabric Qualities
              </span>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD CLIENT */}
      {showClientModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-sm">Register Master Client / Party</h3>
              </div>
              <button onClick={() => setShowClientModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveClient} className="p-5 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Party Code</label>
                  <input
                    type="text"
                    required
                    value={clientForm.party_code}
                    onChange={e => setClientForm({ ...clientForm, party_code: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 font-mono text-slate-900"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Party Type</label>
                  <select
                    value={clientForm.party_type}
                    onChange={e => setClientForm({ ...clientForm, party_type: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900"
                  >
                    <option value="FABRIC_BUYER">Fabric Buyer</option>
                    <option value="YARN_SUPPLIER">Yarn Supplier</option>
                    <option value="JOB_WORKER">Job Worker / Sizing</option>
                    <option value="BROKER">Textile Broker</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="font-bold text-slate-700 block mb-1">Company / Mill Name *</label>
                  <input
                    type="text"
                    required
                    value={clientForm.party_name}
                    onChange={e => setClientForm({ ...clientForm, party_name: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">GSTIN Number (15 Digits)</label>
                  <input
                    type="text"
                    maxLength={15}
                    value={clientForm.gstin}
                    onChange={e => setClientForm({ ...clientForm, gstin: e.target.value.toUpperCase() })}
                    placeholder="24AAACV1234A1Z5"
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 font-mono text-slate-900"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">PAN Number</label>
                  <input
                    type="text"
                    maxLength={10}
                    value={clientForm.pan_number}
                    onChange={e => setClientForm({ ...clientForm, pan_number: e.target.value.toUpperCase() })}
                    placeholder="AAACV1234A"
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 font-mono text-slate-900"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Contact Person</label>
                  <input
                    type="text"
                    value={clientForm.contact_person}
                    onChange={e => setClientForm({ ...clientForm, contact_person: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={clientForm.phone}
                    onChange={e => setClientForm({ ...clientForm, phone: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">City</label>
                  <input
                    type="text"
                    value={clientForm.city}
                    onChange={e => setClientForm({ ...clientForm, city: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Credit Limit (Rs.)</label>
                  <input
                    type="number"
                    value={clientForm.credit_limit}
                    onChange={e => setClientForm({ ...clientForm, credit_limit: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 font-mono text-slate-900"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowClientModal(false)}
                  className="px-3 py-2 rounded-lg border border-slate-300 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
                >
                  Save Client Master
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD EMPLOYEE */}
      {showEmpModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-sm">Register Employee Master</h3>
              </div>
              <button onClick={() => setShowEmpModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEmployee} className="p-5 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Employee Code *</label>
                  <input
                    type="text"
                    required
                    value={empForm.employee_code}
                    onChange={e => setEmpForm({ ...empForm, employee_code: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 font-mono text-slate-900"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={empForm.full_name}
                    onChange={e => setEmpForm({ ...empForm, full_name: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Designation</label>
                  <select
                    value={empForm.designation}
                    onChange={e => setEmpForm({ ...empForm, designation: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900"
                  >
                    <option value="Weaver / Operator">Weaver / Operator</option>
                    <option value="Shift Supervisor">Shift Supervisor</option>
                    <option value="QC Incharge">QC Incharge</option>
                    <option value="Store Incharge">Store Incharge</option>
                    <option value="Sales Officer">Sales Officer</option>
                    <option value="Accounts Officer">Accounts Officer</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Department</label>
                  <select
                    value={empForm.department}
                    onChange={e => setEmpForm({ ...empForm, department: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900"
                  >
                    <option value="Weaving Shed">Weaving Shed</option>
                    <option value="Store">Store</option>
                    <option value="Quality Control">Quality Control</option>
                    <option value="Sales">Sales</option>
                    <option value="Accounts">Accounts</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Shift</label>
                  <select
                    value={empForm.shift_preference}
                    onChange={e => setEmpForm({ ...empForm, shift_preference: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900"
                  >
                    <option value="Shift A">Shift A (Day: 08:00 - 16:00)</option>
                    <option value="Shift B">Shift B (Evening: 16:00 - 00:00)</option>
                    <option value="Night">Night (00:00 - 08:00)</option>
                    <option value="General">General (09:30 - 18:00)</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Monthly Salary / Rate</label>
                  <input
                    type="number"
                    value={empForm.monthly_salary_or_rate}
                    onChange={e => setEmpForm({ ...empForm, monthly_salary_or_rate: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 font-mono text-slate-900"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowEmpModal(false)}
                  className="px-3 py-2 rounded-lg border border-slate-300 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
                >
                  Save Employee Master
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD ITEM / SPEC */}
      {showItemModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-sm">Register Item & Fabric Spec Master</h3>
              </div>
              <button onClick={() => setShowItemModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="p-5 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Item Code *</label>
                  <input
                    type="text"
                    required
                    value={itemForm.item_code}
                    onChange={e => setItemForm({ ...itemForm, item_code: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 font-mono text-slate-900"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Category</label>
                  <select
                    value={itemForm.item_category}
                    onChange={e => setItemForm({ ...itemForm, item_category: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900"
                  >
                    <option value="GREY_FABRIC">Grey Fabric Quality</option>
                    <option value="RAW_YARN">Raw Yarn</option>
                    <option value="SIZING_MATERIAL">Sizing Material</option>
                    <option value="LOOM_SPARE">Loom Spare Part</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="font-bold text-slate-700 block mb-1">Item / Quality Name *</label>
                  <input
                    type="text"
                    required
                    value={itemForm.item_name}
                    onChange={e => setItemForm({ ...itemForm, item_name: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 font-bold text-slate-900 text-sm"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">HSN Code</label>
                  <input
                    type="text"
                    value={itemForm.hsn_code}
                    onChange={e => setItemForm({ ...itemForm, hsn_code: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 font-mono text-slate-900"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Unit of Measure (UOM)</label>
                  <select
                    value={itemForm.unit_of_measure}
                    onChange={e => setItemForm({ ...itemForm, unit_of_measure: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900"
                  >
                    <option value="MTR">Meters (MTR)</option>
                    <option value="KG">Kilograms (KG)</option>
                    <option value="BAG">Bags (BAG)</option>
                    <option value="PCS">Pieces (PCS)</option>
                  </select>
                </div>

                {itemForm.item_category === 'GREY_FABRIC' && (
                  <>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Warp Count</label>
                      <input
                        type="text"
                        value={itemForm.warp_count}
                        onChange={e => setItemForm({ ...itemForm, warp_count: e.target.value })}
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Weft Count</label>
                      <input
                        type="text"
                        value={itemForm.weft_count}
                        onChange={e => setItemForm({ ...itemForm, weft_count: e.target.value })}
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">EPI / PPI</label>
                      <div className="grid grid-cols-2 gap-1">
                        <input
                          type="number"
                          placeholder="EPI"
                          value={itemForm.epi}
                          onChange={e => setItemForm({ ...itemForm, epi: parseInt(e.target.value) || 0 })}
                          className="w-full bg-white border border-slate-300 rounded-lg px-2 py-2 font-mono text-slate-900"
                        />
                        <input
                          type="number"
                          placeholder="PPI"
                          value={itemForm.ppi}
                          onChange={e => setItemForm({ ...itemForm, ppi: parseInt(e.target.value) || 0 })}
                          className="w-full bg-white border border-slate-300 rounded-lg px-2 py-2 font-mono text-slate-900"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Width (Inches) / GSM</label>
                      <div className="grid grid-cols-2 gap-1">
                        <input
                          type="number"
                          placeholder="Width"
                          value={itemForm.width_inches}
                          onChange={e => setItemForm({ ...itemForm, width_inches: parseFloat(e.target.value) || 0 })}
                          className="w-full bg-white border border-slate-300 rounded-lg px-2 py-2 font-mono text-slate-900"
                        />
                        <input
                          type="number"
                          placeholder="GSM"
                          value={itemForm.gsm}
                          onChange={e => setItemForm({ ...itemForm, gsm: parseFloat(e.target.value) || 0 })}
                          className="w-full bg-white border border-slate-300 rounded-lg px-2 py-2 font-mono text-slate-900"
                        />
                      </div>
                    </div>
                  </>
                )}

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Standard Cost (Rs.)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={itemForm.standard_cost}
                    onChange={e => setItemForm({ ...itemForm, standard_cost: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 font-mono text-slate-900"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">GST Slab %</label>
                  <select
                    value={itemForm.gst_rate_percent}
                    onChange={e => setItemForm({ ...itemForm, gst_rate_percent: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900"
                  >
                    <option value={0}>0% (Exempt)</option>
                    <option value={5}>5% (Textile / Fabric)</option>
                    <option value={12}>12% (Technical Fabric)</option>
                    <option value={18}>18% (Spares & Chemicals)</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowItemModal(false)}
                  className="px-3 py-2 rounded-lg border border-slate-300 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
                >
                  Save Item Master
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
