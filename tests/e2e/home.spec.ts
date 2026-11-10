import { expect, test } from "@playwright/test";
import { TIKTOK_URL, quiet } from "./helpers";
import { areas, FIRST_AREA, homePage, LOCATION, PHONE, PHONE_E164, services, siteSettings } from "./client";
import { toE164 } from "@/lib/phone";

test.beforeEach(async ({ page }) => quiet(page));

test("homepage renders every section in the briefed order", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(homePage.hero.headline);
  await expect(page.getByText(homePage.hero.subheadline)).toBeVisible();
  await expect(page.getByRole("link", { name: /Get My Free Quote/ }).first()).toHaveAttribute("href", "/get-a-quote");
  await expect(page.getByRole("link", { name: /Watch Our Latest Builds/ })).toHaveAttribute("href", "#watch-us-build");
  await expect(page.locator('[data-section="announcement"]')).toHaveText(`${siteSettings.announcement.text} ${siteSettings.announcement.link!.label} →`);
  // Footer "Areas we cover" lists the client's areas in their set order
  const footerAreas = page.locator("footer").getByRole("heading", { name: "Areas we cover" }).locator("..").getByRole("link");
  await expect(footerAreas).toHaveText(areas.map((a) => a.name));

  // Trust claims default OFF: with nothing switched on, no trust strip at all
  await expect(page.getByTestId("trust-strip")).toHaveCount(0);
  const order = ["header", "hero", "services", "tiktok", "case-studies", "before-after", "reviews", "questions", "how-it-works", "promise", "quote-band", "footer"];
  const tops: number[] = [];
  for (const s of order) {
    const el = page.locator(`[data-section="${s}"]`).first();
    await expect(el, `section ${s}`).toBeAttached();
    tops.push(await el.evaluate((n) => n.getBoundingClientRect().top + window.scrollY));
  }
  expect([...tops].sort((a, b) => a - b)).toEqual(tops);

  await expect(page.getByRole("heading", { name: homePage.tiktok.heading })).toBeVisible();
  await expect(page.getByTestId("services-grid").getByRole("link")).toHaveCount(services.filter((s) => !s.hidden).length);
  await expect(page.getByTestId("case-studies").locator("li")).toHaveCount(3);
  await expect(page.getByTestId("questions").getByRole("heading")).toHaveText([
    "Will my project need planning permission?", "How long will it take?", "Can we stay in the house during the build?", "Roughly what will it cost?",
  ]);
  await expect(page.getByTestId("how-it-works").locator("li")).toHaveCount(5);
  await expect(page.getByTestId("promise").locator("li")).toHaveCount(5);
});

test("header has nav, quote button and tap-to-call", async ({ page }) => {
  await page.goto("/");
  const header = page.locator("header").first();
  for (const n of ["Services", "Projects", "Reviews", "Areas"]) await expect(header.getByRole("link", { name: n, exact: true })).toBeVisible();
  await expect(header.getByRole("link", { name: "Get a Free Quote" })).toHaveAttribute("href", "/get-a-quote");
  await expect(header.getByRole("link", { name: PHONE })).toHaveAttribute("href", `tel:${PHONE_E164}`);
});

test("no trust claims by default: no 'Fully insured', ratings or accreditations anywhere", async ({ page }) => {
  for (const p of ["/", "/services/loft-conversions"]) {
    await page.goto(p);
    await expect(page.getByTestId("trust-strip")).toHaveCount(0);
    await expect(page.locator("body")).not.toContainText(siteSettings.trustStrip.insuredLabel);
    await expect(page.locator("body")).not.toContainText(/\d+(\.\d)?\/10\b/);
  }
});

test("hero window: 3 videos, dots switch slides, video loads lazily", async ({ page }) => {
  await page.goto("/");
  const hero = page.getByTestId("hero-videos");
  const slides = hero.locator("[aria-roledescription=slide]");
  await expect(slides).toHaveCount(3);
  await expect(slides.nth(0)).toHaveAttribute("data-active", "true");
  // Only the active slide's video gets a src
  await expect(slides.nth(0).locator("video")).toHaveAttribute("src", /\.mp4$/);
  await expect(slides.nth(1).locator("video")).not.toHaveAttribute("src", /.+/);
  const dots = hero.getByRole("tab");
  await expect(dots).toHaveCount(3);
  await dots.nth(2).click();
  await expect(slides.nth(2)).toHaveAttribute("data-active", "true");
  await expect(dots.nth(2)).toHaveAttribute("aria-selected", "true");
  const v = slides.nth(2).locator("video");
  await expect(v).toHaveAttribute("muted", "");
  await expect(v).toHaveAttribute("loop", "");
  await expect(v).toHaveAttribute("playsinline", "");
  await expect.poll(() => v.evaluate((el: HTMLVideoElement) => !el.paused)).toBe(true);
  // Pause button
  await hero.getByRole("button", { name: "Pause video" }).click();
  await expect.poll(() => v.evaluate((el: HTMLVideoElement) => el.paused)).toBe(true);
  // Keyboard arrows
  await dots.nth(2).focus();
  await page.keyboard.press("ArrowRight");
  await expect(slides.nth(0)).toHaveAttribute("data-active", "true");
});

test("TikTok gallery: every tile opens the exact post in a new tab, safely", async ({ page, context }) => {
  await page.goto("/");
  const items = page.getByTestId("tiktok-item");
  await expect(items).toHaveCount(4);
  for (let i = 0; i < 4; i++) {
    const a = items.nth(i);
    await expect(a).toHaveAttribute("href", TIKTOK_URL);
    await expect(a).toHaveAttribute("target", "_blank");
    await expect(a).toHaveAttribute("rel", /noopener/);
    await expect(a).toContainText("View on TikTok");
  }
  // Video tile and image tile both exist
  await expect(items.nth(0).locator("video")).toHaveCount(1);
  await expect(items.nth(1).locator("[data-placeholder=true]")).toHaveCount(1);
  // Clicking opens the exact URL in a new tab and the opener is severed
  await context.route(/tiktok\.com/, (r) => r.fulfill({ status: 200, body: "<html><body>tiktok stub</body></html>", contentType: "text/html" }));
  const [popup] = await Promise.all([page.waitForEvent("popup"), items.nth(1).click()]);
  await popup.waitForLoadState();
  expect(popup.url()).toBe(TIKTOK_URL);
  expect(await popup.evaluate(() => window.opener)).toBeNull();
  // Video tile also links out
  const [popup2] = await Promise.all([page.waitForEvent("popup"), items.nth(0).click()]);
  expect(popup2.url()).toBe(TIKTOK_URL);
});

test("before/after slider responds to keyboard and drag", async ({ page }) => {
  await page.goto("/");
  const slider = page.getByTestId("ba-slider").first();
  await slider.scrollIntoViewIfNeeded();
  const before = slider.getByTestId("ba-before");
  await expect(before).toHaveAttribute("style", /inset\(0px 50%|inset\(0 50%/);
  const range = slider.getByTestId("ba-range");
  await range.focus();
  for (let i = 0; i < 10; i++) await page.keyboard.press("ArrowRight");
  await expect(range).toHaveValue("60");
  await expect(before).toHaveAttribute("style", /40%/);
  const box = (await slider.boundingBox())!;
  await page.mouse.move(box.x + box.width * 0.5, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width * 0.2, box.y + box.height / 2, { steps: 5 });
  await page.mouse.up();
  const v = Number(await range.inputValue());
  expect(v).toBeGreaterThan(14);
  expect(v).toBeLessThan(26);
});

test("services link to their own pages", async ({ page }) => {
  await page.goto("/");
  await page.getByTestId("services-grid").getByRole("link", { name: /Loft conversions/ }).click();
  await expect(page).toHaveURL(/\/services\/loft-conversions$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(`Loft conversions in ${LOCATION}`);
  await expect(page.getByTestId("answer-box")).toContainText("permitted development");
});

test("mobile: sticky bottom bar with Call / WhatsApp / Quote @mobile", async ({ page, isMobile }) => {
  test.skip(!isMobile, "mobile only");
  await page.goto("/");
  const bar = page.getByTestId("mobile-bar");
  await expect(bar).toBeVisible();
  await expect(bar.getByRole("link", { name: "Call" })).toHaveAttribute("href", `tel:${PHONE_E164}`);
  await expect(bar.getByRole("link", { name: "WhatsApp" })).toHaveAttribute("href", new RegExp(`^https://wa\\.me/${toE164(siteSettings.whatsappNumber).slice(1)}\\?text=`));
  await expect(bar.getByRole("link", { name: "Free Quote" })).toHaveAttribute("href", "/get-a-quote");
  await page.mouse.wheel(0, 3000);
  await expect(bar).toBeInViewport();
  // Mobile menu
  await page.getByRole("button", { name: "Open menu" }).click();
  await expect(page.locator("#mobile-menu")).toBeVisible();
  await page.locator("#mobile-menu").getByRole("link", { name: "Areas" }).click();
  await expect(page).toHaveURL(/\/areas$/);
});

test("desktop hides the mobile bar", async ({ page, isMobile }) => {
  test.skip(isMobile, "desktop only");
  await page.goto("/");
  await expect(page.getByTestId("mobile-bar")).toBeHidden();
});

test("no horizontal overflow on mobile pages @mobile", async ({ page, isMobile }) => {
  test.skip(!isMobile, "mobile only");
  for (const p of ["/", "/get-a-quote", "/services/loft-conversions", `/areas/${FIRST_AREA.slug}`, "/guides/party-wall", "/contact"]) {
    await page.goto(p);
    const over = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(over, p).toBeLessThanOrEqual(0);
  }
});
