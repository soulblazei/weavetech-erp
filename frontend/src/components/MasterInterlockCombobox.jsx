import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
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
 * Inline QuickAdd Modal for registering unlinked masters on shop floor
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
  const [gstRate, setGstRate] = useState('5.00');
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

  // Strict numeric decimal guard for touch devices
  const sanitizeDecimal = (val) => {
    const cleaned = val.replace(/[^0-9.]/g, '');
    const parts = cleaned.split('.');
    return parts.length > 2 ? parts[0] + '.' + parts.slice(1).join('') : cleaned;
  };

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
        unit,
        gstRate: parseFloat(gstRate) || 5.00
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-300 overflow-hidden">
        
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              {type === 'client' ? <Building2 className="w-5 h-5" /> : <Package className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Quick Register {type === 'client' ? 'Party / Buyer' : 'Item / Quality'}
              </h3>
              <p className="text-xs text-slate-500">Unlinked value detected. Bind master to proceed.</p>
            </div>
          </div>
          <button 
            type="button" 
            onClick={onClose} 
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 text-xs font-semibold text-red-700 bg-red-50 border border-red-200 rounded-xl">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              {type === 'client' ? 'Party / Mill Name *' : 'Item Description / Quality *'}
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Reliance Textile Mills Ltd"
              className="w-full min-h-[48px] h-12 px-4 rounded-xl border border-slate-300 text-slate-900 text-base font-semibold focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Master Code
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full min-h-[48px] h-12 px-4 rounded-xl border border-slate-300 text-slate-900 bg-slate-50 text-sm font-mono font-bold"
              />
            </div>

            {type === 'client' ? (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  GSTIN
                </label>
                <input
                  type="text"
                  maxLength={15}
                  value={gstin}
                  onChange={(e) => setGstin(e.target.value.toUpperCase())}
                  placeholder="24AAAAA0000A1Z5"
                  className="w-full min-h-[48px] h-12 px-4 rounded-xl border border-slate-300 text-slate-900 uppercase text-sm font-mono focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
            ) : (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Unit
                </label>
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full min-h-[48px] h-12 px-4 rounded-xl border border-slate-300 text-slate-900 text-sm font-bold focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20"
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
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Category
                </label>
                <select
                  value={itemType}
                  onChange={(e) => setItemType(e.target.value)}
                  className="w-full min-h-[48px] h-12 px-4 rounded-xl border border-slate-300 text-slate-900 text-sm font-bold focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="GREY_FABRIC">Grey Fabric Quality</option>
                  <option value="YARN">Yarn Count (Warp/Weft)</option>
                  <option value="CHEMICAL">Chemical / Sizing Material</option>
                  <option value="SPARES">Loom Mechanical Spare</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  GST Rate (%)
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={gstRate}
                  onChange={(e) => setGstRate(sanitizeDecimal(e.target.value))}
                  placeholder="5.00"
                  className="w-full min-h-[48px] h-12 px-4 rounded-xl border border-slate-300 text-slate-900 font-mono font-bold text-base focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[48px] px-5 text-sm font-bold text-slate-600 hover:text-slate-900 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !name.trim()}
              className="min-h-[48px] inline-flex items-center gap-2 px-6 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] disabled:bg-slate-300 text-white font-bold text-sm rounded-xl shadow-md"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Binding...</span>
                </>
              ) : (
                <>
                  <PlusCircle className="w-5 h-5" />
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
 * Low-spec & touch-optimized (48px minimum target) master selection combobox.
 */
function MasterInterlockComboboxComponent({
  type = 'client',
  label = 'Party / Client Master',
  placeholder = 'Type to fuzzy search master...',
  value = null,
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

  useEffect(() => {
    if (value && value.name) {
      setQueryText(value.name);
    } else if (!value) {
      setQueryText('');
    }
  }, [value]);

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
      console.error('Error in master lookup:', err);
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

    if (value && value.name !== text) {
      onChange(null);
    }

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      fetchMasters(text);
    }, 200);
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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
        if (queryText.trim() && (!value || value.name !== queryText.trim())) {
          setShowQuickAdd(true);
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [queryText, value]);

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
      
      {/* Label and Interlock Lock Chip */}
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-800">
          {type === 'client' ? <Building2 className="w-4 h-4 text-indigo-600" /> : <Package className="w-4 h-4 text-indigo-600" />}
          <span>{label}</span>
          {required && <span className="text-red-500 font-bold">*</span>}
        </label>

        <div>
          {isBound ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 font-bold text-xs">
              <Lock className="w-3.5 h-3.5 text-emerald-600" />
              <span>Bound ({value.code || 'LOCKED'})</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-300 font-bold text-xs">
              <Unlock className="w-3.5 h-3.5 text-amber-600" />
              <span>Unbound</span>
            </span>
          )}
        </div>
      </div>

      {/* Main Touch-First Input Box (48px Touch Target) */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
          ) : (
            <Search className="w-5 h-5" />
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
          className={`w-full min-h-[48px] h-12 pl-11 pr-20 rounded-xl text-base font-semibold bg-white transition-colors
            ${isBound 
              ? 'border-2 border-emerald-600 text-slate-900 bg-emerald-50/20' 
              : 'border border-slate-300 text-slate-900 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20'}
            ${error ? 'border-red-500 ring-1 ring-red-500' : ''}
            ${disabled ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'shadow-sm'}
          `}
        />

        <div className="absolute inset-y-0 right-0 pr-1.5 flex items-center gap-1">
          {queryText && (
            <button
              type="button"
              onClick={handleClear}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-400 hover:text-slate-700 rounded-lg"
              title="Clear selection"
            >
              <X className="w-5 h-5" />
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              setIsOpen(!isOpen);
              if (!isOpen && !results.length) fetchMasters(queryText);
            }}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-400 hover:text-slate-700 rounded-lg"
          >
            <ChevronDown className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {/* Fuzzy Results Dropdown (High Touch Row Targets) */}
      {isOpen && (
        <div className="absolute z-40 left-0 right-0 mt-1 bg-white border border-slate-300 rounded-2xl shadow-xl overflow-hidden">
          <div className="max-h-64 overflow-y-auto divide-y divide-slate-100">
            {results.length > 0 ? (
              results.map((item, idx) => {
                const isSelected = value?.id === item.id;
                const isHighlighted = highlightIndex === idx;

                return (
                  <div
                    key={item.id}
                    onClick={() => handleSelect(item)}
                    className={`min-h-[52px] flex items-center justify-between px-4 py-3 cursor-pointer text-sm transition-colors
                      ${isHighlighted ? 'bg-indigo-50' : 'hover:bg-slate-50'}
                      ${isSelected ? 'bg-emerald-50 font-bold' : ''}
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl ${isSelected ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'}`}>
                        {type === 'client' ? <Building2 className="w-5 h-5" /> : <Package className="w-5 h-5" />}
                      </div>
                      <div>
                        <div className="text-slate-900 font-bold text-base">{item.name}</div>
                        <div className="text-xs text-slate-500 font-mono">
                          {item.code} {item.gstin ? `• GST: ${item.gstin}` : ''} {item.unit ? `• ${item.unit}` : ''}
                        </div>
                      </div>
                    </div>

                    {isSelected && (
                      <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                    )}
                  </div>
                );
              })
            ) : (
              <div className="p-5 text-center">
                <p className="text-sm text-slate-600 mb-3 font-medium">No master matches "{queryText}"</p>
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    setShowQuickAdd(true);
                  }}
                  className="min-h-[48px] inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-sm"
                >
                  <PlusCircle className="w-5 h-5" />
                  <span>Register "{queryText || 'New'}"</span>
                </button>
              </div>
            )}
          </div>

          <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs font-semibold text-slate-600">
            <span>GIN Trigram Indexed</span>
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                setShowQuickAdd(true);
              }}
              className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1 font-bold"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Quick Add</span>
            </button>
          </div>
        </div>
      )}

      {error ? (
        <p className="text-xs font-bold text-red-600 flex items-center gap-1">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </p>
      ) : helperText ? (
        <p className="text-xs text-slate-500 font-medium">{helperText}</p>
      ) : !isBound && required ? (
        <p className="text-xs text-amber-700 font-bold flex items-center gap-1">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>Form submission locked until a valid master record is bound.</span>
        </p>
      ) : null}

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

export const MasterInterlockCombobox = memo(MasterInterlockComboboxComponent);
export default MasterInterlockCombobox;
