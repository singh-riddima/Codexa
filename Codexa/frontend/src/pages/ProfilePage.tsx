import { motion } from 'framer-motion';
import { AppShell } from '@/components/layout/AppShell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function ProfilePage() {
  const { user, logout, deleteAccount } = useAuth();
  const navigate = useNavigate();
  const selectedSubjects = user?.selectedSubjects ?? [];

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm('Delete your Codexa account permanently? This removes your login and stored profile data.');
    if (!confirmed) return;

    await deleteAccount();
    navigate('/', { replace: true });
  };

  return (
    <AppShell>
      <div className="space-y-8 py-8">
        <section>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-xs uppercase tracking-[0.35em] text-white/45">Profile section</p>
            <h1 className="mt-3 text-4xl font-semibold">Manage your profile and privacy.</h1>
            <p className="mt-4 max-w-3xl text-white/60">Keep your account details, subject preferences, and privacy controls up to date.</p>
          </motion.div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.1fr_.9fr]">
          <Card>
            <CardHeader>
              <CardTitle>Profile details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-fuchsia-400/40 bg-fuchsia-500/10 text-xl font-semibold text-fuchsia-200">
                  {(user?.name ?? 'U').slice(0, 1).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold">{user?.name ?? 'Codexa User'}</p>
                  <p className="text-sm text-white/60">{user?.email ?? 'student@codexa.ai'}</p>
                </div>
                <Button className="ml-auto" variant="secondary">Update profile picture</Button>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label htmlFor="fullName" className="mb-2 block text-sm text-white/65">Full name</label>
                  <Input id="fullName" defaultValue={user?.name ?? ''} placeholder="Full name" />
                </div>

                <div>
                  <label htmlFor="username" className="mb-2 block text-sm text-white/65">Username</label>
                  <Input id="username" defaultValue={user?.name?.toLowerCase().replace(/\s+/g, '_') ?? ''} placeholder="Username" />
                </div>

                <div>
                  <label htmlFor="email" className="mb-2 block text-sm text-white/65">Email</label>
                  <Input id="email" defaultValue={user?.email ?? ''} placeholder="Email" />
                </div>

                <div>
                  <label htmlFor="age" className="mb-2 block text-sm text-white/65">Age</label>
                  <Input id="age" defaultValue="21" placeholder="Age" />
                </div>

                <div>
                  <label htmlFor="state" className="mb-2 block text-sm text-white/65">State</label>
                  <Input id="state" defaultValue="Maharashtra" placeholder="State" />
                </div>

                <div>
                  <label htmlFor="university" className="mb-2 block text-sm text-white/65">University / College</label>
                  <Input id="university" defaultValue={user?.university ?? 'University / College Name'} placeholder="University / College Name" />
                </div>

                <div>
                  <label htmlFor="degree" className="mb-2 block text-sm text-white/65">Degree / Graduation</label>
                  <Input id="degree" defaultValue="B.Tech CSE" placeholder="Degree / Graduation" />
                </div>

                <div>
                  <label htmlFor="year" className="mb-2 block text-sm text-white/65">Year of study</label>
                  <Input id="year" defaultValue="Final Year" placeholder="Year of study" />
                </div>
              </div>

              <div>
                <p className="mb-3 text-sm text-white/65">Selected subjects</p>
                <div className="flex flex-wrap gap-2">{selectedSubjects.length ? selectedSubjects.map((subject) => <Badge key={subject}>{subject}</Badge>) : <p className="text-sm text-white/50">No subjects selected yet.</p>}</div>
              </div>

              <Button>Save changes</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Account and privacy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-4">
                <span className="text-white/75">Account privacy</span>
                <Switch checked onCheckedChange={() => {}} />
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-4">
                <span className="text-white/75">Email notifications</span>
                <Switch checked onCheckedChange={() => {}} />
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-4">
                <span className="text-white/75">Target reminders</span>
                <Switch checked onCheckedChange={() => {}} />
              </div>
              <Button variant="secondary" className="w-full">Change password</Button>
              <Button variant="outline" className="w-full" onClick={logout}>Logout</Button>
              <Button
                variant="outline"
                className="w-full border-rose-400/50 bg-rose-500/10 text-rose-100 hover:bg-rose-500/20"
                onClick={handleDeleteAccount}
              >
                Delete account permanently
              </Button>
            </CardContent>
          </Card>
        </section>
      </div>
    </AppShell>
  );
}
