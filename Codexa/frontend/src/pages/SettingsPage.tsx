import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { Switch } from '@/components/ui/switch';

export default function SettingsPage() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <AppShell>
      <div className="space-y-8 py-8">
        <section>
          <p className="text-xs uppercase tracking-[0.35em] text-white/45">Profile settings</p>
          <h1 className="mt-3 text-4xl font-semibold">Settings and profile.</h1>
          <p className="mt-4 max-w-3xl text-white/60">Update your details, theme preference, and preparation identity.</p>
        </section>
        <section className="grid gap-6 xl:grid-cols-[1fr_.85fr]">
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Input defaultValue={user?.name ?? ''} placeholder="Your name" />
                <Input defaultValue={user?.email ?? ''} placeholder="Email" />
              </div>
              <Input placeholder="Target role" defaultValue={user?.targetRole ?? ''} />
              <Input placeholder="University" defaultValue={user?.university ?? ''} />
              <Textarea placeholder="Write a short bio for your profile" defaultValue="I am preparing for product and service company interviews with structured practice." />
              <Button>Save changes</Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-white/70">
              <div className="flex items-center justify-between rounded-2xl border border-white/8 bg-white/5 p-4">
                <span>Theme preference</span>
                <Switch checked={theme === 'dark'} onCheckedChange={toggleTheme} />
              </div>
              <div className="rounded-2xl border border-white/8 bg-white/5 p-4">Session persistence: enabled via JWT + local storage placeholder flow.</div>
              <div className="rounded-2xl border border-white/8 bg-white/5 p-4">AI features: future-ready architecture reserved in the UI.</div>
            </CardContent>
          </Card>
        </section>
      </div>
    </AppShell>
  );
}