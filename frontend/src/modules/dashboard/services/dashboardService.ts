import apiClient from '../../../api/axios';

type EstadoTicket = 'pendiente' | 'valorado' | 'autorizado' | 'rechazado' | 'reparado';
type PrioridadTicket = 'baja' | 'media' | 'alta' | 'critica';

export interface DashboardStats {
  total: number;
  pendientes: number;
  valorados: number;
  autorizados: number;
  rechazados: number;
  reparados: number;
  costo_acumulado?: number;
}

export interface TicketReciente {
  id: number;
  folio: string;
  titulo: string;
  desc: string;
  ubicacion: string;
  fecha: string;
  estado: EstadoTicket;
  prioridad: PrioridadTicket;
  tecnico: string;
  zona: string;
}

export interface DashboardData {
  stats: DashboardStats;
  recientes: TicketReciente[];
}

const dashboardService = {
  getDashboardOverview: async (): Promise<DashboardData> => {
    const response = await apiClient.get('/dashboard');
    return response.data;
  },
};

export default dashboardService;
