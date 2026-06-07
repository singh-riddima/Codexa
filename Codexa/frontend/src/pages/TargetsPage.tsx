import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { AppShell } from '@/components/layout/AppShell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/context/AuthContext';
import { slugifySubjectName } from '@/lib/subject-data';
import api from '@/api/client';
import { useQueries } from '@tanstack/react-query';

type TargetCategory = 'Daily' | 'Weekly' | 'Monthly';

type TargetItem = {
  id: number;
  title: string;
  subject: string;
  category: TargetCategory;
  deadline: string;
  priority: 'Low' | 'Medium' | 'High';
  progress: number;
  completed: boolean;
};

const buildTargetsFromSubjects = (subjects: string[]): TargetItem[] => subjects.map((subject, index) => {
  const category: TargetCategory = index % 3 === 0 ? 'Daily' : index % 3 === 1 ? 'Weekly' : 'Monthly';
  return {
    id: index + 1,
    title: `Revise ${subject}`,
    subject,
    category,
    deadline: category === 'Daily' ? 'Today' : category === 'Weekly' ? 'Friday' : '30 May',
    priority: category === 'Daily' ? 'High' : category === 'Weekly' ? 'Medium' : 'Low',
    progress: 0,
    completed: false
  };
});

export default function TargetsPage() {
  const { user } = useAuth();
  const [targets, setTargets] = useState<TargetItem[]>([]);
  const [draftTitle, setDraftTitle] = useState('');
  const [draftSubject, setDraftSubject] = useState('');
  const subjectKeys = (user?.selectedSubjects ?? []).map((subject) => slugifySubjectName(subject));
  const subjectQueries = useQueries({
    queries: subjectKeys.map((key) => ({
      queryKey: ['subject', key],
      queryFn: async () => (await api.get(`/subject/${key}`)).data,
      enabled: Boolean(key)
    }))
  });

  useEffect(() => {
    setTargets(buildTargetsFromSubjects(user?.selectedSubjects ?? []));
  }, [user?.selectedSubjects]);

  useEffect(() => {
    setTargets((prev) => prev.map((item, index) => {
      const summary = subjectQueries[index]?.data ?? null;
      return summary ? {
        ...item,
        progress: summary.completion ?? item.progress,
        completed: (summary.completion ?? item.progress) >= 90
      } : item;
    }));
  }, [subjectQueries]);

  const grouped = useMemo(() => ({
    Daily: targets.filter((item) => item.category === 'Daily'),
    Weekly: targets.filter((item) => item.category === 'Weekly'),
    Monthly: targets.filter((item) => item.category === 'Monthly')
  }), [targets]);

  const addTarget = () => {
    if (!draftTitle.trim()) return;
    setTargets((prev) => [
      {
        id: Date.now(),
        title: draftTitle.trim(),
        subject: draftSubject.trim() || (user?.selectedSubjects?.[0] ?? 'General'),
        category: 'Daily',
        deadline: 'Tomorrow',
        priority: 'Medium',
        progress: 0,
        completed: false
      },
      ...prev
    ]);
    setDraftTitle('');
  };

  const toggleComplete = (id: number) => {
    setTargets((prev) => prev.map((item) => item.id === id ? { ...item, completed: !item.completed, progress: item.completed ? item.progress : 100 } : item));
  };

  const removeTarget = (id: number) => {
    setTargets((prev) => prev.filter((item) => item.id !== id));
  };

  const bumpProgress = (id: number, delta: number) => {
    setTargets((prev) => prev.map((item) => item.id === id ? { ...item, progress: Math.max(0, Math.min(100, item.progress + delta)) } : item));
  };

  return (
    <AppShell>
      <div className="space-y-8 py-8">
        <section>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-xs uppercase tracking-[0.35em] text-white/45">Targets section</p>
            <h1 className="mt-3 text-4xl font-semibold">Manage daily, weekly, and monthly targets.</h1>
            <p className="mt-4 max-w-3xl text-white/60">Create, edit, delete, and complete subject-wise targets with animated progress indicators.</p>
          </motion.div>
        </section>

        <section>
          <Card>
            <CardHeader><CardTitle>Create new target</CardTitle></CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-[1fr_220px_auto]">
              <Input value={draftTitle} onChange={(event) => setDraftTitle(event.target.value)} placeholder="Target title" />
              <Input value={draftSubject} onChange={(event) => setDraftSubject(event.target.value)} placeholder="Subject" />
              <Button onClick={addTarget}>Create target</Button>
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-6 xl:grid-cols-3">
          {(Object.keys(grouped) as TargetCategory[]).map((category) => (
            <Card key={category}>
              <CardHeader>
                <CardTitle>{category} targets</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {grouped[category].length === 0 ? <p className="text-sm text-white/55">No targets yet.</p> : null}
                {grouped[category].map((item) => (
                  <div key={item.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="mb-2 flex items-start justify-between gap-2">
                      <div>
                        <p className="font-medium">{item.title}</p>
                        <p className="text-xs text-white/55">{item.subject} • Deadline: {item.deadline}</p>
                      </div>
                      <Badge className={item.priority === 'High' ? 'border-pink-400/40 bg-pink-500/20 text-pink-100' : item.priority === 'Medium' ? 'border-fuchsia-400/40 bg-fuchsia-500/20 text-fuchsia-100' : ''}>{item.priority}</Badge>
                    </div>
                    <Progress value={item.progress} />
                    <p className="mt-2 text-xs text-white/55">Completion status: {item.completed ? 'Completed' : 'In progress'} ({item.progress}%)</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Button size="sm" variant="secondary" onClick={() => bumpProgress(item.id, 10)}>+10%</Button>
                      <Button size="sm" variant="secondary" onClick={() => bumpProgress(item.id, -10)}>-10%</Button>
                      <Button size="sm" variant="outline" onClick={() => toggleComplete(item.id)}>{item.completed ? 'Mark pending' : 'Mark completed'}</Button>
                      <Button size="sm" variant="ghost" onClick={() => removeTarget(item.id)}>Delete</Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </section>

        {!targets.length ? <Card><CardContent className="p-6 text-sm text-white/55">Add subjects first to generate personalized targets.</CardContent></Card> : null}
      </div>
    </AppShell>
  );
}
