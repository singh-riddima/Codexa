import { useQuery } from '@tanstack/react-query';
import api from '@/api/client';

export function useAnalyticsData() {
  return useQuery({
    queryKey: ['analytics-data'],
    queryFn: async () => {
      try {
        const { data } = await api.get('/analytics');
        return {
          charts: data.charts,
          weeklySeries: data.weeklySeries ?? [],
          radarData: data.radar ?? [],
          heatmapData: data.heatmap ?? [],
          readiness: data.readiness
        };
      } catch {
        return {
          charts: {
            dsa: [],
            coding: [],
            subjects: [],
            aptitude: [],
            goals: []
          },
          weeklySeries: [],
          radarData: [],
          heatmapData: [],
          readiness: {
            score: 0,
            prediction: 0,
            risk: 'No live data available'
          }
        };
      }
    }
  });
}