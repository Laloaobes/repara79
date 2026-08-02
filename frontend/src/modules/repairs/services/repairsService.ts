import apiClient from '../../../api/axios';
import { Ticket } from '../../tickets/services/ticketsService';

export interface RepairEvidence {
  id: number;
  tipo: 'inicial' | 'durante' | 'final';
  imagen_url: string;
}

export interface Repair {
  id: number;
  ticket_id: number;
  estado_inicial: string;
  proceso_reparacion?: string | null;
  estado_final?: string | null;
  fecha_inicio: string;
  fecha_reparacion?: string | null;
  ticket?: {
    id: number;
    folio: string;
    titulo: string;
    descripcion_desperfecto: string;
    ubicacion: string;
    estado: string;
    area?: string | null;
  };
  evidencias: RepairEvidence[];
  archived: boolean;
  report_available: boolean;
}

export interface RepairTray {
  disponibles: Ticket[];
  en_curso: Repair[];
}

export interface FinishRepairPayload {
  proceso_reparacion: string;
  estado_final: string;
  evidencia_inicial: File;
  evidencia_durante: File;
  evidencia_final: File;
}

const repairsService = {
  async getTray(): Promise<RepairTray> {
    const response = await apiClient.get('/reparaciones');
    return response.data.data;
  },

  async start(ticketId: number, estadoInicial: string): Promise<Repair> {
    const response = await apiClient.post(`/tickets/${ticketId}/reparacion`, {
      estado_inicial: estadoInicial,
    });
    return response.data.data;
  },

  async finish(repairId: number, payload: FinishRepairPayload): Promise<Repair> {
    const body = new FormData();
    body.append('proceso_reparacion', payload.proceso_reparacion);
    body.append('estado_final', payload.estado_final);
    body.append('evidencia_inicial', payload.evidencia_inicial);
    body.append('evidencia_durante', payload.evidencia_durante);
    body.append('evidencia_final', payload.evidencia_final);

    const response = await apiClient.post(`/reparaciones/${repairId}/finalizar`, body, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data;
  },
};

export default repairsService;
