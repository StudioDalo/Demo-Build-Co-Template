import { expect, test, type Page } from "@playwright/test";
import { quiet } from "./helpers";
import { areas, BUSINESS, FIRST_AREA, LEGAL, PHONE_E164, siteSettings } from "./client";
import { meta } from "@/packs/active/meta";
import { toE164 } from "@/lib/phone";
import { fmt } from "@/config";

test.beforeEach(async ({ page }) => quiet(page));

async function jsonLd(page: Page) {
  const raw = await page.locator('script[type="application/ld+json"]').allTextContents();
  return raw.map((r) => JSON.parse(r) as Record<string, unknown>);
}
const types = (blocks: Record<string, unknown>[]) => blocks.map((b) => b["@type"]);

const PAGES = ["/", "/services", "/services/loft-conversions", "/projects", "/before-and-after", "/how-we-work", "/guides", "/guides/permitted-development", "/guides/planning-permission", "/guides/building-regulations", "/guides/party-wall", "/cost-guides", "/cost-guides/loft-conversion-cost", "/reviews", "/about", "/faqs", "/areas", `/areas/${FIRST_AREA.slug}`, "/get-a-quote", "/contact", "/planning-checklist", "/privacy", "/terms"];

test("every public page: one H1, title, meta description, canonical, alt text, LocalBusiness schema", async ({ page }) => {
  for (const p of PAGES) {
    await page.goto(p);
    await expect(page.locator("h1"), p).toHaveCount(1);
    const title = await page.title();
    expect(title.length, `${p} title`).toBeGreaterThan(10);
    expect(title.length, `${p} title length: ${title}`).toBeLessThan(75);
    const desc = await page.locator('meta[name="description"]').getAttribute("content");
    expect(desc?.length ?? 0, `${p} description`).toBeGreaterThan(50);
    await expect(page.locator('link[rel="canonical"]'), p).toHaveAttribute("href", `http://localhost:3100${p === "/" ? "" : p}`);
    await expect(page.locator("html")).toHaveAttribute("lang", "en-GB");
    const missingAlt = await page.locator("img:not([alt])").count();
    expect(missingAlt, `${p} images without alt`).toBe(0);
    const ld = await jsonLd(page);
    expect(types(ld), p).toContain(meta.businessType);
    expect(types(ld), p).toContain("WebSite");
  }
});

test("homepage schema: consistent NAP, areas, FAQ + HowTo, and NO fabricated reviews", async ({ page }) => {
  await page.goto("/");
  const ld = await jsonLd(page);
  const biz = ld.find((b) => b["@type"] === meta.businessType)! as Record<string, any>;
  expect(biz.name).toBe(BUSINESS);
  expect(biz.legalName).toBe(LEGAL);
  expect(biz.telephone).toBe(PHONE_E164);
  expect(biz.contactPoint.map((c: any) => c.telephone)).toEqual(siteSettings.phones.map((p) => toE164(p.number)));
  expect(biz.address.addressLocality).toBe(siteSettings.address.locality);
  expect(biz.areaServed.length).toBe(areas.length + 1);
  for (const url of Object.values(siteSettings.social).filter(Boolean)) expect(biz.sameAs).toContain(url);
  expect(biz.review).toBeUndefined();
  expect(biz.aggregateRating).toBeUndefined();
  const faq = ld.find((b) => b["@type"] === "FAQPage") as Record<string, any>;
  expect(faq.mainEntity.map((q: any) => q.name)).toContain("Will my project need planning permission?");
  // placeholder answer ("How long") is excluded from FAQ schema until the owner confirms it
  expect(faq.mainEntity.map((q: any) => q.name)).not.toContain("How long will it take?");
  expect(types(ld)).toContain("HowTo");
  // Visible NAP in footer matches schema
  await expect(page.locator("footer address")).toContainText(LEGAL);
  for (const p of siteSettings.phones) await expect(page.locator("footer address")).toContainText(p.number);
});

test("service, guide and area pages carry their own schema + breadcrumbs", async ({ page }) => {
  await page.goto("/services/loft-conversions");
  let t = types(await jsonLd(page));
  expect(t).toEqual(expect.arrayContaining(["Service", "FAQPage", "BreadcrumbList"]));
  await page.goto("/guides/party-wall");
  t = types(await jsonLd(page));
  expect(t).toEqual(expect.arrayContaining(["Article", "FAQPage", "BreadcrumbList"]));
  await expect(page.getByTestId("answer-box")).toContainText("Party Wall etc. Act 1996");
  await expect(page.getByText("[OWNER TO REVIEW BEFORE PUBLISHING]").first()).toBeVisible();
  await expect(page.getByText("Always check with your own council for your property.").first()).toBeVisible();
  await page.goto(`/areas/${FIRST_AREA.slug}`);
  const ld = await jsonLd(page);
  const svc = ld.find((b) => b["@type"] === "Service") as Record<string, any>;
  expect(svc.areaServed.name).toBe(FIRST_AREA.borough);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(fmt(siteSettings.uiText.areaPageTitle, { area: FIRST_AREA.name }));
});

test("placeholder case studies are noindex; real pages are indexable", async ({ page }) => {
  await page.goto("/projects/example-project-1");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  await page.goto("/services/landscaping");
  await expect(page.locator('meta[name="robots"]')).toHaveCount(0);
});

test("robots.txt, sitemap.xml, llms.txt and llms-full.txt", async ({ request }) => {
  const robots = await (await request.get("/robots.txt")).text();
  expect(robots).toContain("Sitemap: http://localhost:3100/sitemap.xml");
  expect(robots).toContain("Disallow: /admin");
  expect(robots).toContain("Disallow: /studio");
  expect(robots).toMatch(/User-Agent: GPTBot/i);
  expect(robots).toMatch(/User-Agent: ClaudeBot/i);

  const sitemap = await (await request.get("/sitemap.xml")).text();
  for (const u of ["/services/loft-conversions", ...areas.map((a) => `/areas/${a.slug}`), "/guides/party-wall", "/cost-guides/extension-cost", "/get-a-quote"]) {
    expect(sitemap).toContain(`http://localhost:3100${u}`);
  }
  expect(sitemap).not.toContain("example-project");
  expect(sitemap).not.toContain("/admin");

  const llms = await request.get("/llms.txt");
  expect(llms.headers()["content-type"]).toContain("text/plain");
  const txt = await llms.text();
  expect(txt.startsWith(`# ${LEGAL}`)).toBe(true);
  expect(txt).toContain(siteSettings.phones.map((p) => p.number).join(" / "));
  expect(txt).toContain("[Loft conversions](http://localhost:3100/services/loft-conversions)");
  for (const a of areas) expect(txt).toContain(a.name);
  expect(txt).not.toContain("EDITABLE PLACEHOLDER");
  expect(txt).not.toContain(".example");
  const full = await (await request.get("/llms-full.txt")).text();
  expect(full).toContain("### Will my project need planning permission?");
  expect(full).toContain("Party Wall etc. Act 1996");
});

test("security headers are set", async ({ request }) => {
  const res = await request.get("/");
  expect(res.headers()["x-content-type-options"]).toBe("nosniff");
  expect(res.headers()["referrer-policy"]).toBe("strict-origin-when-cross-origin");
  expect(res.headers()["x-frame-options"]).toBe("SAMEORIGIN");
});
