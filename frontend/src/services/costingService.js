import api from './api';

export const costingService = {
  calculate: async (payload) => {
    const res = await api.post('/costings/calculate', payload);
    return res.data;
  },

  create: async (payload) => {
    const res = await api.post('/costings', payload);
    return res.data;
  },

  getAll: async (params = {}) => {
    const res = await api.get('/costings', { params });
    return res.data;
  },

  getById: async (id) => {
    const res = await api.get(`/costings/${id}`);
    return res.data;
  },

  update: async (id, payload) => {
    const res = await api.put(`/costings/${id}`, payload);
    return res.data;
  },

  delete: async (id) => {
    const res = await api.delete(`/costings/${id}`);
    return res.data;
  },

  duplicate: async (id) => {
    const res = await api.post(`/costings/${id}/duplicate`);
    return res.data;
  },

  getKpis: async () => {
    const res = await api.get('/costings/kpis');
    return res.data;
  },

  getTrend: async (days = 30) => {
    const res = await api.get('/costings/trend', { params: { days } });
    return res.data;
  }
};
