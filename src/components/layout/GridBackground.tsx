import { cn } from '@/src/lib/cn';

export interface GridBackgroundProps {
  className?: string;
}

export function GridBackground({ className }: GridBackgroundProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'pointer-events-none absolute inset-0 overflow-hidden bg-grid-pattern',
        className
      )}
    />
  );
}
