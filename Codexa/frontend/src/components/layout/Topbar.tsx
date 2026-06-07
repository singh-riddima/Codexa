import { useState } from 'react';
import { Bell, Menu, MoonStar, Search, SunMedium } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export function Topbar({ onMenuClick }: { onMenuClick: () => void }) {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-[linear-gradient(180deg,rgba(8,8,15,0.92),rgba(8,8,15,0.76))] backdrop-blur-2xl">
      <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" className="lg:hidden" onClick={onMenuClick}>
            <Menu className="h-4 w-4" />
          </Button>
          <button type="button" onClick={() => setSearchOpen((value) => !value)} className="hidden h-11 items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-white/60 transition hover:bg-white/10 md:flex">
            <Search className="h-4 w-4" />
            Search modules, goals, or analytics
          </button>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={toggleTheme}>
            {theme === 'dark' ? <SunMedium className="h-4 w-4" /> : <MoonStar className="h-4 w-4" />}
          </Button>
          <Button variant="ghost" size="sm">
            <Bell className="h-4 w-4" />
          </Button>
          <Badge className="hidden md:inline-flex border-white/10 bg-white/10 text-white">{user?.name ?? 'Guest'}</Badge>
          <Button variant="secondary" size="sm" onClick={logout}>
            Logout
          </Button>
        </div>
      </div>
      {searchOpen ? <div className="border-t border-white/10 bg-white/5 px-4 py-3 text-sm text-white/70 sm:px-6 lg:px-8">Search is wired for future AI query and command features.</div> : null}
    </header>
  );
}