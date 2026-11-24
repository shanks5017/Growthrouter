import { motion } from 'motion/react';
import { Container } from '@/src/components/layout';
import { Button } from '@/src/components/ui';
import { cn } from '@/src/lib/cn';
import {
  DISTANCE,
  DURATION,
  EASE_OUT_EXPO,
  STAGGER,
  maskLineVariants,
  reducedFadeVariants,
} from '@/src/lib/motion';
import { useInViewOnce } from '@/src/lib/useInViewOnce';
import { useReducedMotion } from '@/src/lib/useReducedMotion';
import { HalftoneGlobe } from './HalftoneGlobe';

export interface FinalCTAProps {
  className?: string;
}

export function FinalCTA({ className }: FinalCTAProps) {
  const prefersReducedMotion = useReducedMotion();
  const { ref, inView } = useInViewOnce<HTMLDivElement>({
    threshold: 0.2,
    rootMargin: '0px 0px -10% 0px',
  });

  const isVisible = prefersReducedMotion || inView;

  return (
    <section
      id="final-cta"
      aria-labelledby="final-cta-heading"
      className={cn('relative w-full overflow-hidden', className)}
    >
      <Container className="relative overflow-hidden py-32 md:py-40">
        <HalftoneGlobe className="absolute -bottom-36 md:-bottom-40 left-1/2 -translate-x-1/2 z-0 w-[min(540px,94vw)] opacity-85" />

        <div
          ref={ref}
          className="relative z-10 flex flex-col items-center text-center"
        >
          <h2
            id="final-cta-heading"
            className="display font-light tracking-[-0.03em] max-w-3xl mx-auto"
          >
            {/* Extra 0.08em bottom padding prevents clipping descenders during mask reveal */}
            <span className="block overflow-hidden pb-[0.08em] -mb-[0.08em]">
              <motion.span
                variants={prefersReducedMotion ? reducedFadeVariants : maskLineVariants}
                initial="hidden"
                animate={isVisible ? 'visible' : 'hidden'}
                custom={0}
                className="block text-text"
              >
                Stop posting into the void.
              </motion.span>
            </span>
            <span className="block overflow-hidden pb-[0.08em] -mb-[0.08em]">
              <motion.span
                variants={prefersReducedMotion ? reducedFadeVariants : maskLineVariants}
                initial="hidden"
                animate={isVisible ? 'visible' : 'hidden'}
                custom={STAGGER.heroLine}
                className="block text-accent-fg"
              >
                See who to talk to today.
              </motion.span>
            </span>
          </h2>

          <motion.div
            initial={
              prefersReducedMotion
                ? { opacity: 0 }
                : { opacity: 0, y: DISTANCE.heroItemY }
            }
            animate={
              isVisible
                ? { opacity: 1, y: 0 }
                : prefersReducedMotion
                  ? { opacity: 0 }
                  : { opacity: 0, y: DISTANCE.heroItemY }
            }
            transition={{
              duration: prefersReducedMotion ? DURATION.reduced : DURATION.heroBody,
              delay: prefersReducedMotion ? 0 : STAGGER.heroLine + 0.15,
              ease: EASE_OUT_EXPO,
            }}
            className="mt-8"
          >
            <Button href="#" variant="primary" size="md">
              Start with $5 of free credits
            </Button>
          </motion.div>
        </div>
      </Container>
    </section>
  );
}
