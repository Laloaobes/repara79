import apiClient from '../../../api/axios';

export interface HistorialTicket {
  id: number;
  folio: string;
  categoria: string;
  ubicacion_exacta: string;
  descripcion: string;
  zona: { id: number; nombre: string } | null;
  creador: { id: number; name: string } | null;
  tecnico: { id: number; name: string } | null;
  valoracion: {
    id: number;
    tiempo_estimado: number;
    costo_total: number;
    observaciones: string | null;
    materiales: Array<{ nombre: string; cantidad: number; precio_unitario: number; subtotal: number }>;
  } | null;
  historial: Array<{
    id: number;
    estado_anterior: string | null;
    estado_nuevo: string;
    comentario: string | null;
    created_at: string;
    usuario: { id: number; name: string } | null;
  }>;
  created_at: string;
  updated_at: string;
}

export interface PaginatedHistorial {
  data: HistorialTicket[];
  total: number;
  per_page: number;
  current_page: number;
  last_page: number;
}

export interface HistorialFilters {
  folio?: string;
  zona_id?: number;
  fecha_inicio?: string;
  fecha_fin?: string;
  page?: number;
}

const historialService = {
  getAll: async (filters: HistorialFilters = {}): Promise<PaginatedHistorial> => {
    const params = new URLSearchParams();
    if (filters.folio) params.append('folio', filters.folio);
    if (filters.zona_id) params.append('zona_id', String(filters.zona_id));
    if (filters.fecha_inicio) params.append('fecha_inicio', filters.fecha_inicio);
    if (filters.fecha_fin) params.append('fecha_fin', filters.fecha_fin);
    if (filters.page) params.append('page', String(filters.page));
    const response = await apiClient.get(`/historial?${params.toString()}`);
    return response.data;
  },

  getById: async (id: number): Promise<HistorialTicket> => {
    const response = await apiClient.get(`/historial/${id}`);
    return response.data;
  },
};

export default historialService;
