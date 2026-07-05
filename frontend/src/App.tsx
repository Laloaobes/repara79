import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './modules/auth/pages/LoginPage';
import MainLayout from './layouts/MainLayout';
import DashboardPage from './modules/dashboard/pages/DashboardPage';
import TicketsPage from './modules/tickets/pages/TicketsPage';
import TicketDetailPage from './modules/tickets/pages/TicketDetailPage';
import AjustesPage from './modules/settings/pages/AjustesPage';
import ProtectedRoute from './modules/auth/components/ProtectedRoute';
import { AuthProvider } from './modules/auth/context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Ruta pública */}
          <Route path="/login" element={<LoginPage />} />

          {/* Rutas protegidas con layout */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<MainLayout />}>
              <Route index element={<DashboardPage />} />
              <Route path="tickets" element={<TicketsPage />} />
              <Route path="tickets/:id" element={<TicketDetailPage />} />
              <Route path="ajustes" element={<AjustesPage />} />
            </Route>
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
