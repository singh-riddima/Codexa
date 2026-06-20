import { Navigate, useLocation } from 'react-router-dom';
import type { JSX } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';
import { useEffect, useRef, useState } from 'react';

export function OnboardingRoute({ children }: { children: JSX.Element }) {
  const { user, isReady, refreshUser } = useAuth();
  const location = useLocation();
  const [checkingServer, setCheckingServer] = useState(false);
  const didRefreshRef = useRef(false);

  useEffect(() => {
    // Ensure we don't trust a potentially stale persisted user object.
    // Only refresh once per mount.
    if (!isReady || didRefreshRef.current) return;
    if (!user) return;

    if (!user.onboardingCompleted) {
      didRefreshRef.current = true;
      setCheckingServer(true);
      void refreshUser()
        .catch(() => {
          // ignore refresh errors; we'll fall back to the persisted user object
        })
        .finally(() => setCheckingServer(false));
    }
  }, [isReady, user, refreshUser]);

  if (!isReady || checkingServer) {
    return <div className="min-h-screen p-6"><Skeleton className="h-[70vh] w-full" /></div>;
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (user.onboardingCompleted) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
