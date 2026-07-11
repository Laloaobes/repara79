import apiClient from '../../../api/axios';
import { Role } from '../../../constants/roles';

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  rol: Role;
  activo: boolean;
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

  async updateUser(userId: number, data: { rol: Role }): Promise<AdminUser> {
    const response = await apiClient.put(`/usuarios/${userId}`, data);
    return response.data.data;
  },

  async updateUserRole(userId: number, rol: Role): Promise<AdminUser> {
    return this.updateUser(userId, { rol });
  },
};

export default usersService;
