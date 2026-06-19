import * as React from 'react';
import { cn } from '@/lib/utils';
import { Check, ChevronDown } from 'lucide-react';

type OptionLike = React.ReactElement<
  HTMLOptionElement,
  'option'
>;

type CodexaSelectProps = {
  className?: string;
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
  disabled?: boolean;
  placeholder?: string;
};

function getOptions(children: React.ReactNode): OptionLike[] {
  const arr = React.Children.toArray(children).filter(React.isValidElement) as OptionLike[];
  return arr.filter((el) => el.type === 'option');
}

/**
 * Codexa themed select WITHOUT native <select>/<option> rendering.
 * - Popup: dark glass + purple/pink glow
 * - Options: dark background, white text, purple hover overlay
 */
export function CodexaSelect({
  className,
  value,
  onChange,
  children,
  disabled,
  placeholder
}: CodexaSelectProps) {
  const options = React.useMemo(() => getOptions(children), [children]);

  const selected = options.find((o) => String(o.props.value ?? '') === String(value));
  const label = selected ? String(selected.props.children ?? '') : placeholder ?? '';

  const [open, setOpen] = React.useState(false);
  const rootRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      const t = e.target as Node;
      if (!rootRef.current?.contains(t)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  return (
    <div ref={rootRef} className={cn('relative', className)}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen((s) => !s)}
        className={cn(
          'flex h-10 w-full items-center justify-between gap-3 rounded-xl border border-purple-500/30 bg-white/5 px-3 text-sm text-white/90',
          'backdrop-blur-xl shadow-[0_0_25px_rgba(168,85,247,0.3)]',
          'transition',
          disabled ? 'cursor-not-allowed opacity-60' : 'hover:bg-white/7',
          'focus:outline-none focus:ring-2 focus:ring-fuchsia-400/20 focus:border-fuchsia-400/35'
        )}
      >
        <span className={cn('truncate', !label && 'text-white/50')}>{label}</span>
        <ChevronDown className={cn('h-4 w-4 text-white/70 transition', open && 'rotate-180')} />
      </button>

      {open ? (
        <div
          className={cn(
            'absolute z-50 mt-2 w-full overflow-hidden rounded-xl border border-purple-500/30 bg-[#09090f]/95',
            'backdrop-blur-xl shadow-[0_0_45px_rgba(236,72,153,0.25)]'
          )}
        >
          <div className="max-h-60 overflow-auto p-2">
            {options.length === 0 ? (
              <div className="px-3 py-2 text-sm text-white/60">No options</div>
            ) : (
              options.map((opt) => {
                const optValue = String(opt.props.value ?? '');
                const optLabel = String(opt.props.children ?? '');
                const selectedNow = optValue === String(value);

                return (
                  <button
                    key={optValue || optLabel}
                    type="button"
                    onClick={() => {
                      onChange(optValue);
                      setOpen(false);
                    }}
                    className={cn(
                      'group flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left text-sm',
                      'cursor-pointer text-white',
                      'hover:bg-purple-500/20',
                      selectedNow && 'bg-purple-500/20 shadow-[0_0_18px_rgba(236,72,153,0.35)]'
                    )}
                  >
                    <span className="truncate">{optLabel}</span>
                    {selectedNow ? <Check className="h-4 w-4 text-pink-200" /> : <span />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}


