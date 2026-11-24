import { useTheme } from '@/src/lib/theme';
import { Container } from './Container';

const FOOTER_LINKS = [
  { label: 'Docs', href: '#docs' },
  { label: 'X', href: 'https://x.com', external: true },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Privacy', href: '#privacy' },
  { label: 'Terms', href: '#terms' },
] as const;

export function Footer() {
  const { theme, toggleTheme } = useTheme();
  const toggleLabel = theme === 'dark' ? 'Light mode' : 'Dark mode';

  return (
    <footer className="w-full border-t border-border bg-bg">
      <Container className="py-8">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <p className="text-[13px] text-text-muted leading-relaxed">
            GrowthRouter is built by ThoufeekXLabs. Not affiliated with OpenRouter.
          </p>

          <nav
            aria-label="Footer"
            className="flex flex-wrap items-center gap-x-6 gap-y-1"
          >
            {FOOTER_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                {...('external' in link && link.external
                  ? { target: '_blank', rel: 'noopener noreferrer' }
                  : {})}
                className="inline-flex min-h-[44px] items-center text-[13px] text-text-muted hover:text-text transition-colors duration-150 whitespace-nowrap rounded-[4px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
              >
                {link.label}
              </a>
            ))}

            <button
              type="button"
              onClick={toggleTheme}
              aria-label={`Switch to ${toggleLabel.toLowerCase()}`}
              className="inline-flex min-h-[44px] items-center text-[13px] text-text-muted hover:text-text transition-colors duration-150 whitespace-nowrap rounded-[4px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg cursor-pointer"
            >
              {toggleLabel}
            </button>
          </nav>
        </div>
      </Container>
    </footer>
  );
}
