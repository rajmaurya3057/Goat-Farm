import apiClient from './axios';

export const goatsApi = {
  getGoats(params) {
    return apiClient.get('/goats', { params });
  },

  getGoatById(id) {
    return apiClient.get(`/goats/${id}`);
  },

  createGoat(data) {
    return apiClient.post('/goats', data);
  },

  updateGoat(id, data) {
    return apiClient.put(`/goats/${id}`, data);
  },

  deleteGoat(id) {
    return apiClient.delete(`/goats/${id}`);
  },

  recordWeight(id, weight) {
    return apiClient.post(`/goats/${id}/weight`, { weight });
  },
};
