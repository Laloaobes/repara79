import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from '../src/modules/tickets/auth/pages/LoginPage';

const DashboardTemporal = () => (
  <div className="flex items-center justify-center h-screen bg-slate-50 text-2xl font-bold text-slate-800">
    Bienvenido al Dashboard
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta pública: Nuestro nuevo Login/Registro */}
        <Route path="/login" element={<LoginPage />} />

        {/* Ruta privada (temporal): Aquí irá el Dashboard real más adelante */}
        <Route path="/" element={<DashboardTemporal />} />

        {/* Redirección de seguridad: Si alguien entra a una URL que no existe, lo manda al login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
