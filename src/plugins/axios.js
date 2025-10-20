import axios from 'axios';

const API_BASE_URL = 'https://parkingcrud.onrender.com/api'; 

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    }
});

// Puedes añadir interceptores para manejar errores globales o para adjuntar tokens.
apiClient.interceptors.response.use(
    response => response,
    error => {
        // Ejemplo de manejo de errores globales
        if (error.response && error.response.status === 401) {
            console.error('No autorizado. Posiblemente necesite iniciar sesión de nuevo.');
            // Aquí podrías redirigir al usuario a la página de login
        } else if (error.response && error.response.status === 404) {
            console.error('Recurso no encontrado.', error.response.data);
        } else {
            console.error('Error en la petición:', error.message);
        }
        return Promise.reject(error);
    }
);

export default apiClient;