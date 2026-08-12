import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './modules/auth/pages/LoginPage';
import UnauthorizedPage from './modules/auth/pages/UnauthorizedPage';
import MainLayout from './layouts/MainLayout';
import DashboardPage from './modules/dashboard/pages/DashboardPage';
import TicketsPage from './modules/tickets/pages/TicketsPage';
import TicketDetailPage from './modules/tickets/pages/TicketDetailPage';
import MisValoracionesPage from './modules/tickets/pages/MisValoracionesPage';
import PendingValuationTicketsPage from './modules/tickets/pages/PendingValuationTicketsPage';
import ValoracionesPorAprobarPage from './modules/tickets/pages/ValoracionesPorAprobarPage';
import GestionUsuariosPage from './modules/users/pages/GestionUsuariosPage';
import AjustesPage from './modules/settings/pages/AjustesPage';
import ProtectedRoute from './modules/auth/components/ProtectedRoute';
import { AuthProvider } from './modules/auth/context/AuthContext';
import { ROLES } from './constants/roles';
import RepairsPage from './modules/repairs/pages/RepairsPage';
import RepairArchivePage from './modules/repairs/pages/RepairArchivePage';
import RepairArchiveDetailPage from './modules/repairs/pages/RepairArchiveDetailPage';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Ruta pública */}
          <Route path="/login" element={<LoginPage />} />

          {/* Rutas protegidas: solo exigen sesión iniciada */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<MainLayout />}>
              {/* Comunes a los 4 roles */}
              <Route index element={<DashboardPage />} />
              <Route path="ajustes" element={<AjustesPage />} />
              <Route path="no-autorizado" element={<UnauthorizedPage />} />

              {/* Tickets: el backend ya escala la data por rol (propios vs. todos) */}
              <Route path="tickets" element={<TicketsPage />} />
              <Route path="tickets/:id" element={<TicketDetailPage />} />

              {/* Exclusivas de "Personal de Mantenimiento" */}
              <Route element={<ProtectedRoute allowedRoles={[ROLES.PERSONAL_MANTENIMIENTO]} />}>
                <Route path="tickets-por-valorar" element={<PendingValuationTicketsPage />} />
                <Route path="mis-valoraciones" element={<MisValoracionesPage />} />
                <Route path="reparaciones" element={<RepairsPage />} />
              </Route>

              <Route element={<ProtectedRoute allowedRoles={[ROLES.PERSONAL_MANTENIMIENTO, ROLES.SUBDIRECTOR_ADMINISTRATIVO, ROLES.RESPONSABLE_DEL_LUGAR]} />}>
                <Route path="archivero-reparaciones" element={<RepairArchivePage />} />
                <Route path="archivero-reparaciones/:id" element={<RepairArchiveDetailPage />} />
              </Route>

              {/* Exclusivas de "Subdirector Administrativo" */}
              <Route element={<ProtectedRoute allowedRoles={[ROLES.SUBDIRECTOR_ADMINISTRATIVO]} />}>
                <Route path="valoraciones-por-aprobar" element={<ValoracionesPorAprobarPage />} />
                <Route path="usuarios" element={<GestionUsuariosPage />} />
              </Route>
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
