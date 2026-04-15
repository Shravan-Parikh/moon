"use client";

import { useEffect, useState } from "react";
import {
  cacheGet,
  cacheGetStale,
  cacheKey,
  cacheSet,
  type CacheScope,
} from "@/lib/cache";
import { computeMoonLocal, fetchMoonDays, type MoonData } from "@/lib/moon";
import { useLocation } from "./useLocation";

interface Args {
  scope: CacheScope;
  id: string;
  dates: Date[];
  ttlMs: number;
  /** Fall back to a local SunCalc array while the fetch is in flight. */
  localFallback?: boolean;
}

export interface MoonDaysState {
  days: MoonData[];
  loading: boolean;
}

/**
 * Parent must remount this hook's owner when `id` changes (via React `key`)
 * so the lazy initializer re-reads fresh cache without a setState-in-effect.
 */
export function useMoonDays({ scope, id, dates, ttlMs, localFallback = false }: Args): MoonDaysState {
  const loc = useLocation();
  const key = cacheKey(scope, id);

  const initial = useState(() => {
    const fresh = cacheGet<MoonData[]>(key, ttlMs);
    if (fresh) return { days: fresh, fresh: true };
    const stale = cacheGetStale<MoonData[]>(key);
    if (stale) return { days: stale, fresh: false };
    return {
      days: localFallback ? dates.map((d) => computeMoonLocal(d)) : [],
      fresh: false,
    };
  })[0];

  const [days, setDays] = useState<MoonData[]>(initial.days);
  const [loading, setLoading] = useState(!initial.fresh);

  useEffect(() => {
    if (initial.fresh) return;
    const ctrl = new AbortController();
    fetchMoonDays(dates, { lat: loc.lat, lon: loc.lon, signal: ctrl.signal })
      .then((res) => {
        cacheSet(key, res);
        setDays(res);
      })
      .catch(() => {
        /* fetcher already falls back to SunCalc */
      })
      .finally(() => setLoading(false));
    return () => ctrl.abort();
  }, [key, loc.lat, loc.lon, initial.fresh, dates]);

  return { days, loading };
}
