import { AppShell } from '@/components/layout/AppShell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { slugifySubjectName } from '@/lib/subject-data';
import api from '@/api/client';
import { useQueries } from '@tanstack/react-query';

export default function RevisionFlashcardsPage() {
  const { user } = useAuth();
  const subjectKeys = (user?.selectedSubjects ?? []).map((subject) => slugifySubjectName(subject));
  const catalogQueries = useQueries({
    queries: subjectKeys.map((key) => ({
      queryKey: ['subject-catalog', key],
      queryFn: async () => (await api.get(`/subject/${key}/catalog`)).data.subject,
      enabled: Boolean(key)
    }))
  });

  const flashcards = (user?.selectedSubjects ?? []).flatMap((subject, index) => {
    const catalog = catalogQueries[index]?.data as { title?: string; rows?: Array<{ topic: string; subtopic: string; practiceResource: string }> } | undefined;
    return {
      topic: catalog?.title ?? subject,
      front: `What is the most important concept to revise in ${catalog?.title ?? subject}?`,
      back: catalog?.rows?.[0]?.topic ?? 'Open the topic list to continue revision.'
    };
  });

  return (
    <AppShell>
      <div className="space-y-8 py-8">
        <section>
          <p className="text-xs uppercase tracking-[0.35em] text-white/45">Practice module</p>
          <h1 className="mt-3 text-4xl font-semibold">Revision flashcards.</h1>
          <p className="mt-4 max-w-3xl text-white/60">Quick concept recall cards for final-round revision and rapid topic refresh.</p>
        </section>

        <section className="grid gap-6 md:grid-cols-2">
          {flashcards.length ? flashcards.map((card) => (
            <Card key={card.front} className="transition duration-300 hover:-translate-y-1 hover:border-fuchsia-400/35">
              <CardHeader><CardTitle>{card.topic}</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-white/70">Q: {card.front}</p>
                <p className="rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white/65">A: {card.back}</p>
              </CardContent>
            </Card>
          )) : <Card className="border-dashed border-white/15 bg-white/5 md:col-span-2"><CardContent className="p-6 text-sm text-white/55">No subjects selected yet. Add subjects in onboarding or the dashboard to generate revision flashcards.</CardContent></Card>}
        </section>
      </div>
    </AppShell>
  );
}
