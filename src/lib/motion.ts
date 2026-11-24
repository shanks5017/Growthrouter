import type { Variants } from 'motion/react';

export const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;
export const EASE_STANDARD = [0.4, 0, 0.2, 1] as const;

export const DURATION = {
  hover: 0.15,
  ui: 0.2,
  uiFade: 0.25,
  accordion: 0.3,
  reveal: 0.7,
  heroPill: 0.5,
  heroBody: 0.6,
  heroHeadline: 0.8,
  heroCorner: 0.8,
  heroGlow: 1.2,
  heroGlowPulse: 8,
  dashboardEnter: 0.9,
  dashboardItem: 0.45,
  dashboardStatusPulse: 2.8,
  progress: 0.9,
  priceCount: 0.9,
  diagramIncoming: 0.9,
  diagramCenter: 0.4,
  diagramCenterPulse: 3,
  diagramOutgoing: 0.7,
  diagramLabels: 0.35,
  globeFade: 1.2,
  globeCycleMs: 90000,
  reduced: 0.15,
} as const;

export const STAGGER = {
  reveal: 0.08,
  heroLine: 0.12,
  heroItem: 0.08,
  dashboardSidebar: 0.06,
  dashboardToolCard: 0.08,
  dashboardRow: 0.07,
  diagramIncoming: 0.09,
  diagramOutgoing: 0.12,
} as const;

export const DISTANCE = {
  pillY: 12,
  heroItemY: 16,
  revealY: 24,
  dashboardY: 40,
  dashboardSidebarX: -8,
  dashboardCardY: 12,
  dashboardRowY: 8,
} as const;

export const VIEWPORT_ONCE = {
  once: true,
  amount: 0.15,
} as const;

export type DiagramSourceId =
  | 'reddit'
  | 'x'
  | 'hn'
  | 'youtube'
  | 'google'
  | 'forums';

export type DiagramOutputId = 'asking' | 'replies';

export interface DiagramArrivalEvent {
  id: string;
  source: DiagramSourceId;
  at: number;
  output: DiagramOutputId;
}

export const DIAGRAM_CHOREO = {
  loopSec: 8.0,
  minArrivalGapSec: 0.28,
  outputLaunchDelaySec: 0.12,
  progressExponent: 1.35,
  incomingDurationMinSec: 2.0,
  incomingDurationMaxSec: 2.8,
  outgoingDurationSec: {
    asking: 1.85,
    replies: 1.65,
  },
  scanTimeScale: 1.6,
  scanEaseSec: 0.4,
  arrivals: [
    { id: 'ev-1', source: 'reddit', at: 0.6, output: 'asking' },
    { id: 'ev-2', source: 'x', at: 1.06, output: 'replies' },
    { id: 'ev-3', source: 'hn', at: 1.9, output: 'asking' },
    { id: 'ev-4', source: 'youtube', at: 2.36, output: 'asking' },
    { id: 'ev-5', source: 'google', at: 3.54, output: 'replies' },
    { id: 'ev-6', source: 'forums', at: 4.0, output: 'asking' },
    { id: 'ev-7', source: 'hn', at: 4.46, output: 'asking' },
    { id: 'ev-8', source: 'x', at: 5.8, output: 'replies' },
    { id: 'ev-9', source: 'reddit', at: 6.5, output: 'asking' },
    { id: 'ev-10', source: 'google', at: 7.2, output: 'asking' },
  ] satisfies readonly DiagramArrivalEvent[],
} as const;

export const DIAGRAM_PACKETS = {
  dotSize: 2.2,
  dotSpacing: 5.5,
  headSize: 6,
  haloSize: 12,
  haloOpacityLight: 0.12,
  haloOpacityAccent: 0.22,
  trailCount: 12,
  trailOpacities: [
    0.9, 0.74, 0.6, 0.48, 0.38, 0.3, 0.23, 0.17, 0.12, 0.09, 0.07, 0.05,
  ] as const,
  fadeInPct: 0.06,
  fadeOutPct: 0.05,
  groupFadeDuration: 0.4,
  maxDeltaMs: 50,
  centerRippleDurationMs: 600,
  centerRippleThrottleMs: 250,
  outputResponseDurationMs: 180,
  askingPoolSize: 3,
  repliesPoolSize: 2,
} as const;

export const fadeUpVariants: Variants = {
  hidden: (distance: number = DISTANCE.heroItemY) => ({
    opacity: 0,
    y: distance,
  }),
  visible: (delay: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: DURATION.heroBody,
      delay,
      ease: EASE_OUT_EXPO,
    },
  }),
};

export const maskLineVariants: Variants = {
  hidden: {
    y: '105%',
  },
  visible: (delay: number = 0) => ({
    y: '0%',
    transition: {
      duration: DURATION.heroHeadline,
      delay,
      ease: EASE_OUT_EXPO,
    },
  }),
};

export const fadeOnlyVariants: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: (params: { delay?: number; duration?: number } = {}) => ({
    opacity: 1,
    transition: {
      duration: params.duration ?? DURATION.heroCorner,
      delay: params.delay ?? 0,
      ease: EASE_OUT_EXPO,
    },
  }),
};

export const reducedFadeVariants: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      duration: DURATION.reduced,
      ease: EASE_STANDARD,
    },
  },
};
