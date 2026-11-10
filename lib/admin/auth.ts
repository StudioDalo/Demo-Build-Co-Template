import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { siteConfig, storageKey } from "@/config";
import { isProductionRuntime, testFallbacksAllowed } from "@/lib/runtime";
import { isWeakAdminPassword } from "./password";

export const ADMIN_COOKIE = storageKey("admin");
const MAX_AGE_S = 60 * 60 * 24 * 7; // 7 days

export { MIN_ADMIN_PASSWORD } from "./password";

/**
 * Strong, non-default password from the environment only (never in the repo).
 * In production a separate ADMIN_SESSION_SECRET is also required, so a leaked password can't be used to forge sessions.
 */
export const adminConfigured = () => {
  if (isWeakAdminPassword(process.env.ADMIN_PASSWORD, siteConfig.brand.appName)) return false;
  if (isProductionRuntime() && !testFallbacksAllowed() && (process.env.ADMIN_SESSION_SECRET ?? "").length < 32) return false;
  return true;
};
const secret = () => process.env.ADMIN_SESSION_SECRET || `${siteConfig.storagePrefix}:${process.env.ADMIN_PASSWORD}`;

const sign = (payload: string) => createHmac("sha256", secret()).update(payload).digest("base64url");

function safeEqual(a: string, b: string) {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}

export function checkPassword(input: string) {
  if (!adminConfigured()) return false;
  // Compare HMACs so lengths always match
  return safeEqual(sign(`pw:${input}`), sign(`pw:${process.env.ADMIN_PASSWORD}`));
}

export function createSessionValue(now = Date.now()) {
  const exp = String(now + MAX_AGE_S * 1000);
  return `${exp}.${sign(`admin:${exp}`)}`;
}

export function verifySessionValue(value: string | undefined, now = Date.now()) {
  if (!value || !adminConfigured()) return false;
  const [exp, sig] = value.split(".");
  if (!exp || !sig || Number(exp) < now) return false;
  return safeEqual(sig, sign(`admin:${exp}`));
}

export async function isAdmin() {
  return verifySessionValue((await cookies()).get(ADMIN_COOKIE)?.value);
}

export async function requireAdmin() {
  if (!(await isAdmin())) redirect("/admin/login");
}

export async function setAdminCookie() {
  (await cookies()).set(ADMIN_COOKIE, createSessionValue(), {
    httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: MAX_AGE_S,
  });
}

export async function clearAdminCookie() {
  (await cookies()).delete(ADMIN_COOKIE);
}
