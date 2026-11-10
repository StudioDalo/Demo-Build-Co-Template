/**
 * Where is this code running? Pure (no Next.js imports), so next.config.ts, instrumentation.ts,
 * server code and tests can all use it.
 */
type Env = Record<string, string | undefined>;

/** A real production deployment: Vercel production, or `next start` anywhere that isn't Vercel. */
export function isProductionRuntime(env: Env = process.env): boolean {
  if (env.VERCEL_ENV) return env.VERCEL_ENV === "production";
  return env.NODE_ENV === "production" && !env.VERCEL;
}

/**
 * ALLOW_TEST_FALLBACKS=1 lets automated tests run a production build locally with the file lead store,
 * the email outbox and a warning-only startup check. It is ignored on Vercel production.
 */
export function testFallbacksAllowed(env: Env = process.env): boolean {
  return env.ALLOW_TEST_FALLBACKS === "1" && env.VERCEL_ENV !== "production";
}
