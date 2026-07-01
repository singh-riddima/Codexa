import { useQuery } from '@tanstack/react-query';
import api from '@/api/client';

export function useDashboardSummary() {
  return useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: async () => {
      try {
        const { data } = await api.get('/dashboard/summary');
        const metrics = [
          { label: 'Total Problems Solved', value: String(data.metrics.totalSolved), delta: '+ synced from backend', tone: 'brand' as const },
          { label: 'DSA Completion', value: `${data.metrics.dsaCompletion}%`, delta: 'Live progress', tone: 'success' as const },
          { label: 'Daily Streak', value: `${data.metrics.dailyStreak} days`, delta: 'Persistence streak', tone: 'warning' as const },
          { label: 'Readiness Score', value: `${data.metrics.readinessScore}/100`, delta: 'Interview confidence', tone: 'neutral' as const }
        ];

        return {
          metrics,
          goals: data.goals,
          heatmap: data.heatmap ?? [],
          radar: data.radar ?? [],
          weeklySeries: data.weeklySeries ?? []
        };
      } catch {
        return {
          metrics: [
            { label: 'Total Problems Solved', value: '0', delta: 'No live data', tone: 'brand' as const },
            { label: 'DSA Completion', value: '0%', delta: 'No live data', tone: 'success' as const },
            { label: 'Daily Streak', value: '0 days', delta: 'No live data', tone: 'warning' as const },
            { label: 'Readiness Score', value: '0/100', delta: 'No live data', tone: 'neutral' as const }
          ],
          goals: [],
          heatmap: [],
          radar: [],
          weeklySeries: []
        };
      }
    }
  });
}