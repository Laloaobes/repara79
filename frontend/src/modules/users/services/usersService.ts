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

  async updateUserRole(userId: number, rol: Role): Promise<AdminUser> {
    const response = await apiClient.put(`/usuarios/${userId}/rol`, { rol });
    return response.data.data;
  },
};

export default usersService;
