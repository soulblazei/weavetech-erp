import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Users, 
  UserPlus, 
  Layers, 
  ShoppingBag, 
  BarChart3, 
  Plus, 
  Search, 
  Filter, 
  Building2, 
  Phone, 
  Mail, 
  MapPin, 
  CheckCircle2, 
  Clock, 
  IndianRupee, 
  ArrowRight, 
  FileText, 
  Sparkles, 
  AlertTriangle, 
  Check, 
  X, 
  RefreshCw, 
  Eye, 
  ChevronRight, 
  Send, 
  Flame, 
  Tag,
  Factory,
  ArrowUpRight,
  ShieldCheck
} from 'lucide-react';
import MasterAutoSuggestInput from './common/MasterAutoSuggestInput';
import InquiryForm from './crm/InquiryForm';
import { apiClient, mockCRMApi, mastersApi, mockSalesApi } from '../api/client';

export default function CRMModule({ defaultTab, initialSubTab = 'inquiries' }) {
  const [activeTab, setActiveTab] = useState(defaultTab || initialSubTab); // 'forecast', 'sales_team', 'leads', 'inquiries', 'orders', 'mis'
  const [inquiries, setInquiries] = useState([]);
  const [leads, setLeads] = useState([]);
  const [forecasts, setForecasts] = useState([]);
  const [salesTeam, setSalesTeam] = useState([]);
  const [salesOrders, setSalesOrders] = useState([]);
  const [misData, setMisData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Sync tab when prop changes
  useEffect(() => {
    if (defaultTab || initialSubTab) {
      setActiveTab(defaultTab || initialSubTab);
    }
  }, [defaultTab, initialSubTab]);

  // Modals
  const [showInquiryModal, setShowInquiryModal] = useState(false);
  const [selectedLeadForInquiry, setSelectedLeadForInquiry] = useState(null);
  const [showAddLeadModal, setShowAddLeadModal] = useState(false);
  const [showAddForecastModal, setShowAddForecastModal] = useState(false);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState('ALL');
  const [inquiryViewMode, setInquiryViewMode] = useState('kanban'); // 'kanban' | 'table'

  // New Lead Form State
  const [newLead, setNewLead] = useState({
    lead_title: '',
    client_master_id: null,
    party_name: '',
    contact_person: '',
    phone: '',
    email: '',
    city: 'Surat',
    source: 'DIRECT_CALL',
    estimated_meters: 50000,
    assigned_to_emp_id: 6,
    notes: ''
  });

  // New Forecast Form State
  const [newForecast, setNewForecast] = useState({
    forecast_period: 'July 2026',
    target_meters: 500000,
    projected_revenue: 22500000,
    notes: 'Monsoon grey poplin demand'
  });

  // Fetch all CRM data
  const loadCRMData = async () => {
    setIsLoading(true);
    try {
      // Inquiries
      try {
        const resInq = await apiClient.get('/crm/inquiries');
        setInquiries(resInq.data || []);
      } catch (e) {
        setInquiries(mockCRMApi.getInquiries());
      }

      // Leads
      try {
        const resLeads = await apiClient.get('/crm/leads');
        setLeads(resLeads.data || []);
      } catch (e) {
        setLeads(mockCRMApi.getLeads());
      }

      // Forecasts
      try {
        const resFc = await apiClient.get('/crm/forecasts');
        setForecasts(resFc.data || []);
      } catch (e) {
        setForecasts(mockCRMApi.getForecasts());
      }

      // Sales Team
      try {
        const resTeam = await apiClient.get('/crm/sales-team');
        setSalesTeam(resTeam.data || []);
      } catch (e) {
        setSalesTeam(mockCRMApi.getSalesTeam());
      }

      // Sales Orders
      try {
        const resOrders = await apiClient.get('/sales/summary');
        setSalesOrders(resOrders.data?.data || []);
      } catch (e) {
        const res = mockSalesApi.getSummary();
        setSalesOrders(res.data || []);
      }

      // CRM MIS
      try {
        const resMis = await apiClient.get('/crm/mis');
        setMisData(resMis.data);
      } catch (e) {
        setMisData(mockCRMApi.getMIS());
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCRMData();
  }, []);

  const formatRs = (val) => {
    const num = Number(val || 0);
    if (num >= 10000000) return `₹ ${(num / 10000000).toFixed(2)} Cr`;
    if (num >= 100000) return `₹ ${(num / 100000).toFixed(2)} Lac`;
    return `₹ ${num.toLocaleString('en-IN')}`;
  };

  const handleStageChange = async (inqId, newStage, dropReason = null) => {
    try {
      try {
        await apiClient.patch(`/crm/inquiries/${inqId}/stage`, { stage: newStage, drop_reason: dropReason });
      } catch (e) {
        mockCRMApi.updateInquiryStage(inqId, newStage, dropReason);
      }

      // If converted to WON, auto-create a Sales Order
      if (newStage === 'WON_ORDER_CONVERTED') {
        const targetInq = inquiries.find(i => i.id === inqId);
        if (targetInq) {
          const orderPayload = {
            customer_name: targetInq.party_name,
            contact_person: targetInq.contact_person,
            customer_city: targetInq.city,
            quality_construction: targetInq.quality_construction,
            warp_count: targetInq.warp_count || '60s Combed',
            weft_count: targetInq.weft_count || '60s Combed',
            epi: String(targetInq.epi || 92),
            ppi: String(targetInq.ppi || 88),
            weave_type: 'Plain 1/1',
            width_inches: targetInq.width_inches || 58,
            gsm: targetInq.gsm || 110,
            total_meters: targetInq.required_meters,
            rate_per_meter: targetInq.target_rate_per_meter,
            tax_percent: 5,
            delivery_date: targetInq.delivery_target_date || new Date().toISOString().slice(0, 10),
            payment_terms: '30 Days Credit',
            remarks: `Converted from Inquiry ${targetInq.inquiry_number}: ${targetInq.remarks || ''}`
          };
          try {
            await apiClient.post('/sales/orders', orderPayload);
          } catch (e) {
            mockSalesApi.createOrder(orderPayload);
          }
        }
      }

      loadCRMData();
    } catch (err) {
      alert("Error updating stage: " + err.message);
    }
  };

  const handleCreateLead = async (e) => {
    e.preventDefault();
    if (!newLead.party_name) return;
    try {
      try {
        await apiClient.post('/crm/leads', newLead);
      } catch (err) {
        mockCRMApi.createLead(newLead);
      }
      setShowAddLeadModal(false);
      setNewLead({
        lead_title: '',
        client_master_id: null,
        party_name: '',
        contact_person: '',
        phone: '',
        email: '',
        city: 'Surat',
        source: 'DIRECT_CALL',
        estimated_meters: 50000,
        assigned_to_emp_id: 6,
        notes: ''
      });
      loadCRMData();
    } catch (err) {
      alert("Error saving lead");
    }
  };

  const handleCreateForecast = async (e) => {
    e.preventDefault();
    try {
      try {
        await apiClient.post('/crm/forecasts', newForecast);
      } catch (err) {
        mockCRMApi.createForecast(newForecast);
      }
      setShowAddForecastModal(false);
      loadCRMData();
    } catch (err) {
      alert("Error saving forecast");
    }
  };

  const crmTabs = [
    { id: 'forecast', label: '1. Forecast', icon: TrendingUp, desc: 'Weaving Meter Projections' },
    { id: 'sales_team', label: '2. Sales Team', icon: Users, desc: 'Roster & Territories' },
    { id: 'leads', label: '3. Lead Manager', icon: UserPlus, desc: 'Cold & Agency Leads' },
    { id: 'inquiries', label: '4. Opportunity / Inquiry', icon: Layers, desc: 'Technical RFQ & Kanban' },
    { id: 'orders', label: '5. Sales Orders', icon: ShoppingBag, desc: 'Production Booking Queue' },
    { id: 'mis', label: '6. CRM MIS & Analytics', icon: BarChart3, desc: 'Funnel & Deal Analytics' },
  ];

  const kanbanStages = [
    { id: 'INQUIRY_RECEIVED', label: 'Inquiry Received', color: 'border-t-blue-500', badge: 'bg-blue-50 text-blue-700' },
    { id: 'SAMPLE_SENT', label: 'Sample Dispatched', color: 'border-t-amber-500', badge: 'bg-amber-50 text-amber-700' },
    { id: 'PRICE_QUOTED', label: 'Price Quoted', color: 'border-t-purple-500', badge: 'bg-purple-50 text-purple-700' },
    { id: 'RATE_NEGOTIATION', label: 'Rate Negotiation', color: 'border-t-indigo-500', badge: 'bg-indigo-50 text-indigo-700' },
    { id: 'WON_ORDER_CONVERTED', label: 'Contracts Won', color: 'border-t-emerald-500', badge: 'bg-emerald-50 text-emerald-700' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      
      {/* Top CRM Sub-Module Navigation Ribbon */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-1.5 flex flex-wrap gap-1.5">
        {crmTabs.map(tab => {
          const TabIcon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 min-w-[140px] px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <TabIcon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* 1. FORECAST VIEW */}
      {/* ========================================================================= */}
      {activeTab === 'forecast' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-indigo-600" />
                Monthly & Quarterly Weaving Forecast
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Projected weaving meter targets vs actual loom shed realization.
              </p>
            </div>
            <button
              onClick={() => setShowAddForecastModal(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-xs flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add Forecast Period
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {forecasts.map(fc => {
              const pct = fc.target_meters > 0 ? Math.min(100, Math.round((fc.achieved_meters / fc.target_meters) * 100)) : 0;
              const isHigh = pct >= 90;
              const isMed = pct >= 60 && pct < 90;

              return (
                <div key={fc.id} className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="font-black text-sm text-slate-900">{fc.forecast_period}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      isHigh ? 'bg-emerald-100 text-emerald-800' : isMed ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {pct}% Achieved
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs text-slate-600">
                      <span>Target: <strong>{Number(fc.target_meters).toLocaleString()} m</strong></span>
                      <span>Realized: <strong>{Number(fc.achieved_meters || 0).toLocaleString()} m</strong></span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-500 ${isHigh ? 'bg-emerald-500' : isMed ? 'bg-amber-500' : 'bg-indigo-600'}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">Projected Rev</span>
                      <strong className="text-slate-900 font-mono">{formatRs(fc.projected_revenue)}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">Actual Rev</span>
                      <strong className="text-emerald-700 font-mono">{formatRs(fc.achieved_revenue)}</strong>
                    </div>
                  </div>

                  {fc.notes && (
                    <p className="text-[11px] text-slate-500 italic bg-slate-50 p-2 rounded-lg">
                      "{fc.notes}"
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. SALES TEAM VIEW */}
      {/* ========================================================================= */}
      {activeTab === 'sales_team' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-600" />
                Sales Team Roster & Field Territories
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Territory coverage, monthly target meters, and active inquiry pipelines per executive.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {salesTeam.map(exec => (
              <div key={exec.id} className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4 hover:shadow-md transition">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 font-black flex items-center justify-center text-sm">
                      {exec.full_name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">{exec.full_name}</h3>
                      <span className="text-[10px] font-bold text-slate-500 block">{exec.designation}</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                    {exec.employee_code}
                  </span>
                </div>

                <div className="space-y-2 bg-slate-50 p-3 rounded-xl text-xs">
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-slate-400" /> Territory:</span>
                    <strong className="text-slate-900">{exec.territory || 'Surat Industrial Belt'}</strong>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-slate-400" /> Mobile:</span>
                    <strong className="font-mono text-slate-900">{exec.phone || '9879066778'}</strong>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="flex items-center gap-1.5"><Layers className="w-3.5 h-3.5 text-slate-400" /> Monthly Target:</span>
                    <strong className="font-mono text-indigo-700">{Number(exec.target_meters_monthly || 50000).toLocaleString()} m</strong>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1 text-center">
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-2">
                    <span className="text-[10px] font-bold text-blue-700 uppercase block">Active Leads</span>
                    <strong className="text-sm font-black text-blue-900">{exec.active_leads_count || 2}</strong>
                  </div>
                  <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-2">
                    <span className="text-[10px] font-bold text-indigo-700 uppercase block">Active Inquiries</span>
                    <strong className="text-sm font-black text-indigo-900">{exec.active_inquiries_count || 3}</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. LEAD MANAGER VIEW */}
      {/* ========================================================================= */}
      {activeTab === 'leads' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-indigo-600" />
                Cold Buyer Contacts & Sourcing Leads
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Capture initial buyer interest, trade fair inquiries, and agency referrals before RFQ quote.
              </p>
            </div>
            <button
              onClick={() => setShowAddLeadModal(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-xs flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add Sourcing Lead
            </button>
          </div>

          {/* Leads Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">Active Leads ({leads.length})</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    <th className="p-3.5">Lead Title & Party</th>
                    <th className="p-3.5">Contact / Phone</th>
                    <th className="p-3.5">Source</th>
                    <th className="p-3.5">Est. Meters</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {leads.map(lead => (
                    <tr key={lead.id} className="hover:bg-slate-50/80 transition">
                      <td className="p-3.5 font-semibold text-slate-900">
                        <div>{lead.lead_title}</div>
                        <span className="text-[11px] font-bold text-indigo-600">{lead.party_name}</span>
                        {lead.city && <span className="text-[10px] text-slate-400 ml-1.5">• {lead.city}</span>}
                      </td>
                      <td className="p-3.5 text-slate-600">
                        <div>{lead.contact_person || 'N/A'}</div>
                        <div className="font-mono text-[11px] text-slate-500">{lead.phone}</div>
                      </td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                          {lead.source}
                        </span>
                      </td>
                      <td className="p-3.5 font-mono font-bold text-slate-800">
                        {Number(lead.estimated_meters).toLocaleString()} m
                      </td>
                      <td className="p-3.5">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                          {lead.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => {
                            setSelectedLeadForInquiry(lead);
                            setShowInquiryModal(true);
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-600 hover:text-white text-indigo-700 font-bold rounded-lg text-xs transition cursor-pointer"
                        >
                          Convert to Inquiry <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {leads.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-6 text-center text-slate-400 italic">
                        No leads logged yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. OPPORTUNITY / INQUIRY DESK (KANBAN & TABLE) */}
      {/* ========================================================================= */}
      {activeTab === 'inquiries' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Layers className="w-5 h-5 text-indigo-600" />
                Fabric Opportunity & Inquiry Desk
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Technical fabric RFQs with real-time Master verification, sample tracking, and order conversion.
              </p>
            </div>
            <div className="flex items-center gap-3">
              {/* View Switcher */}
              <div className="bg-slate-100 p-1 rounded-xl flex gap-1">
                <button
                  onClick={() => setInquiryViewMode('kanban')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    inquiryViewMode === 'kanban' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  Kanban
                </button>
                <button
                  onClick={() => setInquiryViewMode('table')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    inquiryViewMode === 'table' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  Grid Table
                </button>
              </div>

              <button
                onClick={() => {
                  setSelectedLeadForInquiry(null);
                  setShowInquiryModal(true);
                }}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-xs flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Log Fabric Inquiry
              </button>
            </div>
          </div>

          {/* Kanban Board Mode */}
          {inquiryViewMode === 'kanban' && (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {kanbanStages.map(stage => {
                const stageInquiries = inquiries.filter(i => (i.stage || 'INQUIRY_RECEIVED') === stage.id);
                const stageVal = stageInquiries.reduce((s, i) => s + (i.grand_total || 0), 0);

                return (
                  <div key={stage.id} className={`bg-slate-50 rounded-2xl border border-slate-200 border-t-4 ${stage.color} p-3.5 space-y-3`}>
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-xs text-slate-800">{stage.label}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${stage.badge}`}>
                        {stageInquiries.length}
                      </span>
                    </div>

                    <div className="text-[11px] font-mono text-slate-500 pb-1 border-b border-slate-200">
                      Val: <strong className="text-slate-900">{formatRs(stageVal)}</strong>
                    </div>

                    <div className="space-y-3">
                      {stageInquiries.map(inq => (
                        <div key={inq.id} className="bg-white rounded-xl border border-slate-200 shadow-xs p-3.5 space-y-2 hover:shadow-md transition">
                          <div className="flex justify-between items-start">
                            <span className="text-[10px] font-mono font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                              {inq.inquiry_number}
                            </span>
                            <span className="text-[10px] font-bold text-slate-500">
                              {inq.delivery_target_date ? inq.delivery_target_date.slice(5) : ''}
                            </span>
                          </div>

                          <h4 className="font-bold text-xs text-slate-900 leading-snug">
                            {inq.party_name}
                          </h4>

                          <p className="text-[11px] text-slate-600 line-clamp-2">
                            {inq.quality_construction}
                          </p>

                          <div className="bg-slate-50 p-2 rounded-lg text-[11px] font-mono flex justify-between items-center">
                            <span className="text-slate-600">{Number(inq.required_meters).toLocaleString()} m</span>
                            <strong className="text-emerald-700 font-bold">{formatRs(inq.grand_total)}</strong>
                          </div>

                          {/* Quick Stage Transition Actions */}
                          <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-1">
                            {stage.id === 'INQUIRY_RECEIVED' && (
                              <button
                                onClick={() => handleStageChange(inq.id, 'SAMPLE_SENT')}
                                className="w-full text-center py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 text-[10px] font-bold rounded cursor-pointer"
                              >
                                ➔ Send Sample
                              </button>
                            )}
                            {stage.id === 'SAMPLE_SENT' && (
                              <button
                                onClick={() => handleStageChange(inq.id, 'PRICE_QUOTED')}
                                className="w-full text-center py-1 bg-purple-50 hover:bg-purple-100 text-purple-800 text-[10px] font-bold rounded cursor-pointer"
                              >
                                ➔ Quote Price
                              </button>
                            )}
                            {stage.id === 'PRICE_QUOTED' && (
                              <button
                                onClick={() => handleStageChange(inq.id, 'RATE_NEGOTIATION')}
                                className="w-full text-center py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 text-[10px] font-bold rounded cursor-pointer"
                              >
                                ➔ Negotiate Rate
                              </button>
                            )}
                            {stage.id === 'RATE_NEGOTIATION' && (
                              <button
                                onClick={() => handleStageChange(inq.id, 'WON_ORDER_CONVERTED')}
                                className="w-full text-center py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold rounded cursor-pointer shadow-xs"
                              >
                                ✓ Convert to Sales Order
                              </button>
                            )}
                            {stage.id === 'WON_ORDER_CONVERTED' && (
                              <span className="w-full text-center py-1 bg-emerald-50 text-emerald-800 text-[10px] font-bold rounded">
                                ✓ Contract Won
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                      {stageInquiries.length === 0 && (
                        <div className="p-4 text-center text-slate-400 text-xs italic">
                          No inquiries
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Table View Mode */}
          {inquiryViewMode === 'table' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      <th className="p-3.5">Inquiry No & Party</th>
                      <th className="p-3.5">Fabric Quality Spec</th>
                      <th className="p-3.5">Meters</th>
                      <th className="p-3.5">Target Rate</th>
                      <th className="p-3.5">Total Valuation</th>
                      <th className="p-3.5">Stage</th>
                      <th className="p-3.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {inquiries.map(inq => (
                      <tr key={inq.id} className="hover:bg-slate-50 transition">
                        <td className="p-3.5">
                          <span className="font-mono text-[11px] font-bold text-indigo-600 block">{inq.inquiry_number}</span>
                          <strong className="text-slate-900">{inq.party_name}</strong>
                          <span className="text-[11px] text-slate-500 block">{inq.city} • {inq.phone}</span>
                        </td>
                        <td className="p-3.5 font-semibold text-slate-700">
                          {inq.quality_construction}
                        </td>
                        <td className="p-3.5 font-mono font-bold text-slate-900">
                          {Number(inq.required_meters).toLocaleString()} m
                        </td>
                        <td className="p-3.5 font-mono font-bold text-slate-900">
                          ₹ {Number(inq.target_rate_per_meter).toFixed(2)}
                        </td>
                        <td className="p-3.5 font-mono font-bold text-emerald-700">
                          {formatRs(inq.grand_total)}
                        </td>
                        <td className="p-3.5">
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                            {inq.stage}
                          </span>
                        </td>
                        <td className="p-3.5 text-right">
                          {inq.stage !== 'WON_ORDER_CONVERTED' ? (
                            <button
                              onClick={() => handleStageChange(inq.id, 'WON_ORDER_CONVERTED')}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold cursor-pointer"
                            >
                              Convert to Order
                            </button>
                          ) : (
                            <span className="text-emerald-700 font-bold text-xs">✓ Won & Booked</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. SALES ORDERS QUEUE */}
      {/* ========================================================================= */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-indigo-600" />
                Confirmed Commercial Sales Orders
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Converted inquiry contracts queued for loom scheduling, sizing, and warp beam gaiting.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    <th className="p-3.5">Order No</th>
                    <th className="p-3.5">Customer & City</th>
                    <th className="p-3.5">Quality Construction</th>
                    <th className="p-3.5">Meters</th>
                    <th className="p-3.5">Rate</th>
                    <th className="p-3.5">Contract Total</th>
                    <th className="p-3.5">Delivery Target</th>
                    <th className="p-3.5">Loom Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {salesOrders.map(order => (
                    <tr key={order.id} className="hover:bg-slate-50 transition">
                      <td className="p-3.5 font-mono font-bold text-indigo-600">
                        {order.order_number}
                      </td>
                      <td className="p-3.5">
                        <strong className="text-slate-900 block">{order.customer_name}</strong>
                        <span className="text-[11px] text-slate-500">{order.customer_city}</span>
                      </td>
                      <td className="p-3.5 font-semibold text-slate-700">
                        {order.quality_construction}
                      </td>
                      <td className="p-3.5 font-mono font-bold text-slate-900">
                        {Number(order.total_meters).toLocaleString()} m
                      </td>
                      <td className="p-3.5 font-mono font-bold text-slate-800">
                        ₹ {Number(order.rate_per_meter).toFixed(2)}
                      </td>
                      <td className="p-3.5 font-mono font-black text-emerald-700">
                        {formatRs(order.grand_total || order.total_amount)}
                      </td>
                      <td className="p-3.5 text-slate-600 font-semibold">
                        {order.delivery_date}
                      </td>
                      <td className="p-3.5">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          order.status === 'IN_WEAVING' ? 'bg-indigo-100 text-indigo-800' :
                          order.status === 'READY_TO_DISPATCH' ? 'bg-emerald-100 text-emerald-800' :
                          'bg-amber-100 text-amber-800'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {salesOrders.length === 0 && (
                    <tr>
                      <td colSpan={8} className="p-6 text-center text-slate-400 italic">
                        No sales orders confirmed yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. CRM MIS & ANALYTICS VIEW */}
      {/* ========================================================================= */}
      {activeTab === 'mis' && misData && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-indigo-600" />
              CRM Pipeline Analytics & Executive Performance
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Conversion rate MIS, drop reason analysis, and pipeline valuation overview.
            </p>
          </div>

          {/* Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-2">
              <span className="text-xs font-bold text-slate-500 uppercase">Active Pipeline Valuation</span>
              <div className="text-2xl font-black text-slate-900 font-mono">
                {formatRs(misData.active_pipeline_valuation)}
              </div>
              <span className="text-[11px] text-indigo-600 font-bold block">In-flight RFQs</span>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-2">
              <span className="text-xs font-bold text-slate-500 uppercase">Won Contract Value</span>
              <div className="text-2xl font-black text-emerald-600 font-mono">
                {formatRs(misData.won_contract_valuation)}
              </div>
              <span className="text-[11px] text-emerald-700 font-bold block">Converted to Sales Orders</span>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-2">
              <span className="text-xs font-bold text-slate-500 uppercase">Total Inquiries</span>
              <div className="text-2xl font-black text-indigo-600 font-mono">
                {misData.total_inquiries}
              </div>
              <span className="text-[11px] text-slate-500 block">{misData.won_inquiries} Won / {misData.lost_inquiries} Lost</span>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-2">
              <span className="text-xs font-bold text-slate-500 uppercase">Win Conversion Rate</span>
              <div className="text-2xl font-black text-purple-600 font-mono">
                {misData.conversion_rate_percent}%
              </div>
              <span className="text-[11px] text-purple-700 font-bold block">Industry benchmark: 65%</span>
            </div>
          </div>

          {/* Root-cause drop breakdown */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              Lost Inquiry Root Cause Breakdown
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {misData.drop_reasons_breakdown.map((drop, idx) => (
                <div key={idx} className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex justify-between items-center">
                  <span className="text-xs font-semibold text-slate-800">{drop.reason}</span>
                  <span className="text-xs font-mono font-bold px-2 py-1 bg-rose-50 text-rose-700 rounded-lg">
                    {drop.count} Deals
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: INQUIRY CAPTURE FORM */}
      {/* ========================================================================= */}
      <InquiryForm
        isOpen={showInquiryModal}
        initialLead={selectedLeadForInquiry}
        onClose={() => {
          setShowInquiryModal(false);
          setSelectedLeadForInquiry(null);
        }}
        onSuccess={() => {
          loadCRMData();
          setActiveTab('inquiries');
        }}
      />

      {/* ========================================================================= */}
      {/* MODAL: QUICK ADD LEAD */}
      {/* ========================================================================= */}
      {showAddLeadModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="bg-indigo-600 px-6 py-4 text-white flex justify-between items-center">
              <h3 className="text-base font-bold flex items-center gap-2">
                <UserPlus className="w-5 h-5" /> Add Sourcing Lead
              </h3>
              <button onClick={() => setShowAddLeadModal(false)} className="text-white/80 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateLead} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Lead Title / Subject *</label>
                <input
                  type="text"
                  required
                  value={newLead.lead_title}
                  onChange={e => setNewLead({ ...newLead, lead_title: e.target.value })}
                  placeholder="e.g. Summer Poplin 50,000m Inquiry"
                  className="w-full h-10 px-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                />
              </div>

              <MasterAutoSuggestInput
                masterType="clients"
                category="FABRIC_BUYER"
                label="Buyer / Party Master"
                value={newLead.party_name}
                required={true}
                placeholder="Search Client Master or register new..."
                onChange={text => setNewLead(prev => ({ ...prev, party_name: text }))}
                onSelect={client => {
                  setNewLead(prev => ({
                    ...prev,
                    client_master_id: client.id,
                    party_name: client.party_name,
                    contact_person: client.contact_person || prev.contact_person,
                    phone: client.phone || prev.phone,
                    city: client.city || prev.city
                  }));
                }}
              />

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Contact Person</label>
                  <input
                    type="text"
                    value={newLead.contact_person}
                    onChange={e => setNewLead({ ...newLead, contact_person: e.target.value })}
                    className="w-full h-10 px-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Phone</label>
                  <input
                    type="text"
                    maxLength={10}
                    value={newLead.phone}
                    onChange={e => setNewLead({ ...newLead, phone: e.target.value.replace(/\D/g, '') })}
                    className="w-full h-10 px-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Source</label>
                  <select
                    value={newLead.source}
                    onChange={e => setNewLead({ ...newLead, source: e.target.value })}
                    className="w-full h-10 px-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold"
                  >
                    <option value="DIRECT_CALL">Direct Phone Call</option>
                    <option value="BROKER_AGENCY">Textile Broker Agency</option>
                    <option value="TEXTILE_EXHIBITION">Exhibition / Gartex</option>
                    <option value="WHATSAPP_INQUIRY">WhatsApp Inquiry</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Est. Meters</label>
                  <input
                    type="number"
                    value={newLead.estimated_meters}
                    onChange={e => setNewLead({ ...newLead, estimated_meters: parseFloat(e.target.value) || 0 })}
                    className="w-full h-10 px-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddLeadModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer"
                >
                  Save Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD FORECAST PERIOD */}
      {/* ========================================================================= */}
      {showAddForecastModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="bg-indigo-600 px-6 py-4 text-white flex justify-between items-center">
              <h3 className="text-base font-bold flex items-center gap-2">
                <TrendingUp className="w-5 h-5" /> Add Weaving Forecast Period
              </h3>
              <button onClick={() => setShowAddForecastModal(false)} className="text-white/80 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateForecast} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Forecast Period (Month/Year) *</label>
                <input
                  type="text"
                  required
                  value={newForecast.forecast_period}
                  onChange={e => setNewForecast({ ...newForecast, forecast_period: e.target.value })}
                  placeholder="e.g. July 2026 / Q2 2026"
                  className="w-full h-10 px-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Target Weaving Meters *</label>
                <input
                  type="number"
                  required
                  value={newForecast.target_meters}
                  onChange={e => setNewForecast({ ...newForecast, target_meters: parseFloat(e.target.value) || 0 })}
                  className="w-full h-10 px-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Projected Revenue (₹)</label>
                <input
                  type="number"
                  value={newForecast.projected_revenue}
                  onChange={e => setNewForecast({ ...newForecast, projected_revenue: parseFloat(e.target.value) || 0 })}
                  className="w-full h-10 px-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Notes</label>
                <textarea
                  rows={2}
                  value={newForecast.notes}
                  onChange={e => setNewForecast({ ...newForecast, notes: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddForecastModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer"
                >
                  Save Forecast
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
