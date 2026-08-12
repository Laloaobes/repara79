import apiClient from '../../../api/axios';
import { Role } from '../../../constants/roles';

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  rol: Role;
  activo: boolean;
  areas: AssignedArea[];
}

export interface AssignedArea {
  id: number;
  nombre: string;
  ubicacion: string | null;
  sede: {
    id: number;
    nombre: string;
  } | null;
}

export interface ManagedArea extends AssignedArea {
  responsable: {
    id: number;
    name: string;
  } | null;
}

const usersService = {
  async getUsers(): Promise<AdminUser[]> {
    const response = await apiClient.get('/usuarios');
    return response.data.data;
  },

  async getUser(userId: number): Promise<AdminUser> {
    const response = await apiClient.get(`/usuarios/${userId}`);
    return response.data.data;
  },

  async getAreas(): Promise<ManagedArea[]> {
    const response = await apiClient.get('/usuarios/areas-disponibles');
    return response.data.data;
  },

  async updateUser(
    userId: number,
    data: { rol: Role; area_ids?: number[] },
  ): Promise<AdminUser> {
    const response = await apiClient.put(`/usuarios/${userId}`, data);
    return response.data.data;
  },
};

export default usersService;
