import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/src/lib/cn';

export type BadgeVariant =
  | 'neutral'
  | 'lime'
  | 'white-filled'
  | 'orange-filled'
  | 'red-filled';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  children: ReactNode;
}

const variantClasses: Record<BadgeVariant, string> = {
  neutral: 'bg-surface-2 text-text-muted border-border-strong',
  lime: 'bg-accent/12 text-accent-fg border-accent/35',
  'white-filled': 'bg-[#F2F2F0] text-[#0B0B0C] border-border-strong',
  'orange-filled': 'bg-[#FF6B2C] text-[#0B0B0C] border-transparent',
  'red-filled': 'bg-danger text-[#FFFFFF] border-transparent',
};

export function Badge({
  variant = 'neutral',
  className,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center justify-center whitespace-nowrap shrink-0 border rounded-[var(--radius-badge)] px-2 py-1 font-mono text-[11px] font-medium uppercase tracking-[0.08em] leading-none tabular-nums',
        variantClasses[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

export const MonoTag = Badge;
