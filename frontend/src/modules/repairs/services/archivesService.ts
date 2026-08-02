import apiClient from '../../../api/axios';
import { RepairEvidence } from './repairsService';

export interface RepairArchive {
  id: number;
  titulo: string;
  descripcion_final: string;
  fecha_generacion: string;
  ticket: { id: number; folio: string; titulo: string; ubicacion: string; area?: string; sede?: string };
  generado_por?: { id: number; name: string };
  reparacion?: {
    id: number;
    estado_inicial: string;
    proceso_reparacion: string;
    estado_final: string;
    fecha_inicio: string;
    fecha_reparacion: string;
    evidencias: RepairEvidence[];
  };
}

const archivesService = {
  async getAll(search = ''): Promise<RepairArchive[]> {
    const response = await apiClient.get('/bitacoras-reparacion', { params: { search: search || undefined } });
    return response.data.data;
  },

  async downloadReport(ticketId: number, folio: string): Promise<void> {
    const response = await apiClient.get(`/tickets/${ticketId}/reporte-reparacion`, { responseType: 'blob' });
    const url = URL.createObjectURL(response.data);
    const link = document.createElement('a');
    link.href = url;
    link.download = `reporte-${folio}.pdf`;
    link.click();
    URL.revokeObjectURL(url);
  },
};

export default archivesService;
