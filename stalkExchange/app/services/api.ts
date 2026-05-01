import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const fetchStock     = (ticker: string) => api.get(`/stock/${ticker}`);
export const getStockDetail = (ticker: string) => api.get(`/stock/${ticker}/detail`);

export const getFavorites = (userId = 'guest', industry: string | null = null) =>
  api.get('/favorites', { params: { userId, ...(industry ? { industry } : {}) } });

export const addFavorite    = (payload: object)                       => api.post('/favorites', payload);
export const deleteFavorite = (ticker: string, userId = 'guest')      =>
  api.delete(`/favorites/${ticker}`, { params: { userId } });

export const loginUser    = (email: string, password: string) => api.post('/auth/login',    { email, password });
export const registerUser = (email: string, password: string) => api.post('/auth/register', { email, password });

export default api;
