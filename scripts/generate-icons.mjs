#!/usr/bin/env node
/**
 * Generates 8 moon-phase app icons (SVG → PNG via macOS sips).
 * Run: node scripts/generate-icons.mjs
 */
import { writeFileSync, mkdirSync, existsSync } from "fs";
import { execSync } from "child_process";
import { join } from "path";

const OUT = join(import.meta.dirname, "..", "public", "icons");
if (!existsSync(OUT)) mkdirSync(OUT, { recursive: true });

const PHASES = [
  { name: "new-moon",         phase01: 0.0,   illumination: 0.0  },
  { name: "waxing-crescent",  phase01: 0.125, illumination: 0.15 },
  { name: "first-quarter",    phase01: 0.25,  illumination: 0.5  },
  { name: "waxing-gibbous",   phase01: 0.375, illumination: 0.85 },
  { name: "full-moon",        phase01: 0.5,   illumination: 1.0  },
  { name: "waning-gibbous",   phase01: 0.625, illumination: 0.85 },
  { name: "last-quarter",     phase01: 0.75,  illumination: 0.5  },
  { name: "waning-crescent",  phase01: 0.875, illumination: 0.15 },
];

// ── Shadow path (mirrors MoonDisplay.tsx) ────────────────────────────
function shadowPath(phase01, r, cx, cy) {
  const k = Math.cos(2 * Math.PI * phase01);
  const rx = Math.max(Math.abs(k) * r, 0.0001);
  const top = `${cx} ${cy - r}`;
  const bot = `${cx} ${cy + r}`;
  const waxing = phase01 < 0.5;
  const outerSweep = waxing ? 0 : 1;
  let innerSweep;
  if (waxing) {
    innerSweep = k > 0 ? 0 : 1;
  } else {
    innerSweep = k > 0 ? 1 : 0;
  }
  return `M ${top} A ${r} ${r} 0 0 ${outerSweep} ${bot} A ${rx} ${r} 0 0 ${innerSweep} ${top} Z`;
}

// ── SVG builder ──────────────────────────────────────────────────────
function buildSvg({ phase01, illumination }) {
  const size = 512;
  const r = 160;
  const cx = size / 2;
  const cy = size / 2;
  const nearNew = illumination < 0.01;
  const nearFull = illumination > 0.99;

  const litCircle = nearNew
    ? ""
    : `<circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#lit)"/>`;

  const shadow =
    nearNew || nearFull
      ? ""
      : `<path d="${shadowPath(phase01, r, cx, cy)}" fill="url(#shadow)" filter="url(#soft)"/>`;

  const darkDisc = nearNew
    ? `<circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#shadow)"/>`
    : "";

  // Subtle glow behind the moon
  const glow = nearNew
    ? ""
    : `<circle cx="${cx}" cy="${cy}" r="${r + 40}" fill="url(#glow)"/>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}">
  <defs>
    <radialGradient id="bg" cx="50%" cy="50%" r="60%">
      <stop offset="0%" stop-color="#1a2030"/>
      <stop offset="100%" stop-color="#0b0f1a"/>
    </radialGradient>
    <radialGradient id="lit" cx="35%" cy="30%" r="70%">
      <stop offset="0%" stop-color="#fffdf0"/>
      <stop offset="60%" stop-color="#f5f3ce"/>
      <stop offset="100%" stop-color="#cfcb95"/>
    </radialGradient>
    <radialGradient id="shadow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#1a2030"/>
      <stop offset="100%" stop-color="#0b0f1a"/>
    </radialGradient>
    <radialGradient id="glow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="rgba(245,243,206,0.25)"/>
      <stop offset="100%" stop-color="rgba(245,243,206,0)"/>
    </radialGradient>
    <filter id="soft" x="-5%" y="-5%" width="110%" height="110%">
      <feGaussianBlur stdDeviation="1.5"/>
    </filter>
  </defs>
  <rect width="${size}" height="${size}" rx="96" fill="url(#bg)"/>
  ${glow}
  ${litCircle}
  ${darkDisc}
  ${shadow}
  <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="rgba(245,243,206,0.12)" stroke-width="2"/>
</svg>`;
}

// ── Generate ─────────────────────────────────────────────────────────
const SIZES = [192, 512];

for (const p of PHASES) {
  const svg = buildSvg(p);
  const svgPath = join(OUT, `${p.name}.svg`);
  writeFileSync(svgPath, svg);
  console.log(`  ✓ ${p.name}.svg`);

  for (const s of SIZES) {
    const pngPath = join(OUT, `${p.name}-${s}.png`);
    try {
      execSync(
        `sips -s format png --resampleHeightWidth ${s} ${s} "${svgPath}" --out "${pngPath}"`,
        { stdio: "pipe" },
      );
      console.log(`  ✓ ${p.name}-${s}.png`);
    } catch (e) {
      console.error(`  ✗ ${p.name}-${s}.png — sips failed: ${e.message}`);
    }
  }
}

console.log(`\nDone. ${PHASES.length} phases × ${SIZES.length + 1} formats = ${PHASES.length * (SIZES.length + 1)} files in public/icons/`);
