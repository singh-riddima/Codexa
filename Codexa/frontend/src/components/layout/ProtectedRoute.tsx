import { Navigate, useLocation } from 'react-router-dom';
import type { JSX } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';

export function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { user, isReady } = useAuth();
  const location = useLocation();

  if (!isReady) {
    return <div className="min-h-screen p-6"><Skeleton className="h-[70vh] w-full" /></div>;
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (!user.onboardingCompleted && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  return children;
}