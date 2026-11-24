import { useEffect, useState } from 'react';
import { animate } from 'motion/react';
import { Check } from 'lucide-react';
import { Button } from '@/src/components/ui';
import { cn } from '@/src/lib/cn';
import { DURATION, EASE_OUT_EXPO } from '@/src/lib/motion';
import { useInViewOnce } from '@/src/lib/useInViewOnce';
import { useReducedMotion } from '@/src/lib/useReducedMotion';

export type PlanCadence = 'once' | '/month';

export interface PlanCardProps {
  name: string;
  price: number | string;
  cadence: PlanCadence;
  features: readonly string[];
  cta: string;
  href: string;
  highlighted?: boolean;
  tag?: string;
  staggerIndex?: number;
  className?: string;
  onMouseEnter?: () => void;
  onClick?: () => void;
}

export function PlanCard({
  name,
  price,
  cadence,
  features,
  cta,
  href,
  highlighted = false,
  tag,
  staggerIndex,
  className,
  onMouseEnter,
  onClick,
}: PlanCardProps) {
  const numericPrice = typeof price === 'number' ? price : Number(price);
  const canCount = Number.isFinite(numericPrice);
  const prefersReducedMotion = useReducedMotion();
  const { ref, inView } = useInViewOnce<HTMLDivElement>({
    threshold: 0.15,
    rootMargin: '0px 0px -10% 0px',
  });

  const [displayPrice, setDisplayPrice] = useState<number>(() =>
    prefersReducedMotion || !canCount ? numericPrice : 0
  );

  useEffect(() => {
    if (!canCount) return;

    if (prefersReducedMotion) {
      setDisplayPrice(numericPrice);
      return;
    }

    if (!inView) return;

    const delay = (staggerIndex ?? 0) * 0.08;
    const controls = animate(0, numericPrice, {
      duration: DURATION.priceCount,
      delay,
      ease: EASE_OUT_EXPO,
      onUpdate: (latest) => {
        setDisplayPrice(Math.round(latest));
      },
    });

    return () => controls.stop();
  }, [canCount, numericPrice, inView, staggerIndex, prefersReducedMotion]);

  return (
    <div
      ref={ref}
      data-reveal=""
      data-stagger-index={staggerIndex}
      onMouseEnter={onMouseEnter}
      onClick={onClick}
      className={cn(
        'group flex h-full w-full flex-col rounded-[22px] p-6 lg:p-7 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] cursor-pointer',
        highlighted
          ? 'border-2 border-accent bg-surface shadow-[0_0_36px_rgba(215,255,30,0.2)] -translate-y-1.5'
          : 'border border-border bg-surface hover:border-accent hover:shadow-[0_0_36px_rgba(215,255,30,0.18)] hover:-translate-y-1.5',
        className
      )}
    >
      {/* 1. Header row */}
      <div className="flex min-h-[26px] items-center justify-between gap-2">
        <h4 className="text-[17px] font-medium tracking-[-0.02em] text-text">
          {name}
        </h4>
        {tag ? (
          <span
            className={cn(
              'inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium tracking-tight leading-none transition-colors duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]',
              highlighted
                ? 'border border-accent text-accent bg-accent/10'
                : 'border border-accent/50 text-accent/80 bg-transparent group-hover:border-accent group-hover:text-accent group-hover:bg-accent/10'
            )}
          >
            {tag}
          </span>
        ) : null}
      </div>

      {/* 2. Price */}
      <div className="mt-4 flex items-baseline">
        <span className="text-[34px] sm:text-[38px] lg:text-[40px] font-semibold tracking-[-0.03em] text-text leading-none tabular-nums">
          $
        </span>
        <span className="text-[34px] sm:text-[38px] lg:text-[40px] font-semibold tracking-[-0.03em] text-text leading-none tabular-nums">
          {canCount ? displayPrice : price}
        </span>
        <span className="ml-1.5 text-[13px] text-text-muted font-normal">
          {cadence}
        </span>
      </div>

      {/* 3. Feature list */}
      <ul className="mt-6 flex-1 space-y-3.5">
        {features.map((feature) => (
          <li
            key={feature}
            className="flex items-start gap-2.5 text-[13.5px] leading-snug text-text/80"
          >
            <span
              aria-hidden="true"
              className={cn(
                'mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-[4px] text-accent-ink transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]',
                highlighted
                  ? 'bg-accent scale-105 shadow-[0_0_10px_var(--accent-glow)]'
                  : 'bg-accent/85 group-hover:bg-accent group-hover:scale-105 group-hover:shadow-[0_0_10px_var(--accent-glow)]'
              )}
            >
              <Check className="h-2.5 w-2.5 stroke-[3]" />
            </span>
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      {/* 4. Full-width CTA pinned to bottom */}
      <div className="mt-8">
        <Button
          href={href}
          variant={highlighted ? 'primary' : 'secondary'}
          size="md"
          shape="pill"
          className={cn(
            'w-full text-[14px] !duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] transition-all',
            highlighted
              ? 'bg-accent text-accent-ink border-accent/80 shadow-[0_0_20px_var(--accent-glow)]'
              : 'border-border-strong bg-surface-2 text-text group-hover:bg-accent group-hover:text-accent-ink group-hover:border-accent/80 group-hover:shadow-[0_0_20px_var(--accent-glow)]'
          )}
        >
          {cta}
        </Button>
      </div>
    </div>
  );
}
