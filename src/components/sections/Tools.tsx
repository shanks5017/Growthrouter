import { Section } from '@/src/components/layout';
import { SectionHeader } from '@/src/components/ui';
import { ToolCard, type ToolCardData } from './ToolCard';

export const TOOLS_DATA: readonly ToolCardData[] = [
  {
    id: 'see',
    name: 'See',
    creditTag: '2 credits per strong match',
    quote: "I can't see what they're discussing.",
    description:
      'People asking for what you built in the last 14 days. Each one is quoted, linked, and comes with a reply in your voice you send.',
    sourceLine: 'Sources: Reddit, X, Hacker News, YouTube, forums and Google.',
    mockTitle: 'see a French speaking app',
    mockAriaLabel:
      'Example output for See showing two matching posts from X and Hacker News with drafted replies',
    rows: [
      {
        tag: 'X',
        tagVariant: 'white-filled',
        text: 'any app that makes you actually speak French out loud?',
        meta: '3h ago · reply drafted · ',
        metaAction: 'Reply on X',
      },
      {
        tag: 'HN',
        tagVariant: 'orange-filled',
        text: 'I can read French fine but freeze when I have to talk',
        meta: '1d ago · reply drafted · ',
        metaAction: 'Copy reply + open thread',
      },
    ],
    caption:
      'Example, not real data. Your results are real posts, quoted word for word.',
  },
  {
    id: 'reach',
    name: 'Reach',
    creditTag: '2 credits per contact with an email',
    quote: "I can't reach my people.",
    description:
      'People who fit: buyers for a B2B product, partners for a consumer app. Each comes with a checked work email and an email drafted in your own words.',
    sourceLine:
      'Source: a data provider, through Treg (people search, email find and verify).',
    mockTitle: 'reach partners',
    mockAriaLabel:
      'Example output for Reach showing two verified partner contacts with drafted emails',
    rows: [
      {
        tag: 'WHO',
        tagVariant: 'white-filled',
        text: 'Owner, French tutoring studio',
        meta: 'work email checked · email drafted · ',
        metaAction: 'you send it',
      },
      {
        tag: 'WHO',
        tagVariant: 'white-filled',
        text: 'Editor, newsletter for newcomers to Canada',
        meta: 'work email checked · email drafted · ',
        metaAction: 'you send it',
      },
    ],
    caption:
      'Example, not real data. No email found means no charge for that contact.',
  },
  {
    id: 'say',
    name: 'Say',
    creditTag: '3 credits per script',
    quote: "I can't message them.",
    description:
      'A sales script for your product: the outcome story, three audiences, discovery questions, an objection table, and openers for each platform.',
    sourceLine: 'Source: AI, working from your product page.',
    mockTitle: 'say sales script',
    mockAriaLabel:
      'Example output for Say showing an opener, a discovery question, and an objection response',
    rows: [
      {
        tag: 'OPEN',
        tagVariant: 'white-filled',
        text: 'Saw your post about freezing up in French. What have you tried so far?',
        meta: 'opener for X',
      },
      {
        tag: 'ASK',
        tagVariant: 'orange-filled',
        text: "When did you last need to speak French and couldn't?",
        meta: 'discovery question',
      },
      {
        tag: 'BUT',
        tagVariant: 'orange-filled',
        text: 'I already use a language app.',
        meta: 'answer: ',
        metaAction: 'Does it make you talk out loud, or mostly tap?',
      },
    ],
    caption:
      'Example, not real data. Your script is written from your own product page.',
  },
  {
    id: 'get-found',
    name: 'Get found',
    creditTag: '5 credits per check',
    quote: 'I want to set up my SEO.',
    description:
      'Crawler checks on your site, a test of whether AI answers mention you, and a fix list in the order to do it.',
    sourceLine: 'Source: our own fetches of your site, plus AI search.',
    mockTitle: 'get found yoursite.com',
    mockAriaLabel:
      'Example output for Get found showing a crawler pass, an AI-answer miss, and the top fix item',
    rows: [
      {
        tag: 'PASS',
        tagVariant: 'lime',
        text: 'Crawlers can read the homepage',
        meta: 'crawler check',
      },
      {
        tag: 'MISS',
        tagVariant: 'red-filled',
        text: 'Not named when an AI is asked for apps like yours',
        meta: 'AI-answer test',
      },
      {
        tag: 'FIX 1',
        tagVariant: 'white-filled',
        text: 'Add a page that answers the question buyers ask',
        meta: 'first item on the fix list',
      },
    ],
    caption:
      'Example, not real data. Your check runs on your own site.',
  },
] as const;

function ToolsHorizonGlow() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none relative mx-auto mt-4 md:mt-6 -mb-5 md:-mb-7 w-full max-w-[960px] select-none"
      style={{ opacity: 'var(--hero-glow-opacity)' }}
    >
      {/* Soft radial apex bloom behind the curve */}
      <div className="absolute inset-x-[12%] top-0 h-24 rounded-full bg-[radial-gradient(ellipse_60%_70%_at_50%_35%,color-mix(in_srgb,var(--accent)_22%,transparent),color-mix(in_srgb,var(--glow-mid)_10%,transparent)_55%,transparent_100%)] blur-xl" />

      <svg
        viewBox="0 0 1000 120"
        preserveAspectRatio="none"
        className="relative block h-[72px] md:h-[92px] w-full overflow-visible"
      >
        <defs>
          <linearGradient id="tools-arc-rim" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--glow-mid)" stopOpacity="0" />
            <stop offset="20%" stopColor="var(--glow-mid)" stopOpacity="0.45" />
            <stop offset="42%" stopColor="var(--accent)" stopOpacity="0.9" />
            <stop offset="50%" stopColor="var(--glow-hot)" stopOpacity="1" />
            <stop offset="58%" stopColor="var(--accent)" stopOpacity="0.9" />
            <stop offset="80%" stopColor="var(--glow-mid)" stopOpacity="0.45" />
            <stop offset="100%" stopColor="var(--glow-mid)" stopOpacity="0" />
          </linearGradient>

          <linearGradient id="tools-arc-fill" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.14" />
            <stop offset="45%" stopColor="var(--glow-mid)" stopOpacity="0.06" />
            <stop offset="100%" stopColor="var(--bg)" stopOpacity="0" />
          </linearGradient>

          <mask id="tools-arc-fill-mask">
            <linearGradient id="tools-arc-horiz-fade" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="white" stopOpacity="0" />
              <stop offset="25%" stopColor="white" stopOpacity="1" />
              <stop offset="75%" stopColor="white" stopOpacity="1" />
              <stop offset="100%" stopColor="white" stopOpacity="0" />
            </linearGradient>
            <rect x="0" y="0" width="1000" height="120" fill="url(#tools-arc-horiz-fade)" />
          </mask>
        </defs>

        <path
          d="M 20 112 Q 500 14 980 112 L 980 120 L 20 120 Z"
          fill="url(#tools-arc-fill)"
          mask="url(#tools-arc-fill-mask)"
        />
        <path
          d="M 40 110 Q 500 14 960 110"
          fill="none"
          stroke="url(#tools-arc-rim)"
          strokeWidth={6}
          opacity={0.32}
          className="blur-[3px]"
        />
        <path
          d="M 40 110 Q 500 14 960 110"
          fill="none"
          stroke="url(#tools-arc-rim)"
          strokeWidth={1.75}
        />
      </svg>
    </div>
  );
}

export interface ToolsProps {
  className?: string;
}

export function Tools({ className }: ToolsProps) {
  return (
    <Section
      id="tools"
      index="01"
      total="03"
      label="Your tools"
      fadeTopRails
      aria-labelledby="tools-heading"
      className={className}
    >
      <SectionHeader
        headingId="tools-heading"
        data-reveal=""
        eyebrow="See, Reach, Say, Get found"
        titleLine1="You shipped. Nobody knows."
        titleLine2="Four tools for that."
        subtitle="Each tool starts from your product link and answers one problem. You pay credits only for what it returns."
      />

      <ToolsHorizonGlow />

      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-6">
        {TOOLS_DATA.map((tool, index) => (
          <ToolCard
            key={tool.id}
            tool={tool}
            staggerIndex={index}
          />
        ))}
      </div>
    </Section>
  );
}
