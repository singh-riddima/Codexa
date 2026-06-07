import { motion } from 'framer-motion';
import { BarChart3, BrainCircuit, CalendarCheck2, Gauge, LineChart, Target, Workflow } from 'lucide-react';
import { PublicShell } from '@/components/layout/PublicShell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const features = [
  { icon: Target, title: 'Smart Tracking', body: 'Every subject, target, and revision loop is captured in a single live system.' },
  { icon: LineChart, title: 'Analytics Dashboard', body: 'Study momentum, accuracy, streaks, and growth are presented with elegant visualizations.' },
  { icon: Workflow, title: 'Subject-wise Progress', body: 'Each user gets isolated subject tracks that stay connected to the full prep workflow.' },
  { icon: BrainCircuit, title: 'Mock Interview Prep', body: 'Save technical questions, review difficulty, and keep bookmarks close.' },
  { icon: CalendarCheck2, title: 'Daily Targets', body: 'Build a goal list for each day and monitor completion without friction.' },
  { icon: Gauge, title: 'Consistency Monitoring', body: 'A streak-first UI keeps your prep rhythm measurable and visible.' }
];

export default function FeaturesPage() {
  return (
    <PublicShell>
      <div className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
        <motion.section initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
          <p className="text-xs uppercase tracking-[0.4em] text-white/50">Features</p>
          <h1 className="heading-cyber max-w-3xl text-4xl font-semibold sm:text-5xl">Everything a placement prep dashboard should do, without the clutter.</h1>
          <p className="max-w-3xl text-white/65">Codexa combines subject tracking, interview preparation, and progress intelligence into a premium SaaS-style workspace.</p>
        </motion.section>

        <section className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div key={feature.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.45, delay: index * 0.04 }}>
                <Card className="h-full border-white/10 bg-white/7 transition duration-300 hover:-translate-y-1 hover:border-fuchsia-400/25 hover:bg-white/10">
                  <CardContent className="p-6">
                    <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border border-fuchsia-400/20 bg-fuchsia-500/10 text-fuchsia-200">
                      <Icon className="h-5 w-5" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                    <p className="mt-3 text-sm leading-7 text-white/68">{feature.body}</p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </section>

        <section className="mt-10 grid gap-6 lg:grid-cols-[1fr_.9fr]">
          <Card className="border-white/10 bg-white/7">
            <CardHeader>
              <CardDescription>Why it feels different</CardDescription>
              <CardTitle className="heading-cyber text-2xl">A clean, premium shell with glass cards and animated gradients.</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm leading-7 text-white/66">
              <p>The interface uses translucent layers, hover glows, and motion accents so the dashboard feels alive without becoming noisy.</p>
              <p>Subject cards, charts, and goal widgets are designed to work together visually while still staying practical on mobile and desktop.</p>
            </CardContent>
          </Card>
          <Card className="border-white/10 bg-[linear-gradient(135deg,rgba(139,92,246,.14),rgba(236,72,153,.08))]">
            <CardHeader>
              <CardDescription>Core outcomes</CardDescription>
              <CardTitle className="heading-cyber text-2xl">Track more, forget less, and prep with intention.</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              {['Progress visibility', 'Daily discipline', 'Subject mastery', 'Mock readiness'].map((item) => (
                <div key={item} className="rounded-2xl border border-white/10 bg-white/7 px-4 py-4 text-white/80">{item}</div>
              ))}
            </CardContent>
          </Card>
        </section>
      </div>
    </PublicShell>
  );
}