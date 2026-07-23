import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Plus, Clock, Edit2, Trash2, X } from 'lucide-react';
import toast from 'react-hot-toast';

function ModalShift({ onClose, onSave, initialData }) {
  const [form, setForm] = useState({
    nama:      initialData?.nama      || '',
    jamMasuk:  initialData?.jamMasuk  || '08:00',
    jamKeluar: initialData?.jamKeluar || '17:00',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.nama.trim()) return alert('Nama shift harus diisi');
    onSave(form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">{initialData ? 'Edit Shift' : 'Tambah Shift'}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Shift</label>
            <input
              type="text"
              value={form.nama}
              onChange={(e) => setForm({ ...form, nama: e.target.value })}
              placeholder="Contoh: Pagi, Siang, Malam..."
              className="input-field"
              autoFocus
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Jam Masuk</label>
              <input
                type="time"
                value={form.jamMasuk}
                onChange={(e) => setForm({ ...form, jamMasuk: e.target.value })}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Jam Keluar</label>
              <input
                type="time"
                value={form.jamKeluar}
                onChange={(e) => setForm({ ...form, jamKeluar: e.target.value })}
                className="input-field"
              />
            </div>
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

export default function DataShift() {
  const { shifts, tambahShift, updateShift, hapusShift, karyawan } = useApp();
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData]   = useState(null);

  const handleSave = (data) => {
    if (editData) {
      updateShift(editData.id, data);
      toast.success('Shift berhasil diperbarui');
    } else {
      tambahShift(data);
      toast.success('Shift berhasil ditambahkan');
    }
    setModalOpen(false);
    setEditData(null);
  };

  const handleEdit = (s) => {
    setEditData(s);
    setModalOpen(true);
  };

  const handleHapus = (s) => {
    const usedBy = karyawan.filter((k) => k.shift === s.nama);
    if (usedBy.length > 0) {
      return alert(`Shift "${s.nama}" masih digunakan oleh ${usedBy.length} karyawan. Ubah shift karyawan terlebih dahulu.`);
    }
    if (confirm(`Hapus shift "${s.nama}"?`)) {
      hapusShift(s.id);
      toast.success('Shift berhasil dihapus');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Data Shift</h2>
          <p className="text-sm text-gray-500">Kelola master data shift kerja karyawan</p>
        </div>
        <button onClick={() => { setEditData(null); setModalOpen(true); }} className="btn-primary">
          <Plus className="w-4 h-4" /> Tambah Shift
        </button>
      </div>

      {/* Table */}
      {shifts.length === 0 ? (
        <div className="card text-center py-16 text-gray-400">
          <Clock className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium text-gray-500">Belum ada data shift</p>
          <p className="text-sm">Klik "Tambah Shift" untuk menambahkan</p>
        </div>
      ) : (
        <div className="card overflow-hidden !p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">No</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Nama Shift</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Jam Masuk</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Jam Keluar</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Karyawan</th>
                  <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {shifts.map((s, idx) => {
                  const usedByCount = karyawan.filter((k) => k.shift === s.nama).length;
                  return (
                    <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-500">{idx + 1}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-400 to-purple-600 text-white flex items-center justify-center flex-shrink-0">
                            <Clock className="w-4 h-4" />
                          </div>
                          <span className="font-semibold text-gray-900 text-sm">{s.nama}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-50 text-green-700 rounded-md text-xs font-medium">
                          {s.jamMasuk}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-red-50 text-red-600 rounded-md text-xs font-medium">
                          {s.jamKeluar}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600">{usedByCount} karyawan</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-1 justify-end">
                          <button onClick={() => handleEdit(s)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition">
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => handleHapus(s)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {modalOpen && <ModalShift onClose={() => { setModalOpen(false); setEditData(null); }} onSave={handleSave} initialData={editData} />}
    </div>
  );
}
