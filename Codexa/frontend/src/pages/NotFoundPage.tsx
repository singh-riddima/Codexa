import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-hero-gradient px-6 text-center text-white">
      <div className="max-w-xl space-y-6">
        <p className="text-xs uppercase tracking-[0.35em] text-white/45">404</p>
        <h1 className="text-5xl font-semibold">This route drifted into the void.</h1>
        <p className="text-white/60">Return to the dashboard or landing page to continue your Codexa session.</p>
        <div className="flex justify-center gap-3">
          <Button asChild>
            <Link to="/dashboard">Dashboard</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/">Landing page</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}