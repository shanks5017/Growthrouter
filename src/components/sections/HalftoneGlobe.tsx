import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { cn } from '@/src/lib/cn';
import { DURATION, EASE_OUT_EXPO } from '@/src/lib/motion';
import { useInViewActive, useInViewOnce } from '@/src/lib/useInViewOnce';
import { useReducedMotion } from '@/src/lib/useReducedMotion';

export interface HalftoneDot {
  x: number;
  y: number;
  r: number;
  opacity: number;
}

export interface HalftoneGlobeOptions {
  viewSize?: number;
  radius?: number;
  step?: number;
  rotationRad?: number;
}

export function generateHalftoneGlobeDots({
  viewSize = 520,
  radius = 232,
  step = 15,
  rotationRad = 0,
}: HalftoneGlobeOptions = {}): HalftoneDot[] {
  const center = viewSize / 2;
  const dots: HalftoneDot[] = [];

  // Normalized upper-left-front light vector for spherical shading
  const lx = -0.32;
  const ly = -0.44;
  const lz = 0.84;

  const cosR = Math.cos(rotationRad);
  const sinR = Math.sin(rotationRad);

  for (let y = step / 2; y <= viewSize - step / 2; y += step) {
    for (let x = step / 2; x <= viewSize - step / 2; x += step) {
      const nx = (x - center) / radius;
      const ny = (y - center) / radius;
      const r2 = nx * nx + ny * ny;

      if (r2 > 0.98) {
        continue;
      }

      const nz = Math.sqrt(Math.max(0, 1 - r2));

      // Rotate surface normal around Y axis so dot sizes & shading drift across the stationary grid
      const rx = nx * cosR + nz * sinR;
      const rz = -nx * sinR + nz * cosR;
      const diffuse = Math.max(0, rx * lx + ny * ly + rz * lz);

      // Modulate subtly by longitude band for perceptible 3D drift
      const lon = Math.atan2(rx, Math.max(0.001, Math.abs(rz)));
      const meridianWave = 0.88 + 0.12 * Math.cos(lon * 6);

      const limb = Math.pow(nz, 0.35);
      const shade = Math.min(1, (0.18 + 0.82 * diffuse * limb) * meridianWave);

      const dotRadius = Number((1.15 + 2.45 * shade).toFixed(2));
      const dotOpacity = Number((0.18 + 0.42 * shade).toFixed(2));

      dots.push({
        x: Number(x.toFixed(1)),
        y: Number(y.toFixed(1)),
        r: dotRadius,
        opacity: dotOpacity,
      });
    }
  }

  return dots;
}

export interface HalftoneGlobeProps {
  className?: string;
}

export function HalftoneGlobe({ className }: HalftoneGlobeProps) {
  const prefersReducedMotion = useReducedMotion();
  const { ref: onceRef, inView: hasEntered } = useInViewOnce<HTMLDivElement>({
    threshold: 0.05,
    rootMargin: '0px',
  });
  const { ref: activeRef, isActive: isInViewport } = useInViewActive<HTMLDivElement>({
    threshold: 0.01,
  });

  const baseDots = useMemo(() => generateHalftoneGlobeDots({ rotationRad: 0 }), []);
  const circleRefs = useRef<Array<SVGCircleElement | null>>([]);
  const [useShimmerFallback, setUseShimmerFallback] = useState(false);

  const setRefs = (node: HTMLDivElement | null) => {
    onceRef.current = node;
    activeRef.current = node;
  };

  useEffect(() => {
    if (prefersReducedMotion || !isInViewport || useShimmerFallback) return;

    let rafId = 0;
    let lastFrameTime = 0;
    let angle = 0;
    const targetFrameMs = 1000 / 24; // ~24fps throttle
    const angularVelocity = (Math.PI * 2) / DURATION.globeCycleMs; // 1 full turn per ~90s
    let slowFrames = 0;

    const tick = (now: number) => {
      if (document.hidden) {
        lastFrameTime = now;
        rafId = window.requestAnimationFrame(tick);
        return;
      }

      if (lastFrameTime === 0) {
        lastFrameTime = now;
      }

      const elapsed = now - lastFrameTime;
      if (elapsed >= targetFrameMs) {
        const computeStart = performance.now();
        angle = (angle + elapsed * angularVelocity) % (Math.PI * 2);
        lastFrameTime = now;

        const nextDots = generateHalftoneGlobeDots({ rotationRad: angle });
        for (let i = 0; i < nextDots.length; i++) {
          const el = circleRefs.current[i];
          if (!el) continue;
          const dot = nextDots[i];
          el.setAttribute('r', String(dot.r));
          el.setAttribute('fill-opacity', String(dot.opacity));
        }

        const computeCost = performance.now() - computeStart;
        if (computeCost > 2) {
          slowFrames += 1;
          if (slowFrames >= 5) {
            setUseShimmerFallback(true);
            return;
          }
        } else {
          slowFrames = 0;
        }
      }

      rafId = window.requestAnimationFrame(tick);
    };

    rafId = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(rafId);
  }, [prefersReducedMotion, isInViewport, useShimmerFallback]);

  return (
    <motion.div
      ref={setRefs}
      aria-hidden="true"
      initial={prefersReducedMotion ? false : { opacity: 0 }}
      animate={hasEntered || prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
      transition={{
        duration: prefersReducedMotion ? DURATION.reduced : DURATION.globeFade,
        ease: EASE_OUT_EXPO,
      }}
      className={cn(
        'pointer-events-none select-none mask-fade-up',
        className
      )}
    >
      <svg
        id="halftone-globe"
        viewBox="0 0 520 520"
        width="520"
        height="520"
        className="block h-auto w-full"
      >
        <g
          id="halftone-globe-dots"
          data-globe-rotatable=""
          className="origin-center"
        >
          {baseDots.map((dot, idx) => (
            <circle
              key={idx}
              ref={(el) => {
                circleRefs.current[idx] = el;
              }}
              cx={dot.x}
              cy={dot.y}
              r={dot.r}
              fill="var(--accent-fg)"
              fillOpacity={dot.opacity}
              style={
                useShimmerFallback && !prefersReducedMotion
                  ? ({
                      '--dot-min': Math.max(0.14, dot.opacity - 0.14).toFixed(2),
                      '--dot-max': Math.min(0.68, dot.opacity + 0.12).toFixed(2),
                      animation: `globe-dot-shimmer 4.5s ease-in-out ${(idx % 12) * 0.25}s infinite`,
                    } as React.CSSProperties)
                  : undefined
              }
            />
          ))}
        </g>
      </svg>
    </motion.div>
  );
}
