import { AppShell } from '@/components/layout/AppShell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const interviewSets = [
  { title: 'Behavioral round', count: 30, level: 'Easy' },
  { title: 'System design basics', count: 18, level: 'Medium' },
  { title: 'Technical deep dive', count: 26, level: 'Hard' }
];

export default function MockInterviewPage() {
  return (
    <AppShell>
      <div className="space-y-8 py-8">
        <section>
          <p className="text-xs uppercase tracking-[0.35em] text-white/45">Practice module</p>
          <h1 className="mt-3 text-4xl font-semibold">Mock interview questions.</h1>
          <p className="mt-4 max-w-3xl text-white/60">Practice curated interview rounds with guided prompts and self-evaluation checkpoints.</p>
        </section>

        <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {interviewSets.map((set) => (
            <Card key={set.title}>
              <CardHeader><CardTitle>{set.title}</CardTitle></CardHeader>
              <CardContent>
                <p className="text-sm text-white/60">{set.count} questions available</p>
                <Badge className="mt-3">{set.level}</Badge>
              </CardContent>
            </Card>
          ))}
        </section>
      </div>
    </AppShell>
  );
}
