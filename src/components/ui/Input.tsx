import { forwardRef, useId, type InputHTMLAttributes } from 'react';
import { cn } from '@/src/lib/cn';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, hint, error, id, className, ...props },
  ref
) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  return (
    <div className="w-full space-y-2">
      {label ? (
        <label
          htmlFor={inputId}
          className="block label text-text-muted"
        >
          {label}
        </label>
      ) : null}
      <input
        ref={ref}
        id={inputId}
        aria-invalid={error ? true : undefined}
        aria-describedby={
          error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined
        }
        className={cn(
          'w-full h-[44px] px-3.5 rounded-[var(--radius-button)] bg-[var(--input-bg)] border border-border-strong text-[15px] text-text placeholder:text-text-dim transition-[border-color,box-shadow] duration-150 ease-[cubic-bezier(0.4,0,0.2,1)] focus-visible:outline-none focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent/35 disabled:opacity-50 disabled:cursor-not-allowed',
          error && 'border-danger focus-visible:border-danger focus-visible:ring-danger/30',
          className
        )}
        {...props}
      />
      {error ? (
        <p id={`${inputId}-error`} className="text-xs text-[#EF4444]">
          {error}
        </p>
      ) : hint ? (
        <p id={`${inputId}-hint`} className="text-xs text-text-dim">
          {hint}
        </p>
      ) : null}
    </div>
  );
});
