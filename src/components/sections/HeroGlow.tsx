import { motion } from 'motion/react';
import { cn } from '@/src/lib/cn';
import { DURATION, EASE_OUT_EXPO } from '@/src/lib/motion';
import { useReducedMotion } from '@/src/lib/useReducedMotion';

export interface HeroGlowProps {
  className?: string;
}

export function HeroGlow({ className }: HeroGlowProps) {
  const prefersReducedMotion = useReducedMotion();

  const layers = (
    <>
      {/* Layer 1 (haze): wide horizon-hugging deep-green atmosphere scaled to screen width */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[135%] max-w-[1360px] h-full bg-[radial-gradient(ellipse_52%_48%_at_50%_100%,color-mix(in_srgb,var(--glow-deep)_46%,transparent)_0%,transparent_76%)]"
      />

      {/* Layer 2 (core): wide emerald glow sweeping across the dashboard top edge */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[96%] sm:w-[78%] md:w-[68%] h-[66%] bg-[radial-gradient(ellipse_52%_38%_at_50%_100%,color-mix(in_srgb,var(--glow-mid)_68%,transparent)_0%,transparent_74%)]"
      />

      {/* Layer 3 (hot-spot): sleek wide horizontal light bar along the top bezel edge (never a round ball on small screens) */}
      {prefersReducedMotion ? (
        <div
          className="absolute -bottom-[18px] sm:-bottom-[26px] md:-bottom-[32px] left-1/2 -translate-x-1/2 w-[82%] sm:w-[64%] md:w-[50%] h-[44px] sm:h-[64px] md:h-[84px] rounded-full opacity-92 blur-[18px] md:blur-[26px] bg-[radial-gradient(ellipse_52%_48%_at_50%_50%,color-mix(in_srgb,var(--glow-hot)_85%,transparent)_0%,color-mix(in_srgb,var(--glow-hot)_28%,transparent)_46%,transparent_78%)]"
        />
      ) : (
        <motion.div
          animate={{ opacity: [0.85, 1, 0.85] }}
          transition={{
            duration: DURATION.heroGlowPulse,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute -bottom-[18px] sm:-bottom-[26px] md:-bottom-[32px] left-1/2 -translate-x-1/2 w-[82%] sm:w-[64%] md:w-[50%] h-[44px] sm:h-[64px] md:h-[84px] rounded-full blur-[18px] md:blur-[26px] bg-[radial-gradient(ellipse_52%_48%_at_50%_50%,color-mix(in_srgb,var(--glow-hot)_85%,transparent)_0%,color-mix(in_srgb,var(--glow-hot)_28%,transparent)_46%,transparent_78%)]"
        />
      )}
    </>
  );

  return (
    <div
      aria-hidden="true"
      style={{ opacity: 'var(--hero-glow-opacity)' }}
      className={cn(
        'pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 w-full max-w-[1000px] h-[260px] sm:h-[360px] md:h-[460px] lg:h-[540px] overflow-visible z-0',
        className
      )}
    >
      {prefersReducedMotion ? (
        <div className="relative h-full w-full">{layers}</div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: DURATION.heroGlow, ease: EASE_OUT_EXPO }}
          className="relative h-full w-full"
        >
          {layers}
        </motion.div>
      )}
    </div>
  );
}
