import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/src/lib/cn';
import { Eyebrow } from './Eyebrow';

export interface SectionHeaderProps extends HTMLAttributes<HTMLDivElement> {
  eyebrow: string;
  titleLine1: string;
  titleLine2: string;
  subtitle?: ReactNode;
  align?: 'center' | 'left';
  size?: 'default' | 'hero';
  headingId?: string;
}

export function SectionHeader({
  eyebrow,
  titleLine1,
  titleLine2,
  subtitle,
  align = 'center',
  size = 'default',
  headingId,
  className,
  ...props
}: SectionHeaderProps) {
  const isCentered = align === 'center';
  const isHeroScale = size === 'hero';

  return (
    <div
      className={cn(
        'flex flex-col gap-5',
        isHeroScale ? 'max-w-[980px]' : 'max-w-3xl',
        isCentered ? 'items-center text-center mx-auto' : 'items-start text-left',
        className
      )}
      {...props}
    >
      <Eyebrow align={align}>{eyebrow}</Eyebrow>
      <h2
        id={headingId}
        className={isHeroScale ? 'hero-display font-light' : 'h2 font-light tracking-[-0.03em]'}
      >
        <span className="block text-text">{titleLine1}</span>
        <span className="block text-accent-fg">{titleLine2}</span>
      </h2>
      {subtitle ? (
        <p
          className={cn(
            isHeroScale ? 'hero-subtext max-w-[880px]' : 'body text-text-muted max-w-2xl',
            isCentered && 'mx-auto'
          )}
        >
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}
