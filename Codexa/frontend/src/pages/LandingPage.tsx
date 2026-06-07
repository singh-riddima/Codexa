import { motion } from 'framer-motion';
import { ArrowRight, BarChart3, Brain, Compass, LineChart, Sparkles, Target } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis } from 'recharts';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PublicShell } from '@/components/layout/PublicShell';

const heroStats = [
  { value: '10k+', label: 'students tracking prep' },
  { value: '84%', label: 'avg. readiness uplift' },
  { value: '21d', label: 'strong streak momentum' },
  { value: '4.9/5', label: 'portfolio-grade feel' }
];

const featureCards = [
  { icon: Target, title: 'Smart tracking', body: 'Every problem, topic, and target feeds a single placement dashboard.' },
  { icon: LineChart, title: 'Animated analytics', body: 'Charts surface consistency, accuracy, streaks, and revision intensity.' },
  { icon: Brain, title: 'Mock interview layer', body: 'Track technical questions, bookmark prompts, and review difficulty.' },
  { icon: Compass, title: 'Guided workflow', body: 'Move from subject blocks to targets, analytics, and readiness signals with clarity.' }
];

const showcaseSeries = [
  { day: 'Mon', solved: 4, accuracy: 68 },
  { day: 'Tue', solved: 6, accuracy: 71 },
  { day: 'Wed', solved: 8, accuracy: 76 },
  { day: 'Thu', solved: 7, accuracy: 80 },
  { day: 'Fri', solved: 9, accuracy: 83 },
  { day: 'Sat', solved: 11, accuracy: 86 },
  { day: 'Sun', solved: 10, accuracy: 88 }
];

const workflowSteps = [
  { title: 'Plan the day', body: 'Set topic targets and study blocks.' },
  { title: 'Practice subjects', body: 'Work through the subjects you selected for your own roadmap.' },
  { title: 'Review analytics', body: 'Check accuracy, streaks, and weak points.' }
];

const scaleBuckets = [
  { value: '30+', label: 'Core CS subjects' },
  { value: '13', label: 'Programming languages' },
  { value: '11', label: 'Development tracks' },
  { value: '9', label: 'AI/ML topics' },
  { value: '8', label: 'Cybersecurity topics' },
  { value: '7', label: 'Cloud/DevOps topics' },
  { value: '11', label: 'Placement prep tracks' },
  { value: '8', label: 'Advanced electives' }
];

export default function LandingPage() {
  return (
    <PublicShell>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 px-6 py-10 shadow-[0_30px_100px_rgba(0,0,0,0.35)] backdrop-blur-2xl sm:px-10 lg:px-12 lg:py-14">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(168,85,247,0.2),transparent_26%),radial-gradient(circle_at_80%_18%,rgba(236,72,153,0.16),transparent_22%)]" />
          <motion.img
            src="/logo.jpeg"
            alt=""
            aria-hidden="true"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 0.16, scale: 1 }}
            transition={{ duration: 1.2 }}
            className="pointer-events-none absolute left-1/2 top-1/2 h-[34rem] w-[34rem] -translate-x-1/2 -translate-y-1/2 rounded-full object-cover blur-3xl"
          />
          <div className="relative grid items-center gap-10 lg:grid-cols-[1.02fr_.98fr]">
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
              <div className="mb-6 inline-flex items-center justify-center rounded-[2rem] border border-fuchsia-400/25 bg-white/6 p-4 shadow-[0_24px_80px_rgba(168,85,247,0.22)]">
                <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-[1.5rem] border border-white/12 bg-white/10 sm:h-36 sm:w-36 lg:h-40 lg:w-40">
                  <img src="/logo.jpeg" alt="Codexa logo" className="h-full w-full object-cover" />
                </div>
              </div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/8 px-4 py-2 text-xs uppercase tracking-[0.35em] text-white/65">
                <Sparkles className="h-3.5 w-3.5 text-fuchsia-300" /> Futuristic placement platform
              </div>
              <h1 className="heading-cyber max-w-3xl text-5xl font-semibold leading-[1.02] text-glow sm:text-6xl xl:text-7xl">Codexa</h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-white/72 sm:text-xl">Track your placement prep in one dashboard. Stay on top of subjects, interview questions, analytics, and daily targets with a premium SaaS-style workspace.</p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Button asChild size="lg" variant="glow">
                  <Link to="/signup">Get Started <ArrowRight className="h-4 w-4" /></Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link to="/features">Explore Features</Link>
                </Button>
              </div>
              <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {heroStats.map((stat) => (
                  <Card key={stat.label} className="border-white/10 bg-white/7">
                    <CardContent className="p-5">
                      <p className="heading-cyber text-3xl font-semibold">{stat.value}</p>
                      <p className="mt-2 text-sm text-white/62">{stat.label}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 28, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.8, delay: 0.1 }} className="relative">
              <div className="absolute -inset-4 rounded-[2.25rem] bg-fuchsia-500/20 blur-3xl" />
              <Card className="relative overflow-hidden border-white/10 bg-[linear-gradient(180deg,rgba(10,10,20,.96),rgba(8,8,14,.92))]">
                <CardHeader>
                  <CardDescription className="text-white/58">Live dashboard preview</CardDescription>
                  <CardTitle className="heading-cyber text-2xl">Placement readiness cockpit</CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="grid gap-3 sm:grid-cols-3">
                    {[
                      ['Readiness', '84 / 100'],
                      ['Streak', '21 days'],
                      ['Mock score', '78%']
                    ].map(([label, value]) => (
                      <div key={label} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
                        <p className="text-xs uppercase tracking-[0.28em] text-white/45">{label}</p>
                        <p className="mt-2 heading-cyber text-2xl font-semibold">{value}</p>
                      </div>
                    ))}
                  </div>
                  <div className="grid gap-4 lg:grid-cols-[1.2fr_.8fr]">
                    <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                      <div className="mb-4 flex items-center justify-between">
                        <p className="text-sm text-white/65">Analytics pulse</p>
                        <BarChart3 className="h-4 w-4 text-fuchsia-300" />
                      </div>
                      <div className="h-56">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={showcaseSeries}>
                            <defs>
                              <linearGradient id="landing-chart" x1="0" x2="0" y1="0" y2="1">
                                <stop offset="5%" stopColor="#d946ef" stopOpacity={0.48} />
                                <stop offset="95%" stopColor="#d946ef" stopOpacity={0.02} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.07)" />
                            <XAxis dataKey="day" stroke="rgba(255,255,255,.45)" />
                            <Tooltip contentStyle={{ background: 'rgba(10,10,18,.96)', border: '1px solid rgba(255,255,255,.08)' }} />
                            <Area type="monotone" dataKey="solved" stroke="#d946ef" fill="url(#landing-chart)" strokeWidth={2} />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                    <div className="space-y-4 rounded-3xl border border-white/10 bg-white/5 p-4">
                      {[
                        ['Selected Subject 1', '92%', 'Core revision focus'],
                        ['Selected Subject 2', '81%', 'Practice and memory'],
                        ['Selected Subject 3', '76%', 'Protocols and concept mapping']
                      ].map(([label, value, detail]) => (
                        <div key={label} className="rounded-2xl border border-white/10 bg-black/15 px-4 py-3">
                          <div className="flex items-center justify-between gap-3">
                            <p className="font-medium">{label}</p>
                            <span className="text-sm text-fuchsia-200">{value}</span>
                          </div>
                          <p className="mt-1 text-sm text-white/56">{detail}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </section>

        <section className="mt-10 grid gap-6 lg:grid-cols-[1fr_.92fr]">
          <Card className="border-white/10 bg-white/7">
            <CardHeader>
              <CardDescription>Platform scale</CardDescription>
              <CardTitle className="heading-cyber text-2xl">A personalized prep ecosystem that already spans multiple disciplines.</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              {scaleBuckets.slice(0, 4).map((item) => (
                <div key={item.label} className="rounded-2xl border border-white/10 bg-black/15 px-4 py-4">
                  <p className="heading-cyber text-3xl font-semibold text-fuchsia-200">{item.value}</p>
                  <p className="mt-2 text-sm text-white/66">{item.label}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-[linear-gradient(135deg,rgba(139,92,246,.14),rgba(236,72,153,.08),rgba(255,255,255,.04))]">
            <CardHeader>
              <CardDescription>Designed to keep growing</CardDescription>
              <CardTitle className="heading-cyber text-2xl">From core CS to custom subjects, the platform stays centered on the user.</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                {scaleBuckets.slice(4).map((item) => (
                  <div key={item.label} className="rounded-2xl border border-white/10 bg-white/7 px-4 py-4">
                    <p className="heading-cyber text-3xl font-semibold text-fuchsia-200">{item.value}</p>
                    <p className="mt-2 text-sm text-white/66">{item.label}</p>
                  </div>
                ))}
              </div>
              <div className="rounded-2xl border border-fuchsia-300/20 bg-black/15 px-4 py-4 text-sm leading-7 text-white/68">
                Unlimited custom subjects keep the experience flexible, so every user can shape Codexa around their exact placement roadmap.
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {featureCards.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div key={feature.title} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.4 }} transition={{ duration: 0.45, delay: index * 0.05 }}>
                <Card className="h-full border-white/10 bg-white/7 transition duration-300 hover:-translate-y-1 hover:border-fuchsia-400/25 hover:bg-white/10">
                  <CardContent className="p-6">
                    <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border border-fuchsia-400/20 bg-fuchsia-500/10 text-fuchsia-200">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="heading-cyber text-lg font-semibold">{feature.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-white/68">{feature.body}</p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </section>

        <section className="mt-10 grid gap-6 lg:grid-cols-[1fr_.92fr]">
          <Card className="border-white/10 bg-white/7">
            <CardHeader>
              <CardDescription>How Codexa works</CardDescription>
              <CardTitle className="heading-cyber text-2xl">A clean prep workflow that feels like a modern startup product.</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              {workflowSteps.map((step, index) => (
                <div key={step.title} className="flex gap-4 rounded-3xl border border-white/10 bg-black/15 p-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 via-fuchsia-500 to-pink-500 text-sm font-semibold">0{index + 1}</div>
                  <div>
                    <p className="font-medium">{step.title}</p>
                    <p className="mt-1 text-sm text-white/60">{step.body}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-[linear-gradient(135deg,rgba(139,92,246,.12),rgba(217,70,239,.08),rgba(255,255,255,.04))]">
            <CardHeader>
              <CardDescription>Built for ambition</CardDescription>
              <CardTitle className="heading-cyber text-2xl">Premium visuals with practical tracking.</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm leading-7 text-white/68">
              <p>Glass cards, hover glows, animated gradients, and scroll-triggered reveals keep the experience polished without losing clarity.</p>
              <p>The dashboard, subject pages, and interview sections are all framed as one cohesive placement OS so users always know what to do next.</p>
              <div className="grid grid-cols-2 gap-3 pt-2">
                {['Subject blocks', 'Analytics', 'Mock questions', 'Daily targets'].map((item) => (
                  <div key={item} className="rounded-2xl border border-white/10 bg-white/7 px-4 py-3 text-white/80">{item}</div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="mt-10 pb-8">
          <Card className="overflow-hidden border-fuchsia-300/25 bg-gradient-to-r from-violet-500/20 via-fuchsia-500/16 to-pink-500/18">
            <CardContent className="flex flex-col items-start justify-between gap-6 p-8 lg:flex-row lg:items-center">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-white/62">Ready for a better prep flow?</p>
                <h2 className="heading-cyber mt-3 text-3xl font-semibold">Launch Codexa and start tracking with intent.</h2>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button asChild size="lg" variant="glow">
                  <Link to="/signup">Create account</Link>
                </Button>
                <Button asChild size="lg" variant="secondary">
                  <Link to="/dashboard">View dashboard</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </PublicShell>
  );
}