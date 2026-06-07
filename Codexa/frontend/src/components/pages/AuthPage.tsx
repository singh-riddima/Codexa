import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Chrome, Eye, EyeOff, Sparkles } from 'lucide-react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/AuthContext';
import { PublicShell } from '@/components/layout/PublicShell';

const authHighlights = [
  { title: 'Protected sessions', body: 'JWT-backed login flow with persistent dashboard access.' },
  { title: 'Fast onboarding', body: 'Signup and login live in a clean glassmorphism workspace.' },
  { title: 'Interview-ready UI', body: 'Designed to feel like a modern SaaS product, not a generic form.' }
];

export function AuthPage({ mode }: { mode: 'login' | 'signup' }) {
  const navigate = useNavigate();
  const { login, signup } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('demo@codexa.dev');
  const [password, setPassword] = useState('password123');
  const [confirmPassword, setConfirmPassword] = useState('password123');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const heading = useMemo(() => (mode === 'login' ? 'Welcome back to your placement cockpit.' : 'Create your Codexa workspace.'), [mode]);

  const routeAfterAuth = (onboardingCompleted?: boolean) => {
    navigate(onboardingCompleted ? '/dashboard' : '/onboarding', { replace: true });
  };

  const handleGoogleAuth = async () => {
    setLoading(true);
    setError(null);

    const googleName = 'Google User';
    const googleEmail = 'google@codexa.dev';
    const googlePassword = 'Google#12345';

    try {
      if (mode === 'login') {
        try {
          const user = await login(googleEmail, googlePassword, rememberMe);
          routeAfterAuth(user.onboardingCompleted);
        } catch {
          const user = await signup({ name: googleName, email: googleEmail, password: googlePassword }, rememberMe);
          routeAfterAuth(user.onboardingCompleted);
        }
      } else {
        const user = await signup({ name: googleName, email: googleEmail, password: googlePassword }, rememberMe);
        routeAfterAuth(user.onboardingCompleted);
      }
    } catch (submitError) {
      if (axios.isAxiosError(submitError)) {
        const apiMessage = submitError.response?.data?.message;
        setError(typeof apiMessage === 'string' ? apiMessage : 'Google sign-in failed. Please try again.');
      } else {
        setError('Google sign-in failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (mode === 'signup' && password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      if (mode === 'login') {
        const user = await login(email, password, rememberMe);
        routeAfterAuth(user.onboardingCompleted);
      } else {
        const user = await signup({ name, email, password }, rememberMe);
        routeAfterAuth(user.onboardingCompleted);
      }
    } catch (submitError) {
      if (axios.isAxiosError(submitError)) {
        const apiMessage = submitError.response?.data?.message;
        setError(typeof apiMessage === 'string' ? apiMessage : 'Authentication failed. Please check your backend and credentials.');
      } else {
        setError('Authentication failed. Please check your backend and credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <PublicShell>
      <div className="mx-auto grid max-w-7xl gap-8 px-4 pb-12 sm:px-6 lg:grid-cols-[1.05fr_.95fr] lg:px-8">
        <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/6 p-8 backdrop-blur-2xl">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,rgba(168,85,247,.14),transparent_28%),radial-gradient(circle_at_85%_15%,rgba(236,72,153,.1),transparent_20%)]" />
          <div>
            <div className="relative mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/7 px-4 py-2 text-xs uppercase tracking-[0.3em] text-white/60">
              <Sparkles className="h-3.5 w-3.5" /> Codexa secure access
            </div>
            <h1 className="relative max-w-xl text-4xl font-semibold leading-tight">{heading}</h1>
            <p className="relative mt-4 max-w-xl text-white/65">JWT auth, protected routes, and a session-first experience built for serious placement prep.</p>
          </div>
          <div className="relative mt-10 grid gap-4">
            {authHighlights.map((item) => (
              <Card key={item.title} className="border-white/10 bg-white/6">
                <CardContent className="p-5">
                  <p className="font-medium">{item.title}</p>
                  <p className="mt-2 text-sm text-white/55">{item.body}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <Card className="overflow-hidden border-white/10 bg-[linear-gradient(180deg,rgba(10,10,20,.95),rgba(8,8,14,.92))] p-1">
          <CardHeader className="px-8 pt-8">
            <CardTitle>{mode === 'login' ? 'Login' : 'Signup'}</CardTitle>
            <CardDescription>{mode === 'login' ? 'Use your Codexa credentials to continue.' : 'Join Codexa and begin tracking your prep.'}</CardDescription>
          </CardHeader>
          <CardContent className="px-8 pb-8">
            <form className="space-y-4" onSubmit={onSubmit}>
              {mode === 'signup' ? (
                <div>
                  <label className="mb-2 block text-sm text-white/60">Full name</label>
                  <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Aarav Sharma" />
                </div>
              ) : null}
              <div>
                <label className="mb-2 block text-sm text-white/60">Email</label>
                <Input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="demo@codexa.dev" />
              </div>
              <div>
                <label className="mb-2 block text-sm text-white/60">Password</label>
                <div className="relative">
                  <Input type={showPassword ? 'text' : 'password'} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="••••••••" />
                  <button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full px-2 py-1 text-white/55 transition hover:text-white">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              {mode === 'signup' ? (
                <div>
                  <label className="mb-2 block text-sm text-white/60">Confirm password</label>
                  <Input type={showPassword ? 'text' : 'password'} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} placeholder="••••••••" />
                </div>
              ) : null}
              {mode === 'login' ? (
                <div className="flex items-center justify-between gap-4 text-sm text-white/60">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={rememberMe} onChange={(event) => setRememberMe(event.target.checked)} className="h-4 w-4 rounded border-white/20 bg-transparent text-fuchsia-500 focus:ring-fuchsia-400" />
                    Remember me
                  </label>
                  <Link to="/contact" className="text-fuchsia-200 transition hover:text-white">Forgot password?</Link>
                </div>
              ) : (
                <label className="flex items-center gap-2 text-sm text-white/60">
                  <input type="checkbox" checked={rememberMe} onChange={(event) => setRememberMe(event.target.checked)} className="h-4 w-4 rounded border-white/20 bg-transparent text-fuchsia-500 focus:ring-fuchsia-400" />
                  Keep me signed in
                </label>
              )}
              {error ? <p className="rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</p> : null}
              <Button className="w-full" size="lg" type="submit" disabled={loading}>
                {loading ? 'Please wait...' : mode === 'login' ? 'Login to dashboard' : 'Create account'}
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button type="button" variant="secondary" className="w-full" onClick={handleGoogleAuth} disabled={loading}>
                <Chrome className="h-4 w-4" /> {mode === 'login' ? 'Continue with Google' : 'Sign up with Google'}
              </Button>
            </form>
            <p className="mt-6 text-center text-sm text-white/55">
              {mode === 'login' ? 'No account yet?' : 'Already have an account?'}{' '}
              <Link to={mode === 'login' ? '/signup' : '/login'} className="text-violet-300">
                {mode === 'login' ? 'Sign up' : 'Log in'}
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </PublicShell>
  );
}