import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/src/lib/cn';

export type ButtonVariant = 'primary' | 'secondary';
export type ButtonSize = 'sm' | 'md';
export type ButtonShape = 'pill' | 'default';

interface BaseButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  shape?: ButtonShape;
  children: ReactNode;
  className?: string;
}

export type ButtonAsButtonProps = BaseButtonProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof BaseButtonProps> & {
    href?: undefined;
  };

export type ButtonAsLinkProps = BaseButtonProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof BaseButtonProps> & {
    href: string;
  };

export type ButtonProps = ButtonAsButtonProps | ButtonAsLinkProps;

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-accent text-accent-ink border border-accent/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.45)] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.68),0_0_24px_var(--accent-glow)] active:shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_0_10px_var(--accent-glow)]',
  secondary:
    'bg-transparent text-text border border-border-strong hover:bg-surface-2 hover:border-text-muted/50 active:bg-surface',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-9 px-6 text-[14px]',
  md: 'h-[44px] px-6 text-[15px]',
};

const shapeClasses: Record<ButtonShape, string> = {
  pill: 'rounded-full',
  default: 'rounded-[var(--radius-button)]',
};

const baseClasses =
  'group inline-flex items-center justify-center gap-2 whitespace-nowrap shrink-0 font-medium tracking-[-0.01em] transition-[transform,box-shadow,background-color,border-color,color] duration-150 ease-[cubic-bezier(0.4,0,0.2,1)] hover:-translate-y-px active:translate-y-0 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg disabled:opacity-50 disabled:pointer-events-none cursor-pointer select-none motion-reduce:hover:translate-y-0 motion-reduce:active:scale-100 [&>svg]:transition-transform [&>svg]:duration-150 group-hover:[&>svg]:translate-x-0.5';

export function Button(props: ButtonProps) {
  const {
    variant = 'primary',
    size = 'md',
    shape = 'pill',
    className,
    children,
    ...rest
  } = props;
  const classes = cn(
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    shapeClasses[shape],
    className
  );

  if ('href' in props && props.href !== undefined) {
    const { href, ...anchorProps } = rest as Omit<
      ButtonAsLinkProps,
      keyof BaseButtonProps
    >;
    return (
      <a href={href} className={classes} {...anchorProps}>
        {children}
      </a>
    );
  }

  const buttonProps = rest as Omit<ButtonAsButtonProps, keyof BaseButtonProps>;
  return (
    <button type={buttonProps.type ?? 'button'} className={classes} {...buttonProps}>
      {children}
    </button>
  );
}
