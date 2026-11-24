import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/src/lib/cn';

export type CardVariant = 'default' | 'elevated';
export type CardPadding = 'none' | 'sm' | 'md' | 'lg';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  padding?: CardPadding;
  children: ReactNode;
}

const variantClasses: Record<CardVariant, string> = {
  default: 'bg-surface',
  elevated: 'bg-surface-2',
};

const paddingClasses: Record<CardPadding, string> = {
  none: 'p-0',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  { variant = 'default', padding = 'md', className, children, ...props },
  ref
) {
  return (
    <div
      ref={ref}
      className={cn(
        'rounded-[var(--radius-card)] border border-border shadow-[inset_0_1px_0_var(--surface-highlight)]',
        variantClasses[variant],
        paddingClasses[padding],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});
