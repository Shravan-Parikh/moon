import SunCalc from "suncalc";
import type { PhaseName } from "./moon";

const SLUG_MAP: Record<PhaseName, string> = {
  "New Moon": "new-moon",
  "Waxing Crescent": "waxing-crescent",
  "First Quarter": "first-quarter",
  "Waxing Gibbous": "waxing-gibbous",
  "Full Moon": "full-moon",
  "Waning Gibbous": "waning-gibbous",
  "Last Quarter": "last-quarter",
  "Waning Crescent": "waning-crescent",
};

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

/** Returns the icon filename slug for today's moon phase (e.g. "waxing-crescent"). */
export function todayPhaseSlug(): string {
  const ill = SunCalc.getMoonIllumination(new Date());
  const name = phaseFromFraction(ill.phase);
  return SLUG_MAP[name];
}
