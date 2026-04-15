import { daysUntil } from "@/lib/moon";

interface Props {
  next: Date;
}

const fmt = new Intl.DateTimeFormat(undefined, {
  weekday: "short",
  month: "short",
  day: "numeric",
});

export function FullMoonCountdown({ next }: Props) {
  const days = daysUntil(next);
  const label =
    days === 0 ? "Tonight" : days === 1 ? "Tomorrow" : `In ${days} days`;

  return (
    <div className="rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-md px-5 py-4 w-full max-w-sm">
      <div className="text-xs uppercase tracking-widest text-muted">
        Next Full Moon
      </div>
      <div className="mt-1 flex items-baseline justify-between gap-3">
        <div className="text-2xl font-medium text-foreground">{label}</div>
        <div className="text-sm text-muted">{fmt.format(next)}</div>
      </div>
    </div>
  );
}
