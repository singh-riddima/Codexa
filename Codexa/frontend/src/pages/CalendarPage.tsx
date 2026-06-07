import { motion } from 'framer-motion';
import { AppShell } from '@/components/layout/AppShell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';

const achievedDays = new Set([2, 3, 6, 7, 9, 10, 12, 13, 16, 18, 20, 22, 23, 26, 28]);
const missedDays = new Set([1, 5, 8, 11, 14, 17, 21, 24, 29]);

const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function CalendarPage() {
  const { user } = useAuth();
  const daysInMonth = 31;
  const startOffset = 4;
  const cells = Array.from({ length: startOffset + daysInMonth }, (_, index) => {
    const date = index - startOffset + 1;
    if (date < 1 || date > daysInMonth) return null;
    if (achievedDays.has(date)) return { date, status: 'achieved' as const };
    if (missedDays.has(date)) return { date, status: 'missed' as const };
    return { date, status: 'neutral' as const };
  });

  return (
    <AppShell>
      <div className="space-y-8 py-8">
        <section>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-xs uppercase tracking-[0.35em] text-white/45">Calendar section</p>
            <h1 className="mt-3 text-4xl font-semibold">Live study calendar overview.</h1>
            <p className="mt-4 max-w-3xl text-white/60">Color-coded productivity history automatically reflects target completion. This calendar is read-only.</p>
          </motion.div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1fr_.35fr]">
          <Card>
            <CardHeader>
              <CardTitle>May 2026 productivity calendar</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4 grid grid-cols-7 gap-2 text-center text-xs text-white/45">
                {dayLabels.map((day) => (
                  <span key={day}>{day}</span>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-2">
                {cells.map((cell, index) => (
                  <div
                    key={index}
                    className={
                      !cell
                        ? 'h-12 rounded-xl border border-transparent'
                        : cell.status === 'achieved'
                          ? 'h-12 rounded-xl border border-pink-400/45 bg-pink-500/22 text-pink-100'
                          : cell.status === 'missed'
                            ? 'h-12 rounded-xl border border-violet-400/45 bg-violet-500/20 text-violet-100'
                            : 'h-12 rounded-xl border border-white/10 bg-white/5 text-white/70'
                    }
                  >
                    <div className="flex h-full items-center justify-center text-sm font-medium">{cell?.date ?? ''}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Legend</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-white/70">
              <div className="rounded-2xl border border-pink-400/40 bg-pink-500/20 p-3">Pink: Day targets achieved</div>
              <div className="rounded-2xl border border-violet-400/40 bg-violet-500/20 p-3">Purple: Day targets not achieved</div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-3">Neutral: No tracked completion data</div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                <p className="text-white/85">Tracked subjects</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {(user?.selectedSubjects ?? []).length ? (user?.selectedSubjects ?? []).map((subject) => <span key={subject} className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs text-white/70">{subject}</span>) : <span className="text-xs text-white/55">No subjects selected yet.</span>}
                </div>
              </div>
              <p className="pt-2 text-xs text-white/50">Data updates from target progress snapshots and remains non-editable in calendar mode.</p>
            </CardContent>
          </Card>
        </section>
      </div>
    </AppShell>
  );
}
