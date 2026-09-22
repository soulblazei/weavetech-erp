import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Search, 
  CheckCircle2, 
  AlertCircle, 
  PlusCircle, 
  X, 
  Loader2, 
  Building2, 
  Package, 
  Lock,
  Unlock,
  ChevronDown
} from 'lucide-react';

/**
 * QuickAddMasterModal - Inline modal to quickly register a new master entry
 */
export function QuickAddMasterModal({ 
  isOpen, 
  onClose, 
  type = 'client', 
  initialName = '', 
  onSuccess 
}) {
  const [name, setName] = useState(initialName);
  const [code, setCode] = useState('');
  const [gstin, setGstin] = useState('');
  const [itemType, setItemType] = useState('GREY_FABRIC');
  const [unit, setUnit] = useState('MTRS');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setName(initialName);
    if (initialName) {
      const prefix = type === 'client' ? 'CLT' : 'ITM';
      setCode(`${prefix}-${Math.floor(1000 + Math.random() * 9000)}`);
    }
  }, [initialName, type]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Name is mandatory');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const payload = {
        type,
        name: name.trim(),
        code: code.trim() || undefined,
        gstin: gstin.trim() || undefined,
        itemType,
        unit
      };

      const res = await fetch('/api/masters/quick-add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Failed to create master record');
      }

      onSuccess(json.data);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
              {type === 'client' ? <Building2 className="w-5 h-5" /> : <Package className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900">
                Quick Register {type === 'client' ? 'Party / Buyer' : 'Item / Quality'}
              </h3>
              <p className="text-xs text-slate-500">Unlinked value detected. Bind master to continue.</p>
            </div>
          </div>
          <button 
            type="button" 
            onClick={onClose} 
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 text-xs text-red-700 bg-red-50 border border-red-200 rounded-xl">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
              {type === 'client' ? 'Party / Mill Name *' : 'Item Description / Quality *'}
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Reliance Textile Mills Ltd"
              className="w-full min-h-[44px] px-3.5 rounded-xl border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-sm font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                System Code
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full min-h-[44px] px-3.5 rounded-xl border border-slate-300 text-slate-900 bg-slate-50 text-sm font-mono"
              />
            </div>

            {type === 'client' ? (
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  GSTIN (Optional)
                </label>
                <input
                  type="text"
                  maxLength={15}
                  value={gstin}
                  onChange={(e) => setGstin(e.target.value.toUpperCase())}
                  placeholder="24AAAAA0000A1Z5"
                  className="w-full min-h-[44px] px-3.5 rounded-xl border border-slate-300 text-slate-900 uppercase placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-sm font-mono"
                />
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Unit
                </label>
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full min-h-[44px] px-3.5 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-sm font-medium"
                >
                  <option value="MTRS">MTRS (Meters)</option>
                  <option value="KGS">KGS (Kilograms)</option>
                  <option value="BAGS">BAGS (Bags/Cones)</option>
                  <option value="NOS">NOS (Pieces)</option>
                </select>
              </div>
            )}
          </div>

          {type === 'item' && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                Category Type
              </label>
              <select
                value={itemType}
                onChange={(e) => setItemType(e.target.value)}
                className="w-full min-h-[44px] px-3.5 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-sm font-medium"
              >
                <option value="GREY_FABRIC">Grey Fabric Quality</option>
                <option value="YARN">Yarn Count (Warp/Weft)</option>
                <option value="CHEMICAL">Chemical / Sizing Material</option>
                <option value="SPARES">Loom Mechanical Spare</option>
              </select>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !name.trim()}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-medium text-sm rounded-xl shadow-sm transition-all"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Binding...</span>
                </>
              ) : (
                <>
                  <PlusCircle className="w-4 h-4" />
                  <span>Save & Interlock</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/**
 * MasterInterlockCombobox
 * High-speed debounced fuzzy search combobox that enforces strict master binding.
 */
export default function MasterInterlockCombobox({
  type = 'client', // 'client' | 'item'
  label = 'Party / Client Master',
  placeholder = 'Search registered master...',
  value = null, // bound master object: { id, code, name, ... }
  onChange = () => {},
  required = true,
  disabled = false,
  error = null,
  helperText = ''
}) {
  const [queryText, setQueryText] = useState(value?.name || '');
  const [results, setResults] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);

  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const debounceTimerRef = useRef(null);

  // Sync internal input display if external value changes
  useEffect(() => {
    if (value && value.name) {
      setQueryText(value.name);
    } else if (!value) {
      setQueryText('');
    }
  }, [value]);

  // Debounced search query against backend API
  const fetchMasters = useCallback(async (searchStr) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        type,
        q: searchStr.trim(),
        limit: '10'
      });

      const res = await fetch(`/api/masters/search?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        setResults(json.data || []);
      } else {
        setResults([]);
      }
    } catch (err) {
      console.error('Error fetching master records:', err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [type]);

  const handleInputChange = (e) => {
    const text = e.target.value;
    setQueryText(text);
    setIsOpen(true);
    setHighlightIndex(-1);

    // If typing changes and differs from currently bound value, unlock/clear binding
    if (value && value.name !== text) {
      onChange(null);
    }

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      fetchMasters(text);
    }, 250);
  };

  const handleSelect = (item) => {
    setQueryText(item.name);
    onChange(item);
    setIsOpen(false);
    setHighlightIndex(-1);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    setQueryText('');
    onChange(null);
    setResults([]);
    inputRef.current?.focus();
  };

  // Close dropdown on outside click or blur enforcement
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
        // Strict Master Enforcement: If user typed text but didn't select an existing master, prompt QuickAdd
        if (queryText.trim() && (!value || value.name !== queryText.trim())) {
          setShowQuickAdd(true);
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [queryText, value]);

  // Keyboard navigation support
  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setIsOpen(true);
        fetchMasters(queryText);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightIndex((prev) => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightIndex >= 0 && results[highlightIndex]) {
        handleSelect(results[highlightIndex]);
      } else if (queryText.trim() && results.length === 0) {
        setShowQuickAdd(true);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const isBound = Boolean(value && value.id);

  return (
    <div className="relative w-full space-y-1.5" ref={containerRef}>
      {/* Label and Lock Status Indicator */}
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-700">
          {type === 'client' ? <Building2 className="w-3.5 h-3.5 text-indigo-600" /> : <Package className="w-3.5 h-3.5 text-indigo-600" />}
          <span>{label}</span>
          {required && <span className="text-red-500 font-bold">*</span>}
        </label>

        {/* Master Data Interlock Badge */}
        <div className="flex items-center gap-1 text-[11px] font-medium">
          {isBound ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              <Lock className="w-3 h-3 text-emerald-600" />
              <span>Master Bound ({value.code || 'VALID'})</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
              <Unlock className="w-3 h-3 text-amber-600" />
              <span>Unbound</span>
            </span>
          )}
        </div>
      </div>

      {/* Input Field Container */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
          ) : (
            <Search className="w-4 h-4" />
          )}
        </div>

        <input
          ref={inputRef}
          type="text"
          disabled={disabled}
          value={queryText}
          onChange={handleInputChange}
          onFocus={() => {
            setIsOpen(true);
            if (!results.length) fetchMasters(queryText);
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={`w-full min-h-[46px] pl-10 pr-20 rounded-xl text-sm font-medium transition-all bg-white
            ${isBound 
              ? 'border-emerald-500 ring-1 ring-emerald-500/20 text-slate-900 font-semibold' 
              : 'border-slate-300 text-slate-900 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20'}
            ${error ? 'border-red-500 ring-1 ring-red-500/20' : ''}
            ${disabled ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'shadow-sm'}
          `}
        />

        <div className="absolute inset-y-0 right-0 pr-2 flex items-center gap-1">
          {queryText && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              title="Clear selection"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              setIsOpen(!isOpen);
              if (!isOpen && !results.length) fetchMasters(queryText);
            }}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
          >
            <ChevronDown className={`w-4 h-4 transition-transform duration-150 ${isOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-40 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden animate-in fade-in-50 duration-100">
          <div className="max-h-60 overflow-y-auto divide-y divide-slate-100">
            {results.length > 0 ? (
              results.map((item, idx) => {
                const isSelected = value?.id === item.id;
                const isHighlighted = highlightIndex === idx;

                return (
                  <div
                    key={item.id}
                    onClick={() => handleSelect(item)}
                    className={`flex items-center justify-between px-4 py-3 cursor-pointer text-sm transition-colors
                      ${isHighlighted ? 'bg-indigo-50/70' : 'hover:bg-slate-50'}
                      ${isSelected ? 'bg-emerald-50/70 font-semibold' : ''}
                    `}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                        {type === 'client' ? <Building2 className="w-4 h-4" /> : <Package className="w-4 h-4" />}
                      </div>
                      <div>
                        <div className="text-slate-900 font-medium">{item.name}</div>
                        <div className="text-xs text-slate-400 font-mono">
                          {item.code} {item.gstin ? `• GST: ${item.gstin}` : ''} {item.unit ? `• ${item.unit}` : ''}
                        </div>
                      </div>
                    </div>

                    {isSelected && (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    )}
                  </div>
                );
              })
            ) : (
              <div className="p-4 text-center">
                <p className="text-xs text-slate-500 mb-2">No existing master matches "{queryText}"</p>
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    setShowQuickAdd(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-semibold transition-colors"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Register "{queryText || 'New'}" into Master</span>
                </button>
              </div>
            )}
          </div>

          {/* Bottom Quick Add Footer */}
          <div className="p-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span className="font-medium text-slate-400">PostgreSQL Trigram Search Active</span>
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                setShowQuickAdd(true);
              }}
              className="font-semibold text-indigo-600 hover:text-indigo-800 hover:underline flex items-center gap-1"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>+ Quick Add</span>
            </button>
          </div>
        </div>
      )}

      {/* Helper and Error Messages */}
      {error ? (
        <p className="text-xs font-medium text-red-600 flex items-center gap-1">
          <AlertCircle className="w-3.5 h-3.5" />
          <span>{error}</span>
        </p>
      ) : helperText ? (
        <p className="text-xs text-slate-500">{helperText}</p>
      ) : !isBound && required ? (
        <p className="text-xs text-amber-600 font-medium flex items-center gap-1">
          <AlertCircle className="w-3 h-3 shrink-0" />
          <span>Form submission locked until a valid master record is bound.</span>
        </p>
      ) : null}

      {/* Inline Quick Add Master Modal */}
      <QuickAddMasterModal
        isOpen={showQuickAdd}
        onClose={() => setShowQuickAdd(false)}
        type={type}
        initialName={queryText}
        onSuccess={(newMaster) => {
          handleSelect(newMaster);
        }}
      />
    </div>
  );
}
