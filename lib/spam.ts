import "server-only";

/** Cloudflare Turnstile. Skipped (returns true) when TURNSTILE_SECRET_KEY isn't set. */
export async function verifyTurnstile(token: string | undefined, ip?: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true;
  if (!token) return false;
  try {
    const body = new URLSearchParams({ secret, response: token });
    if (ip) body.set("remoteip", ip);
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", body });
    const json = (await res.json()) as { success?: boolean };
    return Boolean(json.success);
  } catch {
    return false;
  }
}

/** Best-effort in-memory rate limit per key (per server instance). */
const hits = new Map<string, number[]>();
export function rateLimited(key: string, limit = 20, windowMs = 10 * 60 * 1000): boolean {
  if (process.env.DISABLE_RATE_LIMIT === "1") return false;
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  recent.push(now);
  hits.set(key, recent);
  return recent.length > limit;
}
