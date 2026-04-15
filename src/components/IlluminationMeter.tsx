interface Props {
  value: number; // 0..1
}

export function IlluminationMeter({ value }: Props) {
  const pct = Math.round(Math.max(0, Math.min(1, value)) * 100);
  return (
    <div className="w-full max-w-[14rem]">
      <div className="flex justify-between text-xs uppercase tracking-widest text-muted">
        <span>Illumination</span>
        <span className="text-foreground/80">{pct}%</span>
      </div>
      <div className="mt-2 h-1.5 rounded-full bg-white/5 overflow-hidden">
        <div
          className="h-full rounded-full bg-glow/80"
          style={{ width: `${pct}%`, transition: "width 600ms ease" }}
        />
      </div>
    </div>
  );
}
