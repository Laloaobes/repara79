import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './routes/ProtectedRoute';
import LoginPage from './modules/auth/pages/LoginPage';
import MainLayout from './layouts/MainLayout';
import DashboardPage from './modules/dashboard/pages/DashboardPage';
import TicketsPage from './modules/tickets/pages/TicketsPage';
import UsersPage from './modules/users/pages/UsersPage';
import ZonasPage from './modules/zonas/pages/ZonasPage';
import ValoracionPage from './modules/valoracion/pages/ValoracionPage';
import HistorialPage from './modules/historial/pages/HistorialPage';
import AjustesPage from './modules/settings/pages/AjustesPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="tickets" element={<TicketsPage />} />
            <Route path="historial" element={<HistorialPage />} />
            <Route path="ajustes" element={<AjustesPage />} />

            {/* Solo Administrador */}
            <Route element={<ProtectedRoute roles={['Administrador']} />}>
              <Route path="usuarios" element={<UsersPage />} />
              <Route path="zonas" element={<ZonasPage />} />
            </Route>

            {/* Técnico y Admin */}
            <Route element={<ProtectedRoute roles={['Personal de Mantenimiento', 'Administrador']} />}>
              <Route path="valoracion/:ticketId" element={<ValoracionPage />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
