import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { AppShell } from '@/components/layout/AppShell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import api from '@/api/client';

const dashboardTiles = [
  {
    title: 'Complete Topic List',
    description: 'Open the topic checklist and track progress with saved checkboxes.',
    path: 'topics'
  },
  {
    title: 'Placement Interview Questions',
    description: 'Open interview questions for this subject.',
    path: 'interview-questions'
  },
  {
    title: 'Mock Interview Questions',
    description: 'Review mock interview sets and readiness.',
    path: 'mocks'
  },
  {
    title: 'Practice Questions',
    description: 'Work through MCQs, coding, and theory practice.',
    path: 'practice'
  }
];

export default function SubjectDashboardPage() {
  const { subjectKey } = useParams();
  const { data: catalog, isLoading: catalogLoading } = useQuery({
    queryKey: ['subject-catalog', subjectKey],
    queryFn: async () => {
      try {
        const res = await api.get(`/subject/${subjectKey}/catalog`);
        return res.data.subject as { title: string };
      } catch (error) {
        const status = typeof error === 'object' && error && 'response' in error ? (error as { response?: { status?: number } }).response?.status : undefined;
        if (status === 404) return null;
        throw error;
      }
    },
    enabled: Boolean(subjectKey)
  });

  if (!subjectKey) {
    return <Navigate to="/dashboard" replace />;
  }

  if (!catalogLoading && !catalog) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <AppShell>
      <div className="space-y-8 py-8">
        <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(11,10,22,.82),rgba(11,10,22,.58))] p-8 shadow-[0_20px_80px_rgba(123,41,255,.14)]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(217,70,239,.18),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(56,189,248,.16),transparent_36%)]" />
          <div className="relative space-y-4">
            <p className="text-xs uppercase tracking-[0.35em] text-white/45">Subject dashboard</p>
            <h1 className="text-4xl font-semibold">{catalog?.title ?? subjectKey}</h1>
            <p className="max-w-3xl text-white/60">Choose what you want to track for this subject.</p>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-2">
          {dashboardTiles.map((tile, index) => (
            <motion.div key={tile.title} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
              <Link to={`/subject/${subjectKey}/${tile.path}`} className="group block h-full">
                <Card className="h-full border-white/10 bg-[linear-gradient(180deg,rgba(13,11,24,.86),rgba(12,10,22,.7))] transition duration-300 group-hover:-translate-y-1 group-hover:border-fuchsia-400/40 group-hover:shadow-[0_14px_50px_rgba(168,85,247,.18)]">
                  <CardHeader className="flex flex-row items-start justify-between gap-4">
                    <CardTitle className="text-xl text-white">{tile.title}</CardTitle>
                    <ChevronRight className="mt-1 h-5 w-5 text-white/45 transition group-hover:translate-x-1 group-hover:text-white" />
                  </CardHeader>
                  <CardContent>
                    <p className="max-w-md text-sm text-white/60">{tile.description}</p>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </section>
      </div>
    </AppShell>
  );
}
