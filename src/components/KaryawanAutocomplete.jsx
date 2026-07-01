import React, { useState, useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function KaryawanAutocomplete({ onSelect, value, placeholder = 'Cari nama karyawan...' }) {
  const { karyawan } = useApp();
  const [query, setQuery]           = useState(value?.nama || '');
  const [open, setOpen]             = useState(false);
  const [highlighted, setHighlighted] = useState(0);
  const containerRef = useRef(null);
  const inputRef     = useRef(null);

  const filtered = query.length === 0 ? [] : karyawan
    .filter((k) =>
      k.nama.toLowerCase().includes(query.toLowerCase()) ||
      k.id.toLowerCase().includes(query.toLowerCase()) ||
      k.jabatan.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 8);

  useEffect(() => {
    const onDown = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, []);

  useEffect(() => { setHighlighted(0); }, [query]);

  const handleSelect = (k) => { setQuery(k.nama); setOpen(false); onSelect(k); };
  const handleClear  = () => { setQuery(''); onSelect(null); inputRef.current?.focus(); };

  const handleKeyDown = (e) => {
    if (!open || filtered.length === 0) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setHighlighted((p) => (p + 1) % filtered.length); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setHighlighted((p) => (p - 1 + filtered.length) % filtered.length); }
    else if (e.key === 'Enter') { e.preventDefault(); if (filtered[highlighted]) handleSelect(filtered[highlighted]); }
    else if (e.key === 'Escape') setOpen(false);
  };

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => query && setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="input-field pl-9 pr-9"
          autoComplete="off"
        />
        {query && (
          <button type="button" onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {open && filtered.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
          {filtered.map((k, i) => (
            <button
              key={k.id}
              type="button"
              onClick={() => handleSelect(k)}
              className={`w-full text-left px-4 py-3 flex items-start gap-3 transition-colors
                ${i === highlighted ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
            >
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">
                {k.nama.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="font-medium text-sm text-gray-900">{k.nama}</p>
                <p className="text-xs text-gray-500 truncate">{k.id} &bull; {k.jabatan} &bull; {k.departemen}</p>
              </div>
            </button>
          ))}
        </div>
      )}

      {open && query.length > 0 && filtered.length === 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg px-4 py-3 text-sm text-gray-500">
          Karyawan tidak ditemukan
        </div>
      )}
    </div>
  );
}
