import apiClient from '../../../api/axios';
import { AreaTicket, TicketCatalogItem, TicketUsuario, Valoracion } from './ticketsService';
import {
  MaterialResubmissionInput,
  ValoracionPendienteFilters,
} from '../types/valuation';

export interface ValoracionPendiente extends Valoracion {
  ticket: {
    id: number;
    folio: string;
    titulo: string;
    descripcion_desperfecto: string;
    ubicacion: string;
    fotografia_inicial_url?: string | null;
    estado?: TicketCatalogItem | null;
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
  async getPendientes(filters: ValoracionPendienteFilters = {}): Promise<ValoracionPendiente[]> {
    const response = await apiClient.get('/valoraciones/pendientes', {
      params: {
        search: filters.search || undefined,
        area_id: filters.area_id || undefined,
        sort: filters.sort || 'fecha_desc',
      },
    });
    return response.data.data;
  },

  async getDetalle(id: number): Promise<ValoracionPendiente> {
    const response = await apiClient.get(`/valoraciones/${id}`);
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

  async reenviar(
    id: number,
    data: { observaciones: string; materiales: MaterialResubmissionInput[] }
  ): Promise<MiValoracion> {
    const response = await apiClient.put(`/valoraciones/${id}/reenviar`, data);
    return response.data.data;
  },
};

export default valoracionesService;
