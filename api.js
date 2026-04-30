import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000',
  headers: { 'Content-Type': 'application/json' },
});

export const fetchStock   = (ticker)         => api.get(`/stock/${ticker}`);
export const getFavorites = (industry = null) => api.get('/favorites', { params: industry ? { industry } : {} });
export const addFavorite  = (payload)         => api.post('/favorites', payload);
export const deleteFavorite = (ticker)        => api.delete(`/favorites/${ticker}`);

export default api;
