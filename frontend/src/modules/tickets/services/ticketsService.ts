import apiClient from '../../../api/axios';

export interface TicketCatalogItem {
  id: number;
  nombre: string;
  descripcion?: string | null;
}

export interface PrioridadTicket {
  id_prioridad: number;
  nombre: string;
  color: string;
  descripcion?: string | null;
}

export interface AreaTicket extends TicketCatalogItem {
  ubicacion?: string | null;
  sede?: TicketCatalogItem | null;
}

export interface Ticket {
  id: number;
  titulo: string;
  descripcion_desperfecto: string;
  ubicacion: string;
  created_at: string;
  area?: AreaTicket | null;
  tipo_desperfecto?: TicketCatalogItem | null;
  estado?: TicketCatalogItem | null;
  prioridad?: PrioridadTicket | null;
}

export interface TicketCatalogs {
  sedes: TicketCatalogItem[];
  areas: AreaTicket[];
  tipos_desperfectos: TicketCatalogItem[];
  prioridades: PrioridadTicket[];
}

export interface CreateTicketPayload {
  area_id: number;
  tipo_desperfecto_id: number;
  prioridad_id: number;
  titulo: string;
  descripcion_desperfecto: string;
  ubicacion: string;
  otro_desperfecto?: string;
}

const ticketsService = {
  async getMyTickets(): Promise<Ticket[]> {
    const response = await apiClient.get('/tickets');
    return response.data.data;
  },

  async createTicket(data: CreateTicketPayload): Promise<Ticket> {
    const response = await apiClient.post('/tickets', data);
    return response.data.data;
  },

  async getCatalogs(): Promise<TicketCatalogs> {
    const response = await apiClient.get('/ticket-catalogs');
    return response.data;
  },
};

export default ticketsService;
