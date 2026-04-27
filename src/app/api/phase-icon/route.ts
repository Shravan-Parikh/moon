import { readFileSync } from "fs";
import { join } from "path";
import { todayPhaseSlug } from "@/lib/phase-icon";

// Node.js runtime so we can read pre-generated PNGs from public/icons/.
export const runtime = "nodejs";

// No cache on this route — the ?d= date param in the URL provides natural
// cache-busting, and different dates must resolve to different phases.
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const size = searchParams.get("s") === "512" ? "512" : "192";
  const slug = todayPhaseSlug();

  try {
    const iconPath = join(
      process.cwd(),
      "public",
      "icons",
      `${slug}-${size}.png`,
    );
    const data = readFileSync(iconPath);
    return new Response(data, {
      headers: {
        "Content-Type": "image/png",
        // Serve the icon for 25h so it survives a single day but re-fetches on the next.
        "Cache-Control": "public, max-age=90000, s-maxage=90000",
      },
    });
  } catch {
    return new Response("Icon not found", { status: 404 });
  }
}
