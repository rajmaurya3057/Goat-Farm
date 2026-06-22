import apiClient from './axios';

export const equipmentApi = {
  getEquipments(params) {
    return apiClient.get('/equipment', { params });
  },

  getEquipmentById(id) {
    return apiClient.get(`/equipment/${id}`);
  },

  createEquipment(data) {
    return apiClient.post('/equipment', data);
  },

  updateEquipment(id, data) {
    return apiClient.put(`/equipment/${id}`, data);
  },

  deleteEquipment(id) {
    return apiClient.delete(`/equipment/${id}`);
  },
};
