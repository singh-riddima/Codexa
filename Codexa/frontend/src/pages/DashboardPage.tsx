import { motion } from 'framer-motion';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { ChartPanel } from '@/components/dashboard/ChartPanel';
import { ContributionHeatmap } from '@/components/dashboard/ContributionHeatmap';
import { Heatmap } from '@/components/dashboard/Heatmap';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { slugifySubjectName } from '@/lib/subject-data';
import { useDashboardSummary } from '@/hooks/useDashboardSummary';
import api from '@/api/client';
import { useAuth } from '@/context/AuthContext';
import { useQueries, useQuery } from '@tanstack/react-query';

type SubjectCard = {
  name: string;
  slug: string;
  to: string;
  progress: number;
  topicsCompleted: number;
  questionsSolved: number;
  streak: number;
  consistency: 'Low' | 'Medium' | 'High';
};

type DatasetCatalogItem = {
  key: string;
  title: string;
  sourceFile: string;
  counts: {
    modules: number;
    topics: number;
    subtopics: number;
  };
};

type WeeklySeriesPoint = {
  day: string;
  solved: number;
  study: number;
  confidence: number;
};

const practiceCards = [
  { title: 'Mock Interview Questions', description: 'Behavioral + technical mock interview sets with guided scoring.', to: '/practice/mock-interview' },
  { title: 'Mock Coding Practice Questions', description: 'Timed coding rounds aligned to placement prep patterns.', to: '/coding' },
  { title: 'Mock Exam Questions', description: 'Assessment-style paper simulations with score snapshots.', to: '/practice/mock-exam' },
  { title: 'Theory Practice', description: 'Core CS theory drills and concept reinforcement.', to: '/core-subjects' },
  { title: 'Revision Flashcards', description: 'Quick concept recall cards for final interview sprints.', to: '/practice/revision-flashcards' }
];

export default function DashboardPage() {
  const { user, refreshUser } = useAuth();
  const { data, isLoading } = useDashboardSummary();
  const [subjectDraft, setSubjectDraft] = useState('');
  const metrics = data?.metrics ?? [];
  const weekly = (data?.weeklySeries ?? []) as WeeklySeriesPoint[];
  const heatmap = data?.heatmap ?? [];
  const radar = data?.radar ?? [];
  const selectedSubjectKeys = useMemo(() => (user?.selectedSubjects ?? []).map((subjectName) => slugifySubjectName(subjectName)), [user?.selectedSubjects]);
  const totalWeeklySolved = weekly.reduce((sum: number, item: WeeklySeriesPoint) => sum + item.solved, 0);
  const totalWeeklyStudy = weekly.reduce((sum: number, item: WeeklySeriesPoint) => sum + item.study, 0);
  const averageWeeklyStudy = weekly.length ? (totalWeeklyStudy / weekly.length).toFixed(1) : '0.0';

  const { data: datasetCatalog } = useQuery({
    queryKey: ['subject-catalog-list'],
    queryFn: async () => (await api.get('/subject/catalog')).data.subjects as DatasetCatalogItem[],
    enabled: Boolean(user)
  });

  const catalogQueries = useQueries({
    queries: selectedSubjectKeys.map((key) => ({
      queryKey: ['subject-catalog', key],
      queryFn: async () => (await api.get(`/subject/${key}/catalog`)).data.subject,
      enabled: Boolean(key)
    }))
  });

  const subjectQueries = useQueries({
    queries: selectedSubjectKeys.map((key) => ({
      queryKey: ['subject', key],
      queryFn: async () => (await api.get(`/subject/${key}`)).data,
      enabled: Boolean(key)
    }))
  });

  const liveSubjectCards = useMemo(() => {
    const selectedSubjects = user?.selectedSubjects ?? [];
    return selectedSubjects.map((subjectName, i) => {
      const key = selectedSubjectKeys[i];
      const catalog = catalogQueries[i]?.data as { title?: string } | undefined;
      const q = subjectQueries[i];
      const summary = q?.data ?? null;
      return {
        sourceLabel: subjectName,
        name: catalog?.title ?? subjectName,
        slug: key,
        to: `/subject/${key}`,
        progress: summary?.completion ?? 0,
        topicsCompleted: summary?.topicsCompleted ?? 0,
        questionsSolved: summary?.questionsSolved ?? 0,
        streak: summary?.practiceStreak ?? 0,
        consistency: summary?.weeklyConsistency >= 84 ? 'High' : summary?.weeklyConsistency >= 70 ? 'Medium' : 'Low'
      };
    });
  }, [user?.selectedSubjects, selectedSubjectKeys, catalogQueries, subjectQueries]);

  const datasetCards = useMemo(
    () =>
      [...(datasetCatalog ?? [])]
        .sort((left, right) => left.title.localeCompare(right.title))
        .map((subject) => ({
          key: subject.key,
          title: subject.title,
          to: `/subject/${subject.key}`,
          modules: subject.counts.modules,
          topics: subject.counts.topics,
          subtopics: subject.counts.subtopics,
          sourceFile: subject.sourceFile
        })),
    [datasetCatalog]
  );

  const overviewCards = [
    { label: 'Readiness score', value: metrics[3]?.value ?? '0/100' },
    { label: 'DSA completion', value: metrics[1]?.value ?? '0%' },
    { label: 'Daily streak', value: metrics[2]?.value ?? '0 days' },
    { label: 'Total solved', value: metrics[0]?.value ?? '0' },
    { label: 'Selected subjects', value: String(selectedSubjectKeys.length) },
    { label: 'Weekly solved', value: String(totalWeeklySolved) },
    { label: 'Weekly study load', value: `${averageWeeklyStudy} avg` },
    { label: 'Tracked goals', value: String(data?.goals?.length ?? 0) }
  ];

  const persistSubjects = async (nextSubjects: string[]) => {
    await api.put('/profile/me', {
      selectedSubjects: nextSubjects,
      onboardingCompleted: true,
      onboardingDuration: user?.onboardingDuration ?? null,
      onboardingIntensity: user?.onboardingIntensity ?? null
    });
    await refreshUser();
  };

  const addCustomSubject = async () => {
    const trimmed = subjectDraft.trim();
    if (!trimmed) return;
    const nextSubjects = [...(user?.selectedSubjects ?? [])];
    const exists = nextSubjects.some((subject) => slugifySubjectName(subject) === slugifySubjectName(trimmed));
    if (!exists) {
      nextSubjects.push(trimmed);
      await persistSubjects(nextSubjects);
    }
    setSubjectDraft('');
  };

  const removeSubject = async (subjectName: string) => {
    const nextSubjects = (user?.selectedSubjects ?? []).filter((item) => slugifySubjectName(item) !== slugifySubjectName(subjectName));
    await persistSubjects(nextSubjects);
  };

  return (
    <AppShell>
      <div className="space-y-8 py-8">
        <section>
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-xs uppercase tracking-[0.35em] text-white/45">Analytics dashboard</p>
            <h1 className="mt-3 text-4xl font-semibold">Your placement preparation at a glance.</h1>
            <p className="mt-4 max-w-3xl text-white/60">Track streaks, weak areas, topic heatmaps, and readiness signals with polished telemetry cards.</p>
          </motion.div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {isLoading
            ? Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-36 rounded-3xl" />)
            : metrics.map((item, index) => <MetricCard key={item.label} item={item} index={index} />)}
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {overviewCards.map((item) => (
            <Card key={item.label} className="transition hover:-translate-y-0.5 hover:border-fuchsia-400/35">
              <CardContent className="pt-6">
                <p className="text-sm text-white/60">{item.label}</p>
                <p className="mt-2 text-2xl font-semibold">{item.value}</p>
              </CardContent>
            </Card>
          ))}
        </section>

        <section className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-semibold">Subject overview</h2>
              <p className="mt-1 text-sm text-white/60">Track progress, solved questions, streaks, and consistency by subject.</p>
            </div>
            <div className="flex w-full max-w-xl gap-2">
              <Input value={subjectDraft} onChange={(event) => setSubjectDraft(event.target.value)} placeholder="Add custom subject" />
              <Button onClick={addCustomSubject}>Add Subject</Button>
            </div>
          </div>

          {selectedSubjectKeys.length === 0 ? (
            <Card className="border-dashed border-white/15 bg-white/5">
              <CardContent className="space-y-4 p-8 text-center text-sm text-white/60">
                <p className="text-lg font-medium text-white">No subjects selected yet.</p>
                <p>Add subjects from onboarding or use the field above to create your first personalized subject card.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {liveSubjectCards.map((subject) => (
                <Card key={subject.slug} className="group transition hover:-translate-y-1 hover:border-fuchsia-400/35">
                  <CardHeader>
                    <CardTitle className="flex items-start justify-between gap-3">
                      <Link to={subject.to} className="min-w-0 flex-1 text-left">
                        <span>{subject.name}</span>
                      </Link>
                      <Button size="sm" variant="ghost" onClick={() => void removeSubject(subject.sourceLabel)} className="text-white/50 hover:text-white">Remove</Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div>
                      <div className="mb-1 flex items-center justify-between text-white/60"><span>Progress</span><span>{subject.progress}%</span></div>
                      <Progress value={subject.progress} />
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-white/65">
                      <div className="rounded-xl border border-white/10 bg-white/5 p-3">Topics completed: {subject.topicsCompleted}</div>
                      <div className="rounded-xl border border-white/10 bg-white/5 p-3">Questions solved: {subject.questionsSolved}</div>
                      <div className="rounded-xl border border-white/10 bg-white/5 p-3">Study streak: {subject.streak} days</div>
                      <div className="rounded-xl border border-white/10 bg-white/5 p-3">Consistency: {subject.consistency}</div>
                    </div>
                    <p className="text-xs uppercase tracking-[0.3em] text-white/45 transition group-hover:text-fuchsia-200">Open subject dashboard</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>



        {/* Practice & Mock Preparation section removed per request */}

        <section className="grid gap-6 xl:grid-cols-[1.15fr_.85fr]">
          <ChartPanel title="Weekly consistency" description="Problems solved and study momentum across the last seven days." type="area" data={weekly} />
          <Card>
            <CardHeader>
              <CardTitle>Topic heatmap</CardTitle>
            </CardHeader>
            <CardContent>
              <Heatmap data={heatmap} />
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-6 xl:grid-cols-[.9fr_1.1fr]">
          <Card>
            <CardHeader>
              <CardTitle>GitHub-style contribution heatmap</CardTitle>
            </CardHeader>
            <CardContent>
              <ContributionHeatmap />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Upcoming goals</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {(data?.goals ?? []).map((goal: any) => (
                <div key={goal.id ?? goal.title} className="rounded-2xl border border-white/8 bg-white/5 p-4">
                  <p className="font-medium">{goal.title}</p>
                  <p className="mt-1 text-sm text-white/55">{goal.description ?? 'Goal in progress'}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-6 xl:grid-cols-2">
          <ChartPanel title="Skill radar" description="Balanced readiness across DSA, coding, core CS, aptitude, and mocks." type="radar" data={radar} />
          <ChartPanel title="Readiness mix" description="Portfolio of study areas shaping your interview confidence." type="pie" data={[
            { label: 'DSA', value: 35 },
            { label: 'Coding', value: 25 },
            { label: 'Core', value: 18 },
            { label: 'Aptitude', value: 12 },
            { label: 'Mock', value: 10 }
          ]} />
        </section>
      </div>
    </AppShell>
  );
}