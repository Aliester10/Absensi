import React, { createContext, useContext, useState, useEffect } from 'react';
import { initialKaryawan, initialShifts } from '../data/initialData';
import { format } from 'date-fns';

const AppContext = createContext();

// Hari libur nasional default Indonesia 2026
const defaultHariLibur = [
  { id: 'HL-001', tanggal: '2026-01-01', nama: 'Tahun Baru Masehi',           tipe: 'Nasional' },
  { id: 'HL-002', tanggal: '2026-01-27', nama: 'Isra Miraj',                  tipe: 'Nasional' },
  { id: 'HL-003', tanggal: '2026-02-17', nama: 'Tahun Baru Imlek',            tipe: 'Nasional' },
  { id: 'HL-004', tanggal: '2026-03-22', nama: 'Hari Raya Nyepi',             tipe: 'Nasional' },
  { id: 'HL-005', tanggal: '2026-03-20', nama: 'Idul Fitri 1447 H (Hari 1)', tipe: 'Nasional' },
  { id: 'HL-006', tanggal: '2026-03-21', nama: 'Idul Fitri 1447 H (Hari 2)', tipe: 'Nasional' },
  { id: 'HL-007', tanggal: '2026-04-03', nama: 'Wafat Isa Al-Masih',          tipe: 'Nasional' },
  { id: 'HL-008', tanggal: '2026-05-01', nama: 'Hari Buruh Internasional',    tipe: 'Nasional' },
  { id: 'HL-009', tanggal: '2026-05-14', nama: 'Kenaikan Isa Al-Masih',       tipe: 'Nasional' },
  { id: 'HL-010', tanggal: '2026-05-24', nama: 'Hari Raya Waisak',            tipe: 'Nasional' },
  { id: 'HL-011', tanggal: '2026-06-01', nama: 'Hari Lahir Pancasila',        tipe: 'Nasional' },
  { id: 'HL-012', tanggal: '2026-05-27', nama: 'Idul Adha 1447 H',            tipe: 'Nasional' },
  { id: 'HL-013', tanggal: '2026-06-17', nama: 'Tahun Baru Islam 1448 H',     tipe: 'Nasional' },
  { id: 'HL-014', tanggal: '2026-08-17', nama: 'Hari Kemerdekaan RI',         tipe: 'Nasional' },
  { id: 'HL-015', tanggal: '2026-08-26', nama: 'Maulid Nabi Muhammad SAW',    tipe: 'Nasional' },
  { id: 'HL-016', tanggal: '2026-12-25', nama: 'Hari Raya Natal',             tipe: 'Nasional' },
];

export function AppProvider({ children }) {
  const [karyawan, setKaryawan] = useState(() => {
    const saved = localStorage.getItem('karyawan');
    return saved ? JSON.parse(saved) : initialKaryawan;
  });

  const [absensi, setAbsensi] = useState(() => {
    const saved = localStorage.getItem('absensi');
    return saved ? JSON.parse(saved) : [];
  });

  const [hariLibur, setHariLibur] = useState(() => {
    const saved = localStorage.getItem('hariLibur');
    return saved ? JSON.parse(saved) : defaultHariLibur;
  });

  const [shifts, setShifts] = useState(() => {
    const saved = localStorage.getItem('shifts');
    return saved ? JSON.parse(saved) : initialShifts;
  });

  useEffect(() => { localStorage.setItem('karyawan', JSON.stringify(karyawan)); }, [karyawan]);
  useEffect(() => { localStorage.setItem('absensi', JSON.stringify(absensi)); }, [absensi]);
  useEffect(() => { localStorage.setItem('hariLibur', JSON.stringify(hariLibur)); }, [hariLibur]);
  useEffect(() => { localStorage.setItem('shifts', JSON.stringify(shifts)); }, [shifts]);

  // Karyawan CRUD
  const tambahKaryawan = (data) => {
    const newId = `KRY-${String(karyawan.length + 1).padStart(3, '0')}`;
    const newKaryawan = { ...data, id: newId, status: 'Aktif' };
    setKaryawan((prev) => [...prev, newKaryawan]);
    return newKaryawan;
  };
  const updateKaryawan = (id, data) => {
    setKaryawan((prev) => prev.map((k) => (k.id === id ? { ...k, ...data } : k)));
  };
  const hapusKaryawan = (id) => {
    setKaryawan((prev) => prev.filter((k) => k.id !== id));
  };

  // Absensi
  const tambahAbsensi = (data) => {
    const id = `ABS-${Date.now()}`;
    const newAbsensi = { ...data, id };
    setAbsensi((prev) => [...prev, newAbsensi]);
    return newAbsensi;
  };
  const updateAbsensi = (id, data) => {
    setAbsensi((prev) => prev.map((a) => (a.id === id ? { ...a, ...data } : a)));
  };
  const getAbsensiHarian = (tanggal) => absensi.filter((a) => a.tanggal === tanggal);
  const kosongkanAbsensiBulan = (bulanPrefix) => {
    setAbsensi((prev) => prev.filter((a) => !a.tanggal.startsWith(bulanPrefix)));
  };

  // Shift CRUD
  const tambahShift = (data) => {
    const id = `SFT-${Date.now()}`;
    const newShift = { ...data, id };
    setShifts((prev) => [...prev, newShift]);
    return newShift;
  };
  const updateShift = (id, data) => {
    setShifts((prev) => prev.map((s) => (s.id === id ? { ...s, ...data } : s)));
  };
  const hapusShift = (id) => {
    setShifts((prev) => prev.filter((s) => s.id !== id));
  };

  // Hari Libur CRUD
  const tambahHariLibur = (data) => {
    const id = `HL-${Date.now()}`;
    const newHL = { ...data, id };
    setHariLibur((prev) => [...prev, newHL]);
    return newHL;
  };
  const updateHariLibur = (id, data) => {
    setHariLibur((prev) => prev.map((h) => (h.id === id ? { ...h, ...data } : h)));
  };
  const hapusHariLibur = (id) => {
    setHariLibur((prev) => prev.filter((h) => h.id !== id));
  };
  // Set berisi tanggal libur untuk lookup O(1)
  const setTanggalLibur = new Set(hariLibur.map((h) => h.tanggal));
  const isHariLibur = (tanggalStr) => setTanggalLibur.has(tanggalStr);
  const getInfoLibur = (tanggalStr) => hariLibur.find((h) => h.tanggal === tanggalStr) ?? null;

  return (
    <AppContext.Provider value={{
      karyawan, tambahKaryawan, updateKaryawan, hapusKaryawan,
      absensi, tambahAbsensi, updateAbsensi, getAbsensiHarian, kosongkanAbsensiBulan,
      shifts, tambahShift, updateShift, hapusShift,
      hariLibur, tambahHariLibur, updateHariLibur, hapusHariLibur,
      isHariLibur, getInfoLibur,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}

