// A small in-memory limiter that keeps one visitor from draining the free
// tier. It's per server instance, so on serverless hosts it's best-effort.
const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS = 20;

const hits = new Map<string, number[]>();

export function isRateLimited(key: string) {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < WINDOW_MS);

  if (recent.length >= MAX_REQUESTS) {
    hits.set(key, recent);
    return true;
  }

  recent.push(now);
  hits.set(key, recent);

  // Drop stale visitors now and then so the map can't grow forever.
  if (hits.size > 5000) {
    for (const [k, times] of hits) {
      if (times.every((t) => now - t >= WINDOW_MS)) hits.delete(k);
    }
  }
  return false;
}
