"use client";

import { useMemo, useState } from "react";
import { MoonCalendar } from "@/components/MoonCalendar";
import { useMoonDays } from "@/hooks/useMoonDays";
import { datesForMonth, todayIso, type MoonData } from "@/lib/moon";

const MONTH_TTL_MS = 1000 * 60 * 60 * 6;

const monthFmt = new Intl.DateTimeFormat(undefined, {
  month: "long",
  year: "numeric",
});

const longDateFmt = new Intl.DateTimeFormat(undefined, {
  weekday: "long",
  month: "long",
  day: "numeric",
});

function monthKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export default function CalendarPage() {
  const [anchor, setAnchor] = useState(() => new Date());
  const month = monthKey(anchor);

  return (
    <section className="flex-1 flex flex-col px-4 pt-12 pb-8 gap-6 fade-in">
      <header className="flex items-center justify-between max-w-md mx-auto w-full">
        <button
          onClick={() => setAnchor((a) => new Date(a.getFullYear(), a.getMonth() - 1, 1, 12))}
          className="text-muted hover:text-foreground text-lg px-2"
          aria-label="Previous month"
        >
          ‹
        </button>
        <div className="flex flex-col items-center">
          <span className="text-xs uppercase tracking-[0.25em] text-muted">Calendar</span>
          <h1 className="text-xl font-medium text-foreground">{monthFmt.format(anchor)}</h1>
        </div>
        <button
          onClick={() => setAnchor((a) => new Date(a.getFullYear(), a.getMonth() + 1, 1, 12))}
          className="text-muted hover:text-foreground text-lg px-2"
          aria-label="Next month"
        >
          ›
        </button>
      </header>

      {/* Remount on month change so the hook can read fresh cache in its lazy initializer. */}
      <CalendarMonth key={month} anchor={anchor} month={month} />
    </section>
  );
}

function CalendarMonth({ anchor, month }: { anchor: Date; month: string }) {
  const dates = useMemo(() => datesForMonth(anchor), [anchor]);
  const today = useMemo(() => todayIso(), []);
  const { days, loading } = useMoonDays({
    scope: "month",
    id: month,
    dates,
    ttlMs: MONTH_TTL_MS,
    localFallback: true,
  });

  return (
    <>
      <MoonCalendar days={days} todayIso={today} />
      <div className="text-center text-xs text-muted">
        {loading ? "Loading…" : "Scroll horizontally · tap to focus"}
      </div>
      <FullMoonsThisMonth days={days} />
    </>
  );
}

function FullMoonsThisMonth({ days }: { days: MoonData[] }) {
  const fulls = days.filter((d) => d.phase === "Full Moon");
  if (fulls.length === 0) return null;
  return (
    <div className="max-w-md mx-auto w-full rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-md px-5 py-4">
      <div className="text-xs uppercase tracking-widest text-muted mb-2">
        Full Moon{fulls.length > 1 ? "s" : ""} this month
      </div>
      <ul className="space-y-1">
        {fulls.map((d) => (
          <li key={d.date} className="text-foreground text-sm">
            {longDateFmt.format(new Date(d.date + "T12:00:00"))}
          </li>
        ))}
      </ul>
    </div>
  );
}
