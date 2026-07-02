import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const publicNavItems = [
  { label: 'Features', to: '/features' },
  { label: 'About', to: '/about' },
  { label: 'About Creator', to: '/creator' }
];

export function PublicNavbar() {
  const { pathname } = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  return (
    <header className={cn('fixed inset-x-0 top-0 z-50 border-b transition-all duration-300', scrolled ? 'border-white/10 bg-[rgba(7,8,15,0.88)] backdrop-blur-2xl shadow-[0_20px_60px_rgba(0,0,0,0.35)]' : 'border-transparent bg-transparent')}>
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl border border-white/12 bg-white/8 shadow-[0_0_30px_rgba(168,85,247,.24)]">
            <img src="/logo.jpeg" alt="Codexa logo" className="h-full w-full object-cover" />
          </div>
          <div>
            <p className="text-[0.65rem] uppercase tracking-[0.4em] text-white/45">Codexa</p>
            <p className="heading-cyber text-sm text-white/85">Placement prep OS</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 rounded-full border border-white/10 bg-white/6 p-1 lg:flex">
          {publicNavItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => cn('rounded-full px-4 py-2 text-sm text-white/70 transition hover:text-white', isActive && 'bg-white/10 text-white')}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Button asChild variant="ghost" size="sm">
            <Link to="/login">Login</Link>
          </Button>
          <Button asChild size="sm">
            <Link to="/signup">Signup</Link>
          </Button>
        </div>

        <Button variant="ghost" size="sm" className="md:hidden" onClick={() => setMenuOpen((current) => !current)}>
          <Menu className="h-4 w-4" />
        </Button>
      </div>

      <AnimatePresence>
        {menuOpen ? (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="border-t border-white/10 bg-[rgba(7,8,15,0.96)] px-4 py-4 backdrop-blur-2xl md:hidden"
          >
            <div className="mx-auto flex max-w-7xl flex-col gap-3">
              {publicNavItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) => cn('rounded-2xl border border-white/10 bg-white/6 px-4 py-3 text-sm text-white/75', isActive && 'border-fuchsia-400/30 bg-fuchsia-500/10 text-white')}
                >
                  {item.label}
                </NavLink>
              ))}
              <div className="mt-1 flex gap-3">
                <Button asChild variant="secondary" className="flex-1">
                  <Link to="/login">Login</Link>
                </Button>
                <Button asChild className="flex-1">
                  <Link to="/signup">Signup</Link>
                </Button>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}