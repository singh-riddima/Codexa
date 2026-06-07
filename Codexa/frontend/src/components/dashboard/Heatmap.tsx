import { cn } from '@/lib/utils';

export function Heatmap({ data }: { data: Array<{ label: string; value: number }> }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {data.map((item) => (
        <div key={item.label} className={cn('rounded-2xl border p-4 text-sm transition-transform duration-300 hover:-translate-y-1', item.value > 80 ? 'border-violet-400/30 bg-violet-500/20' : item.value > 60 ? 'border-fuchsia-400/20 bg-fuchsia-500/16' : 'border-white/10 bg-white/5')}>
          <p className="text-white/55">{item.label}</p>
          <p className="mt-3 text-2xl font-semibold">{item.value}%</p>
        </div>
      ))}
    </div>
  );
}