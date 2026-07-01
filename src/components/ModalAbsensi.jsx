import React, { useState } from 'react';
import { X } from 'lucide-react';
import KaryawanAutocomplete from './KaryawanAutocomplete';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';

const statusOptions = ['Hadir', 'Sakit', 'Izin', 'Cuti', 'Alpha'];

const STATUS_ACTIVE = {
  Hadir: 'border-green-500 bg-green-50 text-green-700',
  Sakit: 'border-red-400 bg-red-50 text-red-600',
  Izin:  'border-yellow-400 bg-yellow-50 text-yellow-700',
  Cuti:  'border-blue-400 bg-blue-50 text-blue-600',
  Alpha: 'border-gray-400 bg-gray-100 text-gray-600',
};

export default function ModalAbsensi({ onClose, onSave, initialData, tanggal, preselectedKaryawan }) {
  const [form, setForm] = useState({
    karyawanId:  initialData?.karyawanId  || preselectedKaryawan?.id         || '',
    nama:        initialData?.nama        || preselectedKaryawan?.nama        || '',
    jabatan:     initialData?.jabatan     || preselectedKaryawan?.jabatan     || '',
    departemen:  initialData?.departemen  || preselectedKaryawan?.departemen  || '',
    jamMasuk:    initialData?.jamMasuk    || '08:00',
    jamKeluar:   initialData?.jamKeluar   || '17:00',
    status:      initialData?.status      || 'Hadir',
    keterangan:  initialData?.keterangan  || '',
  });

  const [selectedKaryawan, setSelectedKaryawan] = useState(
    initialData ? { nama: initialData.nama, id: initialData.karyawanId } : preselectedKaryawan ?? null
  );

  const handleSelectKaryawan = (k) => {
    if (!k) { setSelectedKaryawan(null); setForm((f) => ({ ...f, karyawanId: '', nama: '', jabatan: '', departemen: '' })); return; }
    setSelectedKaryawan(k);
    setForm((f) => ({ ...f, karyawanId: k.id, nama: k.nama, jabatan: k.jabatan, departemen: k.departemen }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.karyawanId) return alert('Pilih karyawan terlebih dahulu');
    onSave(form);
  };

  const tanggalLabel = (() => {
    try { return format(new Date(tanggal + 'T00:00:00'), 'EEEE, dd MMMM yyyy', { locale: localeId }); }
    catch { return tanggal; }
  })();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h3 className="font-semibold text-gray-900">{initialData ? 'Edit Absensi' : 'Tambah Absensi'}</h3>
            <p className="text-xs text-gray-500 mt-0.5">{tanggalLabel}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Karyawan */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Karyawan</label>
            {preselectedKaryawan && !initialData ? (
              <div className="bg-blue-50 border border-blue-100 rounded-lg px-4 py-2.5">
                <p className="font-medium text-blue-900 text-sm">{form.nama}</p>
                <p className="text-xs text-blue-600 mt-0.5">{form.karyawanId} · {form.jabatan} · {form.departemen}</p>
              </div>
            ) : (
              <KaryawanAutocomplete onSelect={handleSelectKaryawan} value={selectedKaryawan} />
            )}
          </div>

          {!preselectedKaryawan && selectedKaryawan && (
            <div className="bg-blue-50 rounded-lg px-4 py-3">
              <p className="font-medium text-blue-900 text-sm">{form.nama}</p>
              <p className="text-blue-700 text-xs mt-0.5">{form.karyawanId} · {form.jabatan} · {form.departemen}</p>
            </div>
          )}

          {/* Jam */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Jam Masuk</label>
              <input type="time" value={form.jamMasuk} onChange={(e) => setForm({ ...form, jamMasuk: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Jam Keluar</label>
              <input type="time" value={form.jamKeluar} onChange={(e) => setForm({ ...form, jamKeluar: e.target.value })} className="input-field" />
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status Kehadiran</label>
            <div className="flex gap-2 flex-wrap">
              {statusOptions.map((s) => (
                <label key={s} className={`flex-1 min-w-[60px] flex items-center justify-center py-2 rounded-lg border-2 cursor-pointer text-xs font-semibold transition-colors
                  ${form.status === s ? STATUS_ACTIVE[s] : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}>
                  <input type="radio" name="status" value={s} checked={form.status === s}
                    onChange={() => setForm({ ...form, status: s })} className="sr-only" />
                  {s}
                </label>
              ))}
            </div>
          </div>

          {/* Keterangan */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Keterangan</label>
            <textarea value={form.keterangan} onChange={(e) => setForm({ ...form, keterangan: e.target.value })}
              rows={2} placeholder="Opsional..." className="input-field resize-none" />
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
