import { cn } from '@/lib/utils';

const levels = [
  'bg-white/6',
  'bg-cyan-500/25',
  'bg-fuchsia-500/30',
  'bg-violet-500/40',
  'bg-pink-500/50'
];

const contributionGrid = Array.from({ length: 84 }, (_, index) => {
  const pattern = [0, 1, 2, 3, 4, 2, 1, 0, 3, 4, 1, 2];
  return pattern[index % pattern.length];
});

export function ContributionHeatmap() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-12 gap-2 sm:gap-2.5">
        {contributionGrid.map((level, index) => (
          <div
            key={index}
            title={`Contribution intensity ${level}`}
            className={cn('aspect-square rounded-[6px] border border-white/6 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.03)]', levels[level])}
          />
        ))}
      </div>
      <div className="flex items-center justify-between text-xs text-white/45">
        <span>Less</span>
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-sm bg-white/6" />
          <span className="h-3 w-3 rounded-sm bg-cyan-500/25" />
          <span className="h-3 w-3 rounded-sm bg-fuchsia-500/30" />
          <span className="h-3 w-3 rounded-sm bg-violet-500/40" />
          <span className="h-3 w-3 rounded-sm bg-pink-500/50" />
        </div>
        <span>More</span>
      </div>
    </div>
  );
}