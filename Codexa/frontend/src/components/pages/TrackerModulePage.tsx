import { motion } from 'framer-motion';
import { CheckCircle2, PencilLine, Sparkles, Target } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { moduleMeta, sampleGoals } from '@/lib/mock-data';
import type { TrackerModuleKey } from '@/types';

export function TrackerModulePage({ module }: { module: TrackerModuleKey }) {
  const meta = moduleMeta[module];
  const Icon = meta.icon;

  return (
    <AppShell>
      <div className="space-y-8 py-8">
        <motion.section initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="grid gap-6 lg:grid-cols-[1.2fr_.8fr]">
          <Card className="overflow-hidden">
            <CardContent className="p-8">
              <div className={`mb-6 inline-flex rounded-2xl bg-gradient-to-r ${meta.accent} p-[1px]`}>
                <div className="rounded-2xl bg-[#090913] px-4 py-2 text-sm text-white/75">{module.toUpperCase()} TRACKER</div>
              </div>
              <h1 className="text-4xl font-semibold">{meta.title}</h1>
              <p className="mt-4 max-w-2xl text-white/60">{meta.subtitle}</p>
              <div className="mt-6 flex flex-wrap gap-3">
                {meta.chips.map((chip) => <Badge key={chip}>{chip}</Badge>)}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-white/8 to-white/5">
            <CardHeader>
              <CardDescription>Focused preparation signal</CardDescription>
              <CardTitle className="flex items-center gap-3 text-2xl"><Icon className="h-6 w-6 text-violet-300" /> Module insights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {meta.metrics.map((metric) => (
                <div key={metric.label} className="rounded-2xl border border-white/8 bg-white/5 p-4">
                  <p className="text-sm text-white/55">{metric.label}</p>
                  <p className="mt-2 text-2xl font-semibold">{metric.value}</p>
                  {metric.delta ? <p className="mt-2 text-sm text-white/55">{metric.delta}</p> : null}
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.section>

        <section className="grid gap-6 xl:grid-cols-[1fr_.8fr]">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-emerald-400" /> Progress and revision</CardTitle>
              <CardDescription>Review progress bars, revision counts, and weak topic markers.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {sampleGoals.map((goal) => (
                <div key={goal.title} className="rounded-2xl border border-white/8 bg-white/5 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-medium">{goal.title}</p>
                      <p className="mt-1 text-sm text-white/55">Due {goal.due}</p>
                    </div>
                    <PencilLine className="h-4 w-4 text-white/40" />
                  </div>
                  <div className="mt-4"><Progress value={goal.progress} /></div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Target className="h-5 w-5 text-fuchsia-400" /> AI placeholders</CardTitle>
              <CardDescription>Future modules reserved for smart recommendations and weak-topic detection.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {['Smart study recommendations', 'Weak topic detection', 'AI mock interviewer', 'Resume analyzer', 'Personalized prep planner'].map((item) => (
                <div key={item} className="flex items-center justify-between rounded-2xl border border-white/8 bg-white/5 p-4 text-sm text-white/70">
                  <span>{item}</span>
                  <Sparkles className="h-4 w-4 text-violet-300" />
                </div>
              ))}
            </CardContent>
          </Card>
        </section>
      </div>
    </AppShell>
  );
}