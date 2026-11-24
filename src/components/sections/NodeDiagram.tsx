import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
} from 'react';
import { motion } from 'motion/react';
import { Badge } from '@/src/components/ui';
import { cn } from '@/src/lib/cn';
import {
  DIAGRAM_CHOREO,
  DIAGRAM_PACKETS,
  DURATION,
  EASE_OUT_EXPO,
  STAGGER,
  type DiagramOutputId,
  type DiagramSourceId,
} from '@/src/lib/motion';
import {
  getScanServerSnapshot,
  getScanState,
  subscribeScanState,
} from '@/src/lib/scanState';
import { useInViewActive, useInViewOnce } from '@/src/lib/useInViewOnce';
import { usePathPackets } from '@/src/lib/usePathPackets';
import { useReducedMotion } from '@/src/lib/useReducedMotion';
import { SOURCE_GLYPHS } from './diagram/glyphs';

const DIAGRAM_LABELS = {
  routing: '[ ROUTING ]',
  scanning: '[ SCANNING ]',
} as const;

export interface NodeDiagramProps {
  className?: string;
}

interface SourceNode {
  id: DiagramSourceId;
  label: string;
  y: number;
  pillWidth: number;
  textWidthEst: number;
  cx1Offset: number;
  cy1Offset: number;
  cx2Offset: number;
  cy2Offset: number;
  pathD: string;
}

const RAW_SOURCES = [
  {
    id: 'reddit',
    label: 'reddit.com',
    y: 34,
    pillWidth: 138,
    textWidthEst: 78,
    cx1Offset: -7,
    cy1Offset: 3,
    cx2Offset: 5,
    cy2Offset: -4,
  },
  {
    id: 'x',
    label: 'x.com',
    y: 82,
    pillWidth: 98,
    textWidthEst: 39,
    cx1Offset: 6,
    cy1Offset: -5,
    cx2Offset: -6,
    cy2Offset: 3,
  },
  {
    id: 'hn',
    label: 'news.ycombinator',
    y: 130,
    pillWidth: 186,
    textWidthEst: 125,
    cx1Offset: -4,
    cy1Offset: 4,
    cx2Offset: 7,
    cy2Offset: -2,
  },
  {
    id: 'youtube',
    label: 'youtube.com',
    y: 178,
    pillWidth: 146,
    textWidthEst: 86,
    cx1Offset: 7,
    cy1Offset: -3,
    cx2Offset: -5,
    cy2Offset: 5,
  },
  {
    id: 'google',
    label: 'google',
    y: 226,
    pillWidth: 108,
    textWidthEst: 47,
    cx1Offset: -6,
    cy1Offset: 6,
    cx2Offset: 4,
    cy2Offset: -5,
  },
  {
    id: 'forums',
    label: 'forums',
    y: 274,
    pillWidth: 108,
    textWidthEst: 47,
    cx1Offset: 5,
    cy1Offset: -4,
    cx2Offset: -7,
    cy2Offset: 4,
  },
] as const;

const SOURCE_PILL_RIGHT_X = 204;
const SOURCE_PILL_HEIGHT = 31;
const PATH_START_X = 212;

const CENTER_PILL_X = 420;
const CENTER_PILL_Y = 138;
const CENTER_PILL_WIDTH = 160;
const CENTER_PILL_HEIGHT = 44;
const CENTER_PILL_RIGHT_X = CENTER_PILL_X + CENTER_PILL_WIDTH; // 580
const CENTER_DOT_X = 444;
const CENTER_DOT_Y = 160;

const OUTPUT_PILL_X = 812;
const OUTPUT_PILL_WIDTH = 144;
const OUTPUT_PILL_HEIGHT = 32;
const OUTPUT_ASKING_Y = 98;
const OUTPUT_REPLIES_Y = 218;

const OUTGOING_ASKING_PATH = `M ${CENTER_PILL_RIGHT_X} 160 C 674 160, 694 ${OUTPUT_ASKING_Y}, 804 ${OUTPUT_ASKING_Y}`;
const OUTGOING_REPLIES_PATH = `M ${CENTER_PILL_RIGHT_X} 160 C 674 160, 694 ${OUTPUT_REPLIES_Y}, 804 ${OUTPUT_REPLIES_Y}`;

const CROSSHAIR_POINTS = [
  { x: 12, y: 12 },
  { x: 988, y: 12 },
] as const;

const TABULAR_MONO_STYLE: CSSProperties = {
  fontVariantNumeric: 'tabular-nums',
  textRendering: 'geometricPrecision',
};

function DiagramHeader() {
  const scanState = useSyncExternalStore(
    subscribeScanState,
    getScanState,
    getScanServerSnapshot
  );
  const isScanning = scanState !== 'idle';

  return (
    <div className="mb-6 flex items-center">
      <div className="flex items-center gap-2.5">
        <span aria-hidden="true" className="h-3.5 w-[2px] bg-accent shrink-0" />
        <span
          className={cn(
            'font-mono text-[11px] font-medium uppercase tracking-[0.08em] transition-colors duration-200',
            isScanning ? 'text-accent-fg' : 'text-text-dim'
          )}
          style={TABULAR_MONO_STYLE}
        >
          {isScanning ? DIAGRAM_LABELS.scanning : DIAGRAM_LABELS.routing}
        </span>
      </div>
    </div>
  );
}

export function NodeDiagram({ className }: NodeDiagramProps) {
  const prefersReducedMotion = useReducedMotion();
  const { ref: onceRef, inView: hasEntered } = useInViewOnce<HTMLDivElement>({
    threshold: 0.2,
    rootMargin: '0px 0px -8% 0px',
  });
  const { ref: activeRef, isActive: isInViewport } = useInViewActive<HTMLDivElement>({
    threshold: 0.05,
  });

  const svgRef = useRef<SVGSVGElement>(null);
  const rippleRefs = useRef<Array<SVGCircleElement | null>>([null, null, null]);
  const rippleCursorRef = useRef(0);
  const lastRippleMsRef = useRef(-Infinity);

  const askingFlashRef = useRef<SVGRectElement>(null);
  const repliesPillRef = useRef<SVGGElement>(null);
  const repliesGlowRef = useRef<SVGRectElement>(null);

  const staticCueRefs = useRef<Array<SVGRectElement | null>>([]);
  const [drawDone, setDrawDone] = useState(false);

  const sources = useMemo<SourceNode[]>(
    () =>
      RAW_SOURCES.map((s) => ({
        ...s,
        pathD: `M ${PATH_START_X} ${s.y} C ${316 + s.cx1Offset} ${s.y + s.cy1Offset}, ${336 + s.cx2Offset} ${CENTER_DOT_Y + s.cy2Offset}, ${CENTER_PILL_X} ${CENTER_DOT_Y}`,
      })),
    []
  );

  const setContainerRefs = (node: HTMLDivElement | null) => {
    onceRef.current = node;
    activeRef.current = node;
  };

  // Toggle data-scanning attribute directly on SVG so scan transitions never re-render the diagram
  useEffect(() => {
    const syncScanAttr = () => {
      const svg = svgRef.current;
      if (!svg) return;
      const active = !prefersReducedMotion && getScanState() !== 'idle';
      svg.setAttribute('data-scanning', active ? 'true' : 'false');
    };

    syncScanAttr();
    return subscribeScanState(syncScanAttr);
  }, [prefersReducedMotion]);

  // Mark draw-in sequence complete so packets fade in right after outputs appear
  useEffect(() => {
    if (prefersReducedMotion) {
      setDrawDone(true);
      return;
    }
    if (!hasEntered) return;

    const timer = window.setTimeout(() => {
      setDrawDone(true);
    }, 2200);

    return () => window.clearTimeout(timer);
  }, [hasEntered, prefersReducedMotion]);

  // Pre-created ripple rings recycled via Web Animations API (max 4/sec, zero React state)
  const handleIncomingArrive = useCallback(() => {
    if (prefersReducedMotion) return;

    const now = performance.now();
    if (now - lastRippleMsRef.current < DIAGRAM_PACKETS.centerRippleThrottleMs) {
      return;
    }
    lastRippleMsRef.current = now;

    const ringIndex = rippleCursorRef.current % 3;
    rippleCursorRef.current = (rippleCursorRef.current + 1) % 3;
    const ring = rippleRefs.current[ringIndex];
    if (!ring) return;

    ring.animate(
      [
        { transform: 'scale(1)', opacity: 0.45 },
        { transform: 'scale(1.9)', opacity: 0 },
      ],
      {
        duration: DIAGRAM_PACKETS.centerRippleDurationMs,
        easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
      }
    );
  }, [prefersReducedMotion]);

  // Subtle 180ms output pill reactions when an output packet lands
  const handleOutputArrive = useCallback(
    (output: DiagramOutputId) => {
      if (prefersReducedMotion) return;

      const duration = DIAGRAM_PACKETS.outputResponseDurationMs;
      const easing = 'cubic-bezier(0.16, 1, 0.3, 1)';

      if (output === 'replies') {
        repliesPillRef.current?.animate(
          [
            { transform: 'scale(1)' },
            { transform: 'scale(1.03)' },
            { transform: 'scale(1)' },
          ],
          { duration, easing }
        );
        repliesGlowRef.current?.animate(
          [{ opacity: 0 }, { opacity: 0.28 }, { opacity: 0 }],
          { duration, easing }
        );
      } else {
        askingFlashRef.current?.animate(
          [{ opacity: 0 }, { opacity: 0.85 }, { opacity: 0 }],
          { duration, easing }
        );
      }
    },
    [prefersReducedMotion]
  );

  const packetsActive = drawDone && isInViewport && !prefersReducedMotion;

  const { setIncomingRef, setOutgoingRef } = usePathPackets({
    svgRef,
    enabled: packetsActive,
    onIncomingArrive: handleIncomingArrive,
    onOutputArrive: handleOutputArrive,
  });

  // Static lit cue along #path-output-replies when prefers-reduced-motion is active
  useEffect(() => {
    if (!prefersReducedMotion) return;
    const svg = svgRef.current;
    if (!svg) return;
    const pathEl = svg.querySelector<SVGPathElement>('#path-output-replies');
    if (!pathEl || typeof pathEl.getTotalLength !== 'function') return;

    const len = pathEl.getTotalLength();
    const headPos = len * 0.56;
    const { headSize, dotSize, dotSpacing } = DIAGRAM_PACKETS;

    const headRect = staticCueRefs.current[0];
    if (headRect) {
      const pt = pathEl.getPointAtLength(headPos);
      headRect.setAttribute(
        'transform',
        `translate(${(pt.x - headSize / 2).toFixed(2)} ${(pt.y - headSize / 2).toFixed(2)})`
      );
    }

    const snappedBase = Math.floor(headPos / dotSpacing) * dotSpacing;
    for (let k = 0; k < DIAGRAM_PACKETS.trailCount; k++) {
      const rect = staticCueRefs.current[k + 1];
      if (!rect) continue;
      const dotPos = snappedBase - k * dotSpacing;
      if (dotPos < 0 || dotPos > headPos - 2) {
        rect.setAttribute('opacity', '0');
        continue;
      }
      const pt = pathEl.getPointAtLength(dotPos);
      rect.setAttribute(
        'transform',
        `translate(${(pt.x - dotSize / 2).toFixed(2)} ${(pt.y - dotSize / 2).toFixed(2)})`
      );
    }
  }, [prefersReducedMotion]);

  const centerDelay =
    (sources.length - 1) * STAGGER.diagramIncoming + DURATION.diagramIncoming;
  const outgoingBaseDelay = centerDelay + DURATION.diagramCenter * 0.7;
  const outputsFadeDelay =
    outgoingBaseDelay + STAGGER.diagramOutgoing + DURATION.diagramOutgoing * 0.65;

  const shouldDraw = prefersReducedMotion || hasEntered;

  const trailIndices = useMemo(
    () => Array.from({ length: DIAGRAM_PACKETS.trailCount }, (_, idx) => idx),
    []
  );

  return (
    <div ref={setContainerRefs} className={cn('w-full', className)}>
      <DiagramHeader />

      {/* Desktop inline SVG diagram (full 1200px container width) */}
      <div className="hidden md:block w-full">
        <svg
          ref={svgRef}
          id="growthrouter-node-diagram"
          viewBox="0 0 1000 320"
          width="100%"
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label="Six sources (Reddit, X, Hacker News, YouTube, Google, forums) flow into GrowthRouter, which outputs people asking and replies ready"
          className="block w-full h-auto overflow-visible"
        >
          <defs>
            {/* Subtle dot-matrix texture inside the center pill */}
            <pattern
              id="center-dot-matrix"
              width="6"
              height="6"
              patternUnits="userSpaceOnUse"
            >
              <circle
                cx="3"
                cy="3"
                r="0.65"
                fill="var(--text)"
                fillOpacity="0.06"
              />
            </pattern>

            {/* Draw-in masks keep dotted stroke-dasharray intact during reveal */}
            {!prefersReducedMotion ? (
              <>
                {sources.map((source, index) => (
                  <mask
                    key={`mask-${source.id}`}
                    id={`mask-path-source-${source.id}`}
                    maskUnits="userSpaceOnUse"
                  >
                    <motion.path
                      d={source.pathD}
                      pathLength={1}
                      fill="none"
                      stroke="white"
                      strokeWidth={10}
                      strokeLinecap="round"
                      style={{ strokeDasharray: 1 }}
                      initial={{ strokeDashoffset: 1 }}
                      animate={shouldDraw ? { strokeDashoffset: 0 } : undefined}
                      transition={{
                        duration: DURATION.diagramIncoming,
                        delay: index * STAGGER.diagramIncoming,
                        ease: EASE_OUT_EXPO,
                      }}
                    />
                  </mask>
                ))}

                <mask id="mask-path-output-asking" maskUnits="userSpaceOnUse">
                  <motion.path
                    d={OUTGOING_ASKING_PATH}
                    pathLength={1}
                    fill="none"
                    stroke="white"
                    strokeWidth={10}
                    strokeLinecap="round"
                    style={{ strokeDasharray: 1 }}
                    initial={{ strokeDashoffset: 1 }}
                    animate={shouldDraw ? { strokeDashoffset: 0 } : undefined}
                    transition={{
                      duration: DURATION.diagramOutgoing,
                      delay: outgoingBaseDelay,
                      ease: EASE_OUT_EXPO,
                    }}
                  />
                </mask>

                <mask id="mask-path-output-replies" maskUnits="userSpaceOnUse">
                  <motion.path
                    d={OUTGOING_REPLIES_PATH}
                    pathLength={1}
                    fill="none"
                    stroke="white"
                    strokeWidth={10}
                    strokeLinecap="round"
                    style={{ strokeDasharray: 1 }}
                    initial={{ strokeDashoffset: 1 }}
                    animate={shouldDraw ? { strokeDashoffset: 0 } : undefined}
                    transition={{
                      duration: DURATION.diagramOutgoing,
                      delay: outgoingBaseDelay + STAGGER.diagramOutgoing,
                      ease: EASE_OUT_EXPO,
                    }}
                  />
                </mask>
              </>
            ) : null}
          </defs>

          {/* Layer 0: Two 8px top corner registration crosshairs */}
          <g aria-hidden="true">
            {CROSSHAIR_POINTS.map((pt, idx) => (
              <g key={idx} opacity={0.3}>
                <line
                  x1={pt.x - 4}
                  y1={pt.y}
                  x2={pt.x + 4}
                  y2={pt.y}
                  stroke="var(--text-dim)"
                  strokeWidth={1}
                  vectorEffect="non-scaling-stroke"
                />
                <line
                  x1={pt.x}
                  y1={pt.y - 4}
                  x2={pt.x}
                  y2={pt.y + 4}
                  stroke="var(--text-dim)"
                  strokeWidth={1}
                  vectorEffect="non-scaling-stroke"
                />
              </g>
            ))}
          </g>

          {/* Layer 1: Dotted paths (lifted toward --text-muted, 2.2u dot size) */}
          <g id="diagram-paths" aria-hidden="true">
            {sources.map((source) => (
              <path
                key={`path-${source.id}`}
                id={`path-source-${source.id}`}
                data-diagram-path="incoming"
                d={source.pathD}
                fill="none"
                stroke="color-mix(in srgb, var(--text-muted) 58%, var(--border-strong))"
                strokeWidth={DIAGRAM_PACKETS.dotSize}
                strokeDasharray={`0.1 ${DIAGRAM_PACKETS.dotSpacing}`}
                strokeLinecap="square"
                shapeRendering="crispEdges"
                mask={
                  prefersReducedMotion
                    ? undefined
                    : `url(#mask-path-source-${source.id})`
                }
                className="diagram-path-incoming"
              />
            ))}

            <g id="diagram-outputs-paths">
              <path
                id="path-output-asking"
                data-diagram-path="outgoing"
                d={OUTGOING_ASKING_PATH}
                fill="none"
                stroke="color-mix(in srgb, var(--text-muted) 58%, var(--border-strong))"
                strokeWidth={DIAGRAM_PACKETS.dotSize}
                strokeDasharray={`0.1 ${DIAGRAM_PACKETS.dotSpacing}`}
                strokeLinecap="square"
                shapeRendering="crispEdges"
                mask={
                  prefersReducedMotion
                    ? undefined
                    : `url(#mask-path-output-asking)`
                }
                className="diagram-path-outgoing"
              />

              <path
                id="path-output-replies"
                data-diagram-path="outgoing-accent"
                d={OUTGOING_REPLIES_PATH}
                fill="none"
                stroke="var(--accent-fg)"
                strokeOpacity={0.62}
                strokeWidth={DIAGRAM_PACKETS.dotSize}
                strokeDasharray={`0.1 ${DIAGRAM_PACKETS.dotSpacing}`}
                strokeLinecap="square"
                shapeRendering="crispEdges"
                mask={
                  prefersReducedMotion
                    ? undefined
                    : `url(#mask-path-output-replies)`
                }
                className="diagram-path-outgoing-accent"
              />
            </g>
          </g>

          {/* Layer 2: Pre-created packet pool (snapped route dot trails + halo + head) */}
          {!prefersReducedMotion ? (
            <motion.g
              id="diagram-packets"
              aria-hidden="true"
              initial={{ opacity: 0 }}
              animate={{ opacity: drawDone ? 1 : 0 }}
              transition={{
                duration: DIAGRAM_PACKETS.groupFadeDuration,
                ease: EASE_OUT_EXPO,
              }}
              shapeRendering="crispEdges"
            >
              {/* Incoming slots (1 per arrival event) */}
              {DIAGRAM_CHOREO.arrivals.map((ev, slotIdx) => (
                <g key={`in-slot-${ev.id}`}>
                  <rect
                    ref={(el) => setIncomingRef(slotIdx, 'halo', el)}
                    width={DIAGRAM_PACKETS.haloSize}
                    height={DIAGRAM_PACKETS.haloSize}
                    rx={2}
                    fill="var(--text)"
                    opacity={0}
                  />
                  {trailIndices.map((k) => (
                    <rect
                      key={`in-trail-${ev.id}-${k}`}
                      ref={(el) => setIncomingRef(slotIdx, k, el)}
                      width={DIAGRAM_PACKETS.dotSize}
                      height={DIAGRAM_PACKETS.dotSize}
                      fill="var(--text)"
                      opacity={0}
                    />
                  ))}
                  <rect
                    ref={(el) => setIncomingRef(slotIdx, 'head', el)}
                    width={DIAGRAM_PACKETS.headSize}
                    height={DIAGRAM_PACKETS.headSize}
                    fill="var(--text)"
                    opacity={0}
                  />
                </g>
              ))}

              {/* Outgoing "asking" pool */}
              {Array.from(
                { length: DIAGRAM_PACKETS.askingPoolSize },
                (_, slotIdx) => (
                  <g key={`asking-slot-${slotIdx}`}>
                    <rect
                      ref={(el) => setOutgoingRef('asking', slotIdx, 'halo', el)}
                      width={DIAGRAM_PACKETS.haloSize}
                      height={DIAGRAM_PACKETS.haloSize}
                      rx={2}
                      fill="var(--text)"
                      opacity={0}
                    />
                    {trailIndices.map((k) => (
                      <rect
                        key={`asking-trail-${slotIdx}-${k}`}
                        ref={(el) => setOutgoingRef('asking', slotIdx, k, el)}
                        width={DIAGRAM_PACKETS.dotSize}
                        height={DIAGRAM_PACKETS.dotSize}
                        fill="var(--text)"
                        opacity={0}
                      />
                    ))}
                    <rect
                      ref={(el) => setOutgoingRef('asking', slotIdx, 'head', el)}
                      width={DIAGRAM_PACKETS.headSize}
                      height={DIAGRAM_PACKETS.headSize}
                      fill="var(--text)"
                      opacity={0}
                    />
                  </g>
                )
              )}

              {/* Outgoing "replies" pool (lime accent) */}
              {Array.from(
                { length: DIAGRAM_PACKETS.repliesPoolSize },
                (_, slotIdx) => (
                  <g key={`replies-slot-${slotIdx}`}>
                    <rect
                      ref={(el) =>
                        setOutgoingRef('replies', slotIdx, 'halo', el)
                      }
                      width={DIAGRAM_PACKETS.haloSize}
                      height={DIAGRAM_PACKETS.haloSize}
                      rx={2}
                      fill="var(--accent-fg)"
                      opacity={0}
                    />
                    {trailIndices.map((k) => (
                      <rect
                        key={`replies-trail-${slotIdx}-${k}`}
                        ref={(el) => setOutgoingRef('replies', slotIdx, k, el)}
                        width={DIAGRAM_PACKETS.dotSize}
                        height={DIAGRAM_PACKETS.dotSize}
                        fill="var(--accent-fg)"
                        opacity={0}
                      />
                    ))}
                    <rect
                      ref={(el) =>
                        setOutgoingRef('replies', slotIdx, 'head', el)
                      }
                      width={DIAGRAM_PACKETS.headSize}
                      height={DIAGRAM_PACKETS.headSize}
                      fill="var(--accent-fg)"
                      opacity={0}
                    />
                  </g>
                )
              )}
            </motion.g>
          ) : (
            <g
              id="diagram-packets"
              aria-hidden="true"
              shapeRendering="crispEdges"
            >
              <rect
                ref={(el) => {
                  staticCueRefs.current[0] = el;
                }}
                width={DIAGRAM_PACKETS.headSize}
                height={DIAGRAM_PACKETS.headSize}
                fill="var(--accent-fg)"
                opacity={1}
              />
              {trailIndices.map((k) => (
                <rect
                  key={`static-cue-${k}`}
                  ref={(el) => {
                    staticCueRefs.current[k + 1] = el;
                  }}
                  width={DIAGRAM_PACKETS.dotSize}
                  height={DIAGRAM_PACKETS.dotSize}
                  fill="var(--accent-fg)"
                  opacity={DIAGRAM_PACKETS.trailOpacities[k]}
                />
              ))}
            </g>
          )}

          {/* Layer 3: Source bordered pills with 14px glyphs & pointer-only hover trace */}
          <g id="diagram-sources" aria-hidden="true">
            {sources.map((source, index) => {
              const Glyph = SOURCE_GLYPHS[source.id];
              const pillX = SOURCE_PILL_RIGHT_X - source.pillWidth;
              const pillY = source.y - SOURCE_PILL_HEIGHT / 2;
              const contentWidth = 14 + 8 + source.textWidthEst;
              const contentLeft = pillX + (source.pillWidth - contentWidth) / 2;
              const textX = contentLeft + 14 + 8;

              return (
                <g
                  key={source.id}
                  id={`node-source-${source.id}`}
                  onPointerEnter={(e) => {
                    if (e.pointerType === 'touch') return;
                    svgRef.current?.setAttribute('data-hover', source.id);
                  }}
                  onPointerLeave={() => {
                    if (
                      svgRef.current?.getAttribute('data-hover') === source.id
                    ) {
                      svgRef.current.removeAttribute('data-hover');
                    }
                  }}
                  className="diagram-source-pill cursor-default"
                >
                  <rect
                    x={pillX}
                    y={pillY}
                    width={source.pillWidth}
                    height={SOURCE_PILL_HEIGHT}
                    rx={8}
                    strokeWidth={1}
                    vectorEffect="non-scaling-stroke"
                    className="diagram-source-rect fill-[var(--surface)] fill-opacity-90 stroke-[var(--border)]"
                  />

                  {/* Scanning sequential pulse highlight border */}
                  <rect
                    x={pillX}
                    y={pillY}
                    width={source.pillWidth}
                    height={SOURCE_PILL_HEIGHT}
                    rx={8}
                    fill="none"
                    stroke="var(--accent-fg)"
                    strokeWidth={1.2}
                    vectorEffect="non-scaling-stroke"
                    className="diagram-scan-pulse pointer-events-none"
                    style={
                      {
                        transformOrigin: `${pillX + source.pillWidth / 2}px ${source.y}px`,
                        '--scan-index': index,
                      } as CSSProperties
                    }
                  />

                  <g
                    transform={`translate(${contentLeft.toFixed(1)}, ${(source.y - 7).toFixed(1)})`}
                    className="diagram-source-glyph"
                  >
                    <Glyph />
                  </g>

                  <text
                    x={textX}
                    y={source.y}
                    dy="0.04em"
                    textAnchor="start"
                    dominantBaseline="central"
                    className="diagram-source-label font-mono text-[13px] fill-[var(--text-muted)]"
                    style={TABULAR_MONO_STYLE}
                  >
                    {source.label}
                  </text>
                </g>
              );
            })}
          </g>

          {/* Layer 3: Central GrowthRouter node with dot-matrix texture, concentric rings, and 3 ripple rings */}
          <motion.g
            id="node-center"
            aria-hidden="true"
            style={{ transformOrigin: '500px 160px' }}
            initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.6 }}
            animate={shouldDraw ? { opacity: 1, scale: 1 } : undefined}
            transition={{
              duration: DURATION.diagramCenter,
              delay: centerDelay,
              ease: EASE_OUT_EXPO,
            }}
          >
            <rect
              x={CENTER_PILL_X}
              y={CENTER_PILL_Y}
              width={CENTER_PILL_WIDTH}
              height={CENTER_PILL_HEIGHT}
              rx={10}
              strokeWidth={1}
              vectorEffect="non-scaling-stroke"
              className="fill-[var(--surface)] stroke-[var(--border-strong)]"
            />

            {/* Dot-matrix interior texture */}
            <rect
              x={CENTER_PILL_X}
              y={CENTER_PILL_Y}
              width={CENTER_PILL_WIDTH}
              height={CENTER_PILL_HEIGHT}
              rx={10}
              fill="url(#center-dot-matrix)"
            />

            {/* Two out-of-phase breathing concentric rings around the lime dot */}
            <circle
              cx={CENTER_DOT_X}
              cy={CENTER_DOT_Y}
              r={10}
              fill="none"
              stroke="var(--border-strong)"
              strokeWidth={1}
              opacity={0.5}
              vectorEffect="non-scaling-stroke"
              style={{ transformOrigin: `${CENTER_DOT_X}px ${CENTER_DOT_Y}px` }}
              className="diagram-center-ring-1"
            />
            <circle
              cx={CENTER_DOT_X}
              cy={CENTER_DOT_Y}
              r={16}
              fill="none"
              stroke="var(--border-strong)"
              strokeWidth={1}
              opacity={0.25}
              vectorEffect="non-scaling-stroke"
              style={{ transformOrigin: `${CENTER_DOT_X}px ${CENTER_DOT_Y}px` }}
              className="diagram-center-ring-2"
            />

            {/* Three pre-created ripple rings recycled via element.animate() on packet arrival */}
            {[0, 1, 2].map((ringIdx) => (
              <circle
                key={`ripple-${ringIdx}`}
                ref={(el) => {
                  rippleRefs.current[ringIdx] = el;
                }}
                cx={CENTER_DOT_X}
                cy={CENTER_DOT_Y}
                r={10}
                fill="none"
                stroke="var(--accent-fg)"
                strokeWidth={1}
                opacity={0}
                vectorEffect="non-scaling-stroke"
                style={{
                  transformOrigin: `${CENTER_DOT_X}px ${CENTER_DOT_Y}px`,
                }}
              />
            ))}

            <circle
              cx={CENTER_DOT_X}
              cy={CENTER_DOT_Y}
              r={7.5}
              strokeWidth={1}
              vectorEffect="non-scaling-stroke"
              className="fill-[var(--surface)] stroke-[var(--accent-fg)]"
            />
            <circle
              cx={CENTER_DOT_X}
              cy={CENTER_DOT_Y}
              r={3.5}
              className="fill-[var(--accent)]"
            />
            <text
              x={462}
              y={CENTER_DOT_Y}
              dy="0.04em"
              textAnchor="start"
              dominantBaseline="central"
              className="fill-[var(--text)] font-mono text-[13.5px] font-medium"
              style={TABULAR_MONO_STYLE}
            >
              growthrouter
            </text>
          </motion.g>

          {/* Layer 3: Right output pills with 180ms arrival reaction shapes */}
          <motion.g
            id="diagram-outputs"
            aria-hidden="true"
            initial={prefersReducedMotion ? false : { opacity: 0 }}
            animate={shouldDraw ? { opacity: 1 } : undefined}
            transition={{
              duration: DURATION.diagramLabels,
              delay: outputsFadeDelay,
              ease: EASE_OUT_EXPO,
            }}
          >
            {/* "people asking" bordered pill */}
            <g id="node-output-asking">
              <rect
                x={OUTPUT_PILL_X}
                y={OUTPUT_ASKING_Y - OUTPUT_PILL_HEIGHT / 2}
                width={OUTPUT_PILL_WIDTH}
                height={OUTPUT_PILL_HEIGHT}
                rx={8}
                strokeWidth={1}
                vectorEffect="non-scaling-stroke"
                className="fill-[var(--surface)] fill-opacity-90 stroke-[var(--border)]"
              />
              <rect
                ref={askingFlashRef}
                x={OUTPUT_PILL_X}
                y={OUTPUT_ASKING_Y - OUTPUT_PILL_HEIGHT / 2}
                width={OUTPUT_PILL_WIDTH}
                height={OUTPUT_PILL_HEIGHT}
                rx={8}
                fill="none"
                stroke="var(--text)"
                strokeWidth={1.2}
                opacity={0}
                vectorEffect="non-scaling-stroke"
              />
              <text
                x={OUTPUT_PILL_X + OUTPUT_PILL_WIDTH / 2}
                y={OUTPUT_ASKING_Y}
                dy="0.04em"
                textAnchor="middle"
                dominantBaseline="central"
                className="fill-[var(--text-muted)] font-mono text-[13px]"
                style={TABULAR_MONO_STYLE}
              >
                people asking
              </text>
            </g>

            {/* "replies ready" solid lime pill + SVG glow shape */}
            <g id="node-output-replies">
              <rect
                ref={repliesGlowRef}
                x={OUTPUT_PILL_X - 4}
                y={OUTPUT_REPLIES_Y - OUTPUT_PILL_HEIGHT / 2 - 4}
                width={OUTPUT_PILL_WIDTH + 8}
                height={OUTPUT_PILL_HEIGHT + 8}
                rx={11}
                fill="var(--accent)"
                opacity={0}
              />
              <g
                ref={repliesPillRef}
                style={{
                  transformOrigin: `${OUTPUT_PILL_X + OUTPUT_PILL_WIDTH / 2}px ${OUTPUT_REPLIES_Y}px`,
                }}
              >
                <rect
                  x={OUTPUT_PILL_X}
                  y={OUTPUT_REPLIES_Y - OUTPUT_PILL_HEIGHT / 2}
                  width={OUTPUT_PILL_WIDTH}
                  height={OUTPUT_PILL_HEIGHT}
                  rx={8}
                  className="fill-[var(--accent)]"
                />
                <text
                  x={OUTPUT_PILL_X + OUTPUT_PILL_WIDTH / 2}
                  y={OUTPUT_REPLIES_Y}
                  dy="0.04em"
                  textAnchor="middle"
                  dominantBaseline="central"
                  className="fill-[var(--accent-ink)] font-mono text-[13.5px] font-medium"
                  style={TABULAR_MONO_STYLE}
                >
                  replies ready
                </text>
              </g>
            </g>
          </motion.g>
        </svg>
      </div>

      {/* Mobile simplified vertical flow (< md) with 14px source glyphs & CSS packets */}
      <div
        className="md:hidden flex flex-col items-center"
        aria-label="Six sources (Reddit, X, Hacker News, YouTube, Google, forums) flow into GrowthRouter, which outputs people asking and replies ready"
      >
        <div
          data-reveal=""
          data-stagger-index={0}
          className="flex flex-wrap items-center justify-center gap-2 max-w-[356px]"
        >
          {sources.map((source) => {
            const Glyph = SOURCE_GLYPHS[source.id];
            return (
              <span
                key={source.id}
                className="inline-flex items-center gap-2 rounded-[8px] border border-border bg-surface/80 px-3 py-1.5 font-mono text-[11px] text-text-muted whitespace-nowrap"
                style={TABULAR_MONO_STYLE}
              >
                <Glyph className="text-text-dim shrink-0" />
                <span>{source.label}</span>
              </span>
            );
          })}
        </div>

        {/* Dotted vertical connector 1 (white square packet) */}
        <div
          aria-hidden="true"
          className="relative h-8 w-px border-l-2 border-dotted border-border-strong flex justify-center"
        >
          <span className="mobile-packet-dot absolute -left-[3px] top-0 h-[5px] w-[5px] bg-text" />
        </div>

        <div
          data-reveal=""
          data-stagger-index={1}
          className="inline-flex items-center gap-2.5 rounded-[10px] border border-border-strong bg-surface px-4 py-2"
        >
          <span
            aria-hidden="true"
            className="h-2.5 w-2.5 rounded-full bg-accent shadow-[0_0_10px_var(--accent-glow)]"
          />
          <span
            className="font-mono text-[12px] font-medium text-text"
            style={TABULAR_MONO_STYLE}
          >
            growthrouter
          </span>
        </div>

        {/* Dotted vertical connector 2 (lime square packet) */}
        <div
          aria-hidden="true"
          className="relative h-8 w-px border-l-2 border-dotted border-accent-fg/60 flex justify-center"
        >
          <span
            className="mobile-packet-dot absolute -left-[3px] top-0 h-[5px] w-[5px] bg-accent-fg"
            style={{ animationDelay: '0.9s' }}
          />
        </div>

        <div
          data-reveal=""
          data-stagger-index={2}
          className="flex flex-wrap items-center justify-center gap-3"
        >
          <span
            className="rounded-[8px] border border-border bg-surface/80 font-mono text-[11px] text-text-muted px-3 py-1.5"
            style={TABULAR_MONO_STYLE}
          >
            people asking
          </span>
          <span
            className="rounded-[8px] bg-accent px-3 py-1.5 font-mono text-[11px] font-medium text-accent-ink whitespace-nowrap"
            style={TABULAR_MONO_STYLE}
          >
            replies ready
          </span>
        </div>
      </div>

      {/* Caption below diagram (40px below diagram) */}
      <div className="mt-10 flex flex-col items-center text-center gap-2.5">
        <p className="text-[13px] leading-relaxed text-text-muted">
          <Badge variant="neutral" className="mr-2 align-middle">
            COMING NEXT WEEK
          </Badge>
          Use it from your agent: Claude Code, Codex or Cursor.
        </p>
        <p className="max-w-[520px] text-[13px] leading-relaxed text-text-muted [text-wrap:balance]">
          Your agent connects GrowthRouter, finds the people and drafts the replies. You send them. For now, paste your link above.
        </p>
      </div>
    </div>
  );
}
