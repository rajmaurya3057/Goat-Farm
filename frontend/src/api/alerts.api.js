import apiClient from './axios';

export const alertsApi = {
  getAlerts(params) {
    return apiClient.get('/alerts', { params });
  },

  markAsRead(id) {
    return apiClient.patch(`/alerts/${id}/read`);
  },

  markAllAsRead() {
    return apiClient.patch('/alerts/read-all');
  },
};
