import apiClient from '../../../api/axios';

export interface Zona {
  id: number;
  nombre: string;
  descripcion: string | null;
  responsable_id: number | null;
  responsable?: { id: number; name: string } | null;
  estatus: boolean;
  tickets_count?: number;
  created_at: string;
}

export interface PaginatedZonas {
  data: Zona[];
  total: number;
  per_page: number;
  current_page: number;
  last_page: number;
}

export interface ZonaFilters {
  buscar?: string;
  page?: number;
}

export interface ZonaPayload {
  nombre: string;
  descripcion?: string;
  responsable_id?: number | null;
  estatus?: boolean;
}

export interface Encargado { id: number; name: string; email: string; }

const zonaService = {
  getAll: async (filters: ZonaFilters = {}): Promise<PaginatedZonas> => {
    const params = new URLSearchParams();
    if (filters.buscar) params.append('buscar', filters.buscar);
    if (filters.page) params.append('page', String(filters.page));
    const response = await apiClient.get(`/zonas?${params.toString()}`);
    return response.data;
  },

  getById: async (id: number): Promise<Zona> => {
    const response = await apiClient.get(`/zonas/${id}`);
    return response.data;
  },

  create: async (data: ZonaPayload): Promise<Zona> => {
    const response = await apiClient.post('/zonas', data);
    return response.data;
  },

  update: async (id: number, data: ZonaPayload): Promise<Zona> => {
    const response = await apiClient.put(`/zonas/${id}`, data);
    return response.data;
  },

  destroy: async (id: number): Promise<void> => {
    await apiClient.delete(`/zonas/${id}`);
  },

  getEncargados: async (): Promise<Encargado[]> => {
    const response = await apiClient.get('/encargados');
    return response.data;
  },
};

export default zonaService;
