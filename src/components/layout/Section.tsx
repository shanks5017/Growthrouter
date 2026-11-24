import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/src/lib/cn';
import { Container } from './Container';

export interface SectionProps extends HTMLAttributes<HTMLElement> {
  index?: string;
  total?: string;
  label?: string;
  divider?: boolean;
  fadeTopRails?: boolean;
  containerClassName?: string;
  children: ReactNode;
}

export function Section({
  index,
  total,
  label,
  divider = true,
  fadeTopRails = false,
  className,
  containerClassName,
  children,
  ...props
}: SectionProps) {
  const showCounter = Boolean(index || label);

  return (
    <section
      className={cn(
        'relative w-full scroll-mt-20',
        divider && 'border-b border-border',
        className
      )}
      {...props}
    >
      <Container
        fadeTopRails={fadeTopRails}
        className={cn(
          showCounter ? 'pt-24 pb-24 md:pb-36' : 'py-24 md:py-36',
          containerClassName
        )}
      >
        {showCounter ? (
          <div className="relative mb-12 flex items-center gap-3 pl-3">
            <span
              aria-hidden="true"
              className="absolute left-0 top-1/2 -translate-y-1/2 h-3.5 w-[2px] bg-accent"
            />
            {index ? (
              <span className="font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-text-muted tabular-nums whitespace-nowrap">
                [ {index}
                {total ? ` / ${total}` : ''} ]
              </span>
            ) : null}
            {label ? (
              <span className="font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-text-dim whitespace-nowrap">
                {label}
              </span>
            ) : null}
          </div>
        ) : null}
        {children}
      </Container>
    </section>
  );
}
