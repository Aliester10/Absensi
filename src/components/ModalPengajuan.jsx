import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import KaryawanAutocomplete from './KaryawanAutocomplete';
import { format } from 'date-fns';

export default function ModalPengajuan({ onClose }) {
  const { tambahPengajuan } = useApp();
  const today = format(new Date(), 'yyyy-MM-dd');
  const [selectedKaryawan, setSelectedKaryawan] = useState(null);
  const [form, setForm] = useState({
    jenis: 'Izin',
    tanggalMulai: today,
    tanggalSelesai: today,
    keterangan: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedKaryawan) return alert('Pilih karyawan terlebih dahulu');
    tambahPengajuan({
      karyawanId:   selectedKaryawan.id,
      namakaryawan: selectedKaryawan.nama,
      jabatan:      selectedKaryawan.jabatan,
      departemen:   selectedKaryawan.departemen,
      ...form,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">Buat Pengajuan</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Cari karyawan */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cari Karyawan</label>
            <KaryawanAutocomplete onSelect={setSelectedKaryawan} placeholder="Ketik nama, ID, atau jabatan..." />
          </div>

          {/* Detail karyawan terpilih */}
          {selectedKaryawan && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100 p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                  {selectedKaryawan.nama.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-blue-900">{selectedKaryawan.nama}</p>
                  <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-blue-700 mt-1">
                    <span><strong>ID:</strong> {selectedKaryawan.id}</span>
                    <span><strong>Jabatan:</strong> {selectedKaryawan.jabatan}</span>
                    <span><strong>Dept:</strong> {selectedKaryawan.departemen}</span>
                    <span><strong>Email:</strong> {selectedKaryawan.email}</span>
                    <span><strong>Telp:</strong> {selectedKaryawan.telepon}</span>
                    <span><strong>Masuk:</strong> {selectedKaryawan.tanggalMasuk}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Jenis */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Pengajuan</label>
            <div className="flex gap-3">
              {['Izin', 'Sakit', 'Cuti'].map((j) => (
                <label key={j} className={`flex-1 flex items-center justify-center py-2.5 rounded-lg border-2 cursor-pointer text-sm font-medium transition-colors
                  ${form.jenis === j
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}>
                  <input type="radio" name="jenis" value={j} checked={form.jenis === j}
                    onChange={() => setForm({ ...form, jenis: j })} className="sr-only" />
                  {j}
                </label>
              ))}
            </div>
          </div>

          {/* Tanggal */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Mulai</label>
              <input type="date" value={form.tanggalMulai}
                onChange={(e) => setForm({ ...form, tanggalMulai: e.target.value })}
                className="input-field" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Selesai</label>
              <input type="date" value={form.tanggalSelesai} min={form.tanggalMulai}
                onChange={(e) => setForm({ ...form, tanggalSelesai: e.target.value })}
                className="input-field" required />
            </div>
          </div>

          {/* Keterangan */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Keterangan / Alasan</label>
            <textarea value={form.keterangan}
              onChange={(e) => setForm({ ...form, keterangan: e.target.value })}
              rows={3} placeholder="Tuliskan alasan pengajuan..."
              className="input-field resize-none" required />
          </div>

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Batal</button>
            <button type="submit" className="btn-primary flex-1">Kirim Pengajuan</button>
          </div>
        </form>
      </div>
    </div>
  );
}
