import apiClient from '../../../api/axios';

export interface TipoUsuario { id: number; nombre: string; }

export interface Usuario {
  id: number;
  name: string;
  email: string;
  telefono: string | null;
  estatus: boolean;
  zona_id: number | null;
  zona?: { id: number; nombre: string } | null;
  tipo_usuario_id: number;
  tipoUsuario: TipoUsuario;
  created_at: string;
}

export interface PaginatedUsuarios {
  data: Usuario[];
  total: number;
  per_page: number;
  current_page: number;
  last_page: number;
}

export interface UsuarioFilters {
  buscar?: string;
  tipo_usuario_id?: number;
  page?: number;
}

export interface CreateUsuarioPayload {
  name: string;
  email: string;
  password: string;
  telefono?: string;
  tipo_usuario_id: number;
  zona_id?: number | null;
}

export interface UpdateUsuarioPayload {
  name?: string;
  email?: string;
  telefono?: string;
  tipo_usuario_id?: number;
  zona_id?: number | null;
}

const userService = {
  getAll: async (filters: UsuarioFilters = {}): Promise<PaginatedUsuarios> => {
    const params = new URLSearchParams();
    if (filters.buscar) params.append('buscar', filters.buscar);
    if (filters.tipo_usuario_id) params.append('tipo_usuario_id', String(filters.tipo_usuario_id));
    if (filters.page) params.append('page', String(filters.page));
    const response = await apiClient.get(`/usuarios?${params.toString()}`);
    return response.data;
  },

  getById: async (id: number): Promise<Usuario> => {
    const response = await apiClient.get(`/usuarios/${id}`);
    return response.data;
  },

  create: async (data: CreateUsuarioPayload): Promise<Usuario> => {
    const response = await apiClient.post('/usuarios', data);
    return response.data;
  },

  update: async (id: number, data: UpdateUsuarioPayload): Promise<Usuario> => {
    const response = await apiClient.put(`/usuarios/${id}`, data);
    return response.data;
  },

  destroy: async (id: number): Promise<void> => {
    await apiClient.delete(`/usuarios/${id}`);
  },

  toggleEstatus: async (id: number): Promise<Usuario> => {
    const response = await apiClient.post(`/usuarios/${id}/toggle-estatus`);
    return response.data;
  },

  resetPassword: async (id: number, password: string): Promise<void> => {
    await apiClient.post(`/usuarios/${id}/reset-password`, { password });
  },

  getTiposUsuario: async (): Promise<TipoUsuario[]> => {
    const response = await apiClient.get('/tipos-usuario');
    return response.data;
  },
};

export default userService;
