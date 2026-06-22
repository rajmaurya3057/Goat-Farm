import apiClient from './axios';

export const vaccinationsApi = {
  getVaccinations(params) {
    return apiClient.get('/vaccinations', { params });
  },
};
