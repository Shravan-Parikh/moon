"use client";

import { useEffect, useState } from "react";

/**
 * Returns true only after the first client-side commit. Use to gate
 * rendering of client-only data (localStorage, geolocation, locale-dependent
 * date formatting) so SSR and the first client render stay identical.
 */
export function useMounted(): boolean {
  const [mounted, setMounted] = useState(false);
  // The single post-mount state flip is the whole point of this hook — it's
  // how we defer client-only state until after hydration.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);
  return mounted;
}
