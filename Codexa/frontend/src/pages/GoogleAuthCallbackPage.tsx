import { useEffect, useState } from 'react';
import { AlertCircle, Loader2, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PublicShell } from '@/components/layout/PublicShell';

const parseCallbackPayload = () => {
  const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
  const queryParams = new URLSearchParams(window.location.search);

  return {
    token: hashParams.get('token') ?? queryParams.get('token'),
    rememberMe: (hashParams.get('rememberMe') ?? queryParams.get('rememberMe')) !== '0',
    error: hashParams.get('error') ?? queryParams.get('error'),
    errorDescription: hashParams.get('error_description') ?? queryParams.get('error_description')
  };
};

export default function GoogleAuthCallbackPage() {
  const [message, setMessage] = useState('Completing Google sign-in...');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const { token, rememberMe, error: callbackError, errorDescription } = parseCallbackPayload();

    if (callbackError) {
      setMessage('Google sign-in failed.');
      setError(errorDescription ?? callbackError);
      return;
    }

    if (!token) {
      setMessage('Google sign-in failed.');
      setError('Missing Google auth token.');
      return;
    }

    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem('codexa-token', token);
    if (rememberMe) {
      sessionStorage.removeItem('codexa-token');
      sessionStorage.removeItem('codexa-user');
    } else {
      localStorage.removeItem('codexa-token');
      localStorage.removeItem('codexa-user');
    }
    localStorage.removeItem('codexa-user');
    sessionStorage.removeItem('codexa-user');

    window.location.replace('/dashboard');
  }, []);

  return (
    <PublicShell>
      <div className="mx-auto flex min-h-[60vh] max-w-2xl items-center px-4 pb-12 sm:px-6 lg:px-8">
        <div className="w-full rounded-[2rem] border border-white/10 bg-white/7 p-8 text-center backdrop-blur-2xl">
          {!error ? (
            <>
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-emerald-400/30 bg-emerald-500/10 text-emerald-200">
                <Loader2 className="h-7 w-7 animate-spin" />
              </div>
              <h1 className="heading-cyber text-3xl font-semibold">Google sign-in in progress</h1>
              <p className="mt-3 text-sm text-white/65">{message}</p>
            </>
          ) : (
            <>
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-rose-400/30 bg-rose-500/10 text-rose-200">
                <AlertCircle className="h-7 w-7" />
              </div>
              <h1 className="heading-cyber text-3xl font-semibold">Google sign-in failed</h1>
              <p className="mt-3 text-sm text-white/65">{error}</p>
              <div className="mt-6 flex items-center justify-center gap-3">
                <Link className="rounded-full border border-white/10 px-4 py-2 text-sm text-white/80 transition hover:border-white/20 hover:text-white" to="/login">
                  Back to login
                </Link>
              </div>
            </>
          )}
          <div className="mt-8 flex items-center justify-center gap-2 text-xs uppercase tracking-[0.3em] text-white/45">
            <ShieldCheck className="h-3.5 w-3.5" /> Secure session handoff
          </div>
        </div>
      </div>
    </PublicShell>
  );
}