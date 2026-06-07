import { useQuery } from '@tanstack/react-query';
import api from '@/api/client';
import { dashboardStats, heatmapData, radarData, weeklySeries, sampleGoals } from '@/lib/mock-data';

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
          heatmap: heatmapData,
          radar: radarData,
          weeklySeries
        };
      } catch {
        return {
          metrics: dashboardStats,
          goals: sampleGoals,
          heatmap: heatmapData,
          radar: radarData,
          weeklySeries
        };
      }
    }
  });
}