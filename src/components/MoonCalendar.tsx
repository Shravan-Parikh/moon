"use client";

import { useEffect, useRef } from "react";
import { MoonDisplay } from "./MoonDisplay";
import { SYNODIC_MONTH, type MoonData } from "@/lib/moon";

interface Props {
  days: MoonData[];
  todayIso: string;
}

export function MoonCalendar({ days, todayIso }: Props) {
  const todayRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    todayRef.current?.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
  }, [todayIso]);

  return (
    <div className="no-scrollbar overflow-x-auto -mx-4 px-4 snap-x snap-mandatory">
      <div className="flex gap-3 py-2">
        {days.map((d) => {
          const isToday = d.date === todayIso;
          const isFull = d.phase === "Full Moon";
          const isNew = d.phase === "New Moon";
          const dayNum = Number(d.date.slice(8, 10));
          return (
            <div
              key={d.date}
              ref={isToday ? todayRef : undefined}
              className={[
                "snap-center shrink-0 w-20 rounded-2xl border px-2 py-3 flex flex-col items-center gap-2 transition",
                isToday
                  ? "border-glow/40 bg-white/[0.04]"
                  : "border-white/5 bg-white/[0.015]",
              ].join(" ")}
            >
              <div
                className={[
                  "text-xs uppercase tracking-widest",
                  isToday ? "text-glow" : "text-muted",
                ].join(" ")}
              >
                {dayNum}
              </div>
              <MoonDisplay
                phase={d.age / SYNODIC_MONTH}
                illumination={d.illumination}
                size={48}
                glow={isFull}
              />
              <div className="text-[10px] text-center text-muted leading-tight">
                {isFull ? "Full" : isNew ? "New" : `${Math.round(d.illumination * 100)}%`}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
