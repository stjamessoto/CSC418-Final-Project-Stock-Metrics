import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000',
  headers: { 'Content-Type': 'application/json' },
});

export const fetchStock      = (ticker: string)          => api.get(`/stock/${ticker}`);
export const getFavorites    = (industry: string | null = null) =>
  api.get('/favorites', { params: industry ? { industry } : {} });
export const addFavorite     = (payload: object)         => api.post('/favorites', payload);
export const deleteFavorite  = (ticker: string)          => api.delete(`/favorites/${ticker}`);

export default api;
