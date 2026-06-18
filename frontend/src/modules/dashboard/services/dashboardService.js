import apiClient from '../../../api/axios';

/**
 * Servicio para manejar las peticiones HTTP del Dashboard.
 * Cumple con la Regla 3: El componente visual no usa Axios directamente.
 */
const dashboardService = {
  
  getDashboardOverview: async () => {
    try {
      // Endpoint esperado de Laravel que devolverá las stats y reportes recientes
      const response = await apiClient.get('/dashboard');
      return response.data;
    } catch (error) {
      console.error('Error al obtener datos del dashboard:', error);
      throw error; // Lanza el error para que la UI lo maneje
    }
  }

};

export default dashboardService;