import { todayPhaseSlug } from "@/lib/phase-icon";

// Revalidate once per hour — Chrome re-reads the manifest periodically
// for installed PWAs, so the icon will update within a day.
export const revalidate = 3600;

export async function GET() {
  const slug = todayPhaseSlug();

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
        src: `/icons/${slug}.svg`,
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: `/icons/${slug}-192.png`,
        sizes: "192x192",
        type: "image/png",
        purpose: "any maskable",
      },
      {
        src: `/icons/${slug}-512.png`,
        sizes: "512x512",
        type: "image/png",
        purpose: "any maskable",
      },
    ],
  };

  return Response.json(manifest, {
    headers: {
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
