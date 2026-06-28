import apiClient from '../../../api/axios';

type EstadoTicket = 'pendiente' | 'valorado' | 'autorizado' | 'rechazado' | 'reparado';
type PrioridadTicket = 'baja' | 'media' | 'alta' | 'critica';

interface Ticket {
  id: number;
  folio: string;
  zona_id: number;
  zona?: { id: number; nombre: string };
  creado_por: number;
  creador?: { id: number; name: string };
  asignado_a: number | null;
  tecnico?: { id: number; name: string } | null;
  categoria: string;
  ubicacion_exacta: string;
  descripcion: string;
  prioridad: PrioridadTicket;
  estado: EstadoTicket;
  motivo_rechazo: string | null;
  evidencias?: Array<{ id: number; ruta_archivo: string; nombre_archivo: string }>;
  valoracion?: {
    id: number;
    tiempo_estimado: number;
    costo_total: number;
    observaciones: string | null;
    materiales?: Array<{ nombre: string; cantidad: number; precio_unitario: number; subtotal: number }>;
  } | null;
  created_at: string;
  updated_at: string;
}

interface PaginatedTickets {
  data: Ticket[];
  total: number;
  per_page: number;
  current_page: number;
  last_page: number;
}

interface TicketFilters {
  estado?: string;
  buscar?: string;
  zona_id?: number;
  prioridad?: string;
  page?: number;
}

const ticketService = {
  getAll: async (filters: TicketFilters = {}): Promise<PaginatedTickets> => {
    const params = new URLSearchParams();
    if (filters.estado && filters.estado !== 'todos') params.append('estado', filters.estado);
    if (filters.buscar) params.append('buscar', filters.buscar);
    if (filters.zona_id) params.append('zona_id', String(filters.zona_id));
    if (filters.prioridad) params.append('prioridad', filters.prioridad);
    if (filters.page) params.append('page', String(filters.page));
    const response = await apiClient.get(`/tickets?${params.toString()}`);
    return response.data;
  },

  getById: async (id: number): Promise<Ticket> => {
    const response = await apiClient.get(`/tickets/${id}`);
    return response.data;
  },

  create: async (formData: FormData): Promise<Ticket> => {
    const response = await apiClient.post('/tickets', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  asignar: async (id: number, tecnicoId: number): Promise<Ticket> => {
    const response = await apiClient.post(`/tickets/${id}/asignar`, { tecnico_id: tecnicoId });
    return response.data;
  },

  autorizar: async (id: number, comentario?: string): Promise<Ticket> => {
    const response = await apiClient.post(`/tickets/${id}/autorizar`, { comentario });
    return response.data;
  },

  rechazar: async (id: number, motivo: string): Promise<Ticket> => {
    const response = await apiClient.post(`/tickets/${id}/rechazar`, { motivo });
    return response.data;
  },

  marcarReparado: async (id: number, comentario?: string): Promise<Ticket> => {
    const response = await apiClient.post(`/tickets/${id}/marcar-reparado`, { comentario });
    return response.data;
  },

  getTecnicos: async (): Promise<Array<{ id: number; name: string; email: string }>> => {
    const response = await apiClient.get('/tecnicos');
    return response.data;
  },
};

export default ticketService;
export type { Ticket, PaginatedTickets, TicketFilters, EstadoTicket, PrioridadTicket };
