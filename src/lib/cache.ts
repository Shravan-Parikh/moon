const PREFIX = "moonpulse:";
const MAX_ENTRIES = 24;

export type CacheScope = "day" | "month";

export function cacheKey(scope: CacheScope, id: string): string {
  return `${scope}:${id}`;
}

interface Entry<T> {
  ts: number;
  data: T;
}

function safeStorage(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function prune(store: Storage): void {
  const keys: string[] = [];
  for (let i = 0; i < store.length; i++) {
    const k = store.key(i);
    if (k && k.startsWith(PREFIX)) keys.push(k);
  }
  if (keys.length <= MAX_ENTRIES) return;
  const scored = keys.map((k) => {
    let ts = 0;
    try {
      ts = JSON.parse(store.getItem(k) ?? "{}")?.ts ?? 0;
    } catch {
      /* ignore */
    }
    return { k, ts };
  });
  scored.sort((a, b) => a.ts - b.ts);
  for (let i = 0; i < scored.length - MAX_ENTRIES; i++) {
    store.removeItem(scored[i].k);
  }
}

export function cacheGet<T>(key: string, maxAgeMs: number): T | null {
  const store = safeStorage();
  if (!store) return null;
  try {
    const raw = store.getItem(PREFIX + key);
    if (!raw) return null;
    const entry = JSON.parse(raw) as Entry<T>;
    if (Date.now() - entry.ts > maxAgeMs) return null;
    return entry.data;
  } catch {
    return null;
  }
}

export function cacheGetStale<T>(key: string): T | null {
  const store = safeStorage();
  if (!store) return null;
  try {
    const raw = store.getItem(PREFIX + key);
    if (!raw) return null;
    return (JSON.parse(raw) as Entry<T>).data;
  } catch {
    return null;
  }
}

export function cacheSet<T>(key: string, data: T): void {
  const store = safeStorage();
  if (!store) return;
  try {
    store.setItem(PREFIX + key, JSON.stringify({ ts: Date.now(), data } satisfies Entry<T>));
    prune(store);
  } catch {
    /* quota or disabled */
  }
}
