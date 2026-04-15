"use client";

import { memo } from "react";

interface Props {
  /** 0..1 lunar age fraction. 0 = new, 0.25 = first quarter, 0.5 = full, 0.75 = last quarter. */
  phase: number;
  /** 0..1 illumination — used only as a visual safety net to flatten near-full / near-new edge cases. */
  illumination: number;
  size?: number;
  glow?: boolean;
  className?: string;
}

/**
 * Build the SVG path of the *dark* (shadow) portion of the moon disc.
 *
 * Geometry:
 *   - outer arc: a full half-circle along the dark-side limb
 *   - inner arc: the terminator, an ellipse with horizontal radius |cos(2π·phase)|·r
 *
 * Sweep-flag convention (SVG y-down):
 *   from (cx, cy-r) to (cx, cy+r): sweep=1 traces the RIGHT semicircle, sweep=0 the LEFT.
 *   from (cx, cy+r) to (cx, cy-r): sweep=1 traces the LEFT semicircle, sweep=0 the RIGHT.
 */
function shadowPath(phase01: number, r: number, cx: number, cy: number): string {
  const k = Math.cos(2 * Math.PI * phase01);
  const rx = Math.max(Math.abs(k) * r, 0.0001);
  const top = `${cx} ${cy - r}`;
  const bot = `${cx} ${cy + r}`;

  // Strict waxing/waning split. Edge cases (p=0 / p=0.5 / p=1) are handled by the caller.
  const waxing = phase01 < 0.5;

  // Outer arc traverses the dark-side limb.
  const outerSweep = waxing ? 0 : 1; // waxing = dark on left, waning = dark on right

  // Terminator: bulges into the lit side for crescent (k>0), into the dark side for gibbous (k<0).
  let innerSweep: number;
  if (waxing) {
    innerSweep = k > 0 ? 0 : 1;
  } else {
    innerSweep = k > 0 ? 1 : 0;
  }

  return `M ${top} A ${r} ${r} 0 0 ${outerSweep} ${bot} A ${rx} ${r} 0 0 ${innerSweep} ${top} Z`;
}

function MoonDisplayInner({
  phase,
  illumination,
  size = 280,
  glow = true,
  className,
}: Props) {
  const r = 48;
  const cx = 50;
  const cy = 50;

  // Edge-case rendering for ~new and ~full where the path math is degenerate
  const nearNew = illumination < 0.01;
  const nearFull = illumination > 0.99;

  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={className}
      role="img"
      aria-label={`Moon at ${(illumination * 100).toFixed(0)}% illumination`}
    >
      <defs>
        <radialGradient id="mp-lit" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#fffdf0" />
          <stop offset="60%" stopColor="#f5f3ce" />
          <stop offset="100%" stopColor="#cfcb95" />
        </radialGradient>
        <radialGradient id="mp-shadow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#1a2030" />
          <stop offset="100%" stopColor="#0b0f1a" />
        </radialGradient>
        {glow && (
          <radialGradient id="mp-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(245,243,206,0.35)" />
            <stop offset="60%" stopColor="rgba(245,243,206,0.08)" />
            <stop offset="100%" stopColor="rgba(245,243,206,0)" />
          </radialGradient>
        )}
        <filter id="mp-soft" x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur stdDeviation="0.4" />
        </filter>
      </defs>

      {glow && <circle cx={cx} cy={cy} r={r + 6} fill="url(#mp-glow)" />}

      {/* Always render the dark base disc */}
      <circle cx={cx} cy={cy} r={r} fill="url(#mp-shadow)" />

      {/* Lit disc on top, only when there's any illumination at all */}
      {!nearNew && (
        <circle cx={cx} cy={cy} r={r} fill="url(#mp-lit)" />
      )}

      {/* Shadow overlay (skip near full where there is none, and near new where the disc is already dark) */}
      {!nearNew && !nearFull && (
        <path d={shadowPath(phase, r, cx, cy)} fill="url(#mp-shadow)" filter="url(#mp-soft)" />
      )}

      {/* Subtle outer ring */}
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke="rgba(245,243,206,0.12)"
        strokeWidth="0.5"
      />
    </svg>
  );
}

export const MoonDisplay = memo(MoonDisplayInner);
