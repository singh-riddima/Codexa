import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const examSets = [
  { title: 'Campus assessment set 1', duration: '60 min', questions: 45 },
  { title: 'Campus assessment set 2', duration: '75 min', questions: 52 },
  { title: 'Company-style test', duration: '90 min', questions: 65 }
];

export default function MockExamPage() {
  return (
    <AppShell>
      <div className="space-y-8 py-8">
        <section>
          <p className="text-xs uppercase tracking-[0.35em] text-white/45">Practice module</p>
          <h1 className="mt-3 text-4xl font-semibold">Mock exam questions.</h1>
          <p className="mt-4 max-w-3xl text-white/60">Attempt timed practice exams to measure readiness for placement test rounds.</p>
        </section>

        <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {examSets.map((set) => (
            <Card key={set.title}>
              <CardHeader><CardTitle>{set.title}</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-white/60">{set.questions} questions • {set.duration}</p>
                <Button size="sm">Start exam</Button>
              </CardContent>
            </Card>
          ))}
        </section>
      </div>
    </AppShell>
  );
}
