import apiClient from './axios';

export const authApi = {
  login(credentials) {
    return apiClient.post('/auth/login', credentials);
  },

  getMe() {
    return apiClient.get('/auth/me');
  },
};
