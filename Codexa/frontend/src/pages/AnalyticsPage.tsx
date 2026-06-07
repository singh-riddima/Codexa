import { AppShell } from '@/components/layout/AppShell';
import { ChartPanel } from '@/components/dashboard/ChartPanel';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Heatmap } from '@/components/dashboard/Heatmap';
import { Skeleton } from '@/components/ui/skeleton';
import { heatmapData, radarData, weeklySeries } from '@/lib/mock-data';
import { useAnalyticsData } from '@/hooks/useAnalyticsData';

export default function AnalyticsPage() {
  const { data, isLoading } = useAnalyticsData();
  const weekly = data?.fallback?.weeklySeries ?? weeklySeries;
  const radar = data?.fallback?.radarData ?? radarData;
  const heatmap = data?.fallback?.heatmapData ?? heatmapData;

  return (
    <AppShell>
      <div className="space-y-8 py-8">
        <section>
          <p className="text-xs uppercase tracking-[0.35em] text-white/45">Analytics</p>
          <h1 className="mt-3 text-4xl font-semibold">Deep preparation telemetry.</h1>
          <p className="mt-4 max-w-3xl text-white/60">Forecast readiness, inspect productivity patterns, and identify topic-level performance gaps.</p>
        </section>
        <section className="grid gap-6 xl:grid-cols-2">
          {isLoading ? <Skeleton className="h-[392px] rounded-3xl" /> : <ChartPanel title="Weekly productivity" description="Study and solve trends across the week." type="area" data={weekly} />}
          <Card>
            <CardHeader>
              <CardTitle>Topic-wise performance</CardTitle>
            </CardHeader>
            <CardContent>
              <Heatmap data={heatmap} />
            </CardContent>
          </Card>
        </section>
        <section className="grid gap-6 xl:grid-cols-2">
          <ChartPanel title="Skill radar" description="A five-axis view of readiness with mock interview coverage." type="radar" data={radar} />
          <Card>
            <CardHeader>
              <CardTitle>Interview readiness prediction</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-white/70">
              <div className="rounded-2xl border border-white/8 bg-white/5 p-4">Predicted readiness next 14 days: <span className="font-semibold text-white">87%</span></div>
              <div className="rounded-2xl border border-white/8 bg-white/5 p-4">Most likely weakness: <span className="font-semibold text-white">Dynamic Programming revisions</span></div>
              <div className="rounded-2xl border border-white/8 bg-white/5 p-4">Suggested focus: <span className="font-semibold text-white">2 mock interviews + 12 problem revisions</span></div>
            </CardContent>
          </Card>
        </section>
      </div>
    </AppShell>
  );
}