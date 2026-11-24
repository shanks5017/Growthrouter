import { useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Coins,
  Eye,
  MessageSquareText,
  Radar,
  ReceiptText,
  UsersRound,
  type LucideIcon,
} from 'lucide-react';
import { Badge, Card, type BadgeVariant } from '@/src/components/ui';
import { cn } from '@/src/lib/cn';
import { DISTANCE, DURATION, EASE_OUT_EXPO, STAGGER } from '@/src/lib/motion';
import { useInViewOnce } from '@/src/lib/useInViewOnce';
import { useReducedMotion } from '@/src/lib/useReducedMotion';

interface SidebarNavItem {
  id: string;
  label: string;
  icon: LucideIcon;
  active?: boolean;
}

interface DashboardToolItem {
  id: string;
  name: string;
  cost: string;
  icon: LucideIcon;
  active?: boolean;
}

export interface DashboardRow {
  tag: string;
  tagVariant: BadgeVariant;
  text: string;
  metaSegments: readonly string[];
  metaAction?: string;
  metaActionNoWrap?: boolean;
  metaJoiner?: 'dot' | 'space';
}

export interface DashboardPanel {
  id: string;
  title: string;
  footnote?: string;
  rows: readonly DashboardRow[];
}

const DASHBOARD_DATA = {
  sidebar: [
    { id: 'see', label: 'See', icon: Eye, active: true },
    { id: 'reach', label: 'Reach', icon: UsersRound },
    { id: 'say', label: 'Say', icon: MessageSquareText },
    { id: 'get-found', label: 'Get found', icon: Radar },
    { id: 'receipts', label: 'Receipts', icon: ReceiptText },
    { id: 'credits', label: 'Credits', icon: Coins },
  ] satisfies readonly SidebarNavItem[],
  header: {
    title: 'See',
    contextBadge: 'a French speaking app',
    creditsBadge: '50 credits',
    modeBadge: 'example',
  },
  tools: [
    {
      id: 'see',
      name: 'See',
      cost: '2 credits per strong match',
      icon: Eye,
      active: true,
    },
    {
      id: 'reach',
      name: 'Reach',
      cost: '2 credits per contact with an email',
      icon: UsersRound,
    },
    {
      id: 'say',
      name: 'Say',
      cost: '3 credits per script',
      icon: MessageSquareText,
    },
    {
      id: 'get-found',
      name: 'Get found',
      cost: '5 credits per check',
      icon: Radar,
    },
  ] satisfies readonly DashboardToolItem[],
  row1Panels: [
    {
      id: 'strong-matches',
      title: 'Strong matches',
      footnote: 'Maybes are free.',
      rows: [
        {
          tag: 'X',
          tagVariant: 'white-filled',
          text: 'any app that makes you actually speak French out loud?',
          metaSegments: ['3h ago', 'reply drafted'],
          metaAction: 'Reply on X',
          metaActionNoWrap: true,
        },
        {
          tag: 'HN',
          tagVariant: 'orange-filled',
          text: 'I can read French fine but freeze when I have to talk',
          metaSegments: ['1d ago', 'reply drafted'],
          metaAction: 'Copy reply + open thread',
          metaActionNoWrap: true,
        },
      ],
    },
    {
      id: 'reach-partners',
      title: 'Reach partners',
      rows: [
        {
          tag: 'WHO',
          tagVariant: 'white-filled',
          text: 'Owner, French tutoring studio',
          metaSegments: ['work email checked', 'email drafted'],
          metaAction: 'you send it',
          metaActionNoWrap: true,
        },
        {
          tag: 'WHO',
          tagVariant: 'white-filled',
          text: 'Editor, newsletter for newcomers to Canada',
          metaSegments: ['work email checked', 'email drafted'],
          metaAction: 'you send it',
          metaActionNoWrap: true,
        },
      ],
    },
  ] satisfies readonly DashboardPanel[],
  row2Panels: [
    {
      id: 'sales-script',
      title: 'Sales script',
      rows: [
        {
          tag: 'OPEN',
          tagVariant: 'white-filled',
          text: 'Saw your post about freezing up in French. What have you tried so far?',
          metaSegments: ['opener for X'],
        },
        {
          tag: 'ASK',
          tagVariant: 'orange-filled',
          text: "When did you last need to speak French and couldn't?",
          metaSegments: ['discovery question'],
        },
        {
          tag: 'BUT',
          tagVariant: 'orange-filled',
          text: 'I already use a language app.',
          metaSegments: ['answer:'],
          metaAction: 'Does it make you talk out loud, or mostly tap?',
          metaActionNoWrap: false,
          metaJoiner: 'space',
        },
      ],
    },
    {
      id: 'get-found',
      title: 'Get found yoursite.com',
      rows: [
        {
          tag: 'PASS',
          tagVariant: 'lime',
          text: 'Crawlers can read the homepage',
          metaSegments: ['crawler check'],
        },
        {
          tag: 'MISS',
          tagVariant: 'red-filled',
          text: 'Not named when an AI is asked for apps like yours',
          metaSegments: ['AI-answer test'],
        },
        {
          tag: 'FIX 1',
          tagVariant: 'white-filled',
          text: 'Add a page that answers the question buyers ask',
          metaSegments: ['first item on the fix list'],
        },
      ],
    },
  ] satisfies readonly DashboardPanel[],
} as const;

function SidebarLogoMark() {
  return (
    <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-[7px] bg-bg ring-1 ring-inset ring-border-strong/50">
      <img
        src="/assets/images/logo.png"
        alt=""
        className="h-full w-full scale-[1.42] object-contain select-none"
        draggable={false}
      />
    </span>
  );
}

function DashboardMetaLine({ row }: { row: DashboardRow }) {
  const joiner = row.metaJoiner ?? 'dot';

  return (
    <div className="mt-1.5 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 font-mono text-[11px] leading-[1.5] text-text-muted">
      {row.metaSegments.map((segment, index) => (
        <span
          key={segment}
          className="inline-flex items-center gap-1.5 whitespace-nowrap"
        >
          {index > 0 ? <span aria-hidden="true">·</span> : null}
          <span>{segment}</span>
        </span>
      ))}
      {row.metaAction ? (
        joiner === 'space' ? (
          <span
            className={cn(
              'font-medium text-text',
              row.metaActionNoWrap ? 'whitespace-nowrap' : 'break-normal'
            )}
          >
            {row.metaAction}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
            <span aria-hidden="true">·</span>
            <span className="font-medium text-text whitespace-nowrap">
              {row.metaAction}
            </span>
          </span>
        )
      ) : null}
    </div>
  );
}

function PanelCard({
  panel,
  isVisible,
  prefersReducedMotion,
  baseRowDelay,
}: {
  panel: DashboardPanel;
  isVisible: boolean;
  prefersReducedMotion: boolean;
  baseRowDelay: number;
}) {
  return (
    <Card
      variant="elevated"
      padding="none"
      className="rounded-[var(--radius-card)] border-border p-3.5 flex flex-col gap-2"
    >
      <div className="text-[13px] font-medium text-text">{panel.title}</div>

      <div className="space-y-1.5">
        {panel.rows.map((row, idx) => (
          <motion.div
            key={row.text}
            initial={
              prefersReducedMotion
                ? false
                : { opacity: 0, y: DISTANCE.dashboardRowY }
            }
            animate={isVisible ? { opacity: 1, y: 0 } : undefined}
            transition={{
              duration: prefersReducedMotion
                ? DURATION.reduced
                : DURATION.dashboardItem,
              delay: prefersReducedMotion
                ? 0
                : baseRowDelay + idx * STAGGER.dashboardRow,
              ease: EASE_OUT_EXPO,
            }}
            className="flex items-start gap-2.5 rounded-[10px] border border-border bg-surface px-3 py-2"
          >
            <Badge variant={row.tagVariant} className="mt-0.5">
              {row.tag}
            </Badge>
            <div className="min-w-0 flex-1">
              <p className="text-[13px] leading-snug text-text">{row.text}</p>
              <DashboardMetaLine row={row} />
            </div>
          </motion.div>
        ))}
      </div>

      {panel.footnote ? (
        <p className="mt-0.5 text-[11px] text-text-muted">{panel.footnote}</p>
      ) : null}
    </Card>
  );
}

export interface DashboardPreviewProps {
  onRevealChange?: (revealed: boolean) => void;
  className?: string;
}

export function DashboardPreview({
  onRevealChange,
  className,
}: DashboardPreviewProps) {
  const prefersReducedMotion = useReducedMotion();
  const { ref: inViewRef, inView } = useInViewOnce<HTMLDivElement>({
    threshold: 0.08,
    rootMargin: '0px 0px -4% 0px',
  });

  const isVisible = prefersReducedMotion || inView;

  useEffect(() => {
    if (isVisible) {
      onRevealChange?.(true);
    }
  }, [isVisible, onRevealChange]);

  return (
    <motion.div
      ref={inViewRef}
      initial={
        prefersReducedMotion
          ? false
          : { opacity: 0, y: DISTANCE.dashboardY }
      }
      animate={
        isVisible
          ? { opacity: 1, y: 0 }
          : { opacity: 0, y: DISTANCE.dashboardY }
      }
      transition={{
        duration: prefersReducedMotion
          ? DURATION.reduced
          : DURATION.dashboardEnter,
        ease: EASE_OUT_EXPO,
      }}
      role="img"
      aria-label="Example GrowthRouter dashboard showing See strong matches, Reach partners, Sales script, and Get found site checks"
      className={cn(
        'relative mx-auto w-full max-w-[1000px] rounded-t-[32px] rounded-b-none border-t border-x border-b-0 border-border-strong bg-[var(--dashboard-bezel-bg)] p-2 pb-0 h-[400px] md:h-[440px] lg:h-[520px] overflow-hidden',
        className
      )}
    >
      {/* Top-edge backlight highlight tinted from --glow-hot at 60% */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-8 top-0 z-30 h-px bg-[linear-gradient(to_right,transparent,color-mix(in_srgb,var(--glow-hot)_60%,transparent)_22%,color-mix(in_srgb,var(--glow-hot)_60%,transparent)_78%,transparent)]"
      />

      {/* Inner decorative non-interactive dashboard frame */}
      <div
        aria-hidden="true"
        className="flex h-full w-full overflow-hidden rounded-t-[24px] rounded-b-none border border-b-0 border-border bg-surface text-left select-none"
      >
        {/* Left sidebar (md+, darker than main area) */}
        <aside className="hidden md:flex md:w-[200px] shrink-0 flex-col border-r border-border bg-bg p-3.5">
          <div className="flex items-center gap-2.5 px-2 pb-4">
            <SidebarLogoMark />
            <span className="text-[14px] font-medium tracking-[-0.02em] text-text">
              GrowthRouter
            </span>
          </div>

          <div className="space-y-1">
            {DASHBOARD_DATA.sidebar.map((item, idx) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.id}
                  initial={
                    prefersReducedMotion
                      ? false
                      : { opacity: 0, x: DISTANCE.dashboardSidebarX }
                  }
                  animate={isVisible ? { opacity: 1, x: 0 } : undefined}
                  transition={{
                    duration: prefersReducedMotion
                      ? DURATION.reduced
                      : DURATION.dashboardItem,
                    delay: prefersReducedMotion
                      ? 0
                      : 0.15 + idx * STAGGER.dashboardSidebar,
                    ease: EASE_OUT_EXPO,
                  }}
                  className={cn(
                    'flex items-center gap-2.5 rounded-[10px] px-2.5 py-2 text-[13px] font-medium',
                    item.active
                      ? 'bg-surface-2 text-text border border-border'
                      : 'text-text-muted border border-transparent'
                  )}
                >
                  <Icon
                    className={cn(
                      'h-4 w-4 shrink-0',
                      item.active ? 'text-accent-fg' : 'text-text-dim'
                    )}
                  />
                  <span>{item.label}</span>
                </motion.div>
              );
            })}
          </div>
        </aside>

        {/* Main workspace area (panels size to content so Row 2 crosses the bottom crop) */}
        <div className="flex-1 min-w-0 bg-surface p-3 md:p-3.5 pb-0 flex flex-col gap-3">
          {/* Header row */}
          <div className="flex flex-wrap items-center justify-between gap-2.5 border-b border-border pb-2">
            <div className="flex items-center gap-2.5 min-w-0">
              {prefersReducedMotion ? (
                <span className="h-2 w-2 rounded-full bg-accent shrink-0" />
              ) : (
                <motion.span
                  animate={{ opacity: [0.55, 1, 0.55], scale: [1, 1.18, 1] }}
                  transition={{
                    duration: DURATION.dashboardStatusPulse,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  className="h-2 w-2 rounded-full bg-accent shrink-0"
                />
              )}
              <span className="text-[15px] font-medium tracking-[-0.02em] text-text">
                {DASHBOARD_DATA.header.title}
              </span>
              <Badge
                variant="neutral"
                className="font-sans normal-case tracking-normal text-[12px] font-normal px-2.5 py-0.5 truncate max-w-[180px]"
              >
                {DASHBOARD_DATA.header.contextBadge}
              </Badge>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Badge variant="lime">{DASHBOARD_DATA.header.creditsBadge}</Badge>
              <Badge variant="neutral">{DASHBOARD_DATA.header.modeBadge}</Badge>
            </div>
          </div>

          {/* Four tool cards row (2x2 below lg, 12px gaps, --surface-2 cards) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {DASHBOARD_DATA.tools.map((tool, idx) => {
              const Icon = tool.icon;
              return (
                <motion.div
                  key={tool.id}
                  initial={
                    prefersReducedMotion
                      ? false
                      : { opacity: 0, y: DISTANCE.dashboardCardY }
                  }
                  animate={isVisible ? { opacity: 1, y: 0 } : undefined}
                  transition={{
                    duration: prefersReducedMotion
                      ? DURATION.reduced
                      : DURATION.dashboardItem,
                    delay: prefersReducedMotion
                      ? 0
                      : 0.25 + idx * STAGGER.dashboardToolCard,
                    ease: EASE_OUT_EXPO,
                  }}
                >
                  <Card
                    variant="elevated"
                    padding="none"
                    className={cn(
                      'h-full rounded-[var(--radius-card)] p-3 flex flex-col gap-2',
                      tool.active ? 'border-border-strong' : 'border-border'
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          'inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border bg-surface',
                          tool.active
                            ? 'border-accent/40 text-accent-fg'
                            : 'border-border-strong text-text-muted'
                        )}
                      >
                        <Icon className="h-3.5 w-3.5" />
                      </span>
                      <span className="text-[14px] font-medium text-text">
                        {tool.name}
                      </span>
                    </div>
                    <p className="font-mono text-[11px] leading-[1.45] text-text-muted break-normal">
                      {tool.cost}
                    </p>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {/* Row 1 panels: Strong matches & Reach partners */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 items-start">
            {DASHBOARD_DATA.row1Panels.map((panel, pIdx) => (
              <PanelCard
                key={panel.id}
                panel={panel}
                isVisible={isVisible}
                prefersReducedMotion={prefersReducedMotion}
                baseRowDelay={0.38 + pIdx * 0.08}
              />
            ))}
          </div>

          {/* Row 2 panels: Sales script & Get found (extends past the hard bottom crop) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 items-start">
            {DASHBOARD_DATA.row2Panels.map((panel, pIdx) => (
              <PanelCard
                key={panel.id}
                panel={panel}
                isVisible={isVisible}
                prefersReducedMotion={prefersReducedMotion}
                baseRowDelay={0.54 + pIdx * 0.08}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Short 40px fade at the very bottom edge of the crop */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-[40px] bg-[linear-gradient(to_bottom,transparent,var(--bg))]"
      />
    </motion.div>
  );
}
