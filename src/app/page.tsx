"use client";

import { useEffect, useMemo, useState } from "react";
import { MoonDisplay } from "@/components/MoonDisplay";
import { IlluminationMeter } from "@/components/IlluminationMeter";
import { FullMoonCountdown } from "@/components/FullMoonCountdown";
import { useMoonDays } from "@/hooks/useMoonDays";
import { useMounted } from "@/hooks/useMounted";
import {
  activityHint,
  DAY_MS,
  nextFullMoon,
  SYNODIC_MONTH,
  todayIso,
} from "@/lib/moon";

const timeFmt = new Intl.DateTimeFormat(undefined, {
  hour: "numeric",
  minute: "2-digit",
});

export default function HomePage() {
  const mounted = useMounted();
  const today = useMemo(() => todayIso(), []);
  const dates = useMemo(() => [new Date()], []);
  const { days, loading } = useMoonDays({
    scope: "day",
    id: today,
    dates,
    ttlMs: DAY_MS,
  });
  const data = days[0] ?? null;
  const phase01 = data ? data.age / SYNODIC_MONTH : 0;

  const [nextFull, setNextFull] = useState<Date | null>(null);
  // Deferred to avoid running the SunCalc walk server-side and to keep the
  // rendered countdown tied to the client's own clock, not the edge's.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNextFull(nextFullMoon(new Date()));
  }, []);

  // Until the component has mounted client-side, render a stable shell so
  // SSR output exactly matches the first client render (hydration-safe).
  if (!mounted) return <HomeSkeleton />;

  return (
    <section className="flex-1 flex flex-col items-center justify-center px-6 pt-12 pb-8 gap-8 fade-in">
      <header className="flex flex-col items-center gap-1">
        <span className="text-xs uppercase tracking-[0.25em] text-muted">Tonight</span>
        <h1 className="text-2xl font-medium text-foreground">
          {data?.phase ?? (loading ? "…" : "—")}
        </h1>
      </header>

      <div className="moon-float">
        <MoonDisplay phase={phase01} illumination={data?.illumination ?? 0} size={260} />
      </div>

      <p className="text-center text-sm text-muted max-w-xs italic">
        {data ? activityHint(data.illumination) : "Looking up tonight's sky…"}
      </p>

      {data && <IlluminationMeter value={data.illumination} />}

      {(data?.moonrise || data?.moonset) && (
        <div className="flex gap-6 text-sm text-muted">
          {data.moonrise && (
            <div>
              <span className="uppercase tracking-widest text-[10px] mr-2">Rise</span>
              <span className="text-foreground/80">{timeFmt.format(new Date(data.moonrise))}</span>
            </div>
          )}
          {data.moonset && (
            <div>
              <span className="uppercase tracking-widest text-[10px] mr-2">Set</span>
              <span className="text-foreground/80">{timeFmt.format(new Date(data.moonset))}</span>
            </div>
          )}
        </div>
      )}

      {nextFull && <FullMoonCountdown next={nextFull} />}

      {data?.source === "suncalc" && (
        <p className="text-[10px] text-muted/70 mt-2">offline · local estimate</p>
      )}
    </section>
  );
}

function HomeSkeleton() {
  return (
    <section className="flex-1 flex flex-col items-center justify-center px-6 pt-12 pb-8 gap-8">
      <div className="h-3 w-16 rounded bg-white/5" />
      <div className="w-[260px] h-[260px] rounded-full bg-white/[0.03]" />
      <div className="h-3 w-48 rounded bg-white/5" />
      <div className="h-16 w-full max-w-sm rounded-2xl bg-white/[0.02]" />
    </section>
  );
}
