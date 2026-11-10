export function siteUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "") ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
  return raw.replace(/\/$/, "");
}

export const absoluteUrl = (p: string) => (/^https?:\/\//.test(p) ? p : `${siteUrl()}${p.startsWith("/") ? p : `/${p}`}`);

/**
 * Search engines are only invited in once the real domain is configured (NEXT_PUBLIC_SITE_URL)
 * and this is the production deployment. Previews and *.vercel.app addresses stay out of Google
 * so placeholder content is never indexed.
 */
export function isLiveSite(): boolean {
  const url = process.env.NEXT_PUBLIC_SITE_URL;
  if (!url || /\.vercel\.app/i.test(url)) return false;
  // VERCEL_ENV on the server; NEXT_PUBLIC_VERCEL_ENV (exposed automatically by Vercel) in the browser
  const env = process.env.VERCEL_ENV || process.env.NEXT_PUBLIC_VERCEL_ENV;
  return env ? env === "production" : true;
}

/**
 * Placeholders ("[EDITABLE PLACEHOLDER]" content, "[00] years trading", example videos…) are shown on
 * previews and localhost so the owner can see what to fill in, and hidden on every production deployment.
 * To show a prospect the demo with its placeholders, use a Preview deployment.
 */
export function hidePlaceholders(): boolean {
  // Any Vercel production deployment hides placeholders, even before the real domain is set (U6).
  // VERCEL_ENV on the server; NEXT_PUBLIC_VERCEL_ENV (set automatically by Vercel) in the browser.
  if ((process.env.VERCEL_ENV || process.env.NEXT_PUBLIC_VERCEL_ENV) === "production") return true;
  return isLiveSite() && !/\/\/(localhost|127\.0\.0\.1)(:|\/|$)/i.test(process.env.NEXT_PUBLIC_SITE_URL ?? "");
}
