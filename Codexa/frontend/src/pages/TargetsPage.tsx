import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AppShell } from '@/components/layout/AppShell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { CodexaSelect } from '@/components/ui/CodexaSelect';
import { CodexaDateInput } from '@/components/ui/codexa-date-input';
import api from '@/api/client';
import { useAuth } from '@/context/AuthContext';
import { slugifySubjectName } from '@/lib/subject-data';

type ScheduleType = 'Today' | 'This Week' | 'Specific Date' | 'Custom Date';
type TargetStatus = 'Pending' | 'In Progress' | 'Completed';
type TargetPriority = 'Low' | 'Medium' | 'High';

type TargetItem = {
  id: string;
  subject: string;
  topic: string;
  schedule: string;
  scheduleDate: string | null;
  status: TargetStatus;
  priority: TargetPriority;
  progress: number;
  completed: boolean;
};

type SubjectCatalog = {
  modules: Array<{
    title: string;
    topics: Array<{
      title: string;
      subtopics: Array<{ title: string }>;
    }>;
  }>;
};

const scheduleOptions: ScheduleType[] = ['Today', 'This Week', 'Specific Date', 'Custom Date'];
const priorityOptions: TargetPriority[] = ['Low', 'Medium', 'High'];
const statusOptions: TargetStatus[] = ['Pending', 'In Progress', 'Completed'];

const formatDate = (value: string | null) => (value ? new Date(value).toLocaleDateString() : '');

export default function TargetsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const selectedSubjects = user?.selectedSubjects ?? [];
  const selectedSubjectKeys = useMemo(() => selectedSubjects.map((subject) => slugifySubjectName(subject)), [selectedSubjects]);

  const [subjectSearch, setSubjectSearch] = useState('');
  const [topicSearch, setTopicSearch] = useState('');
  const [draftSubjectKey, setDraftSubjectKey] = useState('');
  const [draftSubjectTitle, setDraftSubjectTitle] = useState('');
  const [draftTopic, setDraftTopic] = useState('');
  const [scheduleType, setScheduleType] = useState<ScheduleType>('Today');
  const [scheduleDate, setScheduleDate] = useState('');
  const [priority, setPriority] = useState<TargetPriority>('Medium');
  const [useCustomTopic, setUseCustomTopic] = useState(false);

  const { data: targetsData } = useQuery({
    queryKey: ['targets'],
    queryFn: async () => (await api.get('/targets')).data.targets as TargetItem[],
    enabled: Boolean(user)
  });

  const { data: subjectCatalog } = useQuery({
    queryKey: ['target-subject-catalog', draftSubjectKey],
    queryFn: async () => (await api.get(`/subject/${draftSubjectKey}/catalog`)).data.subject as SubjectCatalog,
    enabled: Boolean(draftSubjectKey)
  });

  useEffect(() => {
    if (!draftSubjectKey && selectedSubjectKeys[0]) {
      setDraftSubjectKey(selectedSubjectKeys[0]);
    }
  }, [draftSubjectKey, selectedSubjectKeys]);

  useEffect(() => {
    const index = selectedSubjectKeys.findIndex((key) => key === draftSubjectKey);
    setDraftSubjectTitle(index >= 0 ? selectedSubjects[index] : '');
  }, [draftSubjectKey, selectedSubjectKeys, selectedSubjects]);

  useEffect(() => {
    setDraftTopic('');
    setTopicSearch('');
    setUseCustomTopic(false);
  }, [draftSubjectKey]);

  const subjectOptions = useMemo(() => {
    const query = subjectSearch.trim().toLowerCase();
    return query ? selectedSubjects.filter((subject) => subject.toLowerCase().includes(query)) : selectedSubjects;
  }, [selectedSubjects, subjectSearch]);

  const topicOptions = useMemo(() => {
    const values = new Set<string>();
    (subjectCatalog?.modules ?? []).forEach((module) => {
      values.add(module.title);
      module.topics.forEach((topic) => {
        values.add(topic.title);
        topic.subtopics.forEach((subtopic) => values.add(subtopic.title));
      });
    });

    const query = topicSearch.trim().toLowerCase();
    const list = Array.from(values);
    return query ? list.filter((title) => title.toLowerCase().includes(query)) : list;
  }, [subjectCatalog, topicSearch]);

  useEffect(() => {
    if (!useCustomTopic && !draftTopic && topicOptions[0]) {
      setDraftTopic(topicOptions[0]);
    }
  }, [draftTopic, topicOptions, useCustomTopic]);

  const createTarget = useMutation({
    mutationFn: async () => {
      if (!draftSubjectTitle || !draftTopic) {
        throw new Error('Select a subject and topic first.');
      }

      return (await api.post('/targets', {
        subject: draftSubjectTitle,
        topic: draftTopic,
        schedule: scheduleType,
        scheduleDate: scheduleType === 'Today' || scheduleType === 'This Week' || !scheduleDate ? null : scheduleDate,
        status: 'Pending',
        priority,
        progress: 0,
        completed: false
      })).data.target as TargetItem;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['targets'] });
      setDraftTopic('');
      setTopicSearch('');
      setUseCustomTopic(false);
      setScheduleType('Today');
      setScheduleDate('');
      setPriority('Medium');
    }
  });

  const updateTarget = useMutation({
    mutationFn: async (payload: { id: string; data: Partial<TargetItem> }) => (await api.patch(`/targets/${payload.id}`, payload.data)).data.target as TargetItem,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['targets'] });
    }
  });

  const toggleTarget = useMutation({
    mutationFn: async (id: string) => (await api.patch(`/targets/${id}/toggle`)).data.target as TargetItem,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['targets'] });
    }
  });

  const deleteTarget = useMutation({
    mutationFn: async (id: string) => api.delete(`/targets/${id}`),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['targets'] });
    }
  });

  const grouped = useMemo(() => ({
    Pending: (targetsData ?? []).filter((target) => target.status === 'Pending'),
    'In Progress': (targetsData ?? []).filter((target) => target.status === 'In Progress'),
    Completed: (targetsData ?? []).filter((target) => target.status === 'Completed')
  }), [targetsData]);

  return (
    <AppShell>
      <div className="space-y-8 py-8">
        <section>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-xs uppercase tracking-[0.35em] text-white/45">Targets section</p>
            <h1 className="mt-3 text-4xl font-semibold">Manage daily, weekly, and monthly targets.</h1>
            <p className="mt-4 max-w-3xl text-white/60">Create, update, and complete subject-wise targets with saved progress.</p>
          </motion.div>
        </section>

        <section>
          <Card>
            <CardHeader><CardTitle>Create new target</CardTitle></CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-[1fr_220px_auto]">
              <div className="md:col-span-2">
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="space-y-2">
                    <Input value={subjectSearch} onChange={(event) => setSubjectSearch(event.target.value)} placeholder="Search subject" />
                    <CodexaSelect value={draftSubjectKey} onChange={(value: string) => setDraftSubjectKey(value)}>
                      {subjectOptions.map((subject) => {
                        const key = slugifySubjectName(subject);
                        return <option key={key} value={key} className="text-black">{subject}</option>;
                      })}
                    </CodexaSelect>
                  </div>

                  <div className="space-y-2">
                    <Input
                      value={draftTopic}
                      readOnly={!useCustomTopic}
                      onChange={(event) => {
                        if (!useCustomTopic) return;
                        setDraftTopic(event.target.value);
                      }}
                      placeholder={useCustomTopic ? 'Custom topic' : 'Search topic'}
                    />

                    {useCustomTopic ? null : (
                      <>
                        <Input value={topicSearch} onChange={(event) => setTopicSearch(event.target.value)} placeholder="Filter topic list" />
                        <CodexaSelect value={draftTopic} onChange={(value: string) => setDraftTopic(value)}>
                          <option value="" className="text-black">Select topic</option>
                          {topicOptions.map((title) => <option key={title} value={title} className="text-black">{title}</option>)}
                        </CodexaSelect>
                      </>
                    )}

                    <label className="flex items-center gap-2 text-xs text-white/60">
                      <input type="checkbox" checked={useCustomTopic} onChange={(event) => setUseCustomTopic(event.target.checked)} />
                      Create custom topic
                    </label>
                  </div>

                  <div className="space-y-2">
                    <CodexaSelect value={scheduleType} onChange={(value: string) => setScheduleType(value as ScheduleType)}>
                      {scheduleOptions.map((option) => <option key={option} value={option} className="text-black">{option}</option>)}
                    </CodexaSelect>

                    {(scheduleType === 'Specific Date' || scheduleType === 'Custom Date') ? (
                      <CodexaDateInput value={scheduleDate} onChange={(event) => setScheduleDate(event.target.value)} />
                    ) : null}

                    <CodexaSelect value={priority} onChange={(value: string) => setPriority(value as TargetPriority)}>
                      {priorityOptions.map((option) => <option key={option} value={option} className="text-black">{option}</option>)}
                    </CodexaSelect>
                  </div>
                </div>
              </div>

              <Button onClick={() => void createTarget.mutateAsync()} disabled={createTarget.isPending}>Create target</Button>
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-6 xl:grid-cols-3">
          {statusOptions.map((status) => (
            <Card key={status}>
              <CardHeader>
                <CardTitle>{status} targets</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {grouped[status].length === 0 ? <p className="text-sm text-white/55">No targets yet.</p> : null}
                {grouped[status].map((item) => (
                  <div key={item.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="mb-2 flex items-start justify-between gap-2">
                      <div>
                        <p className="font-medium">{item.topic}</p>
                        <p className="text-xs text-white/55">
                          {item.subject} • Schedule: {item.schedule}
                          {item.scheduleDate ? ` • ${formatDate(item.scheduleDate)}` : ''}
                        </p>
                      </div>
                      <Badge className={item.priority === 'High' ? 'border-pink-400/40 bg-pink-500/20 text-pink-100' : item.priority === 'Medium' ? 'border-fuchsia-400/40 bg-fuchsia-500/20 text-fuchsia-100' : 'border-white/10 bg-white/5 text-white/80'}>
                        {item.priority}
                      </Badge>
                    </div>
                    <Progress value={item.progress} />
                    <p className="mt-2 text-xs text-white/55">Completion status: {item.completed ? 'Completed' : item.status} ({item.progress}%)</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Button size="sm" variant="secondary" onClick={() => void updateTarget.mutateAsync({ id: item.id, data: { progress: Math.min(100, item.progress + 10), status: item.completed ? 'Completed' : 'In Progress' } })}>+10%</Button>
                      <Button size="sm" variant="secondary" onClick={() => void updateTarget.mutateAsync({ id: item.id, data: { progress: Math.max(0, item.progress - 10), status: item.progress <= 10 ? 'Pending' : 'In Progress' } })}>-10%</Button>
                      <Button size="sm" variant="outline" onClick={() => void toggleTarget.mutateAsync(item.id)}>{item.completed ? 'Mark pending' : 'Mark completed'}</Button>
                      <Button size="sm" variant="ghost" onClick={() => void deleteTarget.mutateAsync(item.id)}>Delete</Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </section>

        {!targetsData?.length ? <Card><CardContent className="p-6 text-sm text-white/55">Add subjects first to generate personalized targets.</CardContent></Card> : null}
      </div>
    </AppShell>
  );
}
