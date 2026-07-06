import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  format, startOfMonth, endOfMonth, eachDayOfInterval,
  getDay, getDate, parse, isToday,
} from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, CalendarDays, Plus, Search, Trash2 } from 'lucide-react';
import ModalAbsensi from '../components/ModalAbsensi';
import ModalConfirm from '../components/ModalConfirm';

const STATUS_CFG = {
  Hadir: { symbol: '✓', bg: 'bg-green-100',  text: 'text-green-700'  },
  Sakit: { symbol: 'S', bg: 'bg-red-100',    text: 'text-red-600'    },
  Izin:  { symbol: 'I', bg: 'bg-yellow-100', text: 'text-yellow-700' },
  Cuti:  { symbol: 'C', bg: 'bg-blue-100',   text: 'text-blue-600'   },
  Alpha: { symbol: 'A', bg: 'bg-gray-200',   text: 'text-gray-600'   },
};

const DAY_SHORT = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

export default function LaporanHarian() {
  const { karyawan, absensi, tambahAbsensi, updateAbsensi, isHariLibur, getInfoLibur, kosongkanAbsensiBulan } = useApp();

  const [activeMonth, setActiveMonth] = useState(() => format(new Date(), 'yyyy-MM'));
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    confirmText: '',
    confirmTheme: 'primary',
  });

  const days = useMemo(() => {
    const base = parse(activeMonth, 'yyyy-MM', new Date());
    return eachDayOfInterval({ start: startOfMonth(base), end: endOfMonth(base) });
  }, [activeMonth]);

  const filteredKaryawan = useMemo(() =>
    karyawan.filter((k) =>
      k.nama.toLowerCase().includes(search.toLowerCase()) ||
      k.id.toLowerCase().includes(search.toLowerCase()) ||
      k.departemen.toLowerCase().includes(search.toLowerCase())
    ), [karyawan, search]);

  const absensiIndex = useMemo(() => {
    const idx = {};
    absensi.forEach((a) => {
      if (!idx[a.tanggal]) idx[a.tanggal] = {};
      idx[a.tanggal][a.karyawanId] = a;
    });
    return idx;
  }, [absensi]);

  const getRecord = (karyawanId, day) =>
    absensiIndex[format(day, 'yyyy-MM-dd')]?.[karyawanId] ?? null;

  const prevMonth = () => {
    const d = parse(activeMonth, 'yyyy-MM', new Date());
    d.setMonth(d.getMonth() - 1);
    setActiveMonth(format(d, 'yyyy-MM'));
  };
  const nextMonth = () => {
    const d = parse(activeMonth, 'yyyy-MM', new Date());
    d.setMonth(d.getMonth() + 1);
    setActiveMonth(format(d, 'yyyy-MM'));
  };

  const generateSemua = () => {
    setConfirmDialog({
      isOpen: true,
      title: 'Generate Absensi Bulanan',
      message: 'Apakah Anda yakin ingin men-generate otomatis absensi untuk bulan ini? Data yang kosong akan otomatis diisi status Hadir sesuai shift karyawan.',
      confirmText: 'Generate Sekarang',
      confirmTheme: 'primary',
      onConfirm: () => {
        days.forEach((day) => {
          const dow = getDay(day);
          const tgl = format(day, 'yyyy-MM-dd');
          if (dow === 0 || dow === 6 || isHariLibur(tgl)) return;
          karyawan.forEach((k) => {
            if (!absensiIndex[tgl]?.[k.id]) {
              const shift = k.shift || 'Pagi';
              let jamMasuk = '08:00';
              let jamKeluar = '17:00';
              if (shift === 'Siang') { jamMasuk = '16:00'; jamKeluar = '00:00'; }
              if (shift === 'Malam') { jamMasuk = '00:00'; jamKeluar = '08:00'; }
              tambahAbsensi({ karyawanId: k.id, nama: k.nama, jabatan: k.jabatan, departemen: k.departemen, tanggal: tgl, jamMasuk, jamKeluar, status: 'Hadir', keterangan: '', shift });
            }
          });
        });
      }
    });
  };


  const handleKosongkan = () => {
    setConfirmDialog({
      isOpen: true,
      title: 'Kosongkan Absensi',
      message: 'Apakah Anda yakin ingin mengosongkan semua data absensi di bulan ini? Aksi ini tidak dapat dibatalkan.',
      confirmText: 'Ya, Kosongkan',
      confirmTheme: 'danger',
      onConfirm: () => kosongkanAbsensiBulan(activeMonth)
    });
  };

  const openModal = (k, day) => {
    const tgl = format(day, 'yyyy-MM-dd');
    const existing = absensiIndex[tgl]?.[k.id] ?? null;
    setModalData({ tanggal: tgl, karyawan: k, existing });
    setModalOpen(true);
  };

  const handleSave = (data) => {
    if (modalData.existing) { updateAbsensi(modalData.existing.id, data); }
    else { tambahAbsensi({ ...data, tanggal: modalData.tanggal }); }
    setModalOpen(false);
  };

  const ringkasan = useMemo(() => {
    const counts = { Hadir: 0, Sakit: 0, Izin: 0, Cuti: 0, Alpha: 0 };
    days.forEach((day) => {
      const tgl = format(day, 'yyyy-MM-dd');
      Object.values(absensiIndex[tgl] ?? {}).forEach((a) => {
        if (counts[a.status] !== undefined) counts[a.status]++;
      });
    });
    return counts;
  }, [absensiIndex, days]);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Laporan Harian</h2>
          <p className="text-sm text-gray-500">Rekap kehadiran karyawan — kalender bulanan</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleKosongkan} className="btn-danger">
            <Trash2 className="w-4 h-4" /> Kosongkan Bulan Ini
          </button>
          <button onClick={generateSemua} className="btn-secondary">
            <CalendarDays className="w-4 h-4" /> Generate Bulan Ini
          </button>
          <button
            onClick={() => { setModalData({ tanggal: format(new Date(), 'yyyy-MM-dd'), karyawan: null, existing: null }); setModalOpen(true); }}
            className="btn-primary"
          >
            <Plus className="w-4 h-4" /> Tambah Absensi
          </button>
        </div>
      </div>

      {/* Kontrol bulan + search + ringkasan */}
      <div className="card">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-gray-100 transition">
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <span className="text-base font-bold text-gray-900 w-40 text-center">
              {format(parse(activeMonth, 'yyyy-MM', new Date()), 'MMMM yyyy', { locale: localeId })}
            </span>
            <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-gray-100 transition">
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari karyawan..."
              className="input-field pl-9 py-2"
            />
          </div>

          <div className="flex flex-wrap gap-3 sm:ml-auto">
            {Object.entries(ringkasan).map(([status, count]) => {
              const cfg = STATUS_CFG[status];
              return (
                <div key={status} className="flex items-center gap-1.5">
                  <span className={`w-5 h-5 rounded flex items-center justify-center text-xs font-bold ${cfg.bg} ${cfg.text}`}>
                    {cfg.symbol}
                  </span>
                  <span className="text-sm font-medium text-gray-700">{count}</span>
                  <span className="text-xs text-gray-400">{status}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Legenda */}
      <div className="flex flex-wrap gap-3 px-1">
        {Object.entries(STATUS_CFG).map(([status, cfg]) => (
          <div key={status} className="flex items-center gap-1.5 text-xs text-gray-600">
            <span className={`w-5 h-5 rounded flex items-center justify-center font-bold ${cfg.bg} ${cfg.text}`}>{cfg.symbol}</span>
            {status}
          </div>
        ))}
        <div className="flex items-center gap-1.5 text-xs text-gray-600">
          <span className="w-5 h-5 rounded flex items-center justify-center bg-red-100 text-red-300 font-bold">—</span>
          Libur
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-600">
          <span className="w-5 h-5 rounded flex items-center justify-center border border-dashed border-gray-300 text-gray-300">·</span>
          Belum diisi
        </div>
      </div>

      {/* Tabel Kalender */}
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="border-collapse w-full" style={{ minWidth: `${200 + days.length * 38}px` }}>
            <thead>
              <tr>
                <th
                  className="sticky left-0 z-20 bg-gray-50 border-b border-r border-gray-200 px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide"
                  style={{ minWidth: '200px', width: '200px' }}
                >
                  Karyawan
                </th>
                {days.map((day) => {
                  const dow = getDay(day);
                  const isWeekend = dow === 0 || dow === 6;
                  const tgl = format(day, 'yyyy-MM-dd');
                  const liburInfo = getInfoLibur(tgl);
                  const isLibur = isWeekend || !!liburInfo;
                  const isTodayDay = isToday(day);
                  const liburLabel = liburInfo ? liburInfo.nama : (isWeekend ? (dow === 0 ? 'Minggu' : 'Sabtu') : '');
                  return (
                    <th
                      key={day.toISOString()}
                      className={`border-b border-r border-gray-200 text-center py-1.5 select-none ${isLibur ? 'bg-red-50' : 'bg-gray-50'}`}
                      style={{ minWidth: '36px', width: '36px' }}
                      title={liburLabel}
                    >
                      <div className={`text-xs font-medium ${isLibur ? 'text-red-400' : 'text-gray-500'}`}>{DAY_SHORT[dow]}</div>
                      <div className={`text-sm font-bold leading-tight
                        ${isTodayDay
                          ? 'w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center mx-auto'
                          : isLibur ? 'text-red-500' : 'text-gray-800'}`}>
                        {getDate(day)}
                      </div>
                      {liburInfo && (
                        <div className="w-1.5 h-1.5 rounded-full bg-red-400 mx-auto mt-0.5" title={liburInfo.nama} />
                      )}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {filteredKaryawan.length === 0 ? (
                <tr>
                  <td colSpan={days.length + 1} className="text-center py-12 text-gray-400 text-sm">
                    Tidak ada karyawan ditemukan
                  </td>
                </tr>
              ) : (
                filteredKaryawan.map((k, rowIdx) => (
                  <tr key={k.id} className={rowIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                    <td
                      className={`sticky left-0 z-10 border-b border-r border-gray-100 px-4 py-2.5 ${rowIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                      style={{ minWidth: '200px', width: '200px' }}
                    >
                      <p className="text-sm font-semibold text-gray-900 truncate">{k.nama}</p>
                      <p className="text-xs text-gray-400 truncate">{k.id} · {k.jabatan}</p>
                    </td>
                    {days.map((day) => {
                      const dow = getDay(day);
                      const isWeekend = dow === 0 || dow === 6;
                      const tgl = format(day, 'yyyy-MM-dd');
                      const liburInfo = getInfoLibur(tgl);
                      const isLibur = isWeekend || !!liburInfo;
                      const record = getRecord(k.id, day);
                      const cfg = record ? STATUS_CFG[record.status] : null;
                      const isTodayDay = isToday(day);
                      const liburLabel = liburInfo ? liburInfo.nama : (dow === 0 ? 'Minggu' : 'Sabtu');
                      return (
                        <td
                          key={day.toISOString()}
                          className={`border-b border-r border-gray-100 p-1 text-center ${isLibur ? 'bg-red-50' : ''}`}
                          style={{ minWidth: '36px', width: '36px' }}
                        >
                          {isLibur ? (
                            <div
                              className="w-6 h-6 mx-auto rounded flex items-center justify-center bg-red-100"
                              title={liburLabel}
                            >
                              <span className="text-red-300 text-xs font-bold">—</span>
                            </div>
                          ) : (
                            <button
                              onClick={() => openModal(k, day)}
                              title={record ? `${record.status}${record.keterangan ? ': ' + record.keterangan : ''}` : 'Klik untuk isi absensi'}
                              className={`w-6 h-6 mx-auto rounded flex items-center justify-center transition-all
                                hover:ring-2 hover:ring-blue-400 hover:ring-offset-1 focus:outline-none
                                ${isTodayDay ? 'ring-1 ring-blue-300' : ''}
                                ${cfg ? `${cfg.bg} ${cfg.text}` : 'border border-dashed border-gray-300 text-gray-300 hover:border-blue-400'}`}
                            >
                              {cfg
                                ? <span className="text-xs font-bold">{cfg.symbol}</span>
                                : <span className="text-xs">·</span>}
                            </button>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && (
        <ModalAbsensi
          onClose={() => setModalOpen(false)}
          onSave={handleSave}
          initialData={modalData?.existing}
          tanggal={modalData?.tanggal}
          preselectedKaryawan={modalData?.karyawan}
        />
      )}

      <ModalConfirm
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmText={confirmDialog.confirmText}
        confirmTheme={confirmDialog.confirmTheme}
      />
    </div>
  );
}
