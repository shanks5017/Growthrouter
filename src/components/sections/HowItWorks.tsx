import { Fragment } from 'react';
import { ArrowRight, Layers, Link2, Send, type LucideIcon } from 'lucide-react';
import { Section } from '@/src/components/layout';
import { SectionHeader } from '@/src/components/ui';
import { cn } from '@/src/lib/cn';

interface StepItem {
  number: string;
  title: string;
  body: string;
  icon: LucideIcon;
}

const STEPS: readonly StepItem[] = [
  {
    number: '1',
    title: 'Paste your link',
    body: 'GrowthRouter reads your product page and works out what you sell and who it is for.',
    icon: Link2,
  },
  {
    number: '2',
    title: 'Pick a tool',
    body: 'See, Reach, Say or Get found. Each has a fixed cost in credits.',
    icon: Layers,
  },
  {
    number: '3',
    title: 'You send it yourself',
    body: 'Replies go out from your own Reddit, X, Hacker News or YouTube account. Emails go out from your own mailbox. GrowthRouter sends nothing.',
    icon: Send,
  },
] as const;

export interface HowItWorksProps {
  className?: string;
}

export function HowItWorks({ className }: HowItWorksProps) {
  return (
    <Section
      id="how-it-works"
      index="02"
      total="03"
      label="How it works"
      aria-labelledby="how-it-works-heading"
      className={cn('overflow-hidden', className)}
    >
      {/* Soft ambient bottom glow behind cards & footnote */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-56 overflow-hidden select-none"
        style={{ opacity: 'var(--hero-glow-opacity)' }}
      >
        <div className="mx-auto h-full w-full max-w-[960px] bg-[radial-gradient(ellipse_62%_75%_at_50%_100%,color-mix(in_srgb,var(--accent)_14%,transparent),color-mix(in_srgb,var(--glow-mid)_10%,transparent)_48%,transparent_80%)]" />
      </div>

      <div className="relative z-10">
        <SectionHeader
          headingId="how-it-works-heading"
          data-reveal=""
          eyebrow="Three steps"
          titleLine1="Paste, pick, send."
          titleLine2="You stay in control."
        />

        <ol className="mt-14 md:mt-16 grid grid-cols-1 md:grid-cols-[1fr_auto_1fr_auto_1fr] items-stretch gap-4 lg:gap-5">
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            return (
              <Fragment key={step.number}>
                <li
                  data-reveal=""
                  data-stagger-index={index}
                  className="group flex flex-col rounded-[20px] border border-border bg-[color-mix(in_srgb,var(--surface)_92%,transparent)] backdrop-blur-sm p-6 md:p-7 transition-[border-color,background-color] duration-200 hover:border-border-strong hover:bg-surface"
                >
                  {/* Top row: icon container + lime-bordered step number badge */}
                  <div className="flex items-center gap-3">
                    <span
                      aria-hidden="true"
                      className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] border border-border-strong bg-surface-2/85 text-text shadow-[inset_0_1px_0_var(--surface-highlight)] transition-[border-color,background-color,color,box-shadow] duration-200 group-hover:border-accent-fg/40 group-hover:text-accent-fg"
                    >
                      <Icon className="h-[18px] w-[18px]" strokeWidth={1.65} />
                    </span>

                    <span
                      aria-hidden="true"
                      className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-[7px] border border-accent-fg/75 bg-accent/8 font-mono text-[12px] font-medium text-accent-fg tabular-nums"
                    >
                      {step.number}
                    </span>
                  </div>

                  <h3 className="mt-6 text-[18px] md:text-[19px] font-medium tracking-[-0.02em] leading-snug text-text">
                    {step.title}
                  </h3>

                  <p className="mt-2.5 text-[14.5px] leading-[1.6] text-text-muted">
                    {step.body}
                  </p>
                </li>

                {index < STEPS.length - 1 ? (
                  <li
                    aria-hidden="true"
                    className="hidden md:flex items-center justify-center text-text-dim px-0.5"
                  >
                    <ArrowRight className="h-4 w-4" strokeWidth={1.6} />
                  </li>
                ) : null}
              </Fragment>
            );
          })}
        </ol>

        <p className="mt-10 md:mt-12 mx-auto max-w-2xl text-center text-[13px] leading-relaxed text-text-muted">
          Want to know which reply brought a signup? Receipts are in the app for those who want them. See the{' '}
          <a
            href="#docs"
            className="underline decoration-accent-fg/80 underline-offset-4 text-text hover:text-accent-fg transition-colors duration-150 rounded-[4px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
          >
            docs
          </a>
          .
        </p>
      </div>
    </Section>
  );
}
