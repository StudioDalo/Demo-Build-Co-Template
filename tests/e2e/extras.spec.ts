import { expect, test } from "@playwright/test";
import { readLeads, readOutbox, uniq } from "./helpers";
import { consentScript, noExitScript } from "./helpers";
import { PREFIX, siteSettings } from "./client";

test.beforeEach(async ({ page }) => {
  await page.route(/tiktok\.com|googletagmanager\.com|facebook\.net/, (r) => r.abort());
});

test("exit-intent prompt offers the checklist; submitting emails the PDF", async ({ page, isMobile }) => {
  test.skip(isMobile, "exit intent is desktop");
  await page.addInitScript(consentScript, [PREFIX, false] as const);
  await page.goto("/services");
  await page.waitForTimeout(4300);
  await page.mouse.move(600, 300);
  await page.mouse.move(600, -5);
  await page.evaluate(() => document.dispatchEvent(new MouseEvent("mouseout", { clientY: -1, relatedTarget: null, bubbles: true })));
  const prompt = page.getByTestId("exit-prompt");
  await expect(prompt).toBeVisible();
  await expect(prompt).toContainText("Not ready yet?");
  const email = `cl-${uniq()}@example.com`;
  await prompt.getByRole("button", { name: "Send me the checklist" }).click();
  await expect(prompt.getByText("Please enter a valid email address")).toBeVisible();
  await prompt.getByRole("textbox", { name: "Email" }).fill(email);
  await prompt.getByRole("checkbox").check();
  await prompt.getByRole("button", { name: "Send me the checklist" }).click();
  await expect(prompt.getByTestId("checklist-success")).toBeVisible();
  const dl = prompt.getByRole("link", { name: "Download now" });
  const pdf = await page.request.get((await dl.getAttribute("href"))!);
  expect(pdf.headers()["content-type"]).toBe("application/pdf");
  expect((await pdf.body()).subarray(0, 5).toString()).toBe("%PDF-");
  expect(readLeads().some((l) => l.type === "checklist" && l.email === email)).toBe(true);
  expect(readOutbox().some((m) => m.to === email && m.subject === "Your Loft & Extension Planning Checklist")).toBe(true);
  // Shown once per session
  await page.keyboard.press("Escape");
  await page.reload();
  await page.waitForTimeout(4300);
  await page.evaluate(() => document.dispatchEvent(new MouseEvent("mouseout", { clientY: -1, relatedTarget: null, bubbles: true })));
  await expect(page.getByTestId("exit-prompt")).toHaveCount(0);
});

test("review request page links out and is not indexed; admin shows the link", async ({ page }) => {
  await page.addInitScript(consentScript, [PREFIX, false] as const);
  await page.addInitScript(noExitScript, PREFIX);
  await page.goto("/leave-a-review");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  // Only platforms the owner has set up are linked; with none set, a clearly marked placeholder shows instead
  const configured = [siteSettings.checkatrade.url || siteSettings.social.checkatrade, siteSettings.social.googleBusiness, siteSettings.social.tiktok].filter(Boolean);
  await expect(page.getByTestId("review-links").getByRole("link")).toHaveCount(configured.length);
  if (!configured.length) await expect(page.getByTestId("review-links")).toContainText("[EDITABLE PLACEHOLDER]");
});

test("studio route: setup notice without Sanity, editor shell with Sanity", async ({ page }) => {
  await page.goto("/studio");
  if (process.env.NEXT_PUBLIC_SANITY_PROJECT_ID) {
    await expect(page.getByTestId("studio-setup")).toHaveCount(0);
    await expect(page.locator("#sanity")).toBeAttached({ timeout: 20_000 });
  } else {
    await expect(page.getByTestId("studio-setup")).toContainText("Connect Sanity");
  }
});

test("404 page is branded", async ({ page }) => {
  const res = await page.goto("/this-does-not-exist");
  expect(res?.status()).toBe(404);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("We couldn't find that page");
});
