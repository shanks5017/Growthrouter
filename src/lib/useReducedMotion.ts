import { useReducedMotion as useMotionReduced } from 'motion/react';

export function useReducedMotion(): boolean {
  return Boolean(useMotionReduced());
}
