const hits = new Map<string, { count: number; resetAt: number }>();

// Prevent unbounded memory growth from stale entries.
function cleanup(now: number) {
  if (hits.size < 5000) return;
  for (const [key, entry] of hits) {
    if (entry.resetAt < now) hits.delete(key);
  }
}

/**
 * Simple in-memory sliding-window rate limiter, keyed per process.
 * Good enough for a single-instance deployment; on a multi-instance/serverless
 * production deployment (e.g. Vercel with multiple concurrent lambdas), each
 * instance has its own counter, so this should be swapped for a shared store
 * (e.g. Upstash Redis) before relying on it at scale.
 */
export function checkRateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  cleanup(now);

  const entry = hits.get(key);
  if (!entry || entry.resetAt < now) {
    hits.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (entry.count >= limit) return false;
  entry.count += 1;
  return true;
}

export function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}
