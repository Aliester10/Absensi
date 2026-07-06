import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Plus, Search, Edit2, Trash2, Users } from 'lucide-react';
import ModalKaryawan from '../components/ModalKaryawan';

export default function DataKaryawan() {
  const { karyawan, hapusKaryawan } = useApp();
  const [search, setSearch]       = useState('');
  const [filterDept, setFilterDept] = useState('Semua');
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData]   = useState(null);

  const departments = ['Semua', ...new Set(karyawan.map((k) => k.departemen))];

  const filtered = karyawan.filter((k) => {
    const matchSearch = k.nama.toLowerCase().includes(search.toLowerCase()) ||
      k.id.toLowerCase().includes(search.toLowerCase()) ||
      k.jabatan.toLowerCase().includes(search.toLowerCase());
    const matchDept = filterDept === 'Semua' || k.departemen === filterDept;
    return matchSearch && matchDept;
  });

  const handleEdit  = (k) => { setEditData(k); setModalOpen(true); };
  const handleHapus = (k) => { if (confirm(`Hapus karyawan ${k.nama}?`)) hapusKaryawan(k.id); };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Data Karyawan</h2>
          <p className="text-sm text-gray-500">{karyawan.length} total karyawan terdaftar</p>
        </div>
        <button onClick={() => { setEditData(null); setModalOpen(true); }} className="btn-primary">
          <Plus className="w-4 h-4" /> Tambah Karyawan
        </button>
      </div>

      {/* Filter */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama, ID, atau jabatan..."
              className="input-field pl-9"
            />
          </div>
          <select value={filterDept} onChange={(e) => setFilterDept(e.target.value)} className="input-field sm:w-48">
            {departments.map((d) => <option key={d}>{d}</option>)}
          </select>
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="card text-center py-16 text-gray-400">
          <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium text-gray-500">Tidak ada karyawan</p>
          <p className="text-sm">Klik "Tambah Karyawan" untuk menambahkan</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((k) => (
            <div key={k.id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                    {k.nama.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{k.nama}</p>
                    <p className="text-xs text-blue-600 font-medium">{k.id}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => handleEdit(k)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition">
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => handleHapus(k)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <div className="space-y-1.5 text-xs border-t border-gray-100 pt-3">
                {[
                  ['Jabatan',    k.jabatan],
                  ['Departemen', k.departemen],
                  ['Email',      k.email],
                  ['Telepon',    k.telepon],
                  ['Tgl Masuk',  k.tanggalMasuk],
                  ['Shift',      k.shift || 'Pagi'],
                ].map(([label, val]) => (
                  <div key={label} className="flex justify-between gap-2">
                    <span className="text-gray-400 flex-shrink-0">{label}</span>
                    <span className="font-medium text-gray-700 truncate text-right">{val || '—'}</span>
                  </div>
                ))}
                <div className="flex justify-between">
                  <span className="text-gray-400">Status</span>
                  <span className={`font-semibold ${k.status === 'Aktif' ? 'text-green-600' : 'text-red-500'}`}>
                    {k.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalOpen && <ModalKaryawan onClose={() => setModalOpen(false)} initialData={editData} />}
    </div>
  );
}
