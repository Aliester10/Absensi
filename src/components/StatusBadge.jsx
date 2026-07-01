import React from 'react';

const statusConfig = {
  Hadir:  { cls: 'badge-hadir', label: 'Hadir' },
  Izin:   { cls: 'badge-izin',  label: 'Izin' },
  Sakit:  { cls: 'badge-sakit', label: 'Sakit' },
  Cuti:   { cls: 'badge-cuti',  label: 'Cuti' },
  Alpha:  { cls: 'badge-alpha', label: 'Alpha' },
  Pending:   { cls: 'badge-izin',  label: 'Pending' },
  Disetujui: { cls: 'badge-hadir', label: 'Disetujui' },
  Ditolak:   { cls: 'badge-sakit', label: 'Ditolak' },
};

export default function StatusBadge({ status }) {
  const cfg = statusConfig[status] || { cls: 'badge-alpha', label: status };
  return <span className={cfg.cls}>{cfg.label}</span>;
}
