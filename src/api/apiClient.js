// src/api/apiClient.js
// Cliente Axios unificado com suporte a cookies HttpOnly, token JWT no header e fallback de URL base para desenvolvimento.

import axios from 'axios';

// Define a URL base da API: se VITE_API_URL não estiver no .env, aponta para o servidor Express local (porta 3000)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Envia cookies HttpOnly automaticamente em todas as requisições
});

// Interceptor de Requisição: Injeta automaticamente o Token JWT se estiver salvo no localStorage
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('storyforge_token') || localStorage.getItem('token');
    
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor de Resposta
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // 1. Se atingiu o limite de taxa do servidor (HTTP 429), emite evento sem deslogar
    if (error.response?.status === 429) {
      const warningMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        'Muitas requisições enviadas. Por favor, aguarde alguns segundos.';

      window.dispatchEvent(
        new CustomEvent('app_rate_limit_warning', {
          detail: { message: warningMessage },
        })
      );
    }

    // 2. Cria erro customizado para tratamento uniforme nos componentes
    const customError = new Error(
      error.response?.data?.message || error.response?.data?.error || 'Erro na requisição'
    );
    customError.status = error.response?.status;
    customError.data = error.response?.data;
    customError.response = error.response;

    return Promise.reject(customError);
  }
);

export default apiClient;