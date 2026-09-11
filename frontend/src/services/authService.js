import api from './api';

export const authService = {
  login: async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data.token) {
      localStorage.setItem('grey_cost_token', res.data.token);
      localStorage.setItem('grey_cost_user', JSON.stringify(res.data.user));
    }
    return res.data;
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      // ignore
    } finally {
      localStorage.removeItem('grey_cost_token');
      localStorage.removeItem('grey_cost_user');
    }
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem('grey_cost_user');
    return userStr ? JSON.parse(userStr) : null;
  },

  getProfile: async () => {
    const res = await api.get('/auth/me');
    return res.data;
  }
};
