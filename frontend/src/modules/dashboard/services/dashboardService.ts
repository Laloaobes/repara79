import apiClient from '../../../api/axios';

interface DashboardData {
  stats: {
    total: number;
    urgentes: number;
    enProceso: number;
    resueltos: number;
    pendientes: number;
  };
  recientes: any[];
}

const dashboardService = {

  getDashboardOverview: async (): Promise<DashboardData> => {
    try {
      const response = await apiClient.get('/dashboard');
      return response.data;
    } catch (error) {
      console.error('Error al obtener datos del dashboard:', error);
      throw error;
    }
  }

};

export default dashboardService;