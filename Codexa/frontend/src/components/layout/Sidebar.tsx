import { NavLink } from 'react-router-dom';
import { CalendarDays, LayoutGrid, NotebookPen, Sparkles, Target, UserRound } from 'lucide-react';
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import { slugifySubjectName } from '@/lib/subject-data';
import { useAuth } from '@/context/AuthContext';
import api from '@/api/client';

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

const sidebarItems = [
  { to: '/dashboard', label: 'Home', icon: LayoutGrid, end: true },
  { to: '/dashboard/profile', label: 'Profile', icon: UserRound },
  { to: '/dashboard/progress', label: 'Progress', icon: NotebookPen },
  { to: '/dashboard/targets', label: 'Targets', icon: Target },
  { to: '/dashboard/calendar', label: 'Calendar', icon: CalendarDays }
];

export function Sidebar() {
  const { user } = useAuth();
  const { data: datasetCatalog } = useQuery({
    queryKey: ['subject-catalog-list'],
    queryFn: async () => (await api.get('/subject/catalog')).data.subjects as DatasetCatalogItem[],
    enabled: Boolean(user)
  });

  const catalogByKey = useMemo(() => new Map((datasetCatalog ?? []).map((subject) => [subject.key, subject])), [datasetCatalog]);

  const subjectLinks = useMemo(
    () => (user?.selectedSubjects ?? []).map((subject) => {
      const key = slugifySubjectName(subject);
      const catalogSubject = catalogByKey.get(key);
      return {
        label: catalogSubject?.title ?? subject,
        to: `/subject/${key}`,
        meta: catalogSubject ? `${catalogSubject.counts.topics} topics` : null
      };
    }),
    [catalogByKey, user?.selectedSubjects]
  );

  const datasetLinks = useMemo(
    () => [...(datasetCatalog ?? [])].sort((left, right) => left.title.localeCompare(right.title)),
    [datasetCatalog]
  );

  return (
    <aside className="hidden border-r border-white/10 bg-[linear-gradient(180deg,rgba(11,10,22,0.98),rgba(7,7,14,0.98))] lg:flex lg:flex-col">
      <div className="flex items-center gap-3 border-b border-white/10 px-6 py-6">
        <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-white/8 shadow-[0_0_0_1px_rgba(255,255,255,.16),0_14px_35px_rgba(198,70,255,.24)]">
          <img src="/logo.jpeg" alt="Codexa logo" className="h-full w-full object-cover" />
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-white/50">Codexa</p>
          <h1 className="heading-cyber text-lg font-semibold">Placement OS</h1>
        </div>
      </div>
      <nav className="flex-1 px-3 py-5">
        <div className="space-y-1">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.label}
                to={item.to}
                end={item.end}
                className={({ isActive }) => cn('flex items-center gap-3 rounded-2xl border border-transparent px-4 py-3 text-sm text-white/70 transition hover:border-fuchsia-400/25 hover:bg-fuchsia-500/10 hover:text-white', isActive && 'border-fuchsia-400/30 bg-gradient-to-r from-violet-500/20 to-fuchsia-500/12 text-white shadow-[0_0_0_1px_rgba(201,96,255,.18),0_12px_32px_rgba(137,43,242,.18)]')}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </NavLink>
            );
          })}
        </div>

        <div className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs uppercase tracking-[0.3em] text-white/45">Your subjects</p>
          <div className="mt-3 space-y-2">
            {subjectLinks.length ? subjectLinks.map((subject) => (
              <NavLink
                key={subject.to}
                to={subject.to}
                className={({ isActive }) => cn('block rounded-2xl border border-white/8 px-3 py-2 text-sm text-white/70 transition hover:border-fuchsia-400/25 hover:bg-fuchsia-500/10 hover:text-white', isActive && 'border-fuchsia-400/30 bg-fuchsia-500/15 text-white')}
              >
                <span className="block">{subject.label}</span>
                {subject.meta ? <span className="mt-1 block text-xs text-white/45">{subject.meta}</span> : null}
              </NavLink>
            )) : <p className="text-sm text-white/45">No subjects selected yet.</p>}
          </div>
        </div>


      </nav>
      <div className="border-t border-white/10 p-5 text-xs text-white/50">
        <p className="leading-6">AI-powered placement tracker with futuristic analytics and clean architecture.</p>
      </div>
    </aside>
  );
}