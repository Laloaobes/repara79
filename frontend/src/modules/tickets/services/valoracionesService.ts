import apiClient from '../../../api/axios';
import { AreaTicket, TicketCatalogItem, TicketUsuario, Valoracion } from './ticketsService';

export interface ValoracionPendiente extends Valoracion {
  ticket: {
    id: number;
    titulo: string;
    ubicacion: string;
    area?: AreaTicket | null;
    usuario?: TicketUsuario | null;
  };
}

export interface MiValoracion extends Valoracion {
  ticket: {
    id: number;
    titulo: string;
    estado?: TicketCatalogItem | null;
  };
}

const valoracionesService = {
  async getPendientes(): Promise<ValoracionPendiente[]> {
    const response = await apiClient.get('/valoraciones/pendientes');
    return response.data.data;
  },

  async getMisValoraciones(): Promise<MiValoracion[]> {
    const response = await apiClient.get('/valoraciones/mis-valoraciones');
    return response.data.data;
  },

  async autorizar(id: number): Promise<ValoracionPendiente> {
    const response = await apiClient.post(`/valoraciones/${id}/autorizar`);
    return response.data.data;
  },

  async rechazar(id: number, motivoRechazo: string): Promise<ValoracionPendiente> {
    const response = await apiClient.post(`/valoraciones/${id}/rechazar`, { motivo_rechazo: motivoRechazo });
    return response.data.data;
  },
};

export default valoracionesService;
