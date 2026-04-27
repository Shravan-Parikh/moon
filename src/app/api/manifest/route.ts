import { todayPhaseSlug } from "@/lib/phase-icon";
import { isoDate } from "@/lib/moon";

// Dynamic so the date embedded in icon URLs is always today's.
export const dynamic = "force-dynamic";

export async function GET() {
  const slug = todayPhaseSlug();

  // Embedding today's date in the icon URL is the key mechanism:
  // Chrome only re-downloads a PWA icon when the URL changes.
  // A new ?d= value each day guarantees Chrome re-fetches and updates
  // the home screen icon within ~24 h of visiting the app.
  const d = isoDate(new Date());

  const manifest = {
    name: "MoonPulse",
    short_name: "MoonPulse",
    description: "A minimal moon-phase tracker for your home screen.",
    start_url: "/",
    display: "standalone",
    background_color: "#0b0f1a",
    theme_color: "#0b0f1a",
    orientation: "portrait",
    icons: [
      {
        // SVG: browser tab + any modern context that accepts SVG manifests.
        src: `/icons/${slug}.svg?d=${d}`,
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        // PNG 192: home screen icon (most Android Chrome installs use this).
        src: `/api/phase-icon?s=192&d=${d}`,
        sizes: "192x192",
        type: "image/png",
        purpose: "any maskable",
      },
      {
        // PNG 512: splash screen / high-DPI.
        src: `/api/phase-icon?s=512&d=${d}`,
        sizes: "512x512",
        type: "image/png",
        purpose: "any maskable",
      },
    ],
  };

  return Response.json(manifest, {
    headers: {
      // Short CDN TTL so icon URLs refresh within an hour of a phase change.
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
