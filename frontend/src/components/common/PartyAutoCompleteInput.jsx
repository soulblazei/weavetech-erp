import React, { useState, useEffect, useRef } from 'react';
import { Search, Plus, Building2, MapPin, Phone, ShieldCheck, Check, X, Loader2 } from 'lucide-react';
import { mastersApi, apiClient } from '../../api/client';

export default function PartyAutoCompleteInput({
  label = "Party / Customer Name",
  value = "",
  onChange,
  onSelectParty,
  partyType = "FABRIC_BUYER",
  placeholder = "Type party name or initials (e.g. Vardhman)...",
  required = false
}) {
  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  
  // Quick Add Modal Form State
  const [newParty, setNewParty] = useState({
    party_name: '',
    party_type: partyType,
    contact_person: '',
    phone: '',
    email: '',
    city: '',
    state: '',
    gstin: '',
    payment_terms: '30 Days Credit',
    credit_limit: 1000000
  });
  const [addLoading, setAddLoading] = useState(false);

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
      // Fetch via API with fallback to mock
      apiClient.get(`/masters/clients/suggest?query=${encodeURIComponent(text)}&party_type=${partyType || ''}`)
        .then(res => {
          setSuggestions(res.data || []);
          setIsOpen(true);
        })
        .catch(() => {
          const res = mastersApi.suggestClients(text, partyType);
          setSuggestions(res);
          setIsOpen(true);
        })
        .finally(() => setIsLoading(false));
    } else {
      setSuggestions([]);
      setIsOpen(false);
    }
  };

  const handleSelect = (party) => {
    setQuery(party.party_name);
    if (onChange) onChange(party.party_name);
    if (onSelectParty) onSelectParty(party);
    setIsOpen(false);
  };

  const handleQuickAddSubmit = async (e) => {
    e.preventDefault();
    if (!newParty.party_name) return;
    setAddLoading(true);

    try {
      let created = null;
      try {
        const res = await apiClient.post('/masters/clients', newParty);
        created = res.data;
      } catch (err) {
        created = mastersApi.createClient(newParty);
      }

      setShowQuickAdd(false);
      handleSelect(created);
      setNewParty({
        party_name: '',
        party_type: partyType,
        contact_person: '',
        phone: '',
        email: '',
        city: '',
        state: '',
        gstin: '',
        payment_terms: '30 Days Credit',
        credit_limit: 1000000
      });
    } catch (err) {
      alert("Could not create party. Please check if name already exists.");
    } finally {
      setAddLoading(false);
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
          onClick={() => {
            setNewParty(p => ({ ...p, party_name: query, party_type: partyType }));
            setShowQuickAdd(true);
          }}
          className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
        >
          <Plus className="w-3.5 h-3.5" /> Quick Add Master
        </button>
      </div>

      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => {
            if (query.trim().length > 0) {
              const res = mastersApi.suggestClients(query, partyType);
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
          {suggestions.map((party) => (
            <div
              key={party.id}
              onClick={() => handleSelect(party)}
              className="p-3 hover:bg-indigo-50/70 cursor-pointer transition flex items-center justify-between"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-slate-900">{party.party_name}</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 uppercase">
                    {party.party_type.replace('_', ' ')}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                  {party.city && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" /> {party.city}
                    </span>
                  )}
                  {party.contact_person && (
                    <span>• Contact: <strong className="text-slate-700">{party.contact_person}</strong></span>
                  )}
                  {party.gstin && (
                    <span className="font-mono text-[11px] text-slate-600">GST: {party.gstin}</span>
                  )}
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
                  {party.payment_terms || 'Standard Terms'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quick Add Modal */}
      {showQuickAdd && (
        <div className="fixed inset-0 z-[100] bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-900">Add New Master Client / Party</h3>
              </div>
              <button 
                type="button"
                onClick={() => setShowQuickAdd(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleQuickAddSubmit} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="text-xs font-bold text-slate-700 block mb-1">Company / Party Name *</label>
                  <input
                    type="text"
                    required
                    value={newParty.party_name}
                    onChange={e => setNewParty({ ...newParty, party_name: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600"
                    placeholder="e.g. Vardhman Textiles Ltd"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Party Category</label>
                  <select
                    value={newParty.party_type}
                    onChange={e => setNewParty({ ...newParty, party_type: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600"
                  >
                    <option value="FABRIC_BUYER">Fabric Buyer</option>
                    <option value="YARN_SUPPLIER">Yarn Supplier</option>
                    <option value="JOB_WORKER">Job Worker / Sizing</option>
                    <option value="BROKER">Textile Broker</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Contact Person</label>
                  <input
                    type="text"
                    value={newParty.contact_person}
                    onChange={e => setNewParty({ ...newParty, contact_person: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900"
                    placeholder="Key Person"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={newParty.phone}
                    onChange={e => setNewParty({ ...newParty, phone: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900"
                    placeholder="10-digit Mobile"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">City / Region</label>
                  <input
                    type="text"
                    value={newParty.city}
                    onChange={e => setNewParty({ ...newParty, city: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900"
                    placeholder="e.g. Surat, Ludhiana"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">GSTIN Number</label>
                  <input
                    type="text"
                    value={newParty.gstin}
                    onChange={e => setNewParty({ ...newParty, gstin: e.target.value.toUpperCase() })}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 font-mono"
                    placeholder="24AAACV1234A1Z5"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Default Payment Terms</label>
                  <select
                    value={newParty.payment_terms}
                    onChange={e => setNewParty({ ...newParty, payment_terms: e.target.value })}
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

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowQuickAdd(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 text-sm font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addLoading}
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold flex items-center gap-2"
                >
                  {addLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  Save & Select
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
