import { useEffect, useState } from 'react';
import { animate, motion } from 'motion/react';
import { Card } from '@/src/components/ui';
import { cn } from '@/src/lib/cn';
import { DURATION, EASE_OUT_EXPO } from '@/src/lib/motion';
import { useInViewOnce } from '@/src/lib/useInViewOnce';
import { useReducedMotion } from '@/src/lib/useReducedMotion';

export interface FoundersCardProps {
  claimed?: number;
  total?: number;
  animationDelay?: number;
  className?: string;
}

export function FoundersCard({
  claimed = 7,
  total = 50,
  animationDelay = 0.2,
  className,
}: FoundersCardProps) {
  const safeTotal = total > 0 ? total : 1;
  const clampedClaimed = Math.max(0, Math.min(claimed, safeTotal));
  const ratio = clampedClaimed / safeTotal;
  const prefersReducedMotion = useReducedMotion();
  const { ref: inViewRef, inView } = useInViewOnce<HTMLDivElement>({
    threshold: 0.2,
  });

  const shouldAnimate = prefersReducedMotion || inView;

  const [displayCount, setDisplayCount] = useState(() =>
    prefersReducedMotion ? clampedClaimed : 0
  );

  useEffect(() => {
    if (prefersReducedMotion) {
      setDisplayCount(clampedClaimed);
      return;
    }
    if (!inView) return;

    const controls = animate(0, clampedClaimed, {
      duration: DURATION.progress,
      delay: animationDelay,
      ease: EASE_OUT_EXPO,
      onUpdate: (latest) => {
        setDisplayCount(Math.round(latest));
      },
    });

    return () => controls.stop();
  }, [clampedClaimed, animationDelay, prefersReducedMotion, inView]);

  return (
    <div ref={inViewRef} className={cn('mx-auto w-full', className)}>
      <Card
        padding="none"
        className="w-full min-h-[44px] sm:h-[44px] rounded-[22px] sm:rounded-full border-border-strong bg-surface/90 shadow-[inset_0_1px_0_var(--surface-highlight)] px-5 py-2.5 sm:py-0 flex flex-wrap sm:flex-nowrap items-center justify-between gap-x-3 gap-y-2 text-left"
      >
        <p className="text-[13px] font-medium text-text leading-snug sm:whitespace-nowrap">
          Free $5 for the first {total} founders
        </p>

        <div
          role="progressbar"
          aria-valuenow={clampedClaimed}
          aria-valuemin={0}
          aria-valuemax={safeTotal}
          aria-label={`${clampedClaimed} of ${safeTotal} founder credits claimed`}
          className="h-[3px] w-24 shrink-0 overflow-hidden rounded-full bg-border"
        >
          {prefersReducedMotion ? (
            <div
              className="h-full w-full origin-left rounded-full bg-accent"
              style={{ transform: `scaleX(${ratio})` }}
            />
          ) : (
            <motion.div
              initial={{ scaleX: 0 }}
              animate={shouldAnimate ? { scaleX: ratio } : { scaleX: 0 }}
              transition={{
                duration: DURATION.progress,
                delay: animationDelay,
                ease: EASE_OUT_EXPO,
              }}
              className="h-full w-full origin-left rounded-full bg-accent"
            />
          )}
        </div>

        <span className="font-mono text-[12px] font-medium text-accent-fg tabular-nums whitespace-nowrap shrink-0">
          {displayCount} of {total} claimed
        </span>
      </Card>

      <p className="mt-3 text-center text-[13px] text-text-muted leading-snug">
        Sign up with Google and 50 credits are yours. One per person.
      </p>
    </div>
  );
}
