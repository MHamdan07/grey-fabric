import api from './api';

export const yarnService = {
  getAll: async (status) => {
    const res = await api.get('/yarns', { params: { status } });
    return res.data;
  },
  getById: async (id) => {
    const res = await api.get(`/yarns/${id}`);
    return res.data;
  },
  create: async (data) => {
    const res = await api.post('/yarns', data);
    return res.data;
  },
  update: async (id, data) => {
    const res = await api.put(`/yarns/${id}`, data);
    return res.data;
  },
  delete: async (id) => {
    const res = await api.delete(`/yarns/${id}`);
    return res.data;
  }
};

export const fabricService = {
  getAll: async () => {
    const res = await api.get('/fabrics');
    return res.data;
  },
  getById: async (id) => {
    const res = await api.get(`/fabrics/${id}`);
    return res.data;
  },
  create: async (data) => {
    const res = await api.post('/fabrics', data);
    return res.data;
  },
  update: async (id, data) => {
    const res = await api.put(`/fabrics/${id}`, data);
    return res.data;
  },
  delete: async (id) => {
    const res = await api.delete(`/fabrics/${id}`);
    return res.data;
  }
};

export const chargesService = {
  getAll: async () => {
    const res = await api.get('/charges');
    return res.data;
  },
  getById: async (id) => {
    const res = await api.get(`/charges/${id}`);
    return res.data;
  },
  create: async (data) => {
    const res = await api.post('/charges', data);
    return res.data;
  },
  update: async (id, data) => {
    const res = await api.put(`/charges/${id}`, data);
    return res.data;
  },
  delete: async (id) => {
    const res = await api.delete(`/charges/${id}`);
    return res.data;
  }
};

export const reportService = {
  getCostingsReport: async (params) => {
    const res = await api.get('/reports/costings', { params });
    return res.data;
  },
  exportCsvUrl: () => {
    const token = localStorage.getItem('grey_cost_token');
    return `${api.defaults.baseURL}/reports/export`;
  },
  getActivityLogs: async () => {
    const res = await api.get('/reports/activity-logs');
    return res.data;
  }
};

export const userService = {
  getAll: async () => {
    const res = await api.get('/users');
    return res.data;
  },
  create: async (data) => {
    const res = await api.post('/users', data);
    return res.data;
  },
  update: async (id, data) => {
    const res = await api.put(`/users/${id}`, data);
    return res.data;
  },
  delete: async (id) => {
    const res = await api.delete(`/users/${id}`);
    return res.data;
  }
};
