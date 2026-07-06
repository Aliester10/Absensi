import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useApp } from '../context/AppContext';

const departemenOptions = ['Human Resource', 'Keuangan', 'IT', 'Marketing', 'Produksi', 'Logistik', 'Umum', 'Operasional'];

export default function ModalKaryawan({ onClose, initialData }) {
  const { tambahKaryawan, updateKaryawan } = useApp();
  const [form, setForm] = useState({
    nama:         initialData?.nama         || '',
    jabatan:      initialData?.jabatan      || '',
    departemen:   initialData?.departemen   || 'IT',
    email:        initialData?.email        || '',
    telepon:      initialData?.telepon      || '',
    tanggalMasuk: initialData?.tanggalMasuk || '',
    status:       initialData?.status       || 'Aktif',
    shift:        initialData?.shift        || 'Pagi',
  });

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (initialData) { updateKaryawan(initialData.id, form); }
    else { tambahKaryawan(form); }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white flex items-center justify-between px-6 py-4 border-b border-gray-100 z-10">
          <h3 className="font-semibold text-gray-900">{initialData ? 'Edit Karyawan' : 'Tambah Karyawan Baru'}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {initialData && (
            <div className="bg-gray-50 rounded-lg px-3 py-2 text-xs text-gray-500">
              ID Karyawan: <strong className="text-gray-700">{initialData.id}</strong>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap <span className="text-red-500">*</span></label>
            <input type="text" value={form.nama} onChange={set('nama')} className="input-field" required placeholder="Masukkan nama lengkap" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Jabatan <span className="text-red-500">*</span></label>
              <input type="text" value={form.jabatan} onChange={set('jabatan')} className="input-field" required placeholder="Contoh: Staff IT" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Departemen <span className="text-red-500">*</span></label>
              <select value={form.departemen} onChange={set('departemen')} className="input-field">
                {departemenOptions.map((d) => <option key={d}>{d}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" value={form.email} onChange={set('email')} className="input-field" placeholder="nama@company.com" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">No. Telepon</label>
            <input type="tel" value={form.telepon} onChange={set('telepon')} className="input-field" placeholder="08xxxxxxxxxx" />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Masuk <span className="text-red-500">*</span></label>
              <input type="date" value={form.tanggalMasuk} onChange={set('tanggalMasuk')} className="input-field" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select value={form.status} onChange={set('status')} className="input-field">
                <option>Aktif</option>
                <option>Nonaktif</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Shift</label>
              <select value={form.shift} onChange={set('shift')} className="input-field">
                <option>Pagi</option>
                <option>Siang</option>
                <option>Malam</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Batal</button>
            <button type="submit" className="btn-primary flex-1">{initialData ? 'Simpan Perubahan' : 'Tambah Karyawan'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
