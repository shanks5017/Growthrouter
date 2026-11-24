import { useRef, useState, type FormEvent } from 'react';
import { motion } from 'motion/react';
import { Container } from '@/src/components/layout';
import { Button } from '@/src/components/ui';
import {
  STAGGER,
  fadeUpVariants,
  maskLineVariants,
  reducedFadeVariants,
} from '@/src/lib/motion';
import { useReducedMotion } from '@/src/lib/useReducedMotion';
import { setScanTyping, triggerScanSubmitted } from '@/src/lib/scanState';
import { DashboardPreview } from './DashboardPreview';
import { FoundersCard } from './FoundersCard';
import { HeroGlow } from './HeroGlow';
import { NodeDiagram } from './NodeDiagram';

const HERO_CHIPS = [
  'Free, no account',
  'Reddit · X · HN · YouTube · Google',
  'About a minute',
] as const;

export interface HeroProps {
  claimed?: number;
  total?: number;
}

export function Hero({ claimed = 7, total = 50 }: HeroProps) {
  const [productUrl, setProductUrl] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const prefersReducedMotion = useReducedMotion();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!productUrl.trim()) {
      inputRef.current?.focus();
      return;
    }
    triggerScanSubmitted();
  };

  const bodyBaseDelay = 0.34;

  return (
    <section
      id="hero"
      aria-labelledby="hero-heading"
      className="relative w-full border-b border-border bg-[linear-gradient(to_bottom,var(--hero-bg-top)_0%,var(--bg)_70%)] overflow-x-clip"
    >
      <Container
        bordered={false}
        className="relative pt-[104px] md:pt-[120px] pb-0"
      >
        <div className="relative z-20 flex flex-col items-center text-center">
          {/* 1. Two-line Display H1 (weight 300, line-height 1.04, tight mask reveal) */}
          <h1
            id="hero-heading"
            className="hero-display max-w-[880px] mx-auto"
          >
            <span className="block overflow-hidden pb-[0.08em] -mb-[0.08em]">
              <motion.span
                variants={prefersReducedMotion ? reducedFadeVariants : maskLineVariants}
                initial="hidden"
                animate="visible"
                custom={0.05}
                className="block text-text"
              >
                Find the people asking
              </motion.span>
            </span>
            <span className="block overflow-hidden pb-[0.08em] -mb-[0.08em]">
              <motion.span
                variants={prefersReducedMotion ? reducedFadeVariants : maskLineVariants}
                initial="hidden"
                animate="visible"
                custom={0.05 + STAGGER.heroLine}
                className="block text-accent-fg"
              >
                for what you built.
              </motion.span>
            </span>
          </h1>

          {/* 2. Subtext (weight 300, max-w 880px, ~3 lines) */}
          <motion.p
            variants={prefersReducedMotion ? reducedFadeVariants : fadeUpVariants}
            initial="hidden"
            animate="visible"
            custom={bodyBaseDelay}
            className="mt-6 max-w-[880px] mx-auto hero-subtext"
          >
            You built the fix. People are asking for it right now on Reddit, X, Hacker News, YouTube and Google. Paste your product link: GrowthRouter finds them and writes each one a reply in your voice. You send it.
          </motion.p>

          {/* 3. Unified CTA cluster (single shared max-w-600px width, 80ms stagger) */}
          <div className="mt-10 mx-auto w-full max-w-[600px] flex flex-col items-center text-center">
            {/* Pill input row (56px joined pill on sm+, stacked full-width pills on mobile) */}
            <motion.form
              variants={prefersReducedMotion ? reducedFadeVariants : fadeUpVariants}
              initial="hidden"
              animate="visible"
              custom={bodyBaseDelay + STAGGER.heroItem}
              onSubmit={handleSubmit}
              noValidate
              className="w-full flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-2 sm:h-[56px] sm:rounded-full sm:border sm:border-border-strong sm:bg-[var(--input-bg)] sm:p-1.5 sm:pl-5 transition-[border-color,box-shadow] duration-150 ease-[cubic-bezier(0.4,0,0.2,1)] sm:focus-within:border-accent/80 sm:focus-within:shadow-[0_0_0_3px_var(--accent-glow)]"
            >
              <input
                ref={inputRef}
                type="text"
                inputMode="url"
                autoComplete="off"
                value={productUrl}
                onChange={(e) => {
                  const next = e.target.value;
                  setProductUrl(next);
                  setScanTyping(next.trim().length > 0);
                }}
                placeholder="yourproduct.com"
                aria-label="Your product URL"
                className="h-12 sm:h-full w-full flex-1 min-w-0 rounded-full sm:rounded-none border border-border-strong sm:border-0 bg-[var(--input-bg)] sm:bg-transparent px-5 sm:px-0 text-[15px] text-text placeholder:text-text-dim transition-[border-color,box-shadow] duration-150 ease-[cubic-bezier(0.4,0,0.2,1)] focus:outline-none focus-visible:border-accent/80 focus-visible:shadow-[0_0_0_3px_var(--accent-glow)] sm:focus-visible:shadow-none sm:focus-visible:border-transparent"
              />
              <Button
                type="submit"
                variant="primary"
                size="md"
                shape="pill"
                className="w-full sm:w-auto"
              >
                Find my buyers, free
              </Button>
            </motion.form>

            {/* Three pill chips (13px sans, rounded-full, 1px border-strong, hover brighten, no pointer cursor) */}
            <motion.div
              variants={prefersReducedMotion ? reducedFadeVariants : fadeUpVariants}
              initial="hidden"
              animate="visible"
              custom={bodyBaseDelay + STAGGER.heroItem * 2}
              className="mt-4 flex flex-wrap items-center justify-center gap-2"
            >
              {HERO_CHIPS.map((chip) => (
                <span
                  key={chip}
                  className="inline-flex items-center rounded-full border border-border-strong bg-surface/60 px-[14px] py-[7px] font-sans text-[13px] font-normal leading-none text-text-muted whitespace-nowrap transition-[border-color,color] duration-150 ease-[cubic-bezier(0.4,0,0.2,1)] hover:border-text-muted/60 hover:text-text cursor-default"
                >
                  {chip}
                </span>
              ))}
            </motion.div>

            {/* Slim 44px horizontal founders bar (exact shared 600px width) + sign-up line */}
            <motion.div
              variants={prefersReducedMotion ? reducedFadeVariants : fadeUpVariants}
              initial="hidden"
              animate="visible"
              custom={bodyBaseDelay + STAGGER.heroItem * 3}
              className="mt-4 w-full"
            >
              <FoundersCard
                claimed={claimed}
                total={total}
                animationDelay={0.2}
              />
            </motion.div>

            {/* Footnote (8px below sign-up line, balanced wrap so "See pricing" stays inline) */}
            <motion.p
              variants={prefersReducedMotion ? reducedFadeVariants : fadeUpVariants}
              initial="hidden"
              animate="visible"
              custom={bodyBaseDelay + STAGGER.heroItem * 4}
              className="mt-2 max-w-[520px] mx-auto text-center text-[13px] leading-relaxed text-text-muted [text-wrap:balance]"
            >
              You see real people asking for it before you sign up. You send every reply yourself.{' '}
              <a
                href="#pricing"
                className="underline underline-offset-[3px] text-text-muted hover:text-text transition-colors duration-150 rounded-[4px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg whitespace-nowrap"
              >
                See pricing
              </a>
            </motion.p>
          </div>
        </div>

        {/* 4. DashboardPreview with bottom-anchored HeroGlow behind its top edge */}
        <div className="relative mt-[72px]">
          <HeroGlow />
          <DashboardPreview className="relative z-10" />
        </div>
      </Container>

      {/* 5. Single 1px hairline after hard crop, then NodeDiagram (48px to framing label, 80px below caption) */}
      <div className="relative z-10 w-full border-t border-border bg-bg">
        <Container bordered={false} className="pt-12 pb-20">
          <NodeDiagram />
        </Container>
      </div>
    </section>
  );
}
