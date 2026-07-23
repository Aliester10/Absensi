import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AppProvider } from './context/AppContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import LaporanHarian from './pages/LaporanHarian';
import HariLibur from './pages/HariLibur';
import DataKaryawan from './pages/DataKaryawan';
import DataShift from './pages/DataShift';

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="laporan-harian" element={<LaporanHarian />} />
            <Route path="shift" element={<DataShift />} />
            <Route path="hari-libur" element={<HariLibur />} />
            <Route path="karyawan" element={<DataKaryawan />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}
