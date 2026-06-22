import apiClient from './axios';

export const treatmentsApi = {
  getTreatments(params) {
    return apiClient.get('/treatments', { params });
  },
};
