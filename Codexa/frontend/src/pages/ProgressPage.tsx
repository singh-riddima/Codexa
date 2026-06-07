import { motion } from 'framer-motion';
import { useMemo } from 'react';
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { AppShell } from '@/components/layout/AppShell';
import { ChartPanel } from '@/components/dashboard/ChartPanel';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { radarData } from '@/lib/mock-data';
import { useAuth } from '@/context/AuthContext';
import { slugifySubjectName } from '@/lib/subject-data';
import api from '@/api/client';
import { useQueries } from '@tanstack/react-query';

const dailyActivity = [
  { day: 'Mon', hours: 2, solved: 12 },
  { day: 'Tue', hours: 3, solved: 16 },
  { day: 'Wed', hours: 2.5, solved: 10 },
  { day: 'Thu', hours: 4, solved: 22 },
  { day: 'Fri', hours: 3.5, solved: 18 },
  { day: 'Sat', hours: 5, solved: 27 },
  { day: 'Sun', hours: 2, solved: 8 }
];

export default function ProgressPage() {
  const { user } = useAuth();
  const completedTasks = 8;
  const totalTasks = 12;
  const todayCompletion = Math.round((completedTasks / totalTasks) * 100);
  const selectedSubjectKeys = useMemo(() => (user?.selectedSubjects ?? []).map((subject) => slugifySubjectName(subject)), [user?.selectedSubjects]);
  const subjectQueries = useQueries({
    queries: selectedSubjectKeys.map((key) => ({
      queryKey: ['subject', key],
      queryFn: async () => (await api.get(`/subject/${key}`)).data,
      enabled: Boolean(key)
    }))
  });

  const subjectAnalytics = useMemo(() => (user?.selectedSubjects ?? []).map((subject, index) => {
    const summary = subjectQueries[index]?.data ?? null;
    return {
      subject,
      completion: summary?.completion ?? 0,
      accuracy: summary?.accuracy ?? 0,
      mock: summary?.mockCount ?? 0,
      questions: summary?.questionsSolved ?? 0,
      topics: summary?.topicsCompleted ?? 0
    };
  }), [user?.selectedSubjects, subjectQueries]);

  const analyticsTotals = useMemo(() => {
    if (!subjectAnalytics.length) {
      return { topics: 0, questions: 0, mock: 0, completion: 0 };
    }

    const totals = subjectAnalytics.reduce(
      (accumulator, item) => ({
        topics: accumulator.topics + item.topics,
        questions: accumulator.questions + item.questions,
        mock: accumulator.mock + item.mock,
        completion: accumulator.completion + item.completion
      }),
      { topics: 0, questions: 0, mock: 0, completion: 0 }
    );

    return {
      topics: totals.topics,
      questions: totals.questions,
      mock: totals.mock,
      completion: Math.round(totals.completion / subjectAnalytics.length)
    };
  }, [subjectAnalytics]);

  const weeklyConsistency = subjectAnalytics.length
    ? Math.round(subjectAnalytics.reduce((total, item) => total + item.completion, 0) / subjectAnalytics.length)
    : 0;

  return (
    <AppShell>
      <div className="space-y-8 py-8">
        <section>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-xs uppercase tracking-[0.35em] text-white/45">Progress section</p>
            <h1 className="mt-3 text-4xl font-semibold">Detailed analytics and progress tracking.</h1>
            <p className="mt-4 max-w-3xl text-white/60">Track topics completed, mock practice, study hours, accuracy, and weekly consistency in one view.</p>
          </motion.div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Card><CardContent className="pt-6"><p className="text-sm text-white/60">Topics completed</p><p className="mt-2 text-3xl font-semibold">{analyticsTotals.topics}</p></CardContent></Card>
          <Card><CardContent className="pt-6"><p className="text-sm text-white/60">Questions solved</p><p className="mt-2 text-3xl font-semibold">{analyticsTotals.questions}</p></CardContent></Card>
          <Card><CardContent className="pt-6"><p className="text-sm text-white/60">Mock interviews practiced</p><p className="mt-2 text-3xl font-semibold">{analyticsTotals.mock}</p></CardContent></Card>
          <Card><CardContent className="pt-6"><p className="text-sm text-white/60">Weekly consistency</p><p className="mt-2 text-3xl font-semibold">{weeklyConsistency}%</p></CardContent></Card>
        </section>

        <section className="grid gap-6 xl:grid-cols-2">
          <Card>
            <CardHeader><CardTitle>Daily progress logs</CardTitle></CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dailyActivity}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.08)" />
                  <XAxis dataKey="day" stroke="rgba(255,255,255,.45)" />
                  <YAxis stroke="rgba(255,255,255,.45)" />
                  <Tooltip contentStyle={{ background: 'rgba(10,10,18,.96)', border: '1px solid rgba(255,255,255,.08)' }} />
                  <Line type="monotone" dataKey="hours" stroke="#d946ef" strokeWidth={2.5} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Subject comparison analytics</CardTitle></CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={subjectAnalytics.length ? subjectAnalytics : [{ subject: 'No subjects', completion: 0, accuracy: 0, mock: 0, questions: 0, topics: 0 }]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.08)" />
                  <XAxis dataKey="subject" stroke="rgba(255,255,255,.45)" />
                  <YAxis stroke="rgba(255,255,255,.45)" />
                  <Tooltip contentStyle={{ background: 'rgba(10,10,18,.96)', border: '1px solid rgba(255,255,255,.08)' }} />
                  <Bar dataKey="completion" fill="#a855f7" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-6 xl:grid-cols-2">
          <ChartPanel title="Target completion analytics" description="Readiness and completion trends across the week." type="area" data={dailyActivity.map((item) => ({ day: item.day, solved: item.solved }))} />
          <ChartPanel title="Accuracy readiness" description="Subject performance distribution across modules." type="radar" data={radarData} />
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.1fr_.9fr]">
          <Card>
            <CardHeader><CardTitle>Subject-wise tracking</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {subjectAnalytics.length ? subjectAnalytics.map((item) => (
                <div key={item.subject} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="mb-2 flex items-center justify-between"><p className="font-medium">{item.subject}</p><p className="text-xs text-white/55">{item.accuracy}% accuracy</p></div>
                  <Progress value={item.completion} />
                  <p className="mt-2 text-xs text-white/55">{item.topics} topics completed • {item.questions} questions solved • {item.mock} mock interviews practiced</p>
                </div>
              )) : <p className="text-sm text-white/55">No subjects selected yet.</p>}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Daily study summary</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm text-white/60">Today target completion</p>
                <p className="mt-1 text-2xl font-semibold">{todayCompletion}%</p>
                <Progress value={todayCompletion} className="mt-3" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-sm"><p className="text-white/55">Completed tasks</p><p className="mt-1 text-xl font-semibold">{completedTasks}</p></div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-sm"><p className="text-white/55">Pending tasks</p><p className="mt-1 text-xl font-semibold">{totalTasks - completedTasks}</p></div>
              </div>
              <p className="text-sm text-white/60">Remaining percentage: {100 - todayCompletion}%</p>
            </CardContent>
          </Card>
        </section>
      </div>
    </AppShell>
  );
}
