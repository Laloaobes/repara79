import apiClient from '../../../api/axios';

export interface MaterialInput {
  nombre: string;
  cantidad: number;
  precio_unitario: number;
}

export interface Material extends MaterialInput {
  id: number;
  valoracion_id: number;
  subtotal: number;
}

export interface Valoracion {
  id: number;
  ticket_id: number;
  tecnico_id: number;
  tiempo_estimado: number;
  costo_total: number;
  observaciones: string | null;
  materiales: Material[];
}

export interface ValoracionPayload {
  tiempo_estimado: number;
  observaciones?: string;
  materiales: MaterialInput[];
}

const valoracionService = {
  getByTicket: async (ticketId: number): Promise<Valoracion | null> => {
    try {
      const response = await apiClient.get(`/tickets/${ticketId}/valoracion`);
      return response.data;
    } catch (err: unknown) {
      const e = err as { response?: { status?: number } };
      if (e?.response?.status === 404) return null;
      throw err;
    }
  },

  save: async (ticketId: number, data: ValoracionPayload): Promise<Valoracion> => {
    const response = await apiClient.post(`/tickets/${ticketId}/valoracion`, data);
    return response.data;
  },
};

export default valoracionService;
