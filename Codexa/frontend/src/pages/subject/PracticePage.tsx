import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AppShell } from '@/components/layout/AppShell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import api from '@/api/client';
import { makeProgressTitle, normalizeProgressStatus, type ProgressRecord } from '@/lib/subject-progress';

type CatalogRow = {
  module: string;
  topic: string;
  subtopic: string;
  difficulty: string;
  practiceResource: string;
  interviewResource: string;
};

type CatalogSubject = {
  title: string;
  rows: CatalogRow[];
};

const difficultyOrder = ['All', 'Beginner', 'Intermediate', 'Advanced'] as const;

type DifficultyFilter = typeof difficultyOrder[number];

export default function PracticePage() {
  const { subjectKey } = useParams();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<DifficultyFilter>('All');

  const { data: catalog } = useQuery({
    queryKey: ['subject-catalog', subjectKey],
    queryFn: async () => {
      const res = await api.get(`/subject/${subjectKey}/catalog`);
      return res.data.subject as CatalogSubject;
    },
    enabled: Boolean(subjectKey)
  });

  const { data: progress = [] } = useQuery({
    queryKey: ['subject-progress', subjectKey],
    queryFn: async () => {
      const res = await api.get(`/subject/${subjectKey}/topics`);
      return (res.data.topics ?? []) as ProgressRecord[];
    },
    enabled: Boolean(subjectKey)
  });

  const progressByTitle = useMemo(() => new Map(progress.map((item) => [item.title, item])), [progress]);

  const items = (catalog?.rows ?? [])
    .filter((row) => filter === 'All' || row.difficulty === filter)
    .map((row) => ({
      id: `${row.topic}::${row.subtopic || row.topic}`,
      title: row.subtopic ? `${row.topic} - ${row.subtopic}` : row.topic,
      difficulty: row.difficulty,
      resource: row.practiceResource,
      module: row.module,
      topic: row.topic
    }));

  const isDone = (id: string) => normalizeProgressStatus(progressByTitle.get(makeProgressTitle('practice', id))?.status) === 'done';

  const updateProgress = async (id: string, nextStatus: 'done' | 'todo') => {
    if (!subjectKey) return;
    const title = makeProgressTitle('practice', id);
    const existing = progress.find((item) => item.title === title);

    if (nextStatus === 'todo') {
      if (existing) await api.delete(`/subject/${subjectKey}/topics/${existing.id}`);
    } else if (existing) {
      await api.patch(`/subject/${subjectKey}/topics/${existing.id}`, { title, status: nextStatus });
    } else {
      await api.post(`/subject/${subjectKey}/topics`, { title, status: nextStatus });
    }

    await queryClient.invalidateQueries({ queryKey: ['subject-progress', subjectKey] });
    await queryClient.invalidateQueries({ queryKey: ['subject', subjectKey] });
  };

  return (
    <AppShell>
      <div className="space-y-6 py-8">
        <div>
          <h1 className="text-3xl font-semibold">{catalog?.title ?? 'Subject'} — Practice Questions</h1>
          <p className="mt-2 text-sm text-white/60">Dataset-driven practice drills with saved progress and difficulty filters.</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {difficultyOrder.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setFilter(item)}
              className={`rounded-full px-4 py-2 text-sm transition ${filter === item ? 'bg-fuchsia-500/20 text-white ring-1 ring-fuchsia-400/50' : 'bg-white/5 text-white/55 hover:text-white'}`}
            >
              {item}
            </button>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Practice drills</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {items.map((item) => {
              const done = isDone(item.id);
              return (
                <div key={item.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-start gap-4">
                    <input
                      type="checkbox"
                      checked={done}
                      onChange={() => void updateProgress(item.id, done ? 'todo' : 'done')}
                      className="mt-1 h-4 w-4 rounded border-white/20 bg-transparent text-fuchsia-500"
                    />
                    <div className="flex-1 space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-medium text-white">{item.title}</p>
                          <p className="mt-1 text-xs uppercase tracking-[0.22em] text-white/40">{item.module}</p>
                        </div>
                        <Badge>{item.difficulty}</Badge>
                      </div>
                      <a href={item.resource} target="_blank" rel="noopener noreferrer" className="inline-flex text-sm text-fuchsia-300 underline-offset-4 hover:underline">
                        Open resource link
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
