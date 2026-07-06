import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  format, parse, startOfMonth, endOfMonth,
  eachDayOfInterval, getDay, getDate, isToday,
} from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import {
  Users, CheckCircle, XCircle, Clock, FileText,
  ChevronLeft, ChevronRight,
} from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import { useNavigate } from 'react-router-dom';

const STATUS_CFG = {
  Hadir: { symbol: '✓', bg: 'bg-green-100',  text: 'text-green-700'  },
  Sakit: { symbol: 'S', bg: 'bg-red-100',    text: 'text-red-600'    },
  Izin:  { symbol: 'I', bg: 'bg-yellow-100', text: 'text-yellow-700' },
  Cuti:  { symbol: 'C', bg: 'bg-blue-100',   text: 'text-blue-600'   },
  Alpha: { symbol: 'A', bg: 'bg-gray-200',   text: 'text-gray-600'   },
};

const DAY_SHORT = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

export default function Dashboard() {
  const { karyawan, absensi, pengajuan, isHariLibur, getInfoLibur } = useApp();
  const navigate = useNavigate();

  const today = format(new Date(), 'yyyy-MM-dd');
  const absensiHari = absensi.filter((a) => a.tanggal === today);

  const countStatus = (s) => absensiHari.filter((a) => a.status === s).length;
  const pendingPengajuan = pengajuan.filter((p) => p.status === 'Pending').length;

  const stats = [
    { label: 'Total Karyawan',    value: karyawan.length,  icon: Users,       iconBg: 'bg-blue-50',   iconColor: 'text-blue-600'   },
    { label: 'Hadir Hari Ini',    value: countStatus('Hadir'), icon: CheckCircle, iconBg: 'bg-green-50',  iconColor: 'text-green-600'  },
    { label: 'Tidak Hadir',       value: countStatus('Sakit') + countStatus('Izin') + countStatus('Cuti') + countStatus('Alpha'), icon: XCircle, iconBg: 'bg-red-50', iconColor: 'text-red-600' },
    { label: 'Pengajuan Pending', value: pendingPengajuan, icon: Clock,       iconBg: 'bg-yellow-50', iconColor: 'text-yellow-600' },
  ];

  const recentPengajuan = [...pengajuan]
    .sort((a, b) => b.createdAt?.localeCompare(a.createdAt))
    .slice(0, 5);

  const [activeMonth, setActiveMonth] = useState(() => format(new Date(), 'yyyy-MM'));

  const days = useMemo(() => {
    const base = parse(activeMonth, 'yyyy-MM', new Date());
    return eachDayOfInterval({ start: startOfMonth(base), end: endOfMonth(base) });
  }, [activeMonth]);

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

  const ringkasanBulan = useMemo(() => {
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
    <div className="space-y-6">
      {/* Judul */}
      <div>
        <h2 className="text-xl font-bold text-gray-900">Dashboard</h2>
        <p className="text-sm text-gray-500 mt-0.5">
          {format(new Date(), 'EEEE, dd MMMM yyyy', { locale: localeId })}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, iconBg, iconColor }) => (
          <div key={label} className="card flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}`}>
              <Icon className={`w-6 h-6 ${iconColor}`} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
              <p className="text-xs text-gray-500 leading-tight">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Kalender Absensi ─────────────────────────────────────────── */}
      <div className="card p-0 overflow-hidden">
        {/* Header kalender */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 bg-gray-50">
          <div className="flex items-center gap-2">
            <button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-gray-200 transition">
              <ChevronLeft className="w-4 h-4 text-gray-600" />
            </button>
            <span className="text-sm font-bold text-gray-800 w-36 text-center">
              {format(parse(activeMonth, 'yyyy-MM', new Date()), 'MMMM yyyy', { locale: localeId })}
            </span>
            <button onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-gray-200 transition">
              <ChevronRight className="w-4 h-4 text-gray-600" />
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-3">
            {Object.entries(ringkasanBulan).map(([status, count]) => {
              const cfg = STATUS_CFG[status];
              return (
                <div key={status} className="flex items-center gap-1">
                  <span className={`w-5 h-5 rounded text-xs font-bold flex items-center justify-center ${cfg.bg} ${cfg.text}`}>
                    {cfg.symbol}
                  </span>
                  <span className="text-xs font-semibold text-gray-600">{count}</span>
                </div>
              );
            })}
          </div>

          <button
            onClick={() => navigate('/laporan-harian')}
            className="text-xs text-blue-600 hover:text-blue-800 font-medium"
          >
            Lihat Lengkap →
          </button>
        </div>

        {/* Grid kalender */}
        <div className="overflow-x-auto">
          <table className="border-collapse w-full" style={{ minWidth: `${180 + days.length * 36}px` }}>
            <thead>
              <tr>
                <th
                  className="sticky left-0 z-20 bg-gray-50 border-b border-r border-gray-200 px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide"
                  style={{ minWidth: '180px', width: '180px' }}
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
                  return (
                    <th
                      key={day.toISOString()}
                      className={`border-b border-r border-gray-200 text-center py-1.5 select-none
                        ${isLibur ? 'bg-red-50' : 'bg-gray-50'}`}
                      style={{ minWidth: '34px', width: '34px' }}
                      title={liburInfo ? liburInfo.nama : undefined}
                    >
                      <div className={`text-xs font-medium leading-none mb-0.5 ${isLibur ? 'text-red-400' : 'text-gray-400'}`}>
                        {DAY_SHORT[dow]}
                      </div>
                      <div className={`text-xs font-bold leading-none
                        ${isTodayDay
                          ? 'w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center mx-auto'
                          : isLibur ? 'text-red-500' : 'text-gray-700'}`}>
                        {getDate(day)}
                      </div>
                      {liburInfo && (
                        <div className="w-1 h-1 rounded-full bg-red-400 mx-auto mt-0.5" />
                      )}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {karyawan.length === 0 ? (
                <tr>
                  <td colSpan={days.length + 1} className="text-center py-10 text-gray-400 text-sm">
                    Belum ada karyawan terdaftar
                  </td>
                </tr>
              ) : (
                karyawan.map((k, rowIdx) => (
                  <tr key={k.id} className={rowIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                    <td
                      className={`sticky left-0 z-10 border-b border-r border-gray-100 px-4 py-2 ${rowIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                      style={{ minWidth: '180px', width: '180px' }}
                    >
                      <p className="text-xs font-semibold text-gray-900 truncate">{k.nama}</p>
                      <p className="text-xs text-gray-400 truncate">{k.jabatan}</p>
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
                      return (
                        <td
                          key={day.toISOString()}
                          className={`border-b border-r border-gray-100 p-0.5 text-center ${isLibur ? 'bg-red-50' : ''}`}
                          style={{ minWidth: '34px', width: '34px' }}
                        >
                          {isLibur ? (
                            <div
                              className="w-5 h-5 mx-auto rounded flex items-center justify-center bg-red-100"
                              title={liburInfo ? liburInfo.nama : (dow === 0 ? 'Minggu' : 'Sabtu')}
                            >
                              <span className="text-red-300 text-xs font-bold leading-none">—</span>
                            </div>
                          ) : (
                            <div
                              title={record ? `${k.nama}: ${record.status}` : `${k.nama}: belum diisi`}
                              className={`w-5 h-5 mx-auto rounded flex items-center justify-center
                                ${isTodayDay && !cfg ? 'ring-1 ring-blue-300' : ''}
                                ${cfg ? `${cfg.bg} ${cfg.text}` : 'border border-dashed border-gray-300'}`}
                            >
                              {cfg
                                ? <span className="text-xs font-bold leading-none">{cfg.symbol}</span>
                                : <span className="text-gray-300 text-xs leading-none">·</span>}
                            </div>
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

        {/* Footer legenda */}
        <div className="flex flex-wrap items-center gap-3 px-5 py-2.5 border-t border-gray-100 bg-gray-50">
          {Object.entries(STATUS_CFG).map(([status, cfg]) => (
            <div key={status} className="flex items-center gap-1 text-xs text-gray-500">
              <span className={`w-4 h-4 rounded flex items-center justify-center font-bold text-xs ${cfg.bg} ${cfg.text}`}>
                {cfg.symbol}
              </span>
              {status}
            </div>
          ))}
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <span className="w-4 h-4 rounded flex items-center justify-center bg-red-100 text-red-300 font-bold text-xs">—</span>
            Libur
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <span className="w-4 h-4 rounded border border-dashed border-gray-300 flex items-center justify-center text-gray-300 text-xs">·</span>
            Belum diisi
          </div>
        </div>
      </div>

      {/* Baris bawah */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Absensi hari ini */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Absensi Hari Ini</h3>
            <span className="text-xs text-gray-500">{absensiHari.length} dari {karyawan.length} tercatat</span>
          </div>
          {absensiHari.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <CheckCircle className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">Belum ada absensi hari ini</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-56 overflow-y-auto">
              {absensiHari.map((a) => (
                <div key={a.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{a.nama}</p>
                    <p className="text-xs text-gray-500">{a.jabatan}</p>
                  </div>
                  <StatusBadge status={a.status} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pengajuan terbaru */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-4 h-4 text-gray-500" />
            <h3 className="font-semibold text-gray-900">Pengajuan Terbaru</h3>
          </div>
          {recentPengajuan.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <FileText className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">Belum ada pengajuan</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-56 overflow-y-auto">
              {recentPengajuan.map((p) => (
                <div key={p.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{p.namakaryawan}</p>
                    <p className="text-xs text-gray-500">{p.jenis} &bull; {p.tanggalMulai}</p>
                  </div>
                  <StatusBadge status={p.status} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
