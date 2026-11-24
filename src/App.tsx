import { Suspense, lazy } from 'react';
import { Container, Footer, Nav } from '@/src/components/layout';
import { Hero } from '@/src/components/sections/Hero';
import { ThemeProvider } from '@/src/lib/theme';
import { useScrollReveal } from '@/src/lib/useScrollReveal';

const Tools = lazy(() =>
  import('@/src/components/sections/Tools').then((m) => ({ default: m.Tools }))
);
const HowItWorks = lazy(() =>
  import('@/src/components/sections/HowItWorks').then((m) => ({
    default: m.HowItWorks,
  }))
);
const Pricing = lazy(() =>
  import('@/src/components/sections/Pricing').then((m) => ({
    default: m.Pricing,
  }))
);
const FAQ = lazy(() =>
  import('@/src/components/sections/FAQ').then((m) => ({ default: m.FAQ }))
);
const FinalCTA = lazy(() =>
  import('@/src/components/sections/FinalCTA').then((m) => ({
    default: m.FinalCTA,
  }))
);

function SectionFallback({ minHeightClass }: { minHeightClass: string }) {
  return (
    <div aria-hidden="true" className="w-full border-b border-border">
      <Container className={minHeightClass}>
        <span className="sr-only">Loading section</span>
      </Container>
    </div>
  );
}

function AppShell() {
  useScrollReveal();

  return (
    <div className="min-h-screen flex flex-col bg-bg text-text">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[60] focus:inline-flex focus:min-h-[44px] focus:items-center focus:rounded-[var(--radius-button)] focus:bg-accent focus:px-4 focus:text-[13px] focus:font-medium focus:text-accent-ink focus:outline-none focus:ring-2 focus:ring-text"
      >
        Skip to content
      </a>

      <Nav />

      <main id="main" className="flex-1">
        <Hero />

        <Suspense fallback={<SectionFallback minHeightClass="min-h-[960px]" />}>
          <Tools />
        </Suspense>

        <Suspense fallback={<SectionFallback minHeightClass="min-h-[560px]" />}>
          <HowItWorks />
        </Suspense>

        <Suspense fallback={<SectionFallback minHeightClass="min-h-[1400px]" />}>
          <Pricing />
        </Suspense>

        <Suspense fallback={<SectionFallback minHeightClass="min-h-[720px]" />}>
          <FAQ />
        </Suspense>

        <Suspense fallback={<SectionFallback minHeightClass="min-h-[420px]" />}>
          <FinalCTA />
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppShell />
    </ThemeProvider>
  );
}
