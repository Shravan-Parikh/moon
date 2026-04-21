"use client";

import { useEffect } from "react";
import SunCalc from "suncalc";

const SLUG_MAP = [
  [0.0181, "new-moon"],
  [0.2319, "waxing-crescent"],
  [0.2681, "first-quarter"],
  [0.4819, "waxing-gibbous"],
  [0.5181, "full-moon"],
  [0.7319, "waning-gibbous"],
  [0.7681, "last-quarter"],
  [0.9819, "waning-crescent"],
] as const;

function todaySlug(): string {
  const p = SunCalc.getMoonIllumination(new Date()).phase;
  for (const [threshold, slug] of SLUG_MAP) {
    if (p < threshold) return slug;
  }
  return "new-moon";
}

/**
 * Swaps the browser-tab favicon and apple-touch-icon to match tonight's
 * moon phase. Runs once on mount.
 */
export function DynamicFavicon() {
  useEffect(() => {
    const slug = todaySlug();

    // Update (or create) the primary favicon
    let link = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      document.head.appendChild(link);
    }
    link.type = "image/svg+xml";
    link.href = `/icons/${slug}.svg`;

    // Update the apple-touch-icon
    let apple = document.querySelector<HTMLLinkElement>(
      'link[rel="apple-touch-icon"]',
    );
    if (!apple) {
      apple = document.createElement("link");
      apple.rel = "apple-touch-icon";
      document.head.appendChild(apple);
    }
    apple.href = `/icons/${slug}-192.png`;
  }, []);

  return null;
}
