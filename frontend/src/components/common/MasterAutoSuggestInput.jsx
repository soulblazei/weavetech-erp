import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Plus, 
  Building2, 
  User, 
  Package, 
  MapPin, 
  Check, 
  X, 
  AlertTriangle, 
  ShieldCheck, 
  Phone, 
  Mail, 
  CreditCard, 
  Sparkles,
  Loader2
} from 'lucide-react';
import { mastersApi, apiClient } from '../../api/client';

export default function MasterAutoSuggestInput({
  masterType = "clients", // "clients" | "employees" | "items"
  label = "Select Party / Master Record",
  value = "",
  onChange,
  onSelect,
  category = null,
  placeholder = "Type name, code, phone or city to search...",
  required = false,
  helperText = null,
  disabled = false,
  allowQuickAdd = true,
}) {
  const [query, setQuery] = useState(value || '');
  const [suggestions, setSuggestions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showQuickAddModal, setShowQuickAddModal] = useState(false);
  const [isSubmittingQuickAdd, setIsSubmittingQuickAdd] = useState(false);

  // Quick Add Form Data for Client
  const [clientForm, setClientForm] = useState({
    party_name: '',
    party_type: category || 'FABRIC_BUYER',
    contact_person: '',
    phone: '',
    email: '',
    city: 'Surat',
    state: 'Gujarat',
    gstin: '',
    payment_terms: '30 Days Credit',
    credit_limit: 1000000
  });

  // Quick Add Form Data for Item
  const [itemForm, setItemForm] = useState({
    item_code: '',
    item_name: '',
    item_category: category || 'GREY_FABRIC',
    hsn_code: '5208',
    unit_of_measure: 'MTR',
    standard_cost: 45.0,
    gst_rate_percent: 5.0,
    warp_count: '40s Combed',
    weft_count: '40s Carded',
    epi: 132,
    ppi: 72,
    width_inches: 58.0,
    gsm: 120.0
  });

  const containerRef = useRef(null);

  // Sync external value
  useEffect(() => {
    setQuery(value || '');
    if (!value) {
      setIsVerified(false);
      setSelectedRecord(null);
    }
  }, [value]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch suggestions
  const fetchSuggestions = async (searchVal) => {
    if (!searchVal || searchVal.trim().length === 0) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }
    setIsLoading(true);
    try {
      const res = await apiClient.get(`/masters/suggest?type=${masterType}&query=${encodeURIComponent(searchVal)}&category=${category || ''}`);
      const data = res.data || [];
      setSuggestions(data);
      setIsOpen(true);
      
      // Check if current search matches any existing record exactly
      const exact = data.find(d => {
        const name = (d.party_name || d.full_name || d.item_name || '').toLowerCase();
        const code = (d.party_code || d.employee_code || d.item_code || '').toLowerCase();
        return name === searchVal.toLowerCase() || code === searchVal.toLowerCase();
      });
      if (exact) {
        setIsVerified(true);
        setSelectedRecord(exact);
      }
    } catch (err) {
      // Fallback to local mock database
      const fallbackData = mastersApi.suggest(masterType, searchVal, category);
      setSuggestions(fallbackData);
      setIsOpen(true);
      const exact = fallbackData.find(d => {
        const name = (d.party_name || d.full_name || d.item_name || '').toLowerCase();
        const code = (d.party_code || d.employee_code || d.item_code || '').toLowerCase();
        return name === searchVal.toLowerCase() || code === searchVal.toLowerCase();
      });
      if (exact) {
        setIsVerified(true);
        setSelectedRecord(exact);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const text = e.target.value;
    setQuery(text);
    setIsVerified(false);
    setSelectedRecord(null);
    if (onChange) onChange(text);
    fetchSuggestions(text);
  };

  const handleSelect = (record) => {
    const displayVal = record.party_name || record.full_name || record.item_name || '';
    setQuery(displayVal);
    setIsVerified(true);
    setSelectedRecord(record);
    if (onChange) onChange(displayVal);
    if (onSelect) onSelect(record);
    setIsOpen(false);
  };

  const openQuickAdd = () => {
    if (masterType === 'clients') {
      setClientForm(prev => ({
        ...prev,
        party_name: query || prev.party_name,
        party_type: category || prev.party_type
      }));
    } else if (masterType === 'items') {
      setItemForm(prev => ({
        ...prev,
        item_name: query || prev.item_name,
        item_category: category || prev.item_category
      }));
    }
    setShowQuickAddModal(true);
    setIsOpen(false);
  };

  const handleQuickAddClient = async (e) => {
    e.preventDefault();
    if (!clientForm.party_name.trim()) return;
    setIsSubmittingQuickAdd(true);
    try {
      let created = null;
      try {
        const res = await apiClient.post('/masters/quick-create', {
          master_type: 'clients',
          ...clientForm
        });
        created = res.data;
      } catch (err) {
        created = mastersApi.quickCreate({
          master_type: 'clients',
          ...clientForm
        });
      }
      setShowQuickAddModal(false);
      handleSelect(created);
    } catch (err) {
      alert("Error adding client to master directory: " + (err.message || 'Unknown error'));
    } finally {
      setIsSubmittingQuickAdd(false);
    }
  };

  const handleQuickAddItem = async (e) => {
    e.preventDefault();
    if (!itemForm.item_name.trim()) return;
    setIsSubmittingQuickAdd(true);
    try {
      let created = null;
      try {
        const res = await apiClient.post('/masters/quick-create', {
          master_type: 'items',
          ...itemForm
        });
        created = res.data;
      } catch (err) {
        created = mastersApi.quickCreate({
          master_type: 'items',
          ...itemForm
        });
      }
      setShowQuickAddModal(false);
      handleSelect(created);
    } catch (err) {
      alert("Error adding item to master directory: " + (err.message || 'Unknown error'));
    } finally {
      setIsSubmittingQuickAdd(false);
    }
  };

  const getRecordIcon = () => {
    if (masterType === 'clients') return <Building2 className="w-4 h-4 text-indigo-600" />;
    if (masterType === 'employees') return <User className="w-4 h-4 text-emerald-600" />;
    return <Package className="w-4 h-4 text-amber-600" />;
  };

  const getMasterTypeName = () => {
    if (masterType === 'clients') return 'Client / Buyer Master';
    if (masterType === 'employees') return 'Employee Master';
    return 'Fabric / Item Master';
  };

  return (
    <div className="relative space-y-1.5 w-full" ref={containerRef}>
      {/* Label & Status Badge */}
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
          {getRecordIcon()}
          <span>{label}</span>
          {required && <span className="text-rose-500 font-bold">*</span>}
        </label>
        {isVerified && selectedRecord && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <ShieldCheck className="w-3 h-3 text-emerald-600" />
            Verified Master: {selectedRecord.party_code || selectedRecord.employee_code || selectedRecord.item_code}
          </span>
        )}
      </div>

      {/* Main Input Box */}
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => {
            if (query.trim().length > 0) {
              fetchSuggestions(query);
            }
          }}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full h-11 px-3.5 pr-10 text-xs font-semibold rounded-xl border transition-all shadow-xs outline-none ${
            isVerified
              ? 'border-emerald-500 bg-emerald-50/20 text-slate-900 focus:ring-2 focus:ring-emerald-200'
              : query.trim().length > 0
              ? 'border-amber-400 bg-amber-50/20 text-slate-900 focus:ring-2 focus:ring-amber-200'
              : 'border-slate-300 bg-white text-slate-900 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100'
          }`}
        />

        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
          {isLoading ? (
            <Loader2 className="w-4 h-4 text-slate-400 animate-spin" />
          ) : isVerified ? (
            <Check className="w-4 h-4 text-emerald-600 font-bold" />
          ) : (
            <Search className="w-4 h-4 text-slate-400" />
          )}
        </div>
      </div>

      {/* Strict Master Verification Interlock Warning Banner */}
      {!isVerified && query.trim().length > 0 && !isOpen && (
        <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 text-xs text-amber-900 shadow-xs animate-in fade-in duration-150">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Unregistered Record:</strong> "{query}" is not found in {getMasterTypeName()}. Company ERP policy mandates linking to a Master Record.
            </span>
          </div>
          {allowQuickAdd && (
            <button
              type="button"
              onClick={openQuickAdd}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-xs shadow-xs transition cursor-pointer shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              Register to Master Now
            </button>
          )}
        </div>
      )}

      {/* Helper text if needed */}
      {helperText && <p className="text-[11px] text-slate-500">{helperText}</p>}

      {/* Auto-suggest Dropdown */}
      {isOpen && (
        <div className="absolute z-50 left-0 right-0 top-full mt-1 bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden max-h-72 overflow-y-auto divide-y divide-slate-100">
          {suggestions.length > 0 ? (
            <div>
              <div className="px-3 py-1.5 bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider flex justify-between items-center">
                <span>Matching Master Records ({suggestions.length})</span>
                <span className="text-indigo-600 font-semibold">Click to select & autofill</span>
              </div>
              {suggestions.map((item, idx) => (
                <button
                  key={item.id || idx}
                  type="button"
                  onClick={() => handleSelect(item)}
                  className="w-full text-left px-3.5 py-2.5 hover:bg-indigo-50/80 transition flex items-center justify-between gap-3 group cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="p-1.5 rounded-lg bg-slate-100 group-hover:bg-indigo-100 group-hover:text-indigo-700 text-slate-600 transition">
                      {getRecordIcon()}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-900 truncate group-hover:text-indigo-900">
                        {item.party_name || item.full_name || item.item_name}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-600">
                          {item.party_code || item.employee_code || item.item_code}
                        </span>
                        {item.city && <span>• {item.city}</span>}
                        {item.phone && <span>• 📞 {item.phone}</span>}
                        {item.designation && <span>• {item.designation}</span>}
                        {item.warp_count && item.weft_count && <span>• {item.warp_count} x {item.weft_count}</span>}
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 group-hover:bg-indigo-200 group-hover:text-indigo-900">
                      Select ↵
                    </span>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center space-y-2">
              <p className="text-xs font-medium text-slate-600">
                No existing master record matches <strong className="text-slate-900">"{query}"</strong>
              </p>
              {allowQuickAdd && (
                <button
                  type="button"
                  onClick={openQuickAdd}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow-xs transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  + Add "{query}" to Master Directory
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* QUICK ADD MODAL (Client Master) */}
      {/* ========================================================================= */}
      {showQuickAddModal && masterType === 'clients' && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="bg-indigo-600 px-6 py-4 text-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-indigo-200" />
                <h3 className="text-base font-bold">Quick Register Client Master</h3>
              </div>
              <button 
                type="button"
                onClick={() => setShowQuickAddModal(false)}
                className="text-white/80 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleQuickAddClient} className="p-6 space-y-4">
              <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-3 text-xs text-indigo-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>Quick registration adds this record to the enterprise database and attaches it directly to your form.</span>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Company / Party Name *</label>
                <input
                  type="text"
                  required
                  value={clientForm.party_name}
                  onChange={e => setClientForm({ ...clientForm, party_name: e.target.value })}
                  placeholder="e.g., Arvind Mills Ltd"
                  className="w-full h-10 px-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Party Type *</label>
                  <select
                    value={clientForm.party_type}
                    onChange={e => setClientForm({ ...clientForm, party_type: e.target.value })}
                    className="w-full h-10 px-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900"
                  >
                    <option value="FABRIC_BUYER">Fabric Buyer</option>
                    <option value="YARN_SUPPLIER">Yarn Supplier</option>
                    <option value="JOB_WORKER">Job Worker / Sizing</option>
                    <option value="BROKER">Broker / Agency</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">City *</label>
                  <input
                    type="text"
                    required
                    value={clientForm.city}
                    onChange={e => setClientForm({ ...clientForm, city: e.target.value })}
                    placeholder="e.g., Surat"
                    className="w-full h-10 px-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Contact Person</label>
                  <input
                    type="text"
                    value={clientForm.contact_person}
                    onChange={e => setClientForm({ ...clientForm, contact_person: e.target.value })}
                    placeholder="e.g., Ramesh Shah"
                    className="w-full h-10 px-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Mobile / Phone</label>
                  <input
                    type="text"
                    maxLength={10}
                    value={clientForm.phone}
                    onChange={e => setClientForm({ ...clientForm, phone: e.target.value.replace(/\D/g, '') })}
                    placeholder="10-digit mobile"
                    className="w-full h-10 px-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">GSTIN (15 Chars)</label>
                  <input
                    type="text"
                    maxLength={15}
                    value={clientForm.gstin}
                    onChange={e => setClientForm({ ...clientForm, gstin: e.target.value.toUpperCase() })}
                    placeholder="24AAAAA0000A1Z5"
                    className="w-full h-10 px-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Payment Terms</label>
                  <select
                    value={clientForm.payment_terms}
                    onChange={e => setClientForm({ ...clientForm, payment_terms: e.target.value })}
                    className="w-full h-10 px-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900"
                  >
                    <option value="Against Delivery / COD">Against Delivery / COD</option>
                    <option value="15 Days Credit">15 Days Credit</option>
                    <option value="30 Days Credit">30 Days Credit</option>
                    <option value="45 Days Credit">45 Days Credit</option>
                    <option value="60 Days Credit">60 Days Credit</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowQuickAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingQuickAdd}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingQuickAdd && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Save & Inject to Form
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* QUICK ADD MODAL (Item Master) */}
      {/* ========================================================================= */}
      {showQuickAddModal && masterType === 'items' && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="bg-amber-600 px-6 py-4 text-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-amber-200" />
                <h3 className="text-base font-bold">Quick Register Fabric / Item Master</h3>
              </div>
              <button 
                type="button"
                onClick={() => setShowQuickAddModal(false)}
                className="text-white/80 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleQuickAddItem} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Item / Quality Name *</label>
                <input
                  type="text"
                  required
                  value={itemForm.item_name}
                  onChange={e => setItemForm({ ...itemForm, item_name: e.target.value })}
                  placeholder="e.g., Grey Fabric Poplin 60x60 / 92x88"
                  className="w-full h-10 px-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Category *</label>
                  <select
                    value={itemForm.item_category}
                    onChange={e => setItemForm({ ...itemForm, item_category: e.target.value })}
                    className="w-full h-10 px-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900"
                  >
                    <option value="GREY_FABRIC">Grey Fabric</option>
                    <option value="RAW_YARN">Raw Yarn</option>
                    <option value="SIZING_MATERIAL">Sizing Chemical</option>
                    <option value="LOOM_SPARE">Loom Spare</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">HSN Code</label>
                  <input
                    type="text"
                    value={itemForm.hsn_code}
                    onChange={e => setItemForm({ ...itemForm, hsn_code: e.target.value })}
                    placeholder="5208"
                    className="w-full h-10 px-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 font-mono"
                  />
                </div>
              </div>

              {itemForm.item_category === 'GREY_FABRIC' && (
                <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-xl space-y-3">
                  <span className="text-[11px] font-bold text-amber-900 block">Fabric Technical Construction</span>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-bold text-slate-600 block">Warp Count</label>
                      <input
                        type="text"
                        value={itemForm.warp_count}
                        onChange={e => setItemForm({ ...itemForm, warp_count: e.target.value })}
                        placeholder="60s Combed"
                        className="w-full h-8 px-2 bg-white border border-slate-300 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-600 block">Weft Count</label>
                      <input
                        type="text"
                        value={itemForm.weft_count}
                        onChange={e => setItemForm({ ...itemForm, weft_count: e.target.value })}
                        placeholder="60s Combed"
                        className="w-full h-8 px-2 bg-white border border-slate-300 rounded-lg text-xs"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    <div>
                      <label className="text-[10px] font-bold text-slate-600 block">EPI (Reed)</label>
                      <input
                        type="number"
                        value={itemForm.epi}
                        onChange={e => setItemForm({ ...itemForm, epi: parseInt(e.target.value) || 0 })}
                        className="w-full h-8 px-2 bg-white border border-slate-300 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-600 block">PPI (Pick)</label>
                      <input
                        type="number"
                        value={itemForm.ppi}
                        onChange={e => setItemForm({ ...itemForm, ppi: parseInt(e.target.value) || 0 })}
                        className="w-full h-8 px-2 bg-white border border-slate-300 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-600 block">Width (in)</label>
                      <input
                        type="number"
                        value={itemForm.width_inches}
                        onChange={e => setItemForm({ ...itemForm, width_inches: parseFloat(e.target.value) || 0 })}
                        className="w-full h-8 px-2 bg-white border border-slate-300 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-600 block">GSM</label>
                      <input
                        type="number"
                        value={itemForm.gsm}
                        onChange={e => setItemForm({ ...itemForm, gsm: parseFloat(e.target.value) || 0 })}
                        className="w-full h-8 px-2 bg-white border border-slate-300 rounded-lg text-xs"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Standard Cost (₹ / Unit)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={itemForm.standard_cost}
                    onChange={e => setItemForm({ ...itemForm, standard_cost: parseFloat(e.target.value) || 0 })}
                    className="w-full h-10 px-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">GST Rate (%)</label>
                  <input
                    type="number"
                    value={itemForm.gst_rate_percent}
                    onChange={e => setItemForm({ ...itemForm, gst_rate_percent: parseFloat(e.target.value) || 5 })}
                    className="w-full h-10 px-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowQuickAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingQuickAdd}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingQuickAdd && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Save Item & Attach
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
