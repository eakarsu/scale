// In-memory per-IP quota enforcement.
// PRODUCT-DECISION: Persistent per-API-key quota would require schema changes
// (TOO-RISKY in this pass). We use an in-memory token-bucket per IP scoped to a
// rolling window. Resets on process restart, which is acceptable for a dev/demo
// deployment of an observability tool. Suitable for single-instance Next.js dev.

interface Bucket {
  count: number;
  windowStart: number;
}

// PRODUCT-DECISION: defaults — 60 requests / 60s per IP.
const WINDOW_MS = parseInt(process.env.QUOTA_WINDOW_MS || "60000", 10);
const LIMIT = parseInt(process.env.QUOTA_LIMIT || "60", 10);

const buckets = new Map<string, Bucket>();

export interface QuotaResult {
  allowed: boolean;
  remaining: number;
  limit: number;
  resetMs: number;
}

export function checkQuota(ip: string): QuotaResult {
  const now = Date.now();
  let b = buckets.get(ip);
  if (!b || now - b.windowStart >= WINDOW_MS) {
    b = { count: 0, windowStart: now };
    buckets.set(ip, b);
  }
  b.count += 1;
  const allowed = b.count <= LIMIT;
  const remaining = Math.max(0, LIMIT - b.count);
  const resetMs = WINDOW_MS - (now - b.windowStart);
  return { allowed, remaining, limit: LIMIT, resetMs };
}

export function quotaConfig() {
  return { windowMs: WINDOW_MS, limit: LIMIT };
}
