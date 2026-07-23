export const initialShifts = [
  { id: 'SFT-001', nama: 'Pagi',   jamMasuk: '08:00', jamKeluar: '17:00' },
  { id: 'SFT-002', nama: 'Siang',  jamMasuk: '16:00', jamKeluar: '00:00' },
  { id: 'SFT-003', nama: 'Malam',  jamMasuk: '00:00', jamKeluar: '08:00' },
];

export const initialKaryawan = [
  {
    id: 'KRY-001',
    nama: 'Ahmad Fauzi',
    jabatan: 'Manager HRD',
    departemen: 'Human Resource',
    email: 'ahmad.fauzi@company.com',
    telepon: '081234567890',
    tanggalMasuk: '2018-03-15',
    status: 'Aktif',
    shift: 'Pagi',
  },
  {
    id: 'KRY-002',
    nama: 'Siti Rahayu',
    jabatan: 'Staff Akuntansi',
    departemen: 'Keuangan',
    email: 'siti.rahayu@company.com',
    telepon: '081234567891',
    tanggalMasuk: '2019-07-01',
    status: 'Aktif',
    shift: 'Pagi',
  },
  {
    id: 'KRY-003',
    nama: 'Budi Santoso',
    jabatan: 'Senior Developer',
    departemen: 'IT',
    email: 'budi.santoso@company.com',
    telepon: '081234567892',
    tanggalMasuk: '2020-01-10',
    status: 'Aktif',
    shift: 'Pagi',
  },
  {
    id: 'KRY-004',
    nama: 'Dewi Lestari',
    jabatan: 'Marketing Executive',
    departemen: 'Marketing',
    email: 'dewi.lestari@company.com',
    telepon: '081234567893',
    tanggalMasuk: '2021-05-20',
    status: 'Aktif',
    shift: 'Pagi',
  },
  {
    id: 'KRY-005',
    nama: 'Rudi Hermawan',
    jabatan: 'Supervisor Produksi',
    departemen: 'Produksi',
    email: 'rudi.hermawan@company.com',
    telepon: '081234567894',
    tanggalMasuk: '2017-09-12',
    status: 'Aktif',
    shift: 'Siang',
  },
  {
    id: 'KRY-006',
    nama: 'Rina Permatasari',
    jabatan: 'Staff IT',
    departemen: 'IT',
    email: 'rina.permatasari@company.com',
    telepon: '081234567895',
    tanggalMasuk: '2022-02-14',
    status: 'Aktif',
    shift: 'Malam',
  },
  {
    id: 'KRY-007',
    nama: 'Hendra Wijaya',
    jabatan: 'Kepala Gudang',
    departemen: 'Logistik',
    email: 'hendra.wijaya@company.com',
    telepon: '081234567896',
    tanggalMasuk: '2016-11-30',
    status: 'Aktif',
    shift: 'Siang',
  },
  {
    id: 'KRY-008',
    nama: 'Yuni Astuti',
    jabatan: 'Resepsionis',
    departemen: 'Umum',
    email: 'yuni.astuti@company.com',
    telepon: '081234567897',
    tanggalMasuk: '2023-01-09',
    status: 'Aktif',
    shift: 'Pagi',
  },
];

export const generateAbsensiHari = (karyawanList, tanggal, shifts = initialShifts) => {
  return karyawanList.map((k) => {
    const shiftData = shifts.find((s) => s.nama === (k.shift || 'Pagi'));
    const jamMasuk  = shiftData ? shiftData.jamMasuk  : '08:00';
    const jamKeluar = shiftData ? shiftData.jamKeluar : '17:00';

    return {
      id: `ABS-${tanggal}-${k.id}`,
      karyawanId: k.id,
      nama: k.nama,
      jabatan: k.jabatan,
      departemen: k.departemen,
      tanggal,
      jamMasuk,
      jamKeluar,
      status: 'Hadir',
      keterangan: '',
      shift: k.shift || 'Pagi',
    };
  });
};
