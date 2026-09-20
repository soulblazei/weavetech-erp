import React, { useState, useEffect, useRef } from 'react';
import { Search, Plus, Building2, User, Package, MapPin, Check, X, Loader2 } from 'lucide-react';
import { mastersApi, apiClient } from '../../api/client';

export default function MasterAutoSuggest({
  masterType = "clients", // "clients" | "employees" | "items"
  label = "Select Record",
  value = "",
  onChange,
  onSelect,
  category = null,
  placeholder = "Type to search...",
  required = false
}) {
  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showQuickAdd, setShowQuickAdd] = useState(false);

  // Quick Add Form Data for each type
  const [clientForm, setClientForm] = useState({
    party_name: '',
    party_type: category || 'FABRIC_BUYER',
    contact_person: '',
    phone: '',
    email: '',
    city: '',
    state: '',
    gstin: '',
    payment_terms: '30 Days Credit',
    credit_limit: 1000000
  });

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

  useEffect(() => {
    setQuery(value || '');
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e) => {
    const text = e.target.value;
    setQuery(text);
    if (onChange) onChange(text);

    if (text.trim().length > 0) {
      setIsLoading(true);
      apiClient.get(`/masters/suggest?type=${masterType}&query=${encodeURIComponent(text)}&category=${category || ''}`)
        .then(res => {
          setSuggestions(res.data || []);
          setIsOpen(true);
        })
        .catch(() => {
          const res = mastersApi.suggest(masterType, text, category);
          setSuggestions(res);
          setIsOpen(true);
        })
        .finally(() => setIsLoading(false));
    } else {
      setSuggestions([]);
      setIsOpen(false);
    }
  };

  const handleSelect = (record) => {
    const displayVal = record.party_name || record.full_name || record.item_name || '';
    setQuery(displayVal);
    if (onChange) onChange(displayVal);
    if (onSelect) onSelect(record);
    setIsOpen(false);
  };

  const handleQuickAddClient = async (e) => {
    e.preventDefault();
    if (!clientForm.party_name) return;
    try {
      let created = null;
      try {
        const res = await apiClient.post('/masters/clients', clientForm);
        created = res.data;
      } catch (err) {
        created = mastersApi.createClient(clientForm);
      }
      setShowQuickAdd(false);
      handleSelect(created);
    } catch (err) {
      alert("Error adding client master");
    }
  };

  const handleQuickAddItem = async (e) => {
    e.preventDefault();
    if (!itemForm.item_name) return;
    try {
      let created = null;
      try {
        const res = await apiClient.post('/masters/items', itemForm);
        created = res.data;
      } catch (err) {
        created = mastersApi.createItem(itemForm);
      }
      setShowQuickAdd(false);
      handleSelect(created);
    } catch (err) {
      alert("Error adding item master");
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      <div className="flex items-center justify-between mb-1">
        <label className="text-xs font-bold text-slate-700">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
        <button
          type="button"
          onClick={() => setShowQuickAdd(true)}
          className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" /> + Quick Add
        </button>
      </div>

      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => {
            if (query.trim().length > 0) {
              const res = mastersApi.suggest(masterType, query, category);
              setSuggestions(res);
              setIsOpen(true);
            }
          }}
          placeholder={placeholder}
          required={required}
          className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600 transition"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin text-indigo-600" /> : <Search className="w-4 h-4" />}
        </div>
      </div>

      {/* Floating Suggestions Dropdown */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute z-50 left-0 right-0 mt-1 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden max-h-64 overflow-y-auto divide-y divide-slate-100">
          {suggestions.map((item) => (
            <div
              key={item.id}
              onClick={() => handleSelect(item)}
              className="p-3 hover:bg-indigo-50/80 cursor-pointer transition flex items-center justify-between"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-slate-900">
                    {item.party_name || item.full_name || item.item_name}
                  </span>
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                    {item.party_code || item.employee_code || item.item_code}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-0.5">
                  {item.city && (
                    <span className="flex items-center gap-0.5"><MapPin className="w-3 h-3 text-slate-400" />{item.city}</span>
                  )}
                  {item.contact_person && <span>• Attn: <strong>{item.contact_person}</strong></span>}
                  {item.designation && <span>• {item.designation} ({item.department})</span>}
                  {item.gstin && <span className="font-mono text-[11px]">GST: {item.gstin}</span>}
                  {item.hsn_code && <span className="font-mono text-[11px]">HSN: {item.hsn_code}</span>}
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-1 rounded">
                  {item.party_type || item.item_category || item.department || 'Selected'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quick Add Client Modal */}
      {showQuickAdd && masterType === 'clients' && (
        <div className="fixed inset-0 z-[100] bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-900">Quick Add Client Master</h3>
              </div>
              <button type="button" onClick={() => setShowQuickAdd(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleQuickAddClient} className="p-5 space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Company / Party Name *</label>
                <input
                  type="text"
                  required
                  value={clientForm.party_name}
                  onChange={e => setClientForm({ ...clientForm, party_name: e.target.value })}
                  placeholder="e.g. Vardhman Textiles"
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
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
                <div>
                  <label className="font-bold text-slate-700 block mb-1">GSTIN Number</label>
                  <input
                    type="text"
                    value={clientForm.gstin}
                    onChange={e => setClientForm({ ...clientForm, gstin: e.target.value.toUpperCase() })}
                    placeholder="24AAACV1234A1Z5"
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 font-mono text-slate-900"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Contact Person</label>
                  <input
                    type="text"
                    value={clientForm.contact_person}
                    onChange={e => setClientForm({ ...clientForm, contact_person: e.target.value })}
                    placeholder="Key Person"
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">City</label>
                  <input
                    type="text"
                    value={clientForm.city}
                    onChange={e => setClientForm({ ...clientForm, city: e.target.value })}
                    placeholder="e.g. Surat"
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowQuickAdd(false)}
                  className="px-3 py-2 rounded-lg border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
                >
                  Save & Autofill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quick Add Item Modal */}
      {showQuickAdd && masterType === 'items' && (
        <div className="fixed inset-0 z-[100] bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-900">Quick Add Item / Fabric Spec</h3>
              </div>
              <button type="button" onClick={() => setShowQuickAdd(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleQuickAddItem} className="p-5 space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Item / Quality Name *</label>
                <input
                  type="text"
                  required
                  value={itemForm.item_name}
                  onChange={e => setItemForm({ ...itemForm, item_name: e.target.value })}
                  placeholder="e.g. Poplin 60x60 / 92x88"
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
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
                  <label className="font-bold text-slate-700 block mb-1">Standard Cost (Rs.)</label>
                  <input
                    type="number"
                    value={itemForm.standard_cost}
                    onChange={e => setItemForm({ ...itemForm, standard_cost: parseFloat(e.target.value) || 0 })}
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
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowQuickAdd(false)}
                  className="px-3 py-2 rounded-lg border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
                >
                  Save & Autofill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
