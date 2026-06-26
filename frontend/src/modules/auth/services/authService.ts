import apiClient from '../../../api/axios';

const authService = {
  login: async (email: string, password: string) => {
    const response = await apiClient.post('/login', { email, password });
    return response.data;
  },
  me: async () => {
    const response = await apiClient.get('/me');
    return response.data;
  },
  logout: async () => {
    const response = await apiClient.post('/logout');
    return response.data;
  },
};

export default authService;
