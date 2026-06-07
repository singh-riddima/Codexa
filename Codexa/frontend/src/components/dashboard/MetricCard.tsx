import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import type { StatCardData } from '@/types';

const toneMap = {
  brand: 'from-violet-500/25 to-fuchsia-500/10',
  success: 'from-emerald-500/25 to-cyan-500/10',
  warning: 'from-amber-500/25 to-rose-500/10',
  neutral: 'from-white/10 to-white/5'
} as const;

export function MetricCard({ item, index }: { item: StatCardData; index: number }) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.06 }}>
      <Card className={`bg-gradient-to-br ${toneMap[item.tone ?? 'neutral']}`}>
        <CardContent>
          <CardDescription>{item.label}</CardDescription>
          <CardTitle className="mt-3 text-3xl font-semibold">{item.value}</CardTitle>
          {item.delta ? <p className="mt-3 text-sm text-white/60">{item.delta}</p> : null}
        </CardContent>
      </Card>
    </motion.div>
  );
}