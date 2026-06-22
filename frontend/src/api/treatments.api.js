import apiClient from './axios';

export const treatmentsApi = {
  getTreatments(params) {
    return apiClient.get('/treatments', { params });
  },

  getTreatmentById(id) {
    return apiClient.get(`/treatments/${id}`);
  },

  createTreatment(data) {
    return apiClient.post('/treatments', data);
  },

  updateTreatment(id, data) {
    return apiClient.put(`/treatments/${id}`, data);
  },

  deleteTreatment(id) {
    return apiClient.delete(`/treatments/${id}`);
  },
};
