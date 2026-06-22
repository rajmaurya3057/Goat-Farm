import apiClient from './axios';

export const vaccinationsApi = {
  getVaccinations(params) {
    return apiClient.get('/vaccinations', { params });
  },

  getVaccinationById(id) {
    return apiClient.get(`/vaccinations/${id}`);
  },

  createVaccination(data) {
    return apiClient.post('/vaccinations', data);
  },

  updateVaccination(id, data) {
    return apiClient.put(`/vaccinations/${id}`, data);
  },

  deleteVaccination(id) {
    return apiClient.delete(`/vaccinations/${id}`);
  },
};
