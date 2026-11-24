import { useEffect, useRef, useState } from 'react';
import {
  ArrowRight,
  Eye,
  FileText,
  Search,
  Send,
  type LucideIcon,
} from 'lucide-react';
import { Section } from '@/src/components/layout';
import { Button, SectionHeader } from '@/src/components/ui';
import { PlanCard, type PlanCardProps } from './PlanCard';

export interface CreditRow {
  id: string;
  tool: string;
  description: string;
  cost: string;
  icon: LucideIcon;
}

export const CREDIT_TABLE_DATA: readonly CreditRow[] = [
  {
    id: 'see',
    tool: 'See',
    description:
      'per strong match, with a quote and a drafted reply. Maybes are free.',
    cost: '2 credits',
    icon: Eye,
  },
  {
    id: 'reach',
    tool: 'Reach',
    description: 'per contact with a checked work email and a drafted email.',
    cost: '2 credits',
    icon: Send,
  },
  {
    id: 'say',
    tool: 'Say',
    description: 'per sales script.',
    cost: '3 credits',
    icon: FileText,
  },
  {
    id: 'get-found',
    tool: 'Get found',
    description: 'per check, with the fix list.',
    cost: '5 credits',
    icon: Search,
  },
] as const;

export type PlanData = Omit<PlanCardProps, 'staggerIndex' | 'className'>;

export const PLANS_DATA: readonly PlanData[] = [
  {
    name: 'Starter',
    price: 5,
    cadence: 'once',
    tag: 'Most popular',
    highlighted: true,
    features: [
      '50 credits',
      'Use them on any of the four tools',
      'Spend only on results',
      'Credits never expire',
    ],
    cta: 'Get 50 credits for $5',
    href: '#start-free',
  },
  {
    name: 'Top-up',
    price: 10,
    cadence: 'once',
    features: [
      '110 credits',
      'Use them on any product',
      'Credits never expire',
    ],
    cta: 'Get 110 credits',
    href: '#start-free',
  },
  {
    name: 'Launch',
    price: 39,
    cadence: '/month',
    features: [
      '500 credits every month',
      'The morning run: a fresh search every morning, replies drafted',
      'All four tools',
    ],
    cta: 'Get Launch',
    href: '#start-free',
  },
  {
    name: 'Done with you',
    price: 150,
    cadence: '/month',
    features: [
      '1,500 credits every month',
      'A weekly review of your leads and messages with us',
      'All four tools',
    ],
    cta: 'Get Done with you',
    href: '#start-free',
  },
] as const;

export interface PricingProps {
  className?: string;
}

export function Pricing({ className }: PricingProps) {
  const [hoveredPlan, setHoveredPlan] = useState<string | null>(null);
  const hoverTimerRef = useRef<number | null>(null);

  const handlePlanHover = (name: string) => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
    }
    // Deliberate activation delay so hover activates slowly and smoothly
    hoverTimerRef.current = window.setTimeout(() => {
      setHoveredPlan(name);
    }, 140);
  };

  const handlePlanLeave = () => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
    }
    hoverTimerRef.current = window.setTimeout(() => {
      setHoveredPlan(null);
    }, 220);
  };

  const handlePlanSelect = (name: string) => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
    }
    setHoveredPlan(name);
  };

  useEffect(() => {
    return () => {
      if (hoverTimerRef.current) {
        clearTimeout(hoverTimerRef.current);
      }
    };
  }, []);

  return (
    <Section
      id="pricing"
      index="03"
      total="03"
      label="pricing"
      aria-labelledby="pricing-heading"
      className={className}
    >
      <SectionHeader
        headingId="pricing-heading"
        data-reveal=""
        eyebrow="Pay for results, not seats"
        titleLine1="Pay only for"
        titleLine2="what you use."
        subtitle="Credits are spent only when GrowthRouter brings you something: a strong match with its reply, a checked email, a script or a site check. Maybes are free, and a search that finds nobody costs nothing. $5 buys 50 credits, and the first 50 founders get theirs free."
      />

      {/* Two-column split: Tool credit rows on left, $5 = 50 credits value card on right */}
      <div className="mt-14 md:mt-16 grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left: Credit cost rows card */}
        <div
          data-reveal=""
          data-stagger-index={0}
          className="lg:col-span-8 flex flex-col overflow-hidden rounded-[20px] border border-border bg-[color-mix(in_srgb,var(--surface)_92%,transparent)] backdrop-blur-sm"
        >
          <ul className="flex flex-1 flex-col divide-y divide-border">
            {CREDIT_TABLE_DATA.map((row) => {
              const Icon = row.icon;
              return (
                <li
                  key={row.id}
                  className="group flex flex-1 flex-wrap sm:flex-nowrap items-center justify-between gap-x-4 gap-y-2 px-5 md:px-6 py-4.5 md:py-5 transition-colors duration-150 hover:bg-surface-2/45"
                >
                  <div className="flex items-center gap-4 shrink-0">
                    <span
                      aria-hidden="true"
                      className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[9px] border border-border-strong bg-surface-2/85 text-text-muted shadow-[inset_0_1px_0_var(--surface-highlight)] transition-[border-color,color] duration-150 group-hover:border-accent-fg/40 group-hover:text-accent-fg"
                    >
                      <Icon className="h-[17px] w-[17px]" strokeWidth={1.65} />
                    </span>

                    <span className="w-[88px] text-[15px] font-medium tracking-[-0.01em] text-text whitespace-nowrap">
                      {row.tool}
                    </span>
                  </div>

                  <span className="w-full sm:w-auto sm:flex-1 text-[14px] leading-relaxed text-text-muted">
                    {row.description}
                  </span>

                  <span className="ml-auto font-mono text-[13px] font-medium text-text tabular-nums whitespace-nowrap">
                    {row.cost}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Right: Credit value CTA card */}
        <div
          data-reveal=""
          data-stagger-index={1}
          className="lg:col-span-4 relative flex flex-col justify-between overflow-hidden rounded-[20px] border border-border bg-[color-mix(in_srgb,var(--surface)_92%,transparent)] backdrop-blur-sm p-6 md:p-7"
        >
          {/* Subtle top-right lime ambient corner glow & top rim highlight */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-12 -right-12 h-48 w-48 rounded-full bg-[radial-gradient(circle,color-mix(in_srgb,var(--accent)_18%,transparent),color-mix(in_srgb,var(--glow-mid)_8%,transparent)_55%,transparent_75%)] blur-xl"
            style={{ opacity: 'var(--hero-glow-opacity)' }}
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(to_right,transparent_25%,color-mix(in_srgb,var(--accent)_55%,transparent)_82%,transparent)]"
          />

          <div className="relative z-10">
            <span className="inline-flex items-center rounded-full border border-accent-fg/45 bg-accent/8 px-3 py-1 font-mono text-[10.5px] font-medium uppercase tracking-[0.06em] leading-none text-accent-fg">
              CREDIT VALUE
            </span>

            <p className="mt-5 text-[32px] xl:text-[36px] font-semibold tracking-[-0.03em] leading-tight text-text tabular-nums">
              $5 = <span className="text-accent-fg">50 credits</span>
            </p>

            <p className="mt-2 text-[14px] leading-relaxed text-text-muted">
              One-time purchase. No subscriptions.
            </p>
          </div>

          <div className="relative z-10 mt-8 border-t border-border pt-6">
            <Button
              href="#start-free"
              variant="primary"
              size="md"
              shape="pill"
              className="w-full"
            >
              <span>Get 50 free credits</span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
        </div>
      </div>

      {/* Pricing Plans Section from reference image */}
      <div
        id="plans"
        className="group/section relative mt-24 md:mt-32 pt-16 md:pt-20 border-t border-border transition-colors duration-300"
      >
        {/* Subtle ambient spotlight in background that gently brightens on section hover */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-8 left-1/2 -translate-x-1/2 w-[700px] max-w-full h-[320px] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(215,255,30,0.07)_0%,transparent_70%)] blur-3xl opacity-40 transition-opacity duration-500 group-hover/section:opacity-100"
        />

        {/* Eyebrow & Title */}
        <div data-reveal="" className="relative z-10 text-center max-w-2xl mx-auto">
          <p className="font-mono text-[11px] md:text-[12px] font-medium uppercase tracking-[0.14em] text-text-muted transition-colors duration-300 group-hover/section:text-accent-fg/80">
            PRICING PLANS
          </p>
          <h3 className="mt-3 md:mt-4 text-[30px] sm:text-[36px] md:text-[42px] font-light tracking-[-0.03em] text-text leading-tight">
            Pick a plan if you need more.
          </h3>
        </div>

        {/* 4 Cards Grid */}
        <div
          onMouseLeave={handlePlanLeave}
          className="relative z-10 mt-12 md:mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6 items-stretch"
        >
          {PLANS_DATA.map((plan, index) => {
            const isHighlighted =
              hoveredPlan !== null
                ? hoveredPlan === plan.name
                : Boolean(plan.highlighted);

            return (
              <PlanCard
                key={plan.name}
                {...plan}
                highlighted={isHighlighted}
                staggerIndex={index}
                onMouseEnter={() => handlePlanHover(plan.name)}
                onClick={() => handlePlanSelect(plan.name)}
              />
            );
          })}
        </div>

        {/* Footnote notes */}
        <div data-reveal="" className="relative z-10 mt-12 md:mt-14 text-center space-y-2">
          <p className="text-[13px] md:text-[14px] text-text-muted leading-relaxed max-w-[850px] mx-auto">
            Sign in with Google or email and password, then buy on the pricing page in the app. Checkout is through Dodo Payments.
          </p>
          <p className="text-[13px] md:text-[14px] text-text-muted leading-relaxed">
            The first 50 founders who sign up with Google get 50 credits ($5) free.{' '}
            <a
              href="#start-free"
              className="text-accent underline underline-offset-4 decoration-accent hover:opacity-85 font-medium transition-opacity"
            >
              Start with it.
            </a>
          </p>
        </div>
      </div>
    </Section>
  );
}
