import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/src/lib/cn';

export interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  bordered?: boolean;
  fadeTopRails?: boolean;
  children: ReactNode;
}

export function Container({
  bordered = false,
  fadeTopRails = false,
  className,
  style,
  children,
  ...props
}: ContainerProps) {
  return (
    <div
      className={cn(
        'mx-auto w-full max-w-[1200px] px-4 md:px-6 lg:px-8',
        bordered && 'border-x border-border',
        className
      )}
      style={
        bordered && fadeTopRails
          ? {
              borderImage:
                'linear-gradient(to bottom, transparent 0px, var(--border) 120px) 1',
              ...style,
            }
          : style
      }
      {...props}
    >
      {children}
    </div>
  );
}
