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
import { CodexaSelect } from '@/components/ui/CodexaSelect';

import { CodexaDateInput } from '@/components/ui/codexa-date-input';


type TargetCategory = 'Daily' | 'Weekly' | 'Monthly';

type ScheduleType = 'Today' | 'This Week' | 'Custom Date';

type TargetItem = {
  id: number;
  title: string;
  subject: string;
  category: TargetCategory;
  schedule: ScheduleType;
  scheduleDate?: string; // yyyy-mm-dd for Custom Date
  deadline: string;
  priority: 'Low' | 'Medium' | 'High';
  progress: number;
  completed: boolean;
};


const buildTargetsFromSubjects = (subjects: string[]): TargetItem[] => subjects.map((subject, index) => {
  const category: TargetCategory = index % 3 === 0 ? 'Daily' : index % 3 === 1 ? 'Weekly' : 'Monthly';

  const schedule: ScheduleType = category === 'Daily' ? 'Today' : category === 'Weekly' ? 'This Week' : 'Custom Date';
  const scheduleDate = schedule === 'Custom Date' ? '2026-05-30' : undefined;

  const deadline = schedule === 'Today' ? 'Today' : schedule === 'This Week' ? 'This Week' : scheduleDate ? scheduleDate : 'Custom';

  return {
    id: index + 1,
    title: `Revise ${subject}`,
    subject,
    category,
    schedule,
    scheduleDate,
    deadline,
    priority: category === 'Daily' ? 'High' : category === 'Weekly' ? 'Medium' : 'Low',
    progress: 0,
    completed: false
  };
});


type SubjectCatalogItem = {
  key: string;
  title: string;
  sourceFile: string;
  counts: {
    modules: number;
    topics: number;
    subtopics: number;
  };
};

type SubjectCatalogModule = {
  module: string;
  topics: Array<{ title: string }>;
};

type SubjectCatalogResponse = {
  subject: {
    key: string;
    title: string;
    modules: SubjectCatalogModule[];
  };
};

export default function TargetsPage() {
  const { user } = useAuth();
  const [targets, setTargets] = useState<TargetItem[]>([]);

  const selectedSubjects = user?.selectedSubjects ?? [];
  const selectedSubjectKeys = selectedSubjects.map((subject) => slugifySubjectName(subject));

  const [draftSubjectKey, setDraftSubjectKey] = useState<string>('');
  const [draftSubjectTitle, setDraftSubjectTitle] = useState<string>('');

  const [subjectSearch, setSubjectSearch] = useState('');
  const [titleSearch, setTitleSearch] = useState('');
  const [useCustomTitle, setUseCustomTitle] = useState(false);

  const [draftTitle, setDraftTitle] = useState('');

  const [availableTargetTitles, setAvailableTargetTitles] = useState<string[]>([]);

  useEffect(() => {
    // Debug: ensure dropdown selection + title list are updated
    console.log('[TargetsPage] draftSubjectKey:', draftSubjectKey);
    console.log('[TargetsPage] availableTargetTitles:', availableTargetTitles.slice(0, 10));
    console.log('[TargetsPage] draftTitle:', draftTitle);
  }, [draftSubjectKey, availableTargetTitles, draftTitle]);





  const subjectQueries = useQueries({

    queries: selectedSubjectKeys.map((key) => ({
      queryKey: ['subject', key],
      queryFn: async () => (await api.get(`/subject/${key}`)).data,
      enabled: Boolean(key)
    }))
  });

  const [subjectCatalog, setSubjectCatalog] = useState<SubjectCatalogItem[]>([]);

  useEffect(() => {
    // keep existing behavior (local generated targets + subject completion)
    setTargets(buildTargetsFromSubjects(selectedSubjects));
  }, [user?.selectedSubjects]);

  useEffect(() => {
    // update progress from subject summaries (existing behavior)
    setTargets((prev) => prev.map((item, index) => {
      const summary = subjectQueries[index]?.data ?? null;
      return summary ? {
        ...item,
        progress: summary.completion ?? item.progress,
        completed: (summary.completion ?? item.progress) >= 90
      } : item;
    }));
  }, [subjectQueries]);

  useEffect(() => {
    // init subject dropdown to first selected subject
    const first = selectedSubjectKeys[0] ?? '';
    if (!draftSubjectKey && first) setDraftSubjectKey(first);
  }, [selectedSubjectKeys, draftSubjectKey]);

  useEffect(() => {
    // derive selected subject display title
    const idx = selectedSubjectKeys.findIndex((k) => k === draftSubjectKey);
    setDraftSubjectTitle(idx >= 0 ? selectedSubjects[idx] : '');
  }, [draftSubjectKey, selectedSubjectKeys, selectedSubjects]);


  // Load target titles when subject changes
  useEffect(() => {
    const fetchSubjectTitles = async () => {
      if (!draftSubjectKey) {
        setAvailableTargetTitles([]);
        return;
      }

      try {
        const res = await api.get(`/subject/${draftSubjectKey}/catalog`);
        const data = res.data as SubjectCatalogResponse;

        const modules = data?.subject?.modules ?? [];
        const titles = modules
          .flatMap((m) => {
            const topicTitles = (m.topics ?? []).map((t) => t.title).filter(Boolean);
            return [m.module, ...topicTitles];
          })
          .filter(Boolean);

        setAvailableTargetTitles(Array.from(new Set(titles)));

        // if current title isn't available for new subject, clear it
        setDraftTitle((prev) => {
          const nextTitle = prev?.trim?.() ?? '';
          if (!nextTitle) return '';
          return titles.includes(nextTitle) ? prev : '';
        });
      } catch {
        setAvailableTargetTitles([]);
        setDraftTitle('');
      }
    };

    void fetchSubjectTitles();
    setTitleSearch('');
    setUseCustomTitle(false);
    // keep draftTitle if still valid; it will be validated above
  }, [draftSubjectKey]);

  // If the title was selected while using the dropdown, it must be controlled
  // by `draftTitle` (same state used for value + Create Target).
  // No further changes required here.


  const filteredSubjectOptions = useMemo(() => {
    const q = subjectSearch.trim().toLowerCase();
    const subjects = selectedSubjects;
    if (!q) return subjects;
    return subjects.filter((s) => s.toLowerCase().includes(q));
  }, [subjectSearch, selectedSubjects]);

  const filteredTitleOptions = useMemo(() => {
    if (useCustomTitle) return [];
    const q = titleSearch.trim().toLowerCase();
    if (!q) return availableTargetTitles;
    return availableTargetTitles.filter((t) => t.toLowerCase().includes(q));
  }, [availableTargetTitles, titleSearch, useCustomTitle]);

  const grouped = useMemo(() => ({
    Daily: targets.filter((item) => item.category === 'Daily'),
    Weekly: targets.filter((item) => item.category === 'Weekly'),
    Monthly: targets.filter((item) => item.category === 'Monthly')
  }), [targets]);

  const [scheduleType, setScheduleType] = useState<ScheduleType>('Today');
  const [customScheduleDate, setCustomScheduleDate] = useState<string>('2026-05-30');

  const addTarget = () => {
    const subject = draftSubjectTitle || selectedSubjects[0] || 'General';
    const nextTitle = useCustomTitle ? draftTitle.trim() : draftTitle.trim();
    if (!nextTitle) return;

    const scheduleDate = scheduleType === 'Custom Date' ? customScheduleDate : undefined;
    const deadline = scheduleType === 'Today' ? 'Today' : scheduleType === 'This Week' ? 'This Week' : scheduleDate ? scheduleDate : 'Custom';

    setTargets((prev) => [
      {
        id: Date.now(),
        title: nextTitle,
        subject,
        category: 'Daily',
        schedule: scheduleType,
        scheduleDate,
        deadline,
        priority: 'Medium',
        progress: 0,
        completed: false
      },
      ...prev
    ]);

    // reset workflow
    setDraftTitle('');
    setTitleSearch('');
    setUseCustomTitle(false);
    setScheduleType('Today');
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
              <div className="md:col-span-2">
                <div className="grid gap-3 md:grid-cols-2">
                  {/* Step 1: Subject (searchable dropdown) */}
                  <div className="space-y-2">
                    <Input value={subjectSearch} onChange={(e) => setSubjectSearch(e.target.value)} placeholder="Search subject" />
                    <CodexaSelect
                      value={draftSubjectKey}
                      onChange={(e) => setDraftSubjectKey(e.target.value)}
                    >
                      {filteredSubjectOptions.map((subject) => {
                        const key = slugifySubjectName(subject);
                        return (
                          <option key={key} value={key} className="text-black">
                            {subject}
                          </option>
                        );
                      })}
                    </CodexaSelect>
                  </div>


                  {/* Step 2: Title (dropdown from dataset + optional custom) */}
                  <div className="space-y-2">
                    <Input
                      value={draftTitle}
                      readOnly={!useCustomTitle}
                      onChange={(e) => {
                        if (!useCustomTitle) return;
                        setDraftTitle(e.target.value);
                      }}
                      placeholder={useCustomTitle ? 'Custom target title' : 'Search target title'}
                    />


                    {useCustomTitle ? null : (
                      <CodexaSelect
                        value={draftTitle}
                        onChange={(e) => setDraftTitle(e.target.value)}
                      >
                        <option value="" className="text-black">Select title</option>
                        {filteredTitleOptions.map((t) => (
                          <option key={t} value={t} className="text-black">{t}</option>
                        ))}
                      </CodexaSelect>
                    )}

                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-2 text-xs text-white/60">
                        <input
                          type="checkbox"
                          checked={useCustomTitle}
                          onChange={(e) => {
                            const next = e.target.checked;
                            setUseCustomTitle(next);
                            setDraftTitle(next ? draftTitle : '');
                          }}
                        />
                        Create Custom Target
                      </label>
                    </div>
                  </div>

                  {/* Step 3: Schedule type */}
                  <div className="space-y-2">
                    <CodexaSelect
                      value={scheduleType}
                      onChange={(e) => setScheduleType(e.target.value as ScheduleType)}
                    >
                      <option value="Today" className="text-black">Today</option>
                      <option value="This Week" className="text-black">This Week</option>
                      <option value="Custom Date" className="text-black">Custom Date</option>
                    </CodexaSelect>

                    {scheduleType === 'Custom Date' ? (
                      <CodexaDateInput
                        value={customScheduleDate}
                        onChange={(e) => setCustomScheduleDate(e.target.value)}
                      />
                    ) : null}
                  </div>

                </div>
              </div>

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
                        <p className="text-xs text-white/55">
                          {item.subject} • Schedule: {item.schedule}
                          {item.schedule === 'Custom Date' && item.scheduleDate ? ` • ${item.scheduleDate}` : ''}
                        </p>
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

