import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { NavLink, Outlet } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export function AppShell({ children }: { children?: ReactNode }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const mobileItems = [
    { to: '/dashboard', label: 'Home', end: true },
    { to: '/dashboard/profile', label: 'Profile' },
    { to: '/dashboard/progress', label: 'Progress' },
    { to: '/dashboard/targets', label: 'Targets' },
    { to: '/dashboard/calendar', label: 'Calendar' }
  ];

  return (
    <div className="smoke-overlay min-h-screen bg-[radial-gradient(circle_at_12%_8%,_rgba(124,58,237,0.2),_transparent_28%),radial-gradient(circle_at_88%_12%,_rgba(217,70,239,0.16),_transparent_23%),linear-gradient(180deg,_#05040d,_#080714_50%,_#07070f)] text-white">
      <div className="grid min-h-screen lg:grid-cols-[280px_1fr]">
        <Sidebar />
        <main className="relative overflow-hidden">
          <Topbar onMenuClick={() => setMobileNavOpen((current) => !current)} />
          <AnimatePresence>
            {mobileNavOpen ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden"
                onClick={() => setMobileNavOpen(false)}
              >
                <motion.aside
                  initial={{ x: -320 }}
                  animate={{ x: 0 }}
                  exit={{ x: -320 }}
                  transition={{ type: 'spring', damping: 30, stiffness: 280 }}
                  className="h-full w-[82vw] max-w-sm border-r border-fuchsia-400/25 bg-[linear-gradient(180deg,rgba(11,10,22,0.98),rgba(7,7,13,0.98))] p-5"
                  onClick={(event) => event.stopPropagation()}
                >
                  <div className="mb-6 flex items-center justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.35em] text-white/50">Codexa</p>
                      <h2 className="heading-cyber mt-2 text-xl font-semibold">Placement OS</h2>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setMobileNavOpen(false)}>Close</Button>
                  </div>
                  <nav className="space-y-2">
                    {mobileItems.map((item) => (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        end={item.end}
                        onClick={() => setMobileNavOpen(false)}
                        className={({ isActive }) => cn('block rounded-2xl border border-fuchsia-400/20 bg-white/5 px-4 py-3 text-sm text-white/80 transition hover:bg-fuchsia-500/12', isActive && 'border-fuchsia-400/40 bg-fuchsia-500/15 text-white shadow-[0_0_0_1px_rgba(201,96,255,.18)]')}
                      >
                        {item.label}
                      </NavLink>
                    ))}
                  </nav>
                </motion.aside>
              </motion.div>
            ) : null}
          </AnimatePresence>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="scrollbar mx-auto max-w-[1600px] px-4 pb-10 sm:px-6 lg:px-8">
            {children ?? <Outlet />}
          </motion.div>
        </main>
      </div>
    </div>
  );
}