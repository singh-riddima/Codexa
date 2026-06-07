import { useQuery } from '@tanstack/react-query';
import api from '@/api/client';
import { heatmapData, radarData, weeklySeries } from '@/lib/mock-data';

export function useAnalyticsData() {
  return useQuery({
    queryKey: ['analytics-data'],
    queryFn: async () => {
      try {
        const { data } = await api.get('/analytics');
        return {
          charts: data.charts,
          fallback: {
            weeklySeries,
            radarData,
            heatmapData
          },
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
          fallback: {
            weeklySeries,
            radarData,
            heatmapData
          },
          readiness: {
            score: 84,
            prediction: 87,
            risk: 'Dynamic Programming revision'
          }
        };
      }
    }
  });
}