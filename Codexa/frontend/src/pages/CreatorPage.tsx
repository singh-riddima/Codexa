import { motion } from 'framer-motion';
import { Boxes, Github, Globe, Lightbulb, Linkedin, Mail, Move3D } from 'lucide-react';
import { PublicShell } from '@/components/layout/PublicShell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const skills = [
  { label: 'React', logo: '/logos/react.svg', tone: 'from-cyan-400/20 to-blue-500/20' },
  { label: 'TypeScript', logo: '/logos/typescript.svg', tone: 'from-sky-400/20 to-indigo-500/20' },
  { label: 'Tailwind CSS', logo: '/logos/tailwindcss.svg', tone: 'from-cyan-300/20 to-teal-400/20' },
  { label: 'Framer Motion', logo: '/logos/framer.svg', tone: 'from-fuchsia-400/20 to-pink-500/20' },
  { label: 'System Design', icon: Boxes, tone: 'from-violet-400/20 to-purple-500/20' },
  { label: 'Product Thinking', icon: Lightbulb, tone: 'from-amber-300/20 to-orange-400/20' }
];

export default function CreatorPage() {
  return (
    <PublicShell>
      <div className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
        <motion.section initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
          <p className="text-xs uppercase tracking-[0.4em] text-white/50">About Creator</p>
          <h1 className="heading-cyber max-w-3xl text-4xl font-semibold sm:text-5xl">A creator profile that feels like a modern product showcase.</h1>
          <p className="max-w-3xl text-white/65">This section highlights the creator behind Codexa with a clean profile card, skill chips, and links to professional platforms.</p>
        </motion.section>

        <section className="mt-10 grid gap-6 lg:grid-cols-[.9fr_1.1fr]">
          <Card className="border-white/10 bg-white/7">
            <CardContent className="p-8">
              <div className="mx-auto flex h-64 w-52 items-center justify-center overflow-hidden rounded-[2.25rem] border border-white/10 bg-[linear-gradient(135deg,rgba(168,85,247,.22),rgba(236,72,153,.14),rgba(255,255,255,.05))] shadow-[0_20px_60px_rgba(0,0,0,0.3)] sm:h-72 sm:w-60 lg:h-80 lg:w-64">
                <img src="/creator-photo.jpeg" alt="Creator profile" className="h-full w-full object-cover" />
              </div>
              <div className="mt-6 text-center">
                <p className="heading-cyber text-2xl font-semibold">Riddima Singh</p>
                <p className="mt-2 text-white/60">Frontend-focused builder crafting immersive placement prep experiences.</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-[linear-gradient(180deg,rgba(10,10,20,.96),rgba(8,8,14,.92))]">
            <CardHeader>
              <CardDescription>Bio</CardDescription>
              <CardTitle className="heading-cyber text-2xl">Building interfaces that feel polished, useful, and future-facing.</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 text-sm leading-7 text-white/66">
              <p>The creator section is designed to fit the same premium language as the rest of Codexa, with a strong visual hierarchy and clean social actions.</p>
              <div className="grid gap-3 sm:grid-cols-2">
                {skills.map((skill, index) => {
                  const Icon = skill.icon;
                  return (
                    <motion.div
                      key={skill.label}
                      initial={{ opacity: 0, y: 12 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, amount: 0.4 }}
                      transition={{ duration: 0.35, delay: index * 0.04 }}
                      className={`rounded-2xl border border-white/10 bg-gradient-to-r ${skill.tone} px-4 py-3 text-white/85 shadow-[0_14px_30px_rgba(0,0,0,0.16)]`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-black/15 text-white">
                          {skill.logo ? (
                            <img src={skill.logo} alt={`${skill.label} logo`} className="h-6 w-6 object-contain" />
                          ) : skill.icon ? (
                            <Icon className="h-5 w-5" />
                          ) : null}
                        </div>
                        <div>
                          <p className="font-medium text-white">{skill.label}</p>
                          <p className="text-xs text-white/65">Used in the Codexa build</p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
              <div className="flex flex-wrap gap-3 pt-1">
                <Button asChild variant="secondary">
                  <a href="https://portfolio.example.com" target="_blank" rel="noreferrer"><Globe className="h-4 w-4" /> Portfolio</a>
                </Button>
                <Button asChild variant="secondary">
                  <a href="https://github.com/singh-riddima" target="_blank" rel="noreferrer"><Github className="h-4 w-4" /> GitHub</a>
                </Button>
                <Button asChild variant="secondary">
                  <a href="https://www.linkedin.com/in/riddima-singh-2648b2326/" target="_blank" rel="noreferrer"><Linkedin className="h-4 w-4" /> LinkedIn</a>
                </Button>
                <Button asChild>
                  <a href="https://mail.google.com/mail/?view=cm&fs=1&to=riddimasinghofficial@gmail.com" target="_blank" rel="noreferrer"><Mail className="h-4 w-4" /> Contact</a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </PublicShell>
  );
}