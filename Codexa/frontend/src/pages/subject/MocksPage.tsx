import { useMemo } from 'react';
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

export default function MocksPage() {
  const { subjectKey } = useParams();
  const queryClient = useQueryClient();

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

  const items = (catalog?.rows ?? []).map((row) => ({
    id: `${row.topic}::${row.subtopic || row.topic}`,
    title: row.subtopic || row.topic,
    topic: row.topic,
    subtopic: row.subtopic,
    difficulty: row.difficulty,
    resource: row.interviewResource,
    module: row.module
  }));

  const getStatus = (id: string) => normalizeProgressStatus(progressByTitle.get(makeProgressTitle('mock', id))?.status);

  const updateProgress = async (id: string, nextStatus: 'attempted' | 'done' | 'todo') => {
    if (!subjectKey) return;
    const title = makeProgressTitle('mock', id);
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

  const readiness = items.length ? Math.round((items.filter((item) => getStatus(item.id) === 'done').length / items.length) * 100) : 0;

  return (
    <AppShell>
      <div className="space-y-6 py-8">
        <div>
          <h1 className="text-3xl font-semibold">{catalog?.title ?? 'Subject'} — Mock Interviews</h1>
          <p className="mt-2 text-sm text-white/60">Dataset-driven mock interview prompts with progress and readiness score.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Readiness score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold text-white">{readiness}%</div>
            <p className="mt-2 text-sm text-white/55">Based on completed mock prompts.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Mock interview prompts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {items.map((item) => {
              const status = getStatus(item.id);
              const attempted = status === 'attempted' || status === 'done';
              const completed = status === 'done';
              return (
                <div key={item.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-start gap-4">
                    <input
                      type="checkbox"
                      checked={completed}
                      onChange={() => void updateProgress(item.id, completed ? 'todo' : 'done')}
                      className="mt-1 h-4 w-4 rounded border-white/20 bg-transparent text-fuchsia-500"
                      aria-label={`Mark ${item.title} complete`}
                    />
                    <div className="flex-1 space-y-3">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="font-medium text-white">{item.title}</p>
                          <p className="mt-1 text-sm text-white/55">Topic: {item.topic}</p>
                          <p className="text-xs uppercase tracking-[0.22em] text-white/40">{item.subtopic || item.module}</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Badge>{item.difficulty}</Badge>
                          <Button size="sm" variant={attempted ? 'secondary' : 'ghost'} onClick={() => void updateProgress(item.id, attempted ? 'todo' : 'attempted')}>
                            {attempted ? 'Attempted' : 'Mark Attempted'}
                          </Button>
                        </div>
                      </div>
                      <a href={item.resource} target="_blank" rel="noopener noreferrer" className="inline-flex text-sm text-fuchsia-300 underline-offset-4 hover:underline">
                        Open reference link
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
