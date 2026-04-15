import SunCalc from "suncalc";

export type PhaseName =
  | "New Moon"
  | "Waxing Crescent"
  | "First Quarter"
  | "Waxing Gibbous"
  | "Full Moon"
  | "Waning Gibbous"
  | "Last Quarter"
  | "Waning Crescent";

export interface MoonData {
  date: string; // ISO yyyy-mm-dd
  phase: PhaseName;
  /** 0..1 */
  illumination: number;
  /** moon "age" in days within the lunar cycle (0..29.53), used by the SVG renderer */
  age: number;
  moonrise?: string; // ISO time string or undefined
  moonset?: string;
  /** Whether data came from network or local fallback */
  source: "farmsense" | "suncalc";
}

export const SYNODIC_MONTH = 29.530588853;
export const DAY_MS = 86400000;

/** Map SunCalc.phase (0..1) to a discrete name. Boundaries match conventional astronomy. */
// SunCalc phase convention: 0 = new, 0.25 = first quarter, 0.5 = full, 0.75 = last quarter.
// The narrow bands around each cardinal phase are ~±6 hours wide.
function phaseFromFraction(p: number): PhaseName {
  if (p < 0.0181 || p >= 0.9819) return "New Moon";
  if (p < 0.2319) return "Waxing Crescent";
  if (p < 0.2681) return "First Quarter";
  if (p < 0.4819) return "Waxing Gibbous";
  if (p < 0.5181) return "Full Moon";
  if (p < 0.7319) return "Waning Gibbous";
  if (p < 0.7681) return "Last Quarter";
  return "Waning Crescent";
}

const PHASE_ALIASES: Record<string, PhaseName> = {
  "New Moon": "New Moon",
  "Waxing Crescent": "Waxing Crescent",
  "1st Quarter": "First Quarter",
  "First Quarter": "First Quarter",
  "Waxing Gibbous": "Waxing Gibbous",
  "Full Moon": "Full Moon",
  "Waning Gibbous": "Waning Gibbous",
  "3rd Quarter": "Last Quarter",
  "Last Quarter": "Last Quarter",
  "Waning Crescent": "Waning Crescent",
};

function normalizePhaseName(raw: string): PhaseName {
  return PHASE_ALIASES[raw.trim()] ?? "New Moon";
}

function toUnixSeconds(d: Date): number {
  // UTC noon anchors phase data to a single day regardless of viewer timezone.
  const utc = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 12, 0, 0);
  return Math.floor(utc / 1000);
}

export function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function todayIso(): string {
  return isoDate(new Date());
}

function getMoonRiseSet(
  date: Date,
  lat?: number,
  lon?: number,
): { moonrise?: string; moonset?: string } {
  if (typeof lat !== "number" || typeof lon !== "number") return {};
  const times = SunCalc.getMoonTimes(date, lat, lon, false);
  return {
    moonrise: times.rise ? times.rise.toISOString() : undefined,
    moonset: times.set ? times.set.toISOString() : undefined,
  };
}

export function computeMoonLocal(date: Date, lat?: number, lon?: number): MoonData {
  const ill = SunCalc.getMoonIllumination(date);
  return {
    date: isoDate(date),
    phase: phaseFromFraction(ill.phase),
    illumination: ill.fraction,
    age: ill.phase * SYNODIC_MONTH,
    ...getMoonRiseSet(date, lat, lon),
    source: "suncalc",
  };
}

interface FarmSenseEntry {
  Error: number;
  ErrorMsg?: string;
  TargetDate: string;
  Phase: string;
  Illumination: number;
  Age: number;
}

export async function fetchMoonDays(
  dates: Date[],
  opts?: { lat?: number; lon?: number; signal?: AbortSignal },
): Promise<MoonData[]> {
  const params = dates.map((d) => `d=${toUnixSeconds(d)}`).join("&");
  const url = `https://api.farmsense.net/v1/moonphases/?${params}`;

  try {
    const res = await fetch(url, { signal: opts?.signal });
    if (!res.ok) throw new Error(`FarmSense ${res.status}`);
    const data = (await res.json()) as FarmSenseEntry[];
    if (!Array.isArray(data) || data.length !== dates.length) {
      throw new Error("FarmSense: unexpected payload");
    }
    return data.map((entry, i) => {
      if (entry.Error !== 0) throw new Error(entry.ErrorMsg ?? "FarmSense error");
      const d = dates[i];
      return {
        date: isoDate(d),
        phase: normalizePhaseName(entry.Phase),
        illumination: entry.Illumination,
        age: entry.Age,
        ...getMoonRiseSet(d, opts?.lat, opts?.lon),
        source: "farmsense" as const,
      };
    });
  } catch (err) {
    if ((err as { name?: string })?.name === "AbortError") throw err;
    return dates.map((d) => computeMoonLocal(d, opts?.lat, opts?.lon));
  }
}

/** Find the next full moon strictly after `from` using SunCalc. */
export function nextFullMoon(from: Date = new Date()): Date {
  const start = from.getTime();
  let prevPhase = SunCalc.getMoonIllumination(new Date(start)).phase;
  for (let h = 1; h <= 24 * 35; h++) {
    const t = new Date(start + h * 3600 * 1000);
    const p = SunCalc.getMoonIllumination(t).phase;
    if (prevPhase < 0.5 && p >= 0.5) {
      let lo = start + (h - 1) * 3600 * 1000;
      let hi = start + h * 3600 * 1000;
      while (hi - lo > 60 * 1000) {
        const mid = (lo + hi) / 2;
        if (SunCalc.getMoonIllumination(new Date(mid)).phase < 0.5) lo = mid;
        else hi = mid;
      }
      return new Date(hi);
    }
    prevPhase = p;
  }
  return new Date(start + SYNODIC_MONTH * DAY_MS);
}

export function daysUntil(date: Date, from: Date = new Date()): number {
  return Math.max(0, Math.ceil((date.getTime() - from.getTime()) / DAY_MS));
}

export function activityHint(illumination: number): string {
  if (illumination >= 0.8) return "Bright moonlight — great for night hikes.";
  if (illumination >= 0.4) return "Moderate visibility tonight.";
  if (illumination >= 0.15) return "Dim moonlight — bring a torch.";
  return "Dark sky — ideal for stargazing.";
}

export function datesForMonth(anchor: Date = new Date()): Date[] {
  const year = anchor.getFullYear();
  const month = anchor.getMonth();
  const days = new Date(year, month + 1, 0).getDate();
  const out: Date[] = [];
  for (let d = 1; d <= days; d++) out.push(new Date(year, month, d, 12));
  return out;
}
