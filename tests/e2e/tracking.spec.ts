import { expect, test } from "@playwright/test";
import { adminLogin, dlEvents, quiet, readLeads, uniq } from "./helpers";
import { completeSteps1to7, finishContact } from "./wizard";
import { PHONE, PHONE_E164, PREFIX } from "./client";

const noExit = (prefix: string) => sessionStorage.setItem(`${prefix}-exit-shown`, "1");

test.beforeEach(async ({ page }) => {
  // Never contact Google from tests
  await page.route(/googletagmanager\.com|google-analytics\.com|tiktok\.com|challenges\.cloudflare\.com/, (r) => r.abort());
});

test("cookie banner: equal Accept all / Reject all / Manage, named third parties, GTM only after Accept", async ({ page }) => {
  await page.addInitScript(noExit, PREFIX);
  await page.goto("/");
  const banner = page.getByTestId("cookie-banner");
  await expect(banner).toBeVisible();
  await expect(banner).toContainText("Google Analytics (Google)");
  await expect(banner).toContainText("Google Ads (Google)");
  await expect(banner.getByRole("link", { name: /Privacy/ })).toHaveAttribute("href", "/privacy#cookies");
  const accept = banner.getByRole("button", { name: "Accept all" });
  const reject = banner.getByRole("button", { name: "Reject all" });
  const manage = banner.getByRole("button", { name: "Manage preferences" });
  // Same size and styling
  const [a, r, m] = await Promise.all([accept.boundingBox(), reject.boundingBox(), manage.boundingBox()]);
  expect(Math.round(a!.height)).toBe(Math.round(r!.height));
  expect(Math.round(a!.width)).toBe(Math.round(r!.width));
  expect(Math.round(m!.height)).toBe(Math.round(a!.height));
  expect(await accept.getAttribute("class")).toBe(await reject.getAttribute("class"));

  // Consent Mode v2 defaults are set before anything loads
  const consentDefault = await page.evaluate(() => (window.dataLayer ?? []).find((e: any) => e?.[0] === "consent" && e?.[1] === "default") as any);
  expect(consentDefault?.[2]).toMatchObject({ ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied", analytics_storage: "denied" });
  await expect(page.locator("#gtm-src")).toHaveCount(0);

  await accept.click();
  await expect(banner).toBeHidden();
  await expect(page.locator("#gtm-src")).toHaveAttribute("src", "https://www.googletagmanager.com/gtm.js?id=GTM-E2ETEST");
  const update = await page.evaluate(() => (window.dataLayer ?? []).filter((e: any) => e?.[0] === "consent" && e?.[1] === "update").pop() as any);
  expect(update?.[2]).toMatchObject({ analytics_storage: "granted", ad_storage: "granted", ad_user_data: "granted", ad_personalization: "granted" });
  expect((await page.context().cookies()).find((c) => c.name === `${PREFIX}_consent`)?.value).toMatch(/^11\.\d+$/);

  await page.reload();
  await expect(page.getByTestId("cookie-banner")).toBeHidden();
  await expect(page.locator("#gtm-src")).toHaveCount(1);
});

test("cookie banner: Reject all is one click and sets no tracking cookies; re-asked after 6 months", async ({ page }) => {
  await page.addInitScript(noExit, PREFIX);
  await page.goto("/?utm_source=google&utm_campaign=test");
  await page.getByTestId("cookie-banner").getByRole("button", { name: "Reject all" }).click();
  await expect(page.getByTestId("cookie-banner")).toBeHidden();
  await page.reload();
  await expect(page.getByTestId("cookie-banner")).toBeHidden();
  await expect(page.locator("#gtm-src")).toHaveCount(0);
  const names = (await page.context().cookies()).map((c) => c.name);
  expect(names.filter((n) => (/^(_ga|_gcl)/.test(n) || n === `${PREFIX}_attr`))).toEqual([]);
  // A choice older than 6 months is ignored and the banner shows again
  await page.evaluate((prefix) => localStorage.setItem(`${prefix}_consent`, JSON.stringify({ analytics: true, advertising: true, ts: Date.now() - 200 * 864e5, v: 1 })), PREFIX);
  await page.reload();
  await expect(page.getByTestId("cookie-banner")).toBeVisible();
});

test("Manage preferences: analytics only; footer Cookie settings reopens with the saved choice", async ({ page }) => {
  await page.addInitScript(noExit, PREFIX);
  await page.goto("/");
  const banner = page.getByTestId("cookie-banner");
  await banner.getByRole("button", { name: "Manage preferences" }).click();
  await expect(banner.getByTestId("cookie-prefs")).toBeVisible();
  await banner.getByRole("checkbox", { name: /Analytics/ }).check();
  await banner.getByRole("button", { name: "Save my choices" }).click();
  await expect(banner).toBeHidden();
  const update = await page.evaluate(() => (window.dataLayer ?? []).filter((e: any) => e?.[0] === "consent" && e?.[1] === "update").pop() as any);
  expect(update?.[2]).toMatchObject({ analytics_storage: "granted", ad_storage: "denied" });
  await page.getByTestId("cookie-settings").click();
  await expect(page.getByTestId("cookie-prefs")).toBeVisible();
  await expect(page.getByRole("checkbox", { name: /Analytics/ })).toBeChecked();
  await expect(page.getByRole("checkbox", { name: /Advertising/ })).not.toBeChecked();
  // Keyboard: focus moves into the panel
  await expect(page.getByRole("checkbox", { name: /Analytics/ })).toBeFocused();
});

test("with consent: CTA, phone, WhatsApp, TikTok and form-step events use the exact names", async ({ page }) => {
  await quiet(page, "granted");
  await page.goto("/");
  const stop = (sel: string) => page.locator(sel).first().evaluate((el) => el.addEventListener("click", (e) => e.preventDefault()));
  await stop('header a[href^="tel:"]');
  await page.locator('header a[href^="tel:"]').first().click();
  await stop('[data-testid="tiktok-item"]');
  await page.getByTestId("tiktok-item").first().click();
  await stop('footer a[href*="wa.me"]');
  await page.locator('footer a[href*="wa.me"]').first().click();
  const ev = await dlEvents(page);
  expect(ev).toEqual(expect.arrayContaining([
    expect.objectContaining({ event: "phone_click", phone_location: "header" }),
    expect.objectContaining({ event: "tiktok_thumbnail_click", project_type: "Loft conversion" }),
    expect.objectContaining({ event: "whatsapp_click", whatsapp_location: "footer" }),
  ]));
  // No personal data or URLs with phone numbers in events
  expect(JSON.stringify(ev)).not.toContain(PHONE_E164);
  expect(JSON.stringify(ev)).not.toContain(PHONE.replace(/\s/g, ""));

  await page.locator('[data-section="hero"]').getByRole("link", { name: /Get My Free Quote/ }).click();
  await page.waitForURL("**/get-a-quote");
  expect(await dlEvents(page)).toEqual(expect.arrayContaining([expect.objectContaining({ event: "cta_click", cta_location: "hero", cta_text: "Get My Free Quote" })]));
  await page.getByLabel("Landscaping & gardens").check();
  await page.getByTestId("next").click();
  const ev2 = await dlEvents(page);
  expect(ev2.filter((e) => e.event === "quote_form_start")).toHaveLength(1);
  expect(ev2.filter((e) => e.event === "quote_form_step")).toEqual([expect.objectContaining({ step_number: 1, step_name: "services" })]);
});

test("without consent: nothing is pushed to the dataLayer", async ({ page }) => {
  await quiet(page, "denied");
  await page.goto("/get-a-quote");
  await page.getByLabel("Landscaping & gardens").check();
  await page.getByTestId("next").click();
  expect(await dlEvents(page)).toEqual([]);
  await expect(page.locator("#gtm-src")).toHaveCount(0);
});

for (const consent of ["granted", "denied"] as const) {
  test(`quote with consent ${consent}: lead saved with ad attribution; conversion fires ${consent === "granted" ? "exactly once" : "never"}`, async ({ page }) => {
    await quiet(page, consent);
    const name = `Track ${consent} ${uniq()}`;
    // Land from a Google Ads click, browse, then quote
    await page.goto(`/services/loft-conversions?gclid=TEST-${consent}-${name.slice(-5)}&utm_source=google&utm_medium=cpc&utm_campaign=loft-conversions`);
    await page.getByRole("link", { name: "Get My Free Quote" }).first().click();
    await page.waitForURL("**/get-a-quote**");
    // Campaign params are preserved through internal links
    await expect.poll(() => page.url()).toContain("utm_campaign=loft-conversions");
    expect(page.url()).toContain("gclid=TEST-");
    await completeSteps1to7(page);
    await finishContact(page, name, `${consent}@example.com`);
    await expect(page.getByTestId("thank-you")).toBeVisible();

    const lead = readLeads().find((l) => l.name === name) as unknown as { attribution: Record<string, string> };
    expect(lead.attribution).toMatchObject({ gclid: `TEST-${consent}-${name.slice(-5)}`, utm_source: "google", utm_medium: "cpc", utm_campaign: "loft-conversions", landing_page: "/services/loft-conversions" });
    expect(lead.attribution.first_seen_at).toMatch(/^\d{4}-\d{2}-\d{2}T/);

    const conv = (await dlEvents(page)).filter((e) => e.event === "quote_form_submit");
    if (consent === "denied") {
      expect(conv).toHaveLength(0);
      return;
    }
    expect(conv).toHaveLength(1);
    expect(conv[0]).toMatchObject({ lead_score: "hot", services: ["loft-conversions", "landscaping"], budget_band: "50k-100k", timescale: "asap", value: 0, currency: "GBP" });
    expect(conv[0].lead_id).toMatch(/^[0-9a-f-]{36}$/);
    expect(conv[0].transaction_id).toBe(conv[0].lead_id);
    // Enhanced conversions: hashed only
    expect(conv[0].user_data.sha256_email_address).toMatch(/^[0-9a-f]{64}$/);
    expect(conv[0].user_data.sha256_phone_number).toMatch(/^[0-9a-f]{64}$/);
    expect(JSON.stringify(conv[0])).not.toMatch(/example\.com|07700 ?900456|Track /);
    // Refresh: no second conversion
    await page.reload();
    await expect(page.getByTestId("thank-you")).toBeVisible();
    expect((await dlEvents(page)).filter((e) => e.event === "quote_form_submit")).toHaveLength(0);
  });
}

test("thank-you page: noindex header, and visiting it directly redirects home", async ({ page }) => {
  await quiet(page);
  const res = await page.request.get("/get-a-quote/thank-you");
  expect(res.headers()["x-robots-tag"]).toContain("noindex");
  await page.goto("/get-a-quote/thank-you");
  await page.waitForURL((u) => u.pathname === "/");
});

test("quick quote fires quick_quote_submit only after the server saves it", async ({ page }) => {
  await quiet(page, "granted");
  await page.goto("/");
  const form = page.getByTestId("quick-form").first();
  await form.getByRole("button").last().click();
  await expect(form.getByText("Please enter your name")).toBeVisible();
  expect((await dlEvents(page)).filter((e) => e.event === "quick_quote_submit")).toHaveLength(0);
  await form.getByLabel("Your name").fill(`Quick ${uniq()}`);
  await form.getByLabel("Mobile number").fill("07700 900789");
  await form.getByLabel("Project type").selectOption("loft-conversions");
  await form.getByRole("button").last().click();
  await expect(page.getByTestId("quick-success")).toBeVisible();
  expect((await dlEvents(page)).filter((e) => e.event === "quick_quote_submit")).toEqual([expect.objectContaining({ project_type: "loft-conversions" })]);
});

test("service page: quick form and call button above the fold @mobile", async ({ page }) => {
  await quiet(page);
  await page.goto("/services/loft-conversions");
  const vh = page.viewportSize()!.height;
  const form = page.getByTestId("quick-form");
  await expect(form).toBeVisible();
  await expect(form.getByLabel("Project type")).toHaveValue("loft-conversions");
  const call = await page.getByTestId("service-call").boundingBox();
  expect(call!.y + call!.height).toBeLessThan(vh);
  const nameBox = await form.getByLabel("Your name").boundingBox();
  expect(nameBox!.y).toBeLessThan(vh);
  // Trust strip only appears when the owner switches a claim on (none by default)
  await expect(page.getByTestId("trust-strip")).toHaveCount(0);
});

test("debug mode logs pushes and never loads Google", async ({ page }) => {
  await quiet(page, "granted");
  const logs: string[] = [];
  page.on("console", (m) => logs.push(m.text()));
  await page.goto("/?debug_tracking=1");
  await page.locator('[data-section="hero"]').getByRole("link", { name: /Get My Free Quote/ }).click();
  await page.waitForURL("**/get-a-quote**");
  await expect.poll(() => logs.some((l) => l.includes("[tracking]") && l.includes("cta_click"))).toBe(true);
  await expect(page.locator("#gtm-src")).toHaveCount(0);
});

test("admin: source shown and Won leads export in Google Ads offline conversion format", async ({ page }) => {
  await quiet(page);
  const name = `Ads Won ${uniq()}`;
  const gclid = `GCLID-${uniq()}`;
  await page.goto(`/?gclid=${gclid}&utm_campaign=spring-lofts`);
  const form = page.getByTestId("quick-form").first();
  await form.getByLabel("Your name").fill(name);
  await form.getByLabel("Mobile number").fill("07700 900789");
  await form.getByLabel("Project type").selectOption("loft-conversions");
  await form.getByRole("button").last().click();
  await expect(page.getByTestId("quick-success")).toBeVisible();

  await adminLogin(page);
  const row = page.getByTestId("lead-row").filter({ hasText: name });
  await expect(row.getByTestId("lead-source")).toContainText("Google Ads, campaign: spring-lofts");
  await expect(row.getByTestId("lead-source")).toContainText("gclid");
  await page.getByRole("link", { name }).click();
  await expect(page.getByTestId("lead-attribution")).toContainText(gclid);
  await page.getByTestId("detail-status").selectOption("won");
  await page.getByRole("button", { name: "Update" }).click();
  await page.getByLabel("Job value (£)").fill("32000");
  await page.getByRole("button", { name: "Save value" }).click();
  await expect(page.getByLabel("Job value (£)")).toHaveValue("32000");

  await page.goto("/admin");
  const href = await page.getByTestId("export-gads").getAttribute("href");
  const res = await page.request.get(href!);
  expect(res.status()).toBe(200);
  const csv = await res.text();
  const lines = csv.trim().split(/\r\n/);
  expect(lines[0]).toBe("Parameters:TimeZone=Europe/London");
  expect(lines[1]).toBe("Google Click ID,Conversion Name,Conversion Time,Conversion Value,Conversion Currency");
  const line = lines.find((l) => l.startsWith(gclid))!;
  expect(line).toMatch(new RegExp(`^${gclid},Won Job,\\d{4}-\\d{2}-\\d{2} \\d{2}:\\d{2}:\\d{2},32000\\.00,GBP$`));
  // Leads without a gclid are never included
  expect(lines.slice(2).every((l) => !l.startsWith(","))).toBe(true);
});
