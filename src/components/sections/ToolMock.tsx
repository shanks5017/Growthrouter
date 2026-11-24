import { Badge, type BadgeVariant } from '@/src/components/ui';
import { cn } from '@/src/lib/cn';

export interface ToolMockRow {
  tag: string;
  tagVariant: BadgeVariant;
  text: string;
  meta: string;
  metaAction?: string;
}

export interface ToolMockProps {
  title: string;
  rows: ToolMockRow[];
  ariaLabel?: string;
  className?: string;
}

export function ToolMock({
  title,
  rows,
  ariaLabel,
  className,
}: ToolMockProps) {
  return (
    <div
      role="img"
      aria-label={ariaLabel ?? `${title} example output window`}
      className={cn(
        'w-full overflow-hidden rounded-[12px] border border-border bg-[var(--input-bg)]',
        className
      )}
    >
      <div aria-hidden="true">
        {/* Window header bar */}
        <div className="flex items-center justify-between gap-3 border-b border-border bg-surface-2/70 px-3.5 py-2.5">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex shrink-0 items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-border-strong" />
              <span className="h-2 w-2 rounded-full bg-border-strong" />
              <span className="h-2 w-2 rounded-full bg-border-strong" />
            </div>
            <span className="truncate font-mono text-[11px] sm:text-[12px] text-text-muted">
              {title}
            </span>
          </div>
          <Badge variant="neutral">example</Badge>
        </div>

        {/* Inset rows */}
        <div className="space-y-2 p-3">
          {rows.map((row, rowIndex) => (
            <div
              key={`${row.tag}-${rowIndex}`}
              className="flex items-start gap-3 rounded-[8px] border border-border bg-surface px-3 py-2.5"
            >
              <Badge variant={row.tagVariant} className="mt-0.5">
                {row.tag}
              </Badge>
              <div className="min-w-0 flex-1">
                <p className="text-[13px] md:text-[14px] leading-snug text-text break-words">
                  {row.text}
                </p>
                <p className="mt-1 font-mono text-[11px] leading-relaxed text-text-dim break-words">
                  {row.meta}
                  {row.metaAction ? (
                    <span className="font-medium text-text">
                      {row.metaAction}
                    </span>
                  ) : null}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
