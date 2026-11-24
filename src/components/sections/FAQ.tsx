import { useState } from 'react';
import { Section } from '@/src/components/layout';
import { cn } from '@/src/lib/cn';

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

export const FAQ_DATA: readonly FAQItem[] = [
  {
    id: 'cost',
    question: 'What does it cost?',
    answer:
      'Credits are spent only on results: 2 credits per strong match, 2 per contact with a checked email, 3 per sales script and 5 per site check. $5 buys 50 credits.',
  },
  {
    id: 'spam',
    question: 'Will I get banned? Is this spam?',
    answer:
      'You send every reply yourself, from your own account. GrowthRouter sends nothing.',
  },
  {
    id: 'leads-source',
    question: 'Where do the leads come from?',
    answer: 'Reddit, X, Hacker News, YouTube, forums and Google.',
  },
  {
    id: 'emails-source',
    question: "Where do contacts' emails come from?",
    answer:
      'From a data provider, through Treg (people search, email find and verify). A work email is checked before you are charged.',
  },
  {
    id: 'no-results',
    question: 'What if a search finds nobody?',
    answer: 'A search that finds nobody costs nothing. Maybes are free.',
  },
  {
    id: 'open-source',
    question: 'Is it open source?',
    answer: '[ANSWER TO BE CONFIRMED]',
  },
  {
    id: 'sign-in',
    question: 'How do I sign in?',
    answer:
      'Sign in with Google or with email and password. The first 50 founders who sign up with Google get 50 credits ($5) free.',
  },
  {
    id: 'agent',
    question: 'Can I use it from my agent?',
    answer:
      'Coming next week: use it from your agent, Claude Code, Codex or Cursor. For now, paste your link on the page.',
  },
  {
    id: 'builder',
    question: 'Who is building it?',
    answer: 'GrowthRouter is built by ThoufeekXLabs.',
  },
] as const;

export interface FAQProps {
  className?: string;
}

export function FAQ({ className }: FAQProps) {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <Section
      id="faq"
      divider
      aria-labelledby="faq-heading"
      className={className}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
        <div
          data-reveal=""
          className="lg:col-span-4 lg:sticky lg:top-24"
        >
          <h2 id="faq-heading" className="h2 font-light text-text">
            Questions
          </h2>
        </div>

        <div data-reveal="" className="lg:col-span-8 border-t border-border">
          {FAQ_DATA.map((item) => {
            const isOpen = openId === item.id;
            const triggerId = `faq-trigger-${item.id}`;
            const panelId = `faq-panel-${item.id}`;

            return (
              <div
                key={item.id}
                onMouseEnter={() => setOpenId(item.id)}
                className="border-b border-border"
              >
                <button
                  type="button"
                  id={triggerId}
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => setOpenId(isOpen ? null : item.id)}
                  onMouseEnter={() => setOpenId(item.id)}
                  onFocus={() => setOpenId(item.id)}
                  className="group flex min-h-[44px] w-full items-center justify-between gap-4 py-5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg cursor-pointer"
                >
                  <span
                    className={cn(
                      'text-[15px] md:text-[16px] font-medium transition-colors duration-150',
                      isOpen
                        ? 'text-accent-fg'
                        : 'text-text group-hover:text-accent-fg'
                    )}
                  >
                    {item.question}
                  </span>
                </button>

                {/* Grid-rows (0fr -> 1fr) animates height smoothly without measuring DOM height; inert keeps closed content out of tab order */}
                <div
                  id={panelId}
                  role="region"
                  aria-labelledby={triggerId}
                  aria-hidden={!isOpen}
                  inert={isOpen ? undefined : true}
                  data-accordion-panel=""
                  data-open={isOpen ? 'true' : 'false'}
                  className="accordion-panel"
                >
                  <div data-accordion-content="" className="accordion-content">
                    <div className="pb-6 pr-8">
                      <p className="text-[15px] leading-relaxed text-text-muted max-w-[60ch]">
                        {item.answer}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Section>
  );
}
