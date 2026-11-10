import { expect, test } from "@playwright/test";
import { adminLogin, quiet, readLeads, uniq } from "./helpers";
import { PREFIX } from "./client";

test("admin is password protected", async ({ page, request }) => {
  await quiet(page);
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/admin\/login$/);
  await page.getByLabel("Password").fill("wrong-password");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByRole("alert").filter({ hasText: "Wrong password" })).toBeVisible();
  expect((await request.get("/api/admin/export")).status()).toBe(401);
  expect((await request.get("/api/admin/uploads/2026-01-01/x.png")).status()).toBe(401);
  // forged cookie is rejected
  await page.context().addCookies([{ name: `${PREFIX}_admin`, value: `${Date.now() + 1e9}.forged`, url: "http://localhost:3100" }]);
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/admin\/login$/);
});

test("leads API: honeypot, validation, junk options and token protection", async ({ request }) => {
  const name = `Bot ${uniq()}`;
  // Honeypot filled → pretend success, store nothing
  let res = await request.post("/api/leads", { data: { kind: "quick", data: { name, phone: "07700900456", projectType: "landscaping" }, website: "http://spam.example" } });
  expect(res.status()).toBe(200);
  expect(readLeads().some((l) => l.name === name)).toBe(false);
  // Invalid
  res = await request.post("/api/leads", { data: { kind: "quick", data: { name: "A", phone: "123", projectType: "" } } });
  expect(res.status()).toBe(400);
  const body = await res.json();
  expect(Object.keys(body.fields)).toEqual(expect.arrayContaining(["name", "phone", "projectType"]));
  // Malformed
  res = await request.post("/api/leads", { data: { kind: "nope" } });
  expect(res.status()).toBe(400);
  // Valid quick lead
  const real = `Real ${uniq()}`;
  res = await request.post("/api/leads", { data: { kind: "quick", data: { name: real, phone: "07700900456", projectType: "landscaping" } } });
  const { leadId, token } = await res.json();
  expect(leadId).toBeTruthy();
  // Someone without the token can't overwrite it: they get a NEW lead instead
  res = await request.post("/api/leads", { data: { kind: "partial", leadId, token: "stolen", data: { name: "Hijacker", phone: "07700900789" } } });
  expect((await res.json()).leadId).not.toBe(leadId);
  expect(readLeads().find((l) => l.id === leadId)!.name).toBe(real);
  // With the token it updates the same lead
  res = await request.post("/api/leads", { data: { kind: "partial", leadId, token, data: { name: real, phone: "07700900456", timing: "asap" } } });
  expect((await res.json()).leadId).toBe(leadId);
  expect(readLeads().find((l) => l.id === leadId)!.answers.timing).toBe("asap");
});

test("quote API rejects option values that aren't in the CMS lists", async ({ request }) => {
  const res = await request.post("/api/leads", {
    data: {
      kind: "quote",
      data: {
        services: ["hot-tub"], propertyType: "castle", propertyAge: "1980-or-newer", ownership: "i-own-it", postcode: "SW1A 1AA", timing: "asap", budget: "under-25k",
        drawings: "no", planningStatus: "not-sure", architect: "yes", partyWall: "no", staying: "not-sure-yet", parking: "driveway",
        name: "Junk Test", phone: "07700900456", email: "j@example.com", contactMethod: "email", contactTime: "any-time", heardAbout: "google", consent: true,
      },
    },
  });
  expect(res.status()).toBe(400);
  const { fields } = await res.json();
  expect(fields).toHaveProperty("services");
  expect(fields).toHaveProperty("propertyType");
});

test("admin lists missing or unsafe settings by name (never values)", async ({ page }) => {
  await adminLogin(page);
  const banner = page.getByTestId("settings-warnings");
  await expect(banner).toBeVisible();
  // The test server has no Resend key, Supabase or cron secret: each is named
  for (const k of ["RESEND_API_KEY", "SUPABASE_URL", "CRON_SECRET", "ADMIN_SESSION_SECRET"]) await expect(banner).toContainText(k);
  await expect(banner).not.toContainText("e2e-password-123");
});
