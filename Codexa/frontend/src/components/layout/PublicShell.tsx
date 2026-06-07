import type { ReactNode } from 'react';
import { PublicNavbar } from './PublicNavbar';

export function PublicShell({ children }: { children: ReactNode }) {
  return (
    <div className="smoke-overlay min-h-screen bg-[radial-gradient(circle_at_10%_10%,rgba(126,58,237,0.2),transparent_25%),radial-gradient(circle_at_90%_12%,rgba(217,70,239,0.14),transparent_20%),linear-gradient(180deg,#04040b_0%,#070713_45%,#090914_100%)] text-white">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-[8%] top-[10%] h-72 w-72 rounded-full bg-violet-500/12 blur-3xl" />
        <div className="absolute right-[10%] top-[22%] h-80 w-80 rounded-full bg-fuchsia-500/10 blur-3xl" />
        <div className="absolute bottom-[6%] left-[42%] h-96 w-96 rounded-full bg-pink-500/8 blur-3xl" />
        <div className="absolute inset-0 grid-pattern opacity-[0.12]" />
      </div>
      <PublicNavbar />
      <main className="relative pt-28 sm:pt-32">{children}</main>
    </div>
  );
}