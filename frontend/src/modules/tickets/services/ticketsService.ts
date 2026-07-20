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

export interface ValoracionTecnico {
  id: number;
  name: string;
}

export interface MaterialItem {
  descripcion: string;
  costo: number;
}

export interface Valoracion {
  id: number;
  ticket_id: number;
  materiales?: MaterialItem[] | null;
  costo_estimado?: string | number | null;
  estado: string;
  observaciones: string;
  motivo_rechazo?: string | null;
  tecnico?: ValoracionTecnico | null;
  created_at: string;
}

export interface TicketUsuario {
  id: number;
  name: string;
  email?: string;
}

export interface Ticket {
  id: number;
  titulo: string;
  descripcion_desperfecto: string;
  ubicacion: string;
  fotografia_inicial?: string | null;
  fotografia_inicial_url?: string | null;
  created_at: string;
  area?: AreaTicket | null;
  tipo_desperfecto?: TicketCatalogItem | null;
  estado?: TicketCatalogItem | null;
  prioridad?: PrioridadTicket | null;
  usuario?: TicketUsuario | null;
  valoracion?: Valoracion | null;
}

export interface CreateValoracionPayload {
  ticket_id: number;
  materiales?: MaterialItem[];
  observaciones: string;
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
  fotografia_inicial?: File | null;
}

const ticketsService = {
  async getMyTickets(): Promise<Ticket[]> {
    const response = await apiClient.get('/tickets');
    return response.data.data;
  },

  async createTicket(data: CreateTicketPayload | FormData): Promise<Ticket> {
    const response = await apiClient.post('/tickets', data, data instanceof FormData
      ? { headers: { 'Content-Type': 'multipart/form-data' } }
      : undefined);
    return response.data.data;
  },

  async getCatalogs(): Promise<TicketCatalogs> {
    const response = await apiClient.get('/ticket-catalogs');
    return response.data;
  },

  async getTicketById(id: number): Promise<Ticket> {
    const response = await apiClient.get(`/tickets/${id}`);
    return response.data.data;
  },

  async createValoracion(data: CreateValoracionPayload): Promise<Valoracion> {
    const response = await apiClient.post('/valoraciones', data);
    return response.data.data;
  },
};

export default ticketsService;
