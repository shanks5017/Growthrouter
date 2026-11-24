import { useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Menu, Moon, Sun, X } from 'lucide-react';
import { Button } from '@/src/components/ui/Button';
import { cn } from '@/src/lib/cn';
import { DURATION, EASE_OUT_EXPO } from '@/src/lib/motion';
import { useTheme } from '@/src/lib/theme';
import { useReducedMotion } from '@/src/lib/useReducedMotion';

const NAV_LINKS = [
  { label: 'Tools', href: '#tools', sectionId: 'tools' },
  { label: 'How it works', href: '#how-it-works', sectionId: 'how-it-works' },
  { label: 'Pricing', href: '#pricing', sectionId: 'pricing' },
  { label: 'FAQ', href: '#faq', sectionId: 'faq' },
  { label: 'Docs', href: '#docs', sectionId: null },
] as const;

const TRACKED_SECTION_IDS = ['tools', 'how-it-works', 'pricing', 'faq'] as const;

function LogoMark() {
  return (
    <span
      aria-hidden="true"
      className="inline-flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-bg ring-1 ring-inset ring-border-strong/50"
    >
      <img
        src="/assets/images/logo.png"
        alt=""
        className="h-full w-full scale-[1.48] rounded-full object-contain select-none"
        draggable={false}
      />
    </span>
  );
}

export function Nav() {
  const { theme, toggleTheme } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const prefersReducedMotion = useReducedMotion();

  const headerRef = useRef<HTMLElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const wasOpenRef = useRef(false);

  // Scroll threshold (32px) for floating capsule elevation & backdrop density
  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 32);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Track active section via IntersectionObserver (re-checks lazily mounted sections via MutationObserver)
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;

    const observed = new WeakSet<Element>();
    const ratios = new Map<string, number>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          ratios.set(entry.target.id, entry.isIntersecting ? entry.intersectionRatio : 0);
        }

        let bestId: string | null = null;
        let bestRatio = 0;
        for (const id of TRACKED_SECTION_IDS) {
          const r = ratios.get(id) ?? 0;
          if (r > bestRatio) {
            bestRatio = r;
            bestId = id;
          }
        }
        setActiveSection(bestRatio > 0 ? bestId : null);
      },
      {
        rootMargin: '-25% 0px -45% 0px',
        threshold: [0, 0.15, 0.35, 0.6],
      }
    );

    const registerSections = () => {
      for (const id of TRACKED_SECTION_IDS) {
        const el = document.getElementById(id);
        if (el && !observed.has(el)) {
          observed.add(el);
          observer.observe(el);
        }
      }
    };

    registerSections();
    const mo = new MutationObserver(registerSections);
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      mo.disconnect();
    };
  }, []);

  // Lock body scroll, handle Escape, and restore focus to menu button when mobile nav closes
  useEffect(() => {
    if (mobileOpen) {
      wasOpenRef.current = true;
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      const onKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          setMobileOpen(false);
        }
      };

      window.addEventListener('keydown', onKeyDown);
      return () => {
        document.body.style.overflow = prevOverflow;
        window.removeEventListener('keydown', onKeyDown);
      };
    } else if (wasOpenRef.current) {
      wasOpenRef.current = false;
      menuButtonRef.current?.focus();
    }
  }, [mobileOpen]);

  // Focus trap inside header + mobile card while mobile menu is open
  const handleHeaderKeyDown = (event: ReactKeyboardEvent<HTMLElement>) => {
    if (!mobileOpen || event.key !== 'Tab' || !headerRef.current) return;

    const focusables = Array.from(
      headerRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
    ).filter((el) => el.offsetParent !== null);

    if (focusables.length === 0) return;

    const first = focusables[0];
    const last = focusables[focusables.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  const nextThemeLabel =
    theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';

  const capsuleSurfaceClass = cn(
    'pointer-events-auto rounded-full border backdrop-blur-2xl backdrop-saturate-150 transition-[background-color,border-color,box-shadow] duration-200 ease-[cubic-bezier(0.4,0,0.2,1)]',
    scrolled || mobileOpen
      ? 'border-border-strong bg-[var(--nav-bg)] shadow-[inset_0_1px_0_var(--surface-highlight),var(--nav-shadow-scrolled)]'
      : 'border-border-strong/70 bg-[var(--nav-pill-bg)] shadow-[inset_0_1px_0_var(--surface-highlight),var(--nav-shadow)]'
  );

  return (
    <header
      ref={headerRef}
      onKeyDown={handleHeaderKeyDown}
      className="fixed top-0 left-0 right-0 z-50 w-full pointer-events-none px-5 sm:px-8 lg:px-10 pt-3.5 md:pt-4"
    >
      {/* Desktop 3-island layout: Left logo pill | Centered compact nav + theme pill | Right auth/CTA pill */}
      <div className="relative z-10 mx-auto flex w-full max-w-[1320px] items-center justify-between lg:grid lg:grid-cols-[1fr_auto_1fr] lg:items-center lg:gap-4">
        {/* Left: Separated Brand Pill */}
        <div className="justify-self-start">
          <a
            href="#"
            className={cn(
              capsuleSurfaceClass,
              'inline-flex h-[52px] items-center gap-2.5 whitespace-nowrap shrink-0 pl-2 pr-4.5 text-text hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg'
            )}
          >
            <LogoMark />
            <span className="text-[15.5px] lg:text-[16px] font-medium tracking-[-0.02em] text-text">
              GrowthRouter
            </span>
          </a>
        </div>

        {/* Center: Compact translucent pill matching 52px height while preserving link spacing + theme toggle */}
        <nav
          aria-label="Primary"
          className={cn(
            capsuleSurfaceClass,
            'hidden lg:inline-flex justify-self-center h-[52px] items-center gap-1 p-1.5'
          )}
        >
          {NAV_LINKS.map((link) => {
            const isActive =
              link.sectionId !== null && activeSection === link.sectionId;

            return (
              <a
                key={link.href}
                href={link.href}
                aria-current={isActive ? 'true' : undefined}
                data-active={isActive ? 'true' : undefined}
                className={cn(
                  'relative inline-flex h-10 items-center rounded-full px-3.5 xl:px-4 text-[14.5px] xl:text-[15px] font-normal tracking-[-0.01em] transition-colors duration-150 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg',
                  isActive
                    ? 'text-text font-medium'
                    : 'text-text-muted hover:text-text hover:bg-[var(--surface-highlight)]'
                )}
              >
                {isActive && !prefersReducedMotion ? (
                  <motion.span
                    layoutId="nav-active-pill"
                    aria-hidden="true"
                    transition={{ duration: 0.24, ease: EASE_OUT_EXPO }}
                    className="absolute inset-0 rounded-full border border-border-strong/70 bg-[var(--surface-highlight)]"
                  />
                ) : isActive ? (
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 rounded-full border border-border-strong/70 bg-[var(--surface-highlight)]"
                  />
                ) : null}
                <span className="relative z-10">{link.label}</span>
              </a>
            );
          })}

          <span aria-hidden="true" className="mx-1 h-4 w-px bg-border" />

          <button
            type="button"
            onClick={toggleTheme}
            aria-label={nextThemeLabel}
            title={nextThemeLabel}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-text-muted hover:text-text hover:bg-[var(--surface-highlight)] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg cursor-pointer"
          >
            {theme === 'dark' ? (
              <Sun className="h-[17px] w-[17px]" aria-hidden="true" />
            ) : (
              <Moon className="h-[17px] w-[17px]" aria-hidden="true" />
            )}
          </button>
        </nav>

        {/* Right: Separated Sign in + Start free Pill */}
        <div
          className={cn(
            capsuleSurfaceClass,
            'hidden lg:inline-flex justify-self-end h-[52px] items-center gap-1 p-1 pl-2 shrink-0'
          )}
        >
          <a
            href="#sign-in"
            className="inline-flex h-10 items-center rounded-full px-4 text-[15px] font-medium tracking-[-0.01em] text-text-muted hover:text-text hover:bg-[var(--surface-highlight)] transition-colors duration-150 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
          >
            Sign in
          </a>

          <Button href="#start-free" variant="primary" size="md" shape="pill">
            Start free
          </Button>
        </div>

        {/* Mobile / Tablet right control pill (< lg) */}
        <div
          className={cn(
            capsuleSurfaceClass,
            'flex lg:hidden h-[52px] items-center gap-1 p-1 shrink-0'
          )}
        >
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={nextThemeLabel}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full text-text-muted hover:text-text hover:bg-[var(--surface-highlight)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent cursor-pointer"
          >
            {theme === 'dark' ? (
              <Sun className="h-[18px] w-[18px]" aria-hidden="true" />
            ) : (
              <Moon className="h-[18px] w-[18px]" aria-hidden="true" />
            )}
          </button>

          <button
            ref={menuButtonRef}
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border-strong bg-surface-2/70 text-text hover:bg-surface-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent cursor-pointer"
          >
            {mobileOpen ? (
              <X className="h-[18px] w-[18px]" aria-hidden="true" />
            ) : (
              <Menu className="h-[18px] w-[18px]" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile backdrop & floating rounded card menu */}
      <AnimatePresence>
        {mobileOpen ? (
          <>
            <motion.div
              aria-hidden="true"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: DURATION.ui }}
              onClick={() => setMobileOpen(false)}
              className="pointer-events-auto lg:hidden fixed inset-0 z-0 bg-bg/75 backdrop-blur-sm"
            />
            <motion.div
              id="mobile-nav"
              initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: DURATION.ui, ease: EASE_OUT_EXPO }}
              className="pointer-events-auto lg:hidden relative z-10 mx-auto mt-2.5 w-full rounded-[24px] border border-border-strong bg-[var(--nav-bg)] backdrop-blur-2xl backdrop-saturate-150 p-4 shadow-[inset_0_1px_0_var(--surface-highlight),var(--nav-shadow-scrolled)]"
            >
              <nav aria-label="Mobile navigation" className="flex flex-col gap-1">
                {NAV_LINKS.map((link) => {
                  const isActive =
                    link.sectionId !== null && activeSection === link.sectionId;

                  return (
                    <a
                      key={link.href}
                      href={link.href}
                      aria-current={isActive ? 'true' : undefined}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        'flex min-h-[44px] items-center rounded-full px-4 text-[15px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
                        isActive
                          ? 'bg-[var(--surface-highlight)] font-medium text-text'
                          : 'text-text-muted hover:bg-[var(--surface-highlight)] hover:text-text'
                      )}
                    >
                      {link.label}
                    </a>
                  );
                })}
              </nav>

              <div className="mt-4 flex flex-col gap-2.5 border-t border-border pt-4">
                <Button
                  href="#sign-in"
                  variant="secondary"
                  size="md"
                  shape="pill"
                  onClick={() => setMobileOpen(false)}
                  className="w-full"
                >
                  Sign in
                </Button>
                <Button
                  href="#start-free"
                  variant="primary"
                  size="md"
                  shape="pill"
                  onClick={() => setMobileOpen(false)}
                  className="w-full"
                >
                  Start free
                </Button>
              </div>
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
