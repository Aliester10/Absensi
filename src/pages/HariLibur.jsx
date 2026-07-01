import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { format, parse } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { Plus, Trash2, Edit2, CalendarOff, Search, ChevronLeft, ChevronRight } from 'lucide-react';

const TIPE_OPTIONS = ['Nasional', 'Kantor', 'Bersama'];

const TIPE_CFG = {
  Nasional: { bg: 'bg-red-100',    text: 'text-red-700',    border: 'border-red-200'   },
  Kantor:   { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-200' },
  Bersama:  { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-200' },
};

const BULAN = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];

function Modal({ initialData, onClose, onSave }) {
  const [form, setForm] = useState({
    tanggal: initialData?.tanggal || format(new Date(), 'yyyy-MM-dd'),
    nama:    initialData?.nama    || '',
    tipe:    initialData?.tipe    || 'Nasional',
    catatan: initialData?.catatan || '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.nama.trim()) return;
    onSave(form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">
            {initialData ? 'Edit Hari Libur' : 'Tambah Hari Libur'}
          </h3>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100">
            ✕
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal <span className="text-red-500">*</span></label>
            <input
              type="date"
              value={form.tanggal}
              onChange={(e) => setForm({ ...form, tanggal: e.target.value })}
              className="input-field"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Hari Libur <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={form.nama}
              onChange={(e) => setForm({ ...form, nama: e.target.value })}
              placeholder="Contoh: Hari Raya Idul Fitri"
              className="input-field"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipe</label>
            <div className="flex gap-2">
              {TIPE_OPTIONS.map((t) => {
                const cfg = TIPE_CFG[t];
                return (
                  <label key={t} className={`flex-1 flex items-center justify-center py-2 rounded-lg border-2 cursor-pointer text-sm font-medium transition-colors
                    ${form.tipe === t ? `${cfg.border} ${cfg.bg} ${cfg.text}` : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}>
                    <input type="radio" name="tipe" value={t} checked={form.tipe === t}
                      onChange={() => setForm({ ...form, tipe: t })} className="sr-only" />
                    {t}
                  </label>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Catatan</label>
            <textarea
              value={form.catatan}
              onChange={(e) => setForm({ ...form, catatan: e.target.value })}
              rows={2}
              placeholder="Opsional..."
              className="input-field resize-none"
            />
          </div>

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Batal</button>
            <button type="submit" className="btn-primary flex-1">Simpan</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function HariLibur() {
  const { hariLibur, tambahHariLibur, updateHariLibur, hapusHariLibur } = useApp();

  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData]   = useState(null);
  const [search, setSearch]       = useState('');
  const [filterTipe, setFilterTipe] = useState('Semua');
  const [activeYear, setActiveYear] = useState(() => new Date().getFullYear());

  const handleSave = (data) => {
    if (editData) { updateHariLibur(editData.id, data); }
    else { tambahHariLibur(data); }
    setModalOpen(false);
    setEditData(null);
  };

  const handleEdit = (h) => { setEditData(h); setModalOpen(true); };
  const handleHapus = (h) => {
    if (confirm(`Hapus "${h.nama}"?`)) hapusHariLibur(h.id);
  };

  // Filter & sort
  const filtered = useMemo(() =>
    hariLibur
      .filter((h) => {
        const matchYear  = h.tanggal.startsWith(String(activeYear));
        const matchTipe  = filterTipe === 'Semua' || h.tipe === filterTipe;
        const matchSearch = h.nama.toLowerCase().includes(search.toLowerCase()) ||
          h.tanggal.includes(search);
        return matchYear && matchTipe && matchSearch;
      })
      .sort((a, b) => a.tanggal.localeCompare(b.tanggal)),
  [hariLibur, activeYear, filterTipe, search]);

  // Kelompokkan per bulan
  const grouped = useMemo(() => {
    const map = {};
    filtered.forEach((h) => {
      const bulan = parseInt(h.tanggal.split('-')[1]) - 1; // 0-indexed
      if (!map[bulan]) map[bulan] = [];
      map[bulan].push(h);
    });
    return map;
  }, [filtered]);

  const formatTanggal = (str) => {
    try { return format(new Date(str + 'T00:00:00'), 'EEEE, dd MMMM yyyy', { locale: localeId }); }
    catch { return str; }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Hari Libur</h2>
          <p className="text-sm text-gray-500">Libur nasional &amp; libur kantor — akan ditandai merah di kalender</p>
        </div>
        <button onClick={() => { setEditData(null); setModalOpen(true); }} className="btn-primary">
          <Plus className="w-4 h-4" /> Tambah Hari Libur
        </button>
      </div>

      {/* Kontrol */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          {/* Navigasi tahun */}
          <div className="flex items-center gap-2">
            <button onClick={() => setActiveYear((y) => y - 1)} className="p-2 rounded-lg hover:bg-gray-100 transition">
              <ChevronLeft className="w-4 h-4 text-gray-600" />
            </button>
            <span className="text-base font-bold text-gray-900 w-14 text-center">{activeYear}</span>
            <button onClick={() => setActiveYear((y) => y + 1)} className="p-2 rounded-lg hover:bg-gray-100 transition">
              <ChevronRight className="w-4 h-4 text-gray-600" />
            </button>
          </div>

          {/* Filter tipe */}
          <div className="flex gap-1.5 flex-wrap">
            {['Semua', ...TIPE_OPTIONS].map((t) => (
              <button
                key={t}
                onClick={() => setFilterTipe(t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors
                  ${filterTipe === t
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative ml-auto w-full sm:w-56">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama / tanggal..."
              className="input-field pl-9 py-1.5 text-sm"
            />
          </div>

          <span className="text-sm text-gray-500 whitespace-nowrap">{filtered.length} hari libur</span>
        </div>
      </div>

      {/* Legenda tipe */}
      <div className="flex gap-3 flex-wrap px-1">
        {TIPE_OPTIONS.map((t) => {
          const cfg = TIPE_CFG[t];
          return (
            <div key={t} className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${cfg.bg} ${cfg.text}`}>
              <span className="w-2 h-2 rounded-full bg-current" />
              {t}
            </div>
          );
        })}
      </div>

      {/* Konten */}
      {filtered.length === 0 ? (
        <div className="card text-center py-16 text-gray-400">
          <CalendarOff className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium text-gray-500">Tidak ada hari libur</p>
          <p className="text-sm mt-1">Klik "Tambah Hari Libur" untuk menambahkan</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped)
            .sort(([a], [b]) => Number(a) - Number(b))
            .map(([bulanIdx, items]) => (
              <div key={bulanIdx}>
                {/* Header bulan */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-red-600 font-bold text-xs">{String(Number(bulanIdx) + 1).padStart(2, '0')}</span>
                  </div>
                  <h3 className="font-semibold text-gray-800">{BULAN[bulanIdx]} {activeYear}</h3>
                  <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{items.length} hari</span>
                </div>

                {/* List item */}
                <div className="card p-0 overflow-hidden divide-y divide-gray-50">
                  {items.map((h) => {
                    const cfg = TIPE_CFG[h.tipe] ?? TIPE_CFG['Nasional'];
                    return (
                      <div key={h.id} className="flex items-center gap-4 px-5 py-3 hover:bg-gray-50 transition-colors">
                        {/* Tanggal box */}
                        <div className="w-12 flex-shrink-0 text-center">
                          <div className="text-2xl font-bold text-red-500 leading-none">
                            {h.tanggal.split('-')[2]}
                          </div>
                          <div className="text-xs text-gray-400 mt-0.5">
                            {format(new Date(h.tanggal + 'T00:00:00'), 'EEE', { locale: localeId })}
                          </div>
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 text-sm">{h.nama}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{formatTanggal(h.tanggal)}</p>
                          {h.catatan && <p className="text-xs text-gray-500 mt-0.5 italic">"{h.catatan}"</p>}
                        </div>

                        {/* Badge tipe */}
                        <span className={`hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
                          {h.tipe}
                        </span>

                        {/* Aksi */}
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <button
                            onClick={() => handleEdit(h)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleHapus(h)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition"
                            title="Hapus"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
        </div>
      )}

      {modalOpen && (
        <Modal
          initialData={editData}
          onClose={() => { setModalOpen(false); setEditData(null); }}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
