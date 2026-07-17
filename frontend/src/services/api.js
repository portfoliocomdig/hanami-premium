import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api'
});

// Anexa o JWT (se existir) em toda requisição autenticada
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('hanami_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Se o token expirar/for inválido, limpa a sessão local
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('hanami_token');
      localStorage.removeItem('hanami_user');
    }
    return Promise.reject(error);
  }
);

export default api;
