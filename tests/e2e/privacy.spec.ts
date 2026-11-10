import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { expect, test } from "@playwright/test";
import { adminLogin, quiet, readLeads, uniq } from "./helpers";
import { BUSINESS, PREFIX } from "./client";

test("privacy policy: named providers with locations and safeguards, cookies, retention, ICO placeholders, last updated", async ({ page }) => {
  await quiet(page);
  await page.goto("/privacy");
  const policy = page.getByTestId("privacy-policy");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Privacy and cookies policy");
  await expect(page.getByTestId("privacy-updated")).toContainText("Last updated: 9 November 2026");
  await expect(page.locator("[data-placeholder]").first()).toContainText("OWNER TO REVIEW");
  // Who we are: ICO, company number, registered office placeholders kept until filled in
  await expect(policy).toContainText("[EDITABLE PLACEHOLDER: ICO registration number]");
  await expect(policy).toContainText("[EDITABLE PLACEHOLDER: company number]");
  await expect(policy).toContainText("[EDITABLE PLACEHOLDER: registered office address]");
  // Every provider named, with where and how
  const providers = page.getByTestId("privacy-providers");
  for (const name of ["Vercel Inc.", "Supabase", "Resend", "Sanity", "Google Analytics", "Google Ads"]) await expect(providers).toContainText(name);
  await expect(providers).toContainText("Frankfurt, Germany");
  await expect(providers).toContainText("UK International Data Transfer Addendum");
  await expect(providers).toContainText("UK Extension to the EU-US Data Privacy Framework");
  await expect(policy).not.toContainText(/Meta|Facebook|TikTok pixel/);
  // Collected data covers uploads, auto-reply, partial answers, ad click IDs
  for (const t of ["Photos and plans", "confirmation email", "Partial form answers", "gclid", "utm_campaign"]) await expect(policy).toContainText(t);
  await expect(page.locator("#partial-enquiries")).toContainText("may contact you once");
  await expect(page.locator("#checklist").getByRole("link", { name: /Planning Checklist/ })).toHaveAttribute("href", "/planning-checklist");
  // Cookies section (linked from the banner) and retention table
  await expect(page.locator("#cookies")).toBeAttached();
  await expect(page.getByTestId("cookie-table")).toContainText("Google Analytics (Google)");
  await expect(page.getByTestId("retention-table")).toContainText("24 months");
  await expect(page.getByTestId("retention-table")).toContainText("6 years after the job is completed");
  await expect(policy).toContainText("OWNER TO CONFIRM");
  await expect(policy.getByRole("link", { name: /ico.org.uk/ })).toHaveAttribute("href", "https://ico.org.uk/make-a-complaint/");
  // Tests run with a GTM ID, so the page offers the cookie settings button
  await page.locator("#cookies").getByTestId("cookie-settings").click();
  await expect(page.getByTestId("cookie-prefs")).toBeVisible();
});

test("planning checklist page exists, so the policy's checklist wording is backed up", async ({ page }) => {
  await quiet(page);
  const res = await page.goto("/planning-checklist");
  expect(res?.status()).toBe(200);
});

test("every form links to the same privacy page, and the quote consent mentions partial enquiries", async ({ page }) => {
  await quiet(page);
  await page.goto("/");
  await expect(page.getByTestId("quick-consent").first().getByRole("link", { name: "Privacy policy" })).toHaveAttribute("href", "/privacy");
  await page.goto("/services/loft-conversions");
  await expect(page.getByTestId("quick-consent").getByRole("link", { name: "Privacy policy" })).toHaveAttribute("href", "/privacy");
  await page.goto("/get-a-quote");
  await page.evaluate((prefix) => localStorage.setItem(`${prefix}-quote-draft`, JSON.stringify({ step: 7, answers: { services: ["landscaping"], serviceOptions: {}, uploads: [] } })), PREFIX);
  await page.reload();
  const consent = page.getByRole("checkbox", { name: new RegExp(`I agree to ${BUSINESS}`) });
  await expect(consent).toBeVisible();
  const label = page.locator("label", { has: consent });
  await expect(label).toContainText("If I don't finish the form");
  await expect(label.getByRole("link", { name: "Privacy policy" })).toHaveAttribute("href", "/privacy");
});

test("admin data clean-up deletes enquiries past retention, never won jobs; cron needs its secret", async ({ page }) => {
  await quiet(page);
  // Seed: one old partial, one old lost enquiry with an upload, one old WON job, one recent partial
  const file = path.join(".data-test", "leads.json");
  const leads = readLeads() as unknown as Record<string, unknown>[];
  const old = new Date(Date.now() - 30 * 31 * 864e5).toISOString();
  const base = { type: "quote", score: null, scorePoints: null, phone: "07700900000", email: "", postcode: "", services: [], answers: {}, uploads: [], notes: [], source: {}, consent: true, tokenHash: "", wonValue: null, wonAt: null, attribution: {}, createdAt: old, updatedAt: old };
  const tag = uniq();
  const add = (o: Record<string, unknown>) => leads.push({ ...base, id: crypto.randomUUID(), ...o });
  add({ name: `Old partial ${tag}`, complete: false, status: "new" });
  add({ name: `Old lost ${tag}`, complete: true, status: "lost", uploads: [{ path: "2020-01-01/gone.png", name: "gone.png", size: 1, type: "image/png" }] });
  add({ name: `Old won ${tag}`, complete: true, status: "won", wonValue: 1000 });
  add({ name: `New partial ${tag}`, complete: false, status: "new", createdAt: new Date().toISOString() });
  writeFileSync(file, JSON.stringify(leads, null, 2));

  const cron = await page.request.get("/api/cron/retention");
  expect(cron.status()).toBe(401);

  await adminLogin(page);
  const panel = page.getByTestId("retention-panel");
  await expect(panel.getByTestId("retention-due")).toBeVisible();
  await panel.getByRole("checkbox").check();
  await panel.getByRole("button", { name: /Delete \d+ now/ }).click();
  await expect(page.getByRole("status").filter({ hasText: /Deleted \d+ old enquiries/ })).toBeVisible();
  const names = (JSON.parse(readFileSync(file, "utf8")) as { name: string }[]).map((l) => l.name);
  expect(names).not.toContain(`Old partial ${tag}`);
  expect(names).not.toContain(`Old lost ${tag}`);
  expect(names).toContain(`Old won ${tag}`);
  expect(names).toContain(`New partial ${tag}`);
});
