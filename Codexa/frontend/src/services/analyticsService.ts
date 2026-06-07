import api from '@/api/client';

export const analyticsService = {
  getAnalytics: async () => {
    const { data } = await api.get('/analytics');
    return data;
  }
};