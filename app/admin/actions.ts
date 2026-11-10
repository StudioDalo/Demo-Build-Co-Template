"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { checkPassword, clearAdminCookie, isAdmin, setAdminCookie } from "@/lib/admin/auth";
import { getStores } from "@/lib/leads/store";
import { LEAD_STATUSES, type LeadStatus } from "@/lib/leads/types";
import { rateLimited } from "@/lib/spam";
import { headers } from "next/headers";

export async function login(_prev: { error?: string } | undefined, form: FormData) {
  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0] ?? "local";
  if (rateLimited(`login:${ip}`, 10)) return { error: "Too many attempts. Try again in 10 minutes." };
  if (!checkPassword(String(form.get("password") ?? ""))) return { error: "Wrong password" };
  await setAdminCookie();
  redirect("/admin");
}

export async function logout() {
  await clearAdminCookie();
  redirect("/admin/login");
}

async function guard() {
  if (!(await isAdmin())) redirect("/admin/login");
}

export async function updateStatus(form: FormData) {
  await guard();
  const id = String(form.get("id"));
  const status = String(form.get("status")) as LeadStatus;
  if (!LEAD_STATUSES.includes(status)) return;
  const current = await getStores().leads.get(id);
  if (!current) return;
  // Won: stamp won_at the first time; leaving Won clears it (value is kept in case it's re-won)
  const wonAt = status === "won" ? current.wonAt ?? new Date().toISOString() : null;
  await getStores().leads.update(id, { status, wonAt });
  revalidatePath("/admin");
  revalidatePath(`/admin/leads/${id}`);
}

export async function addNote(form: FormData) {
  await guard();
  const id = String(form.get("id"));
  const text = String(form.get("note") ?? "").trim().slice(0, 2000);
  if (!text) return;
  const lead = await getStores().leads.get(id);
  if (!lead) return;
  await getStores().leads.update(id, { notes: [...lead.notes, { at: new Date().toISOString(), text }] });
  revalidatePath(`/admin/leads/${id}`);
}

/** Won job value in GBP (used for the Google Ads offline-conversion export). */
export async function setWonValue(form: FormData) {
  await guard();
  const id = String(form.get("id"));
  const raw = String(form.get("wonValue") ?? "").replace(/[£,\s]/g, "");
  const value = raw === "" ? null : Number(raw);
  if (value !== null && (!Number.isFinite(value) || value < 0 || value > 10_000_000)) return;
  const lead = await getStores().leads.get(id);
  if (!lead) return;
  await getStores().leads.update(id, { wonValue: value === null ? null : Math.round(value * 100) / 100 });
  revalidatePath("/admin");
  revalidatePath(`/admin/leads/${id}`);
}

/** Delete enquiries past the retention periods in the privacy policy (Won jobs are never included). */
export async function runRetentionCleanup(form: FormData) {
  await guard();
  if (form.get("confirm") !== "yes") redirect("/admin?cleanup=confirm");
  const { getPrivacyPolicy } = await import("@/lib/content");
  const { withLenientContent } = await import("@/lib/content/mode");
  const { deleteLeads, dueForDeletion } = await import("@/lib/leads/retention");
  const stores = getStores();
  const policy = await withLenientContent(() => getPrivacyPolicy());
  const { all } = dueForDeletion(await stores.leads.list(), policy.retentionMonths);
  const n = await deleteLeads(stores, all);
  revalidatePath("/admin");
  redirect(`/admin?cleanup=done&deleted=${n}`);
}
