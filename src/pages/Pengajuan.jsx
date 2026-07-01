import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Plus, FileText } from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import ModalPengajuan from '../components/ModalPengajuan';

export default function Pengajuan() {
  const { pengajuan, updateStatusPengajuan } = useApp();
  const [modalOpen, setModalOpen] = useState(false);
  const [filterJenis, setFilterJenis] = useState('Semua');
  const [filterStatus, setFilterStatus] = useState('Semua');

  const filtered = pengajuan
    .filter((p) => {
      const matchJenis  = filterJenis  === 'Semua' || p.jenis   === filterJenis;
      const matchStatus = filterStatus === 'Semua' || p.status  === filterStatus;
      return matchJenis && matchStatus;
    })
    .sort((a, b) => b.createdAt?.localeCompare(a.createdAt));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Pengajuan Izin / Sakit / Cuti</h2>
          <p className="text-sm text-gray-500">Kelola permohonan karyawan</p>
        </div>
        <button onClick={() => setModalOpen(true)} className="btn-primary">
          <Plus className="w-4 h-4" /> Buat Pengajuan
        </button>
      </div>

      {/* Filter */}
      <div className="card">
        <div className="flex flex-wrap gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Jenis</label>
            <select value={filterJenis} onChange={(e) => setFilterJenis(e.target.value)} className="input-field py-1.5 text-sm">
              {['Semua', 'Izin', 'Sakit', 'Cuti'].map((v) => <option key={v}>{v}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="input-field py-1.5 text-sm">
              {['Semua', 'Pending', 'Disetujui', 'Ditolak'].map((v) => <option key={v}>{v}</option>)}
            </select>
          </div>
          <div className="ml-auto self-end">
            <p className="text-sm text-gray-500">{filtered.length} data</p>
          </div>
        </div>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="card text-center py-16 text-gray-400">
          <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium text-gray-500">Tidak ada pengajuan</p>
          <p className="text-sm">Klik "Buat Pengajuan" untuk menambahkan</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((p) => (
            <div key={p.id} className="card">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-sm font-bold
                    ${p.jenis === 'Sakit' ? 'bg-red-100 text-red-600'
                    : p.jenis === 'Cuti'  ? 'bg-blue-100 text-blue-600'
                    : 'bg-yellow-100 text-yellow-600'}`}>
                    {p.jenis?.[0]}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-gray-900">{p.namakaryawan}</p>
                      <StatusBadge status={p.jenis} />
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">{p.karyawanId} &bull; {p.jabatan}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      {p.tanggalMulai === p.tanggalSelesai
                        ? p.tanggalMulai
                        : `${p.tanggalMulai} s/d ${p.tanggalSelesai}`}
                    </p>
                    {p.keterangan && <p className="text-sm text-gray-500 mt-1 italic">"{p.keterangan}"</p>}
                    <p className="text-xs text-gray-400 mt-1">Diajukan: {p.createdAt}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 sm:flex-col sm:items-end">
                  <StatusBadge status={p.status} />
                  {p.status === 'Pending' && (
                    <div className="flex gap-2 mt-1">
                      <button onClick={() => updateStatusPengajuan(p.id, 'Disetujui')} className="btn-primary py-1 px-3 text-xs">
                        Setujui
                      </button>
                      <button onClick={() => updateStatusPengajuan(p.id, 'Ditolak')} className="btn-danger py-1 px-3 text-xs">
                        Tolak
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalOpen && <ModalPengajuan onClose={() => setModalOpen(false)} />}
    </div>
  );
}
