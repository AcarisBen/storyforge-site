// apiClient.js 
// Este arquivo configura um cliente Axios para comunicação com o backend, incluindo interceptores para tratamento de erros e envio automático de cookies HttpOnly. Ele facilita a integração entre o frontend e o backend, garantindo que as requisições sejam feitas de forma segura e consistente.

import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:3000/api',
  withCredentials: true, // Envia cookies HttpOnly automaticamente em todas as requisições
});

// Interceptor de requisição limpo (sem necessidade de ler do localStorage)
apiClient.interceptors.request.use((config) => {
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const customError = new Error(
      error.response?.data?.message || error.response?.data?.error || 'Erro na requisição'
    );
    customError.status = error.response?.status;
    customError.data = error.response?.data;
    return Promise.reject(customError);
  }
);

export default apiClient;