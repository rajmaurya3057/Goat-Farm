import apiClient from './axios';

export const medicinesApi = {
  getMedicines(params) {
    return apiClient.get('/medicines', { params });
  },

  getMedicineById(id) {
    return apiClient.get(`/medicines/${id}`);
  },

  createMedicine(data) {
    return apiClient.post('/medicines', data);
  },

  updateMedicine(id, data) {
    return apiClient.put(`/medicines/${id}`, data);
  },

  deleteMedicine(id) {
    return apiClient.delete(`/medicines/${id}`);
  },
};
