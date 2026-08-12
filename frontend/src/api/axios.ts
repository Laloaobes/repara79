import axios from 'axios';
import {
  clearLocalSession,
  storeSessionNotice,
} from '../modules/auth/session/sessionManager';

/**
 * Instancia global de Axios configurada para consumir el backend en Laravel.
 * Listo para producción: Utiliza variables de entorno y soporta Sanctum/JWT.
 */
const apiClient = axios.create({
  // En producción, VITE_API_URL debe estar en tu archivo .env
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  // Fundamental si Laravel usa Sanctum (autenticación basada en cookies)
  withCredentials: true, 
});

// Interceptor de Peticiones (Request)
apiClient.interceptors.request.use(
  (config) => {
    // Si estás usando JWT en lugar de cookies, aquí inyectamos el token
    const token = localStorage.getItem('auth_token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor de Respuestas (Response)
apiClient.interceptors.response.use(
  (response) => {
    // Si la petición es exitosa, devolvemos la respuesta tal cual
    return response;
  },
  (error) => {
    // Manejo global de errores de producción
    if (error.response) {
      // Error 401: No autorizado (Token expirado o inválido)
      if (error.response.status === 401 && error.config?.url !== '/login') {
        console.warn('Sesión expirada o no autorizada. Redirigiendo al login...');
        storeSessionNotice('invalid');
        clearLocalSession();
        window.dispatchEvent(new CustomEvent('auth:session-invalid'));
      }
      
      // Error 403: Prohibido (No tiene permisos de Laravel para esa acción)
      if (error.response.status === 403) {
        console.error('Acceso denegado por políticas del backend.');
      }
    } else if (error.request) {
      // Error de red (El backend está caído)
      console.error('No se pudo conectar con el servidor de Laravel.');
    }

    return Promise.reject(error);
  }
);

export default apiClient;
