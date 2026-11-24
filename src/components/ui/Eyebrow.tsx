import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/src/lib/cn';

export interface EyebrowProps extends HTMLAttributes<HTMLDivElement> {
  align?: 'center' | 'left';
  children: ReactNode;
}

export function Eyebrow({
  align = 'center',
  className,
  children,
  ...props
}: EyebrowProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center label text-text-dim',
        align === 'center' ? 'justify-center' : 'justify-start',
        className
      )}
      {...props}
    >
      <span>{children}</span>
    </div>
  );
}
