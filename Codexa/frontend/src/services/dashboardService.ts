import api from '@/api/client';

export const dashboardService = {
  getSummary: async () => {
    const { data } = await api.get('/dashboard/summary');
    return data;
  }
};