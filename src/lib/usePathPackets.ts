import { useEffect, useRef, type RefObject } from 'react';
import {
  DIAGRAM_CHOREO,
  DIAGRAM_PACKETS,
  type DiagramOutputId,
} from './motion';
import { getScanState, subscribeScanState } from './scanState';

interface CachedPath {
  el: SVGPathElement;
  length: number;
}

export interface PacketSlotRefs {
  head: SVGRectElement | null;
  halo: SVGRectElement | null;
  trails: Array<SVGRectElement | null>;
}

export interface UsePathPacketsOptions {
  svgRef: RefObject<SVGSVGElement | null>;
  enabled: boolean;
  onIncomingArrive?: () => void;
  onOutputArrive?: (output: DiagramOutputId) => void;
}

function getWrappedElapsed(loopTime: number, startAt: number, loopSec: number): number {
  let u = loopTime - startAt;
  if (u < 0) u += loopSec;
  if (u >= loopSec) u -= loopSec;
  return u;
}

function hideSlot(slot: PacketSlotRefs | undefined) {
  if (!slot) return;
  slot.head?.setAttribute('opacity', '0');
  slot.halo?.setAttribute('opacity', '0');
  for (let k = 0; k < slot.trails.length; k++) {
    slot.trails[k]?.setAttribute('opacity', '0');
  }
}

export function usePathPackets({
  svgRef,
  enabled,
  onIncomingArrive,
  onOutputArrive,
}: UsePathPacketsOptions) {
  const incomingSlotsRef = useRef<PacketSlotRefs[]>([]);
  const askingSlotsRef = useRef<PacketSlotRefs[]>([]);
  const repliesSlotsRef = useRef<PacketSlotRefs[]>([]);

  const onIncomingArriveRef = useRef(onIncomingArrive);
  onIncomingArriveRef.current = onIncomingArrive;
  const onOutputArriveRef = useRef(onOutputArrive);
  onOutputArriveRef.current = onOutputArrive;

  const ensureSlot = (
    pool: PacketSlotRefs[],
    index: number
  ): PacketSlotRefs => {
    if (!pool[index]) {
      pool[index] = {
        head: null,
        halo: null,
        trails: new Array<SVGRectElement | null>(DIAGRAM_PACKETS.trailCount).fill(
          null
        ),
      };
    }
    return pool[index];
  };

  const setIncomingRef = (
    slotIndex: number,
    part: 'head' | 'halo' | number,
    el: SVGRectElement | null
  ) => {
    const slot = ensureSlot(incomingSlotsRef.current, slotIndex);
    if (part === 'head') slot.head = el;
    else if (part === 'halo') slot.halo = el;
    else slot.trails[part] = el;
  };

  const setOutgoingRef = (
    output: DiagramOutputId,
    slotIndex: number,
    part: 'head' | 'halo' | number,
    el: SVGRectElement | null
  ) => {
    const pool =
      output === 'asking' ? askingSlotsRef.current : repliesSlotsRef.current;
    const slot = ensureSlot(pool, slotIndex);
    if (part === 'head') slot.head = el;
    else if (part === 'halo') slot.halo = el;
    else slot.trails[part] = el;
  };

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    const arrivals = DIAGRAM_CHOREO.arrivals;
    const pathCache = new Map<string, CachedPath>();
    const incomingDurations = new Float64Array(arrivals.length);

    const measurePaths = () => {
      const incomingIds = new Set<string>();
      for (const ev of arrivals) {
        incomingIds.add(`path-source-${ev.source}`);
      }
      const allIds = [
        ...incomingIds,
        'path-output-asking',
        'path-output-replies',
      ];

      for (const id of allIds) {
        const pathEl = svg.querySelector<SVGPathElement>(`#${id}`);
        if (pathEl && typeof pathEl.getTotalLength === 'function') {
          pathCache.set(id, {
            el: pathEl,
            length: pathEl.getTotalLength(),
          });
        }
      }

      let minLen = Infinity;
      let maxLen = 0;
      incomingIds.forEach((id) => {
        const entry = pathCache.get(id);
        if (entry && entry.length > 0) {
          if (entry.length < minLen) minLen = entry.length;
          if (entry.length > maxLen) maxLen = entry.length;
        }
      });

      const span = Math.max(1, maxLen - minLen);
      const { incomingDurationMinSec, incomingDurationMaxSec } = DIAGRAM_CHOREO;

      for (let i = 0; i < arrivals.length; i++) {
        const entry = pathCache.get(`path-source-${arrivals[i].source}`);
        if (!entry || !Number.isFinite(minLen)) {
          incomingDurations[i] = incomingDurationMinSec;
          continue;
        }
        const ratio = (entry.length - minLen) / span;
        incomingDurations[i] =
          incomingDurationMinSec +
          ratio * (incomingDurationMaxSec - incomingDurationMinSec);
      }
    };

    measurePaths();

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(measurePaths);
      resizeObserver.observe(svg);
    } else {
      window.addEventListener('resize', measurePaths);
    }

    // Read scan state through a ref/subscription without triggering React re-renders
    let scanTarget = getScanState() === 'idle' ? 0 : 1;
    let scanBlend = scanTarget;
    const unsubscribeScan = subscribeScanState(() => {
      scanTarget = getScanState() === 'idle' ? 0 : 1;
    });

    if (!enabled) {
      return () => {
        unsubscribeScan();
        resizeObserver?.disconnect();
        window.removeEventListener('resize', measurePaths);
      };
    }

    const {
      loopSec,
      minArrivalGapSec,
      outputLaunchDelaySec,
      progressExponent,
      outgoingDurationSec,
      scanTimeScale,
      scanEaseSec,
    } = DIAGRAM_CHOREO;

    const {
      dotSize,
      dotSpacing,
      headSize,
      haloSize,
      haloOpacityLight,
      haloOpacityAccent,
      trailCount,
      trailOpacities,
      fadeInPct,
      fadeOutPct,
      maxDeltaMs,
    } = DIAGRAM_PACKETS;

    const halfDot = dotSize / 2;
    const halfHead = headSize / 2;
    const halfHalo = haloSize / 2;
    const minArrivalGapMs = minArrivalGapSec * 1000;

    let rafId = 0;
    let lastNow = 0;
    let elapsedTimelineSec = 0;
    let lastIncomingArriveMs = -Infinity;

    const prevInU = new Float64Array(arrivals.length);
    const prevOutU = new Float64Array(arrivals.length);

    // Initialize previous phase at t = 0 so mid-path packets don't misfire at startup
    for (let i = 0; i < arrivals.length; i++) {
      const ev = arrivals[i];
      const inDur = incomingDurations[i];
      const inDepart = (((ev.at - inDur) % loopSec) + loopSec) % loopSec;
      prevInU[i] = getWrappedElapsed(0, inDepart, loopSec);

      const outLaunch = (ev.at + outputLaunchDelaySec) % loopSec;
      prevOutU[i] = getWrappedElapsed(0, outLaunch, loopSec);
    }

    const incomingWasActive = new Uint8Array(arrivals.length);
    const askingWasActive = new Uint8Array(DIAGRAM_PACKETS.askingPoolSize);
    const repliesWasActive = new Uint8Array(DIAGRAM_PACKETS.repliesPoolSize);

    const renderSlot = (
      slot: PacketSlotRefs | undefined,
      cached: CachedPath,
      rawT: number,
      haloOpacity: number
    ) => {
      if (!slot || cached.length <= 0) return;

      const easedT = Math.pow(rawT, progressExponent);
      const headPos = easedT * cached.length;

      let envelope = 1;
      if (rawT < fadeInPct) {
        envelope = rawT / fadeInPct;
      } else if (rawT > 1 - fadeOutPct) {
        envelope = (1 - rawT) / fadeOutPct;
      }
      if (envelope < 0) envelope = 0;
      if (envelope > 1) envelope = 1;

      const pt = cached.el.getPointAtLength(headPos);
      if (slot.head) {
        slot.head.setAttribute(
          'transform',
          `translate(${(pt.x - halfHead).toFixed(2)} ${(pt.y - halfHead).toFixed(2)})`
        );
        slot.head.setAttribute('opacity', envelope.toFixed(3));
      }

      if (slot.halo) {
        slot.halo.setAttribute(
          'transform',
          `translate(${(pt.x - halfHalo).toFixed(2)} ${(pt.y - halfHalo).toFixed(2)})`
        );
        slot.halo.setAttribute('opacity', (envelope * haloOpacity).toFixed(3));
      }

      const snappedBase = Math.floor(headPos / dotSpacing) * dotSpacing;
      for (let k = 0; k < trailCount; k++) {
        const trail = slot.trails[k];
        if (!trail) continue;

        const dotPos = snappedBase - k * dotSpacing;
        if (dotPos < 0 || dotPos > headPos - 2) {
          trail.setAttribute('opacity', '0');
          continue;
        }

        const dpt = cached.el.getPointAtLength(dotPos);
        trail.setAttribute(
          'transform',
          `translate(${(dpt.x - halfDot).toFixed(2)} ${(dpt.y - halfDot).toFixed(2)})`
        );
        trail.setAttribute(
          'opacity',
          (envelope * trailOpacities[k]).toFixed(3)
        );
      }
    };

    const tick = (now: number) => {
      if (document.hidden) {
        lastNow = now;
        rafId = window.requestAnimationFrame(tick);
        return;
      }

      if (lastNow === 0) {
        lastNow = now;
      }

      const rawDeltaMs = now - lastNow;
      lastNow = now;
      const deltaSec = Math.min(maxDeltaMs, Math.max(0, rawDeltaMs)) / 1000;

      if (scanBlend !== scanTarget) {
        const step = deltaSec / scanEaseSec;
        scanBlend =
          scanTarget > scanBlend
            ? Math.min(1, scanBlend + step)
            : Math.max(0, scanBlend - step);
      }

      const timeScale = 1 + (scanTimeScale - 1) * scanBlend;
      elapsedTimelineSec += deltaSec * timeScale;
      const loopTime = elapsedTimelineSec % loopSec;

      // 1. Update scheduled incoming packets and detect center arrivals
      for (let i = 0; i < arrivals.length; i++) {
        const ev = arrivals[i];
        const dur = incomingDurations[i];
        const depart = (((ev.at - dur) % loopSec) + loopSec) % loopSec;
        const u = getWrappedElapsed(loopTime, depart, loopSec);

        if (prevInU[i] < dur && (u >= dur || u < prevInU[i])) {
          if (now - lastIncomingArriveMs >= minArrivalGapMs) {
            lastIncomingArriveMs = now;
            onIncomingArriveRef.current?.();
          }
        }
        prevInU[i] = u;

        if (u >= 0 && u < dur) {
          const cached = pathCache.get(`path-source-${ev.source}`);
          if (cached) {
            incomingWasActive[i] = 1;
            renderSlot(
              incomingSlotsRef.current[i],
              cached,
              u / dur,
              haloOpacityLight
            );
          }
        } else if (incomingWasActive[i]) {
          incomingWasActive[i] = 0;
          hideSlot(incomingSlotsRef.current[i]);
        }
      }

      // 2. Update scheduled outgoing packets launched 120ms after each arrival
      let askingCursor = 0;
      let repliesCursor = 0;

      for (let i = 0; i < arrivals.length; i++) {
        const ev = arrivals[i];
        const dur = outgoingDurationSec[ev.output];
        const launch = (ev.at + outputLaunchDelaySec) % loopSec;
        const u = getWrappedElapsed(loopTime, launch, loopSec);

        if (prevOutU[i] < dur && (u >= dur || u < prevOutU[i])) {
          onOutputArriveRef.current?.(ev.output);
        }
        prevOutU[i] = u;

        if (u >= 0 && u < dur) {
          const isReplies = ev.output === 'replies';
          const cached = pathCache.get(
            isReplies ? 'path-output-replies' : 'path-output-asking'
          );
          if (!cached) continue;

          if (isReplies && repliesCursor < DIAGRAM_PACKETS.repliesPoolSize) {
            repliesWasActive[repliesCursor] = 1;
            renderSlot(
              repliesSlotsRef.current[repliesCursor],
              cached,
              u / dur,
              haloOpacityAccent
            );
            repliesCursor++;
          } else if (
            !isReplies &&
            askingCursor < DIAGRAM_PACKETS.askingPoolSize
          ) {
            askingWasActive[askingCursor] = 1;
            renderSlot(
              askingSlotsRef.current[askingCursor],
              cached,
              u / dur,
              haloOpacityLight
            );
            askingCursor++;
          }
        }
      }

      for (let s = askingCursor; s < DIAGRAM_PACKETS.askingPoolSize; s++) {
        if (askingWasActive[s]) {
          askingWasActive[s] = 0;
          hideSlot(askingSlotsRef.current[s]);
        }
      }

      for (let s = repliesCursor; s < DIAGRAM_PACKETS.repliesPoolSize; s++) {
        if (repliesWasActive[s]) {
          repliesWasActive[s] = 0;
          hideSlot(repliesSlotsRef.current[s]);
        }
      }

      rafId = window.requestAnimationFrame(tick);
    };

    rafId = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(rafId);
      unsubscribeScan();
      resizeObserver?.disconnect();
      window.removeEventListener('resize', measurePaths);
    };
  }, [svgRef, enabled]);

  return { setIncomingRef, setOutgoingRef };
}
