import { Eye, MessageSquareText, Radar, Send, type LucideIcon } from 'lucide-react';
import { cn } from '@/src/lib/cn';
import type { ToolMockRow } from './ToolMock';

export type ToolIconKey = 'see' | 'reach' | 'say' | 'get-found';

const TOOL_ICONS: Record<ToolIconKey, LucideIcon> = {
  see: Eye,
  reach: Send,
  say: MessageSquareText,
  'get-found': Radar,
};

export interface ToolCardData {
  id: ToolIconKey;
  name: string;
  creditTag: string;
  quote: string;
  description: string;
  sourceLine: string;
  mockTitle?: string;
  mockAriaLabel?: string;
  rows?: ToolMockRow[];
  caption?: string;
}

export interface ToolCardProps {
  tool: ToolCardData;
  staggerIndex: number;
  className?: string;
}

export function ToolCard({ tool, staggerIndex, className }: ToolCardProps) {
  const Icon = TOOL_ICONS[tool.id];

  return (
    <article
      data-reveal=""
      data-stagger-index={staggerIndex}
      className={cn(
        'group flex flex-col rounded-[20px] border border-border bg-[color-mix(in_srgb,var(--surface)_92%,transparent)] backdrop-blur-sm p-6 md:p-8 transition-[border-color,background-color] duration-200 hover:border-border-strong hover:bg-surface',
        className
      )}
    >
      {/* Top header: interactive icon container + lighter title/credit spec + indented quote */}
      <div className="flex items-start gap-4">
        <span
          aria-hidden="true"
          className="mt-0.5 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px] border border-border-strong bg-surface-2/85 text-text-muted shadow-[inset_0_1px_0_var(--surface-highlight)] transition-[border-color,background-color,color,box-shadow,transform] duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:border-accent-fg/40 group-hover:text-accent-fg hover:scale-[1.04] hover:border-accent-fg/80 hover:bg-accent/12 hover:text-accent-fg hover:shadow-[inset_0_1px_0_var(--surface-highlight),0_0_18px_var(--accent-glow)] motion-reduce:hover:scale-100"
        >
          <Icon className="h-5 w-5" strokeWidth={1.55} />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
            <h3 className="text-[22px] md:text-[24px] font-normal tracking-[-0.025em] leading-tight text-text">
              {tool.name}
            </h3>
            <span className="font-mono text-[12px] font-medium leading-none text-accent-fg whitespace-nowrap tabular-nums">
              {tool.creditTag}
            </span>
          </div>

          <p className="mt-1.5 text-[15px] leading-snug font-normal text-text/90">
            &ldquo;{tool.quote}&rdquo;
          </p>
        </div>
      </div>

      {/* Description */}
      <p className="mt-6 text-[15px] leading-[1.6] text-text-muted max-w-[50ch]">
        {tool.description}
      </p>

      {/* Bottom hairline dash + source attribution */}
      <div className="mt-auto pt-5">
        <span
          aria-hidden="true"
          className="mb-3 block h-px w-8 bg-border-strong transition-[width,background-color] duration-200 group-hover:w-12 group-hover:bg-accent-fg/45"
        />
        <p className="font-mono text-[11.5px] leading-relaxed text-text-muted">
          {tool.sourceLine}
        </p>
      </div>
    </article>
  );
}
