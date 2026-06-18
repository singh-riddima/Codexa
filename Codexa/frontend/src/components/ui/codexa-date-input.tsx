import * as React from 'react';
import { cn } from '@/lib/utils';

type CodexaDateInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  value: string; // yyyy-mm-dd
};

export function CodexaDateInput({ className, ...props }: CodexaDateInputProps) {
  return (
    <input
      type="date"
      className={cn(
        'h-10 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white/80 outline-none transition',
        'focus:border-fuchsia-400/35 focus:ring-2 focus:ring-fuchsia-400/20',
        'hover:bg-white/7',
        className
      )}
      {...props}
    />
  );
}

