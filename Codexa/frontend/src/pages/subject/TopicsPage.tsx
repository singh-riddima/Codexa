import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AppShell } from '@/components/layout/AppShell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import api from '@/api/client';
import { makeProgressTitle, normalizeProgressStatus, type ProgressRecord } from '@/lib/subject-progress';

type CatalogSubtopic = {
  title: string;
  difficulty: string;
  practiceResource: string;
  interviewResource: string;
};

type CatalogTopic = {
  title: string;
  difficulty: string;
  practiceResource: string;
  interviewResource: string;
  subtopics: CatalogSubtopic[];
};

type CatalogModule = {
  title: string;
  topics: CatalogTopic[];
};

type CatalogSubject = {
  key: string;
  title: string;
  modules: CatalogModule[];
  counts: { modules: number; topics: number; subtopics: number };
};

export default function TopicsPage() {
  const { subjectKey } = useParams();
  const queryClient = useQueryClient();
  const [optimisticProgress, setOptimisticProgress] = useState<Record<string, boolean>>({});

  const { data: catalog, isLoading: catalogLoading } = useQuery({
    queryKey: ['subject-catalog', subjectKey],
    queryFn: async () => {
      const res = await api.get(`/subject/${subjectKey}/catalog`);
      return res.data.subject as CatalogSubject;
    },
    enabled: Boolean(subjectKey)
  });

  const { data: progress = [], isLoading: progressLoading } = useQuery({
    queryKey: ['subject-progress', subjectKey],
    queryFn: async () => {
      const res = await api.get(`/subject/${subjectKey}/topics`);
      return (res.data.topics ?? []) as ProgressRecord[];
    },
    enabled: Boolean(subjectKey)
  });

  const progressByTitle = useMemo(() => new Map(progress.map((item) => [item.title, item])), [progress]);

  const makeTopicKey = (moduleTitle: string, topicTitle: string) => `${moduleTitle}::${topicTitle}`;
  const makeSubtopicKey = (moduleTitle: string, topicTitle: string, subtopicTitle: string) => `${moduleTitle}::${topicTitle}::${subtopicTitle}`;

  const isCompleted = (scope: string, title: string) => {
    const optimisticKey = makeProgressTitle(scope, title);
    if (optimisticKey in optimisticProgress) {
      return optimisticProgress[optimisticKey];
    }

    const prefixed = makeProgressTitle(scope, title);
    const record = progressByTitle.get(prefixed) ?? progressByTitle.get(title);
    return normalizeProgressStatus(record?.status) === 'done';
  };

  const upsertProgress = async (scope: string, title: string, nextStatus: 'done' | 'todo') => {
    if (!subjectKey) return;
    const prefixedTitle = makeProgressTitle(scope, title);
    const existing = progress.find((item) => item.title === prefixedTitle || item.title === title);
    const optimisticKey = makeProgressTitle(scope, title);

    setOptimisticProgress((current) => ({ ...current, [optimisticKey]: nextStatus === 'done' }));

    try {
      if (nextStatus === 'todo') {
        if (existing) {
          await api.delete(`/subject/${subjectKey}/topics/${existing.id}`);
        }
      } else if (existing) {
        await api.patch(`/subject/${subjectKey}/topics/${existing.id}`, { title: prefixedTitle, status: nextStatus });
      } else {
        await api.post(`/subject/${subjectKey}/topics`, { title: prefixedTitle, status: nextStatus });
      }

      await queryClient.invalidateQueries({ queryKey: ['subject-progress', subjectKey] });
      await queryClient.invalidateQueries({ queryKey: ['subject', subjectKey] });
    } finally {
      setOptimisticProgress((current) => {
        const next = { ...current };
        delete next[optimisticKey];
        return next;
      });
    }
  };

  const totalItems = (catalog?.modules ?? []).reduce((total, module) => total + module.topics.reduce((topicTotal, topic) => topicTotal + 1 + topic.subtopics.length, 0), 0);
  const completedItems = (catalog?.modules ?? []).reduce((total, module) => {
    return total + module.topics.reduce((topicTotal, topic) => {
      const topicDone = isCompleted('topic', makeTopicKey(module.title, topic.title)) ? 1 : 0;
      const subtopicDone = topic.subtopics.reduce((subTotal, subtopic) => subTotal + (isCompleted('subtopic', subtopic.title) ? 1 : 0), 0);
      return topicTotal + topicDone + subtopicDone;
    }, 0);
  }, 0);

  return (
    <AppShell>
      <div className="space-y-6 py-8">
        <div>
          <h1 className="text-2xl font-semibold">{catalog?.title ?? subjectKey} — Topics</h1>
          <p className="mt-1 text-sm text-white/60">Modules, topics, and subtopics loaded from the backend dataset.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader><CardTitle>Modules</CardTitle></CardHeader>
            <CardContent className="text-2xl font-semibold">{catalogLoading ? '...' : catalog?.counts.modules ?? 0}</CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Topics</CardTitle></CardHeader>
            <CardContent className="text-2xl font-semibold">{catalogLoading ? '...' : catalog?.counts.topics ?? 0}</CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Completion</CardTitle></CardHeader>
            <CardContent className="text-2xl font-semibold">{catalogLoading || progressLoading ? '...' : `${totalItems ? Math.round((completedItems / totalItems) * 100) : 0}%`}</CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          {(catalog?.modules ?? []).map((module) => (
            <Card key={module.title}>
              <CardHeader>
                <CardTitle>{module.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {module.topics.map((topic) => {
                  const topicKey = makeTopicKey(module.title, topic.title);
                  const topicDone = isCompleted('topic', topicKey);
                  return (
                    <div key={topicKey} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <div className="flex items-start gap-4">
                        <input
                          type="checkbox"
                          checked={topicDone}
                          onChange={() => void upsertProgress('topic', topicKey, topicDone ? 'todo' : 'done')}
                            className="mt-1 h-4 w-4 rounded border-white/20 accent-fuchsia-500"
                          aria-label={`Mark ${topic.title} complete`}
                        />
                        <div className="flex-1 space-y-3">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div>
                              <p className="font-medium text-white">{topic.title}</p>
                              <p className="mt-1 text-xs uppercase tracking-[0.28em] text-white/45">Topic</p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <Badge>{topic.difficulty}</Badge>
                              <a href={topic.practiceResource} target="_blank" rel="noopener noreferrer" className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70 transition hover:border-fuchsia-400/40 hover:text-white">Practice Resource</a>
                              <a href={topic.interviewResource} target="_blank" rel="noopener noreferrer" className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70 transition hover:border-fuchsia-400/40 hover:text-white">Interview Resource</a>
                            </div>
                          </div>

                          <div className="space-y-2 pl-4">
                            {topic.subtopics.map((subtopic) => {
                              const subtopicKey = makeSubtopicKey(module.title, topic.title, subtopic.title);
                              const subtopicDone = isCompleted('subtopic', subtopicKey);
                              return (
                                <div key={subtopicKey} className="flex items-start gap-3 rounded-xl border border-white/10 bg-black/20 p-3">
                                  <input
                                    type="checkbox"
                                    checked={subtopicDone}
                                    onChange={() => void upsertProgress('subtopic', subtopicKey, subtopicDone ? 'todo' : 'done')}
                                    className="mt-1 h-4 w-4 rounded border-white/20 accent-fuchsia-500"
                                    aria-label={`Mark ${subtopic.title} complete`}
                                  />
                                  <div className="flex-1">
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                      <div>
                                        <p className="text-sm font-medium text-white">{subtopic.title}</p>
                                        <p className="mt-1 text-xs uppercase tracking-[0.25em] text-white/40">Subtopic</p>
                                      </div>
                                      <div className="flex flex-wrap gap-2">
                                        <Badge>{subtopic.difficulty}</Badge>
                                        <a href={subtopic.practiceResource} target="_blank" rel="noopener noreferrer" className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] text-white/70 transition hover:border-fuchsia-400/40 hover:text-white">Practice</a>
                                        <a href={subtopic.interviewResource} target="_blank" rel="noopener noreferrer" className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] text-white/70 transition hover:border-fuchsia-400/40 hover:text-white">Interview</a>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
