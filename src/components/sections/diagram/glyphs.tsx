import type { ComponentType } from 'react';
import type { DiagramSourceId } from '@/src/lib/motion';

export interface DiagramGlyphProps {
  className?: string;
}

export function RedditGlyph({ className }: DiagramGlyphProps) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <circle cx="8" cy="9.2" r="4.6" stroke="currentColor" strokeWidth="1.25" />
      <path
        d="M8 4.6V2.6L10.8 2"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="11.5" cy="2" r="0.9" fill="currentColor" />
      <circle cx="6.2" cy="8.9" r="0.75" fill="currentColor" />
      <circle cx="9.8" cy="8.9" r="0.75" fill="currentColor" />
      <path
        d="M6.1 11C6.7 11.5 9.3 11.5 9.9 11"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function XGlyph({ className }: DiagramGlyphProps) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M3 2.75L13 13.25M13 2.75L3 13.25"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function HnGlyph({ className }: DiagramGlyphProps) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <rect
        x="2.25"
        y="2.25"
        width="11.5"
        height="11.5"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.25"
      />
      <path
        d="M5.5 5.2L8 8.4M10.5 5.2L8 8.4V11.3"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function YoutubeGlyph({ className }: DiagramGlyphProps) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <rect
        x="1.75"
        y="3.5"
        width="12.5"
        height="9"
        rx="2.5"
        stroke="currentColor"
        strokeWidth="1.25"
      />
      <path d="M6.75 6.1L10.35 8L6.75 9.9V6.1Z" fill="currentColor" />
    </svg>
  );
}

export function GoogleGlyph({ className }: DiagramGlyphProps) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M12.3 5.1A5.25 5.25 0 1 0 13.1 8.4H8.4"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ForumsGlyph({ className }: DiagramGlyphProps) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M2.5 4.25C2.5 3.42 3.17 2.75 4 2.75H12C12.83 2.75 13.5 3.42 13.5 4.25V9.75C13.5 10.58 12.83 11.25 12 11.25H7.2L4.2 13.5V11.25H4C3.17 11.25 2.5 10.58 2.5 9.75V4.25Z"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export const SOURCE_GLYPHS: Record<
  DiagramSourceId,
  ComponentType<DiagramGlyphProps>
> = {
  reddit: RedditGlyph,
  x: XGlyph,
  hn: HnGlyph,
  youtube: YoutubeGlyph,
  google: GoogleGlyph,
  forums: ForumsGlyph,
};
