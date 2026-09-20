import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Package, 
  User, 
  Phone, 
  Calendar, 
  DollarSign, 
  IndianRupee, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  Layers, 
  X, 
  FileText, 
  Clock, 
  Loader2,
  Check
} from 'lucide-react';
import MasterAutoSuggestInput from '../common/MasterAutoSuggestInput';
import { apiClient, mockCRMApi, mastersApi } from '../../api/client';

export default function InquiryForm({ isOpen, onClose, onSuccess, initialLead = null }) {
  const [formData, setFormData] = useState({
    client_master_id: null,
    party_name: '',
    contact_person: '',
    phone: '',
    city: '',
    item_master_id: null,
    quality_construction: 'Grey Fabric Poplin 60x60 / 92x88',
    warp_count: '60s Combed',
    weft_count: '60s Combed',
    epi: 92,
    ppi: 88,
    width_inches: 58.0,
    gsm: 110.0,
    weave_type: 'Plain 1/1',
    required_meters: 50000,
    target_rate_per_meter: 42.50,
    tax_percent: 5.0,
    delivery_target_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    assigned_to_emp_id: 6,
    stage: 'INQUIRY_RECEIVED',
    priority: 'HIGH',
    remarks: 'Required for garment export order. Standard selvedge.'
  });

  const [salesTeam, setSalesTeam] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isClientVerified, setIsClientVerified] = useState(false);
  const [isItemVerified, setIsItemVerified] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Load sales team
  useEffect(() => {
    try {
      apiClient.get('/crm/sales-team')
        .then(res => setSalesTeam(res.data || []))
        .catch(() => {
          const team = mockCRMApi.getSalesTeam();
          setSalesTeam(team);
        });
    } catch (e) {
      setSalesTeam(mockCRMApi.getSalesTeam());
    }
  }, []);

  // Pre-fill from lead if provided
  useEffect(() => {
    if (initialLead) {
      setFormData(prev => ({
        ...prev,
        client_master_id: initialLead.client_master_id || null,
        party_name: initialLead.party_name || '',
        contact_person: initialLead.contact_person || '',
        phone: initialLead.phone || '',
        city: initialLead.city || '',
        required_meters: initialLead.estimated_meters || 50000,
        remarks: initialLead.notes || prev.remarks
      }));
      if (initialLead.party_name) {
        setIsClientVerified(true);
      }
    }
  }, [initialLead]);

  // Handle Client Auto-Select
  const handleClientSelect = (client) => {
    setFormData(prev => ({
      ...prev,
      client_master_id: client.id,
      party_name: client.party_name,
      contact_person: client.contact_person || prev.contact_person,
      phone: client.phone || prev.phone,
      city: client.city || prev.city
    }));
    setIsClientVerified(true);
  };

  // Handle Fabric Item Auto-Select
  const handleItemSelect = (item) => {
    setFormData(prev => ({
      ...prev,
      item_master_id: item.id,
      quality_construction: item.item_name,
      warp_count: item.warp_count || prev.warp_count,
      weft_count: item.weft_count || prev.weft_count,
      epi: item.epi || prev.epi,
      ppi: item.ppi || prev.ppi,
      width_inches: item.width_inches || prev.width_inches,
      gsm: item.gsm || prev.gsm,
      target_rate_per_meter: item.standard_cost ? item.standard_cost : prev.target_rate_per_meter
    }));
    setIsItemVerified(true);
  };

  // Live calculations
  const rawValue = (Number(formData.required_meters) || 0) * (Number(formData.target_rate_per_meter) || 0);
  const gstAmount = rawValue * ((Number(formData.tax_percent) || 5) / 100);
  const grandTotal = rawValue + gstAmount;

  const formatCurrency = (num) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(num);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!formData.party_name.trim()) {
      setErrorMessage('Please select or register a valid Client/Buyer.');
      return;
    }

    if (!formData.quality_construction.trim()) {
      setErrorMessage('Please enter or select fabric quality construction.');
      return;
    }

    if (formData.required_meters <= 0) {
      setErrorMessage('Required meters must be greater than 0.');
      return;
    }

    if (formData.target_rate_per_meter <= 0) {
      setErrorMessage('Target rate must be greater than 0.');
      return;
    }

    setIsSubmitting(true);
    try {
      let created = null;
      try {
        const res = await apiClient.post('/crm/inquiries', formData);
        created = res.data;
      } catch (err) {
        created = mockCRMApi.createInquiry(formData);
      }

      if (onSuccess) onSuccess(created);
      if (onClose) onClose();
    } catch (err) {
      setErrorMessage('Failed to save inquiry: ' + (err.message || 'Unknown error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-4xl w-full my-auto overflow-hidden animate-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-indigo-800 px-6 py-5 text-white flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 rounded-2xl backdrop-blur-md">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight">Log Technical Fabric Inquiry / RFQ</h2>
              <p className="text-xs text-indigo-100 font-medium">
                Direct integration with Master Directory & automatic commercial cost calculation
              </p>
            </div>
          </div>
          <button 
            type="button" 
            onClick={onClose}
            className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mx-6 mt-4 p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs font-semibold text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          
          {/* SECTION 1: Master Client Selection */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4.5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Building2 className="w-4 h-4 text-indigo-600" />
                1. Buyer / Party Master Verification
              </span>
              <span className="text-[11px] font-semibold text-slate-500">
                Mandatory Master Linkage
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <MasterAutoSuggestInput
                masterType="clients"
                category="FABRIC_BUYER"
                label="Fabric Buyer / Customer"
                value={formData.party_name}
                required={true}
                placeholder="Search Buyer name, code, phone or GSTIN..."
                onChange={(text) => {
                  setFormData(prev => ({ ...prev, party_name: text }));
                }}
                onSelect={handleClientSelect}
              />

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Contact Person</label>
                  <input
                    type="text"
                    value={formData.contact_person}
                    onChange={e => setFormData({ ...formData, contact_person: e.target.value })}
                    placeholder="e.g. Ramesh Shah"
                    className="w-full h-11 px-3.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-indigo-100"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">City / Region</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={e => setFormData({ ...formData, city: e.target.value })}
                    placeholder="e.g. Surat"
                    className="w-full h-11 px-3.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-indigo-100"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 flex items-center justify-between mb-1">
                  <span>10-Digit Mobile / WhatsApp</span>
                  {formData.phone.length === 10 && (
                    <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                      <Check className="w-3 h-3" /> Valid Number
                    </span>
                  )}
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    maxLength={10}
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                    placeholder="9876543210"
                    className="w-full h-11 pl-10 pr-3 bg-white border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 focus:ring-2 focus:ring-indigo-100"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Assigned Sales Executive</label>
                <select
                  value={formData.assigned_to_emp_id}
                  onChange={e => setFormData({ ...formData, assigned_to_emp_id: parseInt(e.target.value) })}
                  className="w-full h-11 px-3.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-indigo-100"
                >
                  {salesTeam.map(emp => (
                    <option key={emp.id} value={emp.id}>
                      {emp.full_name} ({emp.designation || 'Sales'}) • {emp.territory || 'Surat'}
                    </option>
                  ))}
                  {salesTeam.length === 0 && (
                    <option value={6}>Rajesh Patel (Sales Officer)</option>
                  )}
                </select>
              </div>
            </div>
          </div>

          {/* SECTION 2: Technical Fabric Construction */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4.5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4 text-amber-600" />
                2. Fabric Quality Specifications (Warp/Weft, Reed/Pick)
              </span>
              <span className="text-[11px] font-semibold text-slate-500">
                Item Master Lookup
              </span>
            </div>

            <MasterAutoSuggestInput
              masterType="items"
              category="GREY_FABRIC"
              label="Select Standard Quality from Item Master"
              value={formData.quality_construction}
              placeholder="Search quality e.g. Poplin 60x60, Cambric, Sheeting..."
              onChange={(text) => setFormData(prev => ({ ...prev, quality_construction: text }))}
              onSelect={handleItemSelect}
            />

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Warp Yarn Count</label>
                <input
                  type="text"
                  value={formData.warp_count}
                  onChange={e => setFormData({ ...formData, warp_count: e.target.value })}
                  placeholder="60s Combed"
                  className="w-full h-10 px-3 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Weft Yarn Count</label>
                <input
                  type="text"
                  value={formData.weft_count}
                  onChange={e => setFormData({ ...formData, weft_count: e.target.value })}
                  placeholder="60s Combed"
                  className="w-full h-10 px-3 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">EPI (Reed Ends/in)</label>
                <input
                  type="number"
                  value={formData.epi}
                  onChange={e => setFormData({ ...formData, epi: parseInt(e.target.value) || 0 })}
                  className="w-full h-10 px-3 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">PPI (Picks/in)</label>
                <input
                  type="number"
                  value={formData.ppi}
                  onChange={e => setFormData({ ...formData, ppi: parseInt(e.target.value) || 0 })}
                  className="w-full h-10 px-3 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Weave Pattern</label>
                <select
                  value={formData.weave_type}
                  onChange={e => setFormData({ ...formData, weave_type: e.target.value })}
                  className="w-full h-10 px-3 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900"
                >
                  <option value="Plain 1/1">Plain 1/1</option>
                  <option value="Twill 2/1">Twill 2/1</option>
                  <option value="Twill 2/2">Twill 2/2</option>
                  <option value="Satin 4/1">Satin 4/1</option>
                  <option value="Dobby Stripe">Dobby Stripe</option>
                  <option value="Oxford">Oxford</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Width (Inches)</label>
                <input
                  type="number"
                  step="0.5"
                  value={formData.width_inches}
                  onChange={e => setFormData({ ...formData, width_inches: parseFloat(e.target.value) || 0 })}
                  className="w-full h-10 px-3 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">GSM (Grams/m²)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.gsm}
                  onChange={e => setFormData({ ...formData, gsm: parseFloat(e.target.value) || 0 })}
                  className="w-full h-10 px-3 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900"
                />
              </div>
            </div>
          </div>

          {/* SECTION 3: Commercial Terms & Pricing Calculation */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4.5 space-y-4">
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <IndianRupee className="w-4 h-4 text-emerald-600" />
              3. Commercial Terms & Quotation Calculator
            </span>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold text-slate-700">Required Quantity (Meters) *</label>
                  <div className="flex gap-1">
                    {[10000, 25000, 50000, 100000].map(amt => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setFormData({ ...formData, required_meters: amt })}
                        className={`text-[10px] px-2 py-0.5 rounded-md font-bold transition cursor-pointer ${
                          formData.required_meters === amt 
                            ? 'bg-indigo-600 text-white' 
                            : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                        }`}
                      >
                        {amt / 1000}k
                      </button>
                    ))}
                  </div>
                </div>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.required_meters}
                  onChange={e => setFormData({ ...formData, required_meters: Math.max(0, parseFloat(e.target.value) || 0) })}
                  className="w-full h-11 px-3.5 bg-white border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Target Rate (₹ / Meter) *</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-xs">₹</span>
                  <input
                    type="number"
                    step="0.10"
                    required
                    min="0.1"
                    value={formData.target_rate_per_meter}
                    onChange={e => setFormData({ ...formData, target_rate_per_meter: Math.max(0, parseFloat(e.target.value) || 0) })}
                    className="w-full h-11 pl-8 pr-3.5 bg-white border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 focus:ring-2 focus:ring-indigo-100"
                  />
                </div>
              </div>
            </div>

            {/* Live Financial Summary Banner */}
            <div className="bg-emerald-50/80 border border-emerald-300 rounded-2xl p-4 grid grid-cols-3 gap-3">
              <div>
                <span className="text-[10px] font-bold text-emerald-800 uppercase block">Raw Fabric Valuation</span>
                <span className="text-sm font-black text-slate-900 font-mono">{formatCurrency(rawValue)}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-emerald-800 uppercase block">GST @ 5%</span>
                <span className="text-sm font-black text-slate-900 font-mono">{formatCurrency(gstAmount)}</span>
              </div>
              <div className="border-l border-emerald-300 pl-3">
                <span className="text-[10px] font-bold text-emerald-900 uppercase block">Total Quotation Value</span>
                <span className="text-base font-black text-emerald-800 font-mono">{formatCurrency(grandTotal)}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Target Delivery Date</label>
                <input
                  type="date"
                  value={formData.delivery_target_date}
                  onChange={e => setFormData({ ...formData, delivery_target_date: e.target.value })}
                  className="w-full h-10 px-3 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Inquiry Stage</label>
                <select
                  value={formData.stage}
                  onChange={e => setFormData({ ...formData, stage: e.target.value })}
                  className="w-full h-10 px-3 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                >
                  <option value="INQUIRY_RECEIVED">Inquiry Received</option>
                  <option value="SAMPLE_SENT">Sample Dispatched</option>
                  <option value="PRICE_QUOTED">Formal Price Quoted</option>
                  <option value="RATE_NEGOTIATION">Rate Negotiation</option>
                  <option value="WON_ORDER_CONVERTED">Won / Ready for Sales Order</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Inquiry Priority</label>
                <select
                  value={formData.priority}
                  onChange={e => setFormData({ ...formData, priority: e.target.value })}
                  className="w-full h-10 px-3 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                >
                  <option value="HIGH">High Priority (Red)</option>
                  <option value="MEDIUM">Medium Priority (Amber)</option>
                  <option value="LOW">Low / Regular</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Remarks & Finishing Requirements</label>
              <textarea
                rows={2}
                value={formData.remarks}
                onChange={e => setFormData({ ...formData, remarks: e.target.value })}
                placeholder="Special specifications e.g., Combed compact yarn only, zero bowing, rolls in plastic wrapping..."
                className="w-full p-3 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-indigo-100"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-7 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md hover:shadow-lg transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving Fabric Inquiry...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Save & Log Inquiry
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
