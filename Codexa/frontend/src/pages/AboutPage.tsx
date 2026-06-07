import { motion } from 'framer-motion';
import { Award, BrainCircuit, Target, TrendingUp } from 'lucide-react';
import { PublicShell } from '@/components/layout/PublicShell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const principles = [
  { icon: Target, title: 'Focused prep', body: 'Built around measurable study habits and subject-level clarity.' },
  { icon: TrendingUp, title: 'Visible growth', body: 'Every analytics card is meant to help students see improvement over time.' },
  { icon: BrainCircuit, title: 'Modern workflow', body: 'The layout reflects how students actually move from practice to review to mocks.' },
  { icon: Award, title: 'Portfolio quality', body: 'Designed to feel like a polished startup product that belongs in a strong portfolio.' }
];

export default function AboutPage() {
  return (
    <PublicShell>
      <div className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
        <motion.section initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
          <p className="text-xs uppercase tracking-[0.4em] text-white/50">About Codexa</p>
          <h1 className="heading-cyber max-w-3xl text-4xl font-semibold sm:text-5xl">A placement preparation platform made to feel organized, premium, and motivating.</h1>
          <p className="max-w-3xl text-white/65">Codexa turns scattered prep into one structured dashboard with subject blocks, analytics, mock interview prep, and a strong visual identity.</p>
        </motion.section>

        <section className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {principles.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div key={item.title} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.45, delay: index * 0.05 }}>
                <Card className="h-full border-white/10 bg-white/7">
                  <CardContent className="p-6">
                    <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border border-fuchsia-400/20 bg-fuchsia-500/10 text-fuchsia-200">
                      <Icon className="h-5 w-5" />
                    </div>
                    <CardTitle className="text-xl">{item.title}</CardTitle>
                    <p className="mt-3 text-sm leading-7 text-white/68">{item.body}</p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </section>

        <section className="mt-10 grid gap-6 lg:grid-cols-[.95fr_1.05fr]">
          <Card className="border-white/10 bg-[linear-gradient(180deg,rgba(11,10,22,.95),rgba(8,8,14,.92))]">
            <CardHeader>
              <CardDescription>Mission</CardDescription>
              <CardTitle className="heading-cyber text-2xl">Make placement prep measurable and visually motivating.</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm leading-7 text-white/66">
              <p>Instead of a generic tracker, Codexa is shaped like a premium SaaS dashboard so students feel like they are using a real product every day.</p>
              <p>The focus is not just recording progress, but giving users the clarity to know what to study next and why it matters.</p>
            </CardContent>
          </Card>
          <Card className="border-white/10 bg-white/7">
            <CardHeader>
              <CardDescription>What users get</CardDescription>
              <CardTitle className="heading-cyber text-2xl">Subject tracking, analytics, interview prep, and consistent review in one place.</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              {['Personal subject blocks', 'Mock interview prompts', 'Graphs and consistency', 'Custom subject creation'].map((item) => (
                <div key={item} className="rounded-2xl border border-white/10 bg-black/15 px-4 py-4 text-white/78">{item}</div>
              ))}
            </CardContent>
          </Card>
        </section>
      </div>
    </PublicShell>
  );
}