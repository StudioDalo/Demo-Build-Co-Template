/**
 * Startup settings check. Lists every missing or unsafe setting.
 * - In production (see isProductionRuntime) any "error" stops the build on Vercel and the server at start.
 * - "warning"s are shown as a banner in /admin.
 * Pure module (no Next.js imports) so next.config.ts and instrumentation.ts can run it. Never prints values.
 */
import { config } from "../clients/active/config";
import { isWeakAdminPassword } from "./admin/password";
import { isProductionRuntime, testFallbacksAllowed } from "./runtime";

type Env = Record<string, string | undefined>;
export type SettingIssue = { key: string; level: "error" | "warning"; message: string };

const isEmail = (v: string) => /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(v);
const fromAddress = (v: string) => /<([^>]+)>/.exec(v)?.[1] ?? v.trim();

export function checkSettings(env: Env = process.env): SettingIssue[] {
  const issues: SettingIssue[] = [];
  const err = (key: string, message: string) => issues.push({ key, level: "error", message });
  const warn = (key: string, message: string) => issues.push({ key, level: "warning", message });

  // Leads
  if (!env.SUPABASE_URL) err("SUPABASE_URL", "missing: quote requests can't be saved (the form tells visitors to call instead)");
  else if (!/^https:\/\/.+/.test(env.SUPABASE_URL)) err("SUPABASE_URL", "must start with https://");
  if (!env.SUPABASE_SERVICE_ROLE_KEY) err("SUPABASE_SERVICE_ROLE_KEY", "missing: quote requests can't be saved");
  for (const k of Object.keys(env)) if (k.startsWith("NEXT_PUBLIC_") && /SERVICE_ROLE|SECRET|RESEND_API|TOKEN|PASSWORD/i.test(k)) err(k, "a secret must never use the NEXT_PUBLIC_ prefix (it would be sent to every browser)");

  // Email
  if (!env.RESEND_API_KEY) err("RESEND_API_KEY", "missing: no owner notification or customer auto-reply is sent");
  if (!env.EMAIL_FROM) err("EMAIL_FROM", 'missing: set a sender on a domain verified in Resend, e.g. "Business Name <quotes@yourdomain.example>"');
  else if (!isEmail(fromAddress(env.EMAIL_FROM))) err("EMAIL_FROM", "is not a valid email address");
  else if (/@resend\.dev$/i.test(fromAddress(env.EMAIL_FROM))) err("EMAIL_FROM", "uses Resend's test sender (onboarding@resend.dev), which only delivers to the Resend account owner");
  if (!env.LEAD_NOTIFY_EMAIL) err("LEAD_NOTIFY_EMAIL", "missing: nobody is emailed about new leads");
  else if (!isEmail(env.LEAD_NOTIFY_EMAIL)) err("LEAD_NOTIFY_EMAIL", "is not a valid email address");

  // Site address
  if (!env.NEXT_PUBLIC_SITE_URL) err("NEXT_PUBLIC_SITE_URL", "missing: set https://<real domain> (canonical links, sitemap, emails)");
  else if (!/^https:\/\//.test(env.NEXT_PUBLIC_SITE_URL)) err("NEXT_PUBLIC_SITE_URL", "must start with https://");
  else if (/\.vercel\.app/i.test(env.NEXT_PUBLIC_SITE_URL)) warn("NEXT_PUBLIC_SITE_URL", "is a vercel.app address: search engines are kept out until the real domain is set");
  else if (config.slug === "demo-builder") err("CLIENT", "the fictional demo client must not run on a real domain: set CLIENT=<your client> and rebuild");

  // Admin
  if (!env.ADMIN_PASSWORD) err("ADMIN_PASSWORD", "missing: the /admin leads dashboard is switched off");
  else if (isWeakAdminPassword(env.ADMIN_PASSWORD, config.brand.appName)) err("ADMIN_PASSWORD", "too weak: use 12+ characters, not a common password or the business name");
  if (!env.ADMIN_SESSION_SECRET) err("ADMIN_SESSION_SECRET", "missing: required in production to sign admin logins (any random string of 32+ characters)");
  else if (env.ADMIN_SESSION_SECRET.length < 32) err("ADMIN_SESSION_SECRET", "too short: use 32+ random characters");

  // Data retention job
  if (!env.CRON_SECRET) err("CRON_SECRET", "missing: the daily data clean-up job can't run (any random string of 32+ characters)");

  // Test-only switch must never reach production
  if (env.ALLOW_TEST_FALLBACKS === "1" && env.VERCEL_ENV === "production") err("ALLOW_TEST_FALLBACKS", "is for automated tests only: remove it from Vercel");

  // Non-fatal
  if (!env.NEXT_PUBLIC_SANITY_PROJECT_ID) warn("NEXT_PUBLIC_SANITY_PROJECT_ID", "not set: the site shows its built-in starter content and /studio is off");
  else if (!env.SANITY_REVALIDATE_SECRET) warn("SANITY_REVALIDATE_SECRET", "not set: edits in Studio take up to a minute to appear");
  if (!env.TURNSTILE_SECRET_KEY || !env.NEXT_PUBLIC_TURNSTILE_SITE_KEY) warn("TURNSTILE_SECRET_KEY", "spam protection (Cloudflare Turnstile) is off: only the honeypot and rate limit apply");
  if (env.CRON_SECRET && env.RETENTION_AUTO_DELETE !== "1") warn("RETENTION_AUTO_DELETE", "not set: old enquiries are only deleted when you use Data clean-up in /admin");
  return issues;
}

export const settingErrors = (env: Env = process.env) => checkSettings(env).filter((i) => i.level === "error");
export const settingWarnings = (env: Env = process.env) => checkSettings(env).filter((i) => i.level === "warning");

export function formatIssues(issues: SettingIssue[]): string {
  return issues.map((i) => `  - ${i.key}: ${i.message}`).join("\n");
}

/**
 * Throws (stopping the build/server) when this is a production runtime with missing or unsafe settings.
 * With ALLOW_TEST_FALLBACKS=1 (tests only, never on Vercel production) it logs instead.
 */
export function enforceSettings(where: "build" | "server", env: Env = process.env): void {
  if (!isProductionRuntime(env)) return;
  const errors = settingErrors(env);
  if (!errors.length) return;
  const msg = `[settings] ${errors.length} production setting(s) missing or unsafe (${where}):\n${formatIssues(errors)}\nSet them in Vercel → Settings → Environment Variables (see .env.example), then redeploy.`;
  if (testFallbacksAllowed(env)) {
    console.warn(`${msg}\n(continuing because ALLOW_TEST_FALLBACKS=1)`);
    return;
  }
  throw new Error(msg);
}
