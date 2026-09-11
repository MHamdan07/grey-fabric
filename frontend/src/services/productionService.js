import api from './api';

export const productionService = {
    calculateYarnToFabric: async (data) => {
        const response = await api.post('/production/yarn-to-fabric', data);
        return response.data;
    },

    calculateFabricToYarn: async (data) => {
        const response = await api.post('/production/fabric-to-yarn', data);
        return response.data;
    },

    getPlans: async (params = {}) => {
        const response = await api.get('/production/plans', { params });
        return response.data;
    },

    getPlanById: async (id) => {
        const response = await api.get(`/production/plans/${id}`);
        return response.data;
    },

    createPlan: async (data) => {
        const response = await api.post('/production/plans', data);
        return response.data;
    },

    deletePlan: async (id) => {
        const response = await api.delete(`/production/plans/${id}`);
        return response.data;
    },

    getSummary: async () => {
        const response = await api.get('/production/summary');
        return response.data;
    }
};
