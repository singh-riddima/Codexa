import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import api from '@/api/client';
import { useAuth } from '@/context/AuthContext';

const durations = ['1 Month', '3 Months', '6 Months', '9 Months', '12 Months', 'Custom'];

type SubjectOption = {
  label: string;
  category: string;
  aliases?: string[];
};

type DatasetCatalogSubject = {
  key: string;
  title: string;
  sourceFile: string;
};

const subjectGroups: Array<{ category: string; subjects: SubjectOption[] }> = [
  {
    category: 'Core Computer Science Subjects',
    subjects: [
      { label: 'Database Management Systems (DBMS)', category: 'Core Computer Science Subjects', aliases: ['DBMS', 'database management systems'] },
      { label: 'Operating Systems (OS)', category: 'Core Computer Science Subjects', aliases: ['OS', 'operating systems'] },
      { label: 'Computer Networks (CN)', category: 'Core Computer Science Subjects', aliases: ['CN', 'computer networks'] },
      { label: 'Object Oriented Programming (OOPS)', category: 'Core Computer Science Subjects', aliases: ['OOPS', 'oop'] },
      { label: 'Data Structures & Algorithms (DSA)', category: 'Core Computer Science Subjects', aliases: ['DSA', 'data structures', 'algorithms'] },
      { label: 'Software Engineering', category: 'Core Computer Science Subjects' },
      { label: 'Computer Organization & Architecture (COA)', category: 'Core Computer Science Subjects', aliases: ['COA'] },
      { label: 'Theory of Computation (TOC)', category: 'Core Computer Science Subjects', aliases: ['TOC'] },
      { label: 'Compiler Design', category: 'Core Computer Science Subjects' },
      { label: 'Design & Analysis of Algorithms (DAA)', category: 'Core Computer Science Subjects', aliases: ['DAA'] },
      { label: 'Discrete Mathematics', category: 'Core Computer Science Subjects' },
      { label: 'Digital Logic Design', category: 'Core Computer Science Subjects' },
      { label: 'Microprocessors & Microcontrollers', category: 'Core Computer Science Subjects' },
      { label: 'Artificial Intelligence', category: 'Core Computer Science Subjects', aliases: ['AI'] },
      { label: 'Machine Learning', category: 'Core Computer Science Subjects', aliases: ['ML'] },
      { label: 'Deep Learning', category: 'Core Computer Science Subjects' },
      { label: 'Data Mining', category: 'Core Computer Science Subjects' },
      { label: 'Cloud Computing', category: 'Core Computer Science Subjects' },
      { label: 'Distributed Systems', category: 'Core Computer Science Subjects' },
      { label: 'Cyber Security', category: 'Core Computer Science Subjects', aliases: ['cybersecurity'] },
      { label: 'Cryptography', category: 'Core Computer Science Subjects' },
      { label: 'Web Technologies', category: 'Core Computer Science Subjects' },
      { label: 'Mobile App Development', category: 'Core Computer Science Subjects' },
      { label: 'Internet of Things (IoT)', category: 'Core Computer Science Subjects', aliases: ['IoT'] },
      { label: 'Human Computer Interaction', category: 'Core Computer Science Subjects', aliases: ['HCI'] },
      { label: 'Parallel Computing', category: 'Core Computer Science Subjects' },
      { label: 'High Performance Computing', category: 'Core Computer Science Subjects', aliases: ['HPC'] },
      { label: 'DevOps', category: 'Core Computer Science Subjects' },
      { label: 'Blockchain Technology', category: 'Core Computer Science Subjects' },
      { label: 'Big Data Analytics', category: 'Core Computer Science Subjects' },
      { label: 'Natural Language Processing (NLP)', category: 'Core Computer Science Subjects', aliases: ['NLP'] },
      { label: 'Computer Graphics', category: 'Core Computer Science Subjects' }
    ]
  },
  {
    category: 'Programming Languages',
    subjects: [
      { label: 'C Programming', category: 'Programming Languages' },
      { label: 'C++', category: 'Programming Languages' },
      { label: 'Java', category: 'Programming Languages' },
      { label: 'Python', category: 'Programming Languages' },
      { label: 'JavaScript', category: 'Programming Languages' },
      { label: 'TypeScript', category: 'Programming Languages' },
      { label: 'Go', category: 'Programming Languages' },
      { label: 'Rust', category: 'Programming Languages' },
      { label: 'Kotlin', category: 'Programming Languages' },
      { label: 'Swift', category: 'Programming Languages' },
      { label: 'PHP', category: 'Programming Languages' },
      { label: 'R Programming', category: 'Programming Languages' },
      { label: 'MATLAB', category: 'Programming Languages' }
    ]
  },
  {
    category: 'Development Subjects',
    subjects: [
      { label: 'Frontend Development', category: 'Development Subjects' },
      { label: 'Backend Development', category: 'Development Subjects' },
      { label: 'Full Stack Development', category: 'Development Subjects' },
      { label: 'MERN Stack', category: 'Development Subjects' },
      { label: 'MEAN Stack', category: 'Development Subjects' },
      { label: 'API Development', category: 'Development Subjects' },
      { label: 'System Design', category: 'Development Subjects' },
      { label: 'UI/UX Design', category: 'Development Subjects' },
      { label: 'Database Design', category: 'Development Subjects' },
      { label: 'Software Testing', category: 'Development Subjects' },
      { label: 'Agile Methodologies', category: 'Development Subjects' }
    ]
  },
  {
    category: 'AI/ML & Data Science',
    subjects: [
      { label: 'Artificial Neural Networks', category: 'AI/ML & Data Science' },
      { label: 'Reinforcement Learning', category: 'AI/ML & Data Science' },
      { label: 'Generative AI', category: 'AI/ML & Data Science' },
      { label: 'Computer Vision', category: 'AI/ML & Data Science' },
      { label: 'NLP', category: 'AI/ML & Data Science', aliases: ['Natural Language Processing'] },
      { label: 'Recommendation Systems', category: 'AI/ML & Data Science' },
      { label: 'MLOps', category: 'AI/ML & Data Science' },
      { label: 'Data Visualization', category: 'AI/ML & Data Science' },
      { label: 'Statistical Learning', category: 'AI/ML & Data Science' },
      { label: 'Predictive Analytics', category: 'AI/ML & Data Science' }
    ]
  },
  {
    category: 'Cyber Security',
    subjects: [
      { label: 'Ethical Hacking', category: 'Cyber Security' },
      { label: 'Network Security', category: 'Cyber Security' },
      { label: 'Information Security', category: 'Cyber Security' },
      { label: 'Penetration Testing', category: 'Cyber Security' },
      { label: 'Malware Analysis', category: 'Cyber Security' },
      { label: 'Digital Forensics', category: 'Cyber Security' },
      { label: 'Secure Coding', category: 'Cyber Security' },
      { label: 'Cyber Laws', category: 'Cyber Security' }
    ]
  },
  {
    category: 'Cloud & DevOps',
    subjects: [
      { label: 'AWS', category: 'Cloud & DevOps' },
      { label: 'Microsoft Azure', category: 'Cloud & DevOps' },
      { label: 'Google Cloud Platform', category: 'Cloud & DevOps' },
      { label: 'Docker', category: 'Cloud & DevOps' },
      { label: 'Kubernetes', category: 'Cloud & DevOps' },
      { label: 'CI/CD Pipelines', category: 'Cloud & DevOps' },
      { label: 'Linux Administration', category: 'Cloud & DevOps' },
      { label: 'Infrastructure as Code', category: 'Cloud & DevOps' }
    ]
  },
  {
    category: 'Placement Preparation',
    subjects: [
      { label: 'Aptitude', category: 'Placement Preparation' },
      { label: 'Logical Reasoning', category: 'Placement Preparation' },
      { label: 'Verbal Ability', category: 'Placement Preparation' },
      { label: 'Quantitative Aptitude', category: 'Placement Preparation' },
      { label: 'Interview Preparation', category: 'Placement Preparation' },
      { label: 'HR Interview Questions', category: 'Placement Preparation' },
      { label: 'Group Discussion Preparation', category: 'Placement Preparation' },
      { label: 'Resume Building', category: 'Placement Preparation' },
      { label: 'Competitive Coding', category: 'Placement Preparation' },
      { label: 'LeetCode Practice', category: 'Placement Preparation' },
      { label: 'Codeforces Practice', category: 'Placement Preparation' }
    ]
  },
  {
    category: 'Advanced Electives',
    subjects: [
      { label: 'Quantum Computing', category: 'Advanced Electives' },
      { label: 'Bioinformatics', category: 'Advanced Electives' },
      { label: 'Robotics', category: 'Advanced Electives' },
      { label: 'Embedded Systems', category: 'Advanced Electives' },
      { label: 'AR/VR Development', category: 'Advanced Electives' },
      { label: 'Game Development', category: 'Advanced Electives' },
      { label: 'Edge Computing', category: 'Advanced Electives' },
      { label: 'Wireless Sensor Networks', category: 'Advanced Electives' }
    ]
  }
];

function slugifySubjectName(name: string) {
  return name.trim().toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

export default function OnboardingPage() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [selectedDuration, setSelectedDuration] = useState<string | null>(null);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [subjectSearch, setSubjectSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [customSubject, setCustomSubject] = useState('');
  const [customSubjects, setCustomSubjects] = useState<SubjectOption[]>([]);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const { data: datasetCatalog } = useQuery({
    queryKey: ['subject-catalog-list'],
    queryFn: async () => (await api.get('/subject/catalog')).data.subjects as DatasetCatalogSubject[],
    enabled: Boolean(user)
  });

  const catalogSubjectOptions = useMemo(() => {
    const existingLabels = new Set(subjectGroups.flatMap((group) => group.subjects.map((subject) => slugifySubjectName(subject.label))));

    return (datasetCatalog ?? [])
      .map((subject) => ({
        label: subject.title,
        category: 'Dataset Catalog',
        aliases: [subject.key, subject.sourceFile]
      }))
      .filter((subject) => !existingLabels.has(slugifySubjectName(subject.label)));
  }, [datasetCatalog]);

  const subjectGroupsWithCatalog = useMemo(
    () => [...subjectGroups, ...(catalogSubjectOptions.length ? [{ category: 'Dataset Catalog', subjects: catalogSubjectOptions }] : [])],
    [catalogSubjectOptions]
  );

  const subjectOptions = useMemo(() => [...subjectGroupsWithCatalog.flatMap((group) => group.subjects), ...customSubjects], [customSubjects, subjectGroupsWithCatalog]);

  useEffect(() => {
    if (!user || user.onboardingCompleted) return;

    const catalogLabels = new Set(subjectGroupsWithCatalog.flatMap((group) => group.subjects.map((subject) => subject.label.toLowerCase())));
    const savedSubjects = user.selectedSubjects ?? [];

    setSelectedDuration(user.onboardingDuration ?? null);
    setSubjects(savedSubjects);
    setCustomSubjects(savedSubjects.filter((subject) => !catalogLabels.has(subject.toLowerCase())).map((label) => ({ label, category: 'Custom Subjects' })));
  }, [user, subjectGroupsWithCatalog]);

  const filteredGroups = useMemo(() => {
    const query = subjectSearch.trim().toLowerCase();
    return subjectGroupsWithCatalog
      .map((group) => ({
        ...group,
        subjects: group.subjects.filter((subject) => {
          const matchesCategory = categoryFilter === 'All' || categoryFilter === group.category;
          const haystack = [subject.label, subject.category, ...(subject.aliases ?? [])].join(' ').toLowerCase();
          const matchesQuery = !query || haystack.includes(query);
          return matchesCategory && matchesQuery;
        })
      }))
      .filter((group) => group.subjects.length > 0);
  }, [categoryFilter, subjectGroupsWithCatalog, subjectSearch]);

  const selectedPreview = useMemo(
    () => subjects.map((subject) => subjectOptions.find((option) => option.label === subject) ?? { label: subject, category: 'Custom' }),
    [subjectOptions, subjects]
  );

  function closePicker() {
    setPickerOpen(false);
  }

  async function persistOnboardingData(nextSubjects: string[], completed = false) {
    await api.put('/profile/me', {
      selectedSubjects: nextSubjects,
      onboardingDuration: selectedDuration,
      onboardingCompleted: completed
    });
    await refreshUser();
  }

  function toggleSubject(subjectLabel: string) {
    setSubjects((prev) => {
      return prev.includes(subjectLabel) ? prev.filter((item) => item !== subjectLabel) : [...prev, subjectLabel];
    });
  }

  function addCustomSubject() {
    if (!customSubject.trim()) return;
    const label = customSubject.trim();
    const slug = slugifySubjectName(label);
    const exists = subjectOptions.some((subject) => subject.label.toLowerCase() === label.toLowerCase() || slugifySubjectName(subject.label) === slug);
    if (!exists) {
      const customOption = { label, category: 'Custom Subjects' };
      setCustomSubjects((prev) => [...prev, customOption]);
      setSubjects((prev) => {
        return [...prev, label];
      });
    } else if (!subjects.includes(label)) {
      setSubjects((prev) => {
        return [...prev, label];
      });
    }
    setCustomSubject('');
  }

  async function finish() {
    if (saveStatus === 'saving') return;

    setSaveStatus('saving');
    setSaveMessage(null);

    try {
      await persistOnboardingData(subjects, true);
      setSaveStatus('success');
      setSaveMessage('Setup saved. Loading your dashboard...');
      window.setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 450);
    } catch {
      setSaveStatus('error');
      setSaveMessage('Could not save your setup. Please try again.');
    }
  }

  useEffect(() => {
    if (!pickerOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closePicker();
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [pickerOpen]);

  return (
    <AppShell>
      <div className="min-h-[70vh] flex items-center justify-center py-12">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-3xl space-y-8">
          <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/3 to-white/2 p-8 backdrop-blur-md">
            <h2 className="text-2xl font-semibold">Welcome to Codexa</h2>
            <p className="text-sm text-white/60 mt-2">Let's configure a study plan that fits your goals.</p>

            <div className="mt-6">
              <div className="flex items-center gap-4 mb-4">
                <div className={`flex-1 h-1 rounded ${step >= 1 ? 'bg-fuchsia-500' : 'bg-white/10'}`} />
                <div className={`flex-1 h-1 rounded ${step >= 2 ? 'bg-fuchsia-500' : 'bg-white/10'}`} />
                <div className={`flex-1 h-1 rounded ${step >= 3 ? 'bg-fuchsia-500' : 'bg-white/10'}`} />
                <div className={`flex-1 h-1 rounded ${step >= 3 ? 'bg-fuchsia-500' : 'bg-white/10'}`} />
              </div>

              {step === 1 && (
                <div>
                  <p className="text-sm text-white/70 mb-4">How many months would you like to prepare with Codexa?</p>
                  <div className="grid grid-cols-3 gap-4">
                    {durations.map((d) => (
                      <motion.button whileHover={{ scale: 1.02 }} key={d} onClick={() => setSelectedDuration(d)} className={`rounded-xl border p-4 text-left ${selectedDuration === d ? 'border-fuchsia-400 bg-white/5 shadow-lg' : 'border-white/10 bg-transparent'}`}>
                        <div className="font-semibold">{d}</div>
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="relative">
                  <p className="text-sm text-white/70 mb-4">Which subjects would you like to prepare for?</p>
                  <div className="mb-4 flex flex-wrap gap-2">
                    {selectedPreview.map((subject) => (
                      <Badge key={subject.label} className="border border-fuchsia-400/30 bg-fuchsia-500/15 px-3 py-1 text-white shadow-[0_0_18px_rgba(217,70,239,.18)]">
                        {subject.label}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex items-center gap-3">
                    <Button onClick={() => setPickerOpen((open) => !open)}>+ Add Subject</Button>
                    <p className="text-xs text-white/45">Search, filter by category, multi-select, or create a custom subject.</p>
                  </div>

                </div>
              )}

              {step === 3 && (
                <div>
                  <p className="text-sm text-white/70 mb-4">Overview — How Codexa will help you</p>
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      'Placement Preparation Tracking',
                      'Subject-wise Progress Analytics',
                      'Mock Interview Practice',
                      'Coding Practice Monitoring',
                      'Target & Consistency Tracking',
                      'Daily Productivity Analysis'
                    ].map((t) => (
                      <motion.div whileHover={{ scale: 1.03 }} key={t} className="rounded-xl border p-4 bg-white/3 border-white/10">
                        <div className="font-semibold">{t}</div>
                        <div className="text-sm text-white/60 mt-2">Tap to learn more</div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between mt-6">
                <div>
                  {step > 1 && <Button variant="outline" onClick={() => setStep((s) => s - 1)}>Back</Button>}
                </div>
                <div className="flex items-center gap-3">
                  {step < 3 ? (
                    <Button onClick={() => setStep((s) => s + 1)}>Next</Button>
                  ) : (
                    <Button onClick={finish} disabled={saveStatus === 'saving'}>{saveStatus === 'saving' ? 'Saving...' : 'Enter Dashboard'}</Button>
                  )}
                </div>
              </div>

              {saveMessage ? (
                <div className={`mt-4 rounded-xl border px-4 py-3 text-sm ${saveStatus === 'error' ? 'border-rose-400/30 bg-rose-500/10 text-rose-100' : 'border-emerald-400/30 bg-emerald-500/10 text-emerald-100'}`}>
                  {saveMessage}
                </div>
              ) : null}
            </div>
          </div>
        </motion.div>
      </div>

      {pickerOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 px-4 py-6 backdrop-blur-sm"
          onMouseDown={closePicker}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 10 }}
            transition={{ type: 'spring', stiffness: 260, damping: 24 }}
            className="flex h-[80vh] w-[min(90vw,1100px)] flex-col overflow-hidden rounded-[1.5rem] border border-white/10 bg-[linear-gradient(180deg,rgba(12,11,24,.96),rgba(15,14,30,.92))] shadow-[0_20px_60px_rgba(0,0,0,.42)] backdrop-blur-md"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="shrink-0 border-b border-white/10 p-4 sm:p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.28em] text-white/45">Add Subjects</p>
                  <p className="mt-1 text-sm text-white/60">Pick from the list or create your own.</p>
                </div>
                <Button variant="outline" onClick={closePicker} className="shrink-0">Done</Button>
              </div>

              <div className="mt-4 grid gap-3 lg:grid-cols-[1.3fr_.7fr]">
                <Input
                  value={subjectSearch}
                  onChange={(event) => setSubjectSearch(event.target.value)}
                  placeholder="Search subjects"
                  className="border-white/10 bg-white/5"
                />
                <div className="rounded-2xl border border-white/10 bg-white/5 p-2">
                  <div className="flex flex-wrap gap-2">
                    {['All', ...subjectGroupsWithCatalog.map((group) => group.category)].map((category) => (
                      <button
                        key={category}
                        type="button"
                        onClick={() => setCategoryFilter(category)}
                        className={`rounded-full px-3 py-2 text-xs transition ${categoryFilter === category ? 'bg-fuchsia-500/20 text-white ring-1 ring-fuchsia-400/50' : 'text-white/55 hover:bg-white/5 hover:text-white'}`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid min-h-0 flex-1 gap-4 overflow-y-auto p-4 sm:p-5 lg:grid-cols-[1.35fr_.65fr]">
              <div className="min-h-0 space-y-4 overflow-y-auto pr-1.5 overscroll-contain [scrollbar-width:thin]">
                <div className="space-y-4">
                  {filteredGroups.map((group) => (
                    <div key={group.category}>
                      <div className="mb-2.5 flex items-center justify-between gap-3 rounded-xl border border-white/5 bg-[rgba(12,11,24,.92)] px-3 py-2 backdrop-blur-sm">
                        <h4 className="text-sm font-semibold uppercase tracking-[0.24em] text-white/50">{group.category}</h4>
                        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/55">{group.subjects.length}</span>
                      </div>
                      <div className="grid gap-2.5 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
                        {group.subjects.map((subject) => {
                          const selected = subjects.includes(subject.label);
                          return (
                            <motion.button
                              key={subject.label}
                              whileHover={{ y: -2, scale: 1.01 }}
                              whileTap={{ scale: 0.99 }}
                              onClick={() => toggleSubject(subject.label)}
                              className={`rounded-2xl border p-3 text-left transition ${selected ? 'border-fuchsia-400/70 bg-fuchsia-500/15 shadow-[0_0_0_1px_rgba(217,70,239,.15),0_0_24px_rgba(217,70,239,.12)]' : 'border-white/10 bg-white/5 hover:border-fuchsia-400/30 hover:bg-white/7'}`}
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <p className="font-medium text-white">{subject.label}</p>
                                  <p className="mt-1 text-xs uppercase tracking-[0.22em] text-white/45">{subject.category}</p>
                                </div>
                                <span className={`mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full border ${selected ? 'border-fuchsia-300 bg-fuchsia-400 text-black' : 'border-white/20 bg-transparent text-transparent'}`}>
                                  ✓
                                </span>
                              </div>
                            </motion.button>
                          );
                        })}
                      </div>
                    </div>
                  ))}

                  {!filteredGroups.length && (
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-white/60">
                      No subjects match your search.
                    </div>
                  )}
                </div>
              </div>

              <aside className="min-h-0 space-y-4 overflow-y-auto rounded-[1.25rem] border border-white/10 bg-white/5 p-4 overscroll-contain [scrollbar-width:thin]">
                <div>
                  <p className="text-xs uppercase tracking-[0.28em] text-white/45">Selected subjects</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {selectedPreview.length ? selectedPreview.map((subject) => (
                      <Badge key={subject.label} className="border border-fuchsia-400/30 bg-fuchsia-500/15 px-3 py-1 text-white shadow-[0_0_18px_rgba(217,70,239,.18)]">
                        {subject.label}
                      </Badge>
                    )) : <p className="text-sm text-white/50">No subjects selected yet.</p>}
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/20 p-3.5">
                  <p className="text-sm font-medium text-white">+ Create Custom Subject</p>
                  <p className="mt-1 text-sm text-white/55">Add a subject and it will be selected automatically.</p>
                  <div className="mt-4 flex gap-2">
                    <Input
                      value={customSubject}
                      onChange={(event) => setCustomSubject(event.target.value)}
                      placeholder="Type custom subject name"
                      className="border-white/10 bg-white/5"
                    />
                    <Button onClick={addCustomSubject}>Save</Button>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/20 p-3.5 text-sm text-white/60">
                  <p className="font-medium text-white">Selection rules</p>
                  <ul className="mt-2 space-y-2">
                    <li>• Multi-select any number of subjects.</li>
                    <li>• Search filters instantly across labels and aliases.</li>
                    <li>• Categories stay aligned inside the modal.</li>
                  </ul>
                </div>
              </aside>
            </div>
          </motion.div>
        </motion.div>
      )}

    </AppShell>
  );
}
