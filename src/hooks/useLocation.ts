"use client";

import { useEffect, useState } from "react";

export interface LocationState {
  lat: number;
  lon: number;
  source: "geolocation" | "fallback";
}

// San Francisco — sensible default if permission denied / unavailable
const FALLBACK: LocationState = { lat: 37.7749, lon: -122.4194, source: "fallback" };

export function useLocation(): LocationState {
  const [loc, setLoc] = useState<LocationState>(FALLBACK);

  useEffect(() => {
    if (typeof window === "undefined" || !navigator.geolocation) return;
    let cancelled = false;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (cancelled) return;
        setLoc({
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
          source: "geolocation",
        });
      },
      () => {
        // permission denied or error — keep fallback
      },
      { enableHighAccuracy: false, maximumAge: 1000 * 60 * 60, timeout: 5000 },
    );
    return () => {
      cancelled = true;
    };
  }, []);

  return loc;
}
