import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cn } from '@/lib/utils';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'default' | 'secondary' | 'ghost' | 'outline' | 'glow';
  size?: 'sm' | 'md' | 'lg';
  asChild?: boolean;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant = 'default', size = 'md', asChild, ...props }, ref) => {
  const Comp = asChild ? Slot : 'button';
  return (
    <Comp
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-400/70 disabled:pointer-events-none disabled:opacity-50',
        size === 'sm' && 'h-9 px-4 text-sm',
        size === 'md' && 'h-11 px-5 text-sm',
        size === 'lg' && 'h-12 px-6 text-base',
        variant === 'default' && 'bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500 text-white shadow-[0_0_0_1px_rgba(255,255,255,.16),0_14px_40px_rgba(201,76,255,.35)] hover:translate-y-[-1px] hover:brightness-110',
        variant === 'secondary' && 'border border-white/15 bg-white/8 text-white hover:bg-white/12',
        variant === 'outline' && 'border border-fuchsia-400/40 bg-fuchsia-500/10 text-fuchsia-100 hover:bg-fuchsia-500/20',
        variant === 'ghost' && 'bg-transparent text-white/80 hover:bg-white/8 hover:text-white',
        variant === 'glow' && 'bg-gradient-to-r from-[#6f42ff] via-[#cf43f8] to-[#ff4ea9] text-white shadow-[0_0_0_1px_rgba(255,255,255,.18),0_18px_50px_rgba(206,70,255,.42)] hover:brightness-110',
        className
      )}
      {...props}
    />
  );
});

Button.displayName = 'Button';