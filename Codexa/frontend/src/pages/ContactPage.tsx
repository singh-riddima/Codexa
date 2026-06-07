import { motion } from 'framer-motion';
import { Mail, MessageSquare, Phone, Send, Twitter } from 'lucide-react';
import { PublicShell } from '@/components/layout/PublicShell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export default function ContactPage() {
  return (
    <PublicShell>
      <div className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
        <motion.section initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
          <p className="text-xs uppercase tracking-[0.4em] text-white/50">Contact</p>
          <h1 className="heading-cyber max-w-3xl text-4xl font-semibold sm:text-5xl">Share feedback, ask questions, or reach out with ideas.</h1>
          <p className="max-w-3xl text-white/65">The contact page keeps the same glassmorphism look while giving users a simple path to send feedback or connect socially.</p>
        </motion.section>

        <section className="mt-10 grid gap-6 lg:grid-cols-[1.05fr_.95fr]">
          <Card className="border-white/10 bg-white/7">
            <CardHeader>
              <CardDescription>Contact form</CardDescription>
              <CardTitle className="heading-cyber text-2xl">We’d love to hear how Codexa can improve your prep flow.</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Input placeholder="Your name" />
                <Input placeholder="Email address" />
              </div>
              <Input placeholder="Subject" />
              <Textarea placeholder="Share your feedback or question" className="min-h-40" />
              <Button className="w-full" size="lg">
                <Send className="h-4 w-4" /> Send message
              </Button>
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-[linear-gradient(180deg,rgba(10,10,20,.96),rgba(8,8,14,.92))]">
            <CardHeader>
              <CardDescription>Direct links</CardDescription>
              <CardTitle className="heading-cyber text-2xl">Fast ways to connect</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-white/66">
              {[
                { icon: Mail, title: 'Email', value: 'hello@codexa.dev' },
                { icon: Phone, title: 'Support', value: '+91 00000 00000' },
                { icon: MessageSquare, title: 'Feedback', value: 'Product ideas, bugs, and improvements' },
                { icon: Twitter, title: 'Social', value: 'Follow product updates and launch notes' }
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="flex items-start gap-4 rounded-3xl border border-white/10 bg-white/7 p-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-fuchsia-400/20 bg-fuchsia-500/10 text-fuchsia-200">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium text-white">{item.title}</p>
                      <p className="mt-1 text-sm text-white/62">{item.value}</p>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </section>
      </div>
    </PublicShell>
  );
}