import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './modules/auth/pages/LoginPage.jsx';
import MainLayout from './layouts/MainLayout.jsx';
import DashboardPage from './modules/dashboard/pages/DashboardPage.jsx';
import TicketsPage from './modules/tickets/pages/TicketsPage.jsx';
import AjustesPage from './modules/settings/pages/AjustesPage.jsx';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta pública */}
        <Route path="/login" element={<LoginPage />} />

        {/* Rutas protegidas con layout */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="tickets" element={<TicketsPage />} />
          <Route path="ajustes" element={<AjustesPage />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
