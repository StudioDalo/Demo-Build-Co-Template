import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { quiet } from "./helpers";
import { FIRST_AREA } from "./client";

const PAGES = ["/", "/get-a-quote", "/services/loft-conversions", "/guides/permitted-development", `/areas/${FIRST_AREA.slug}`, "/contact", "/faqs", "/cost-guides/loft-conversion-cost", "/admin/login"];

test("WCAG 2.1 AA: no serious or critical axe violations @mobile", async ({ page }) => {
  await quiet(page);
  for (const p of PAGES) {
    await page.goto(p);
    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).exclude("video").analyze();
    const bad = results.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
    expect(bad.map((v) => `${p}: ${v.id} (${v.nodes.length}) ${v.nodes[0]?.target}`), p).toEqual([]);
  }
});

test("quote form is fully keyboard operable", async ({ page }) => {
  await quiet(page);
  await page.goto("/get-a-quote");
  await expect(page.locator("[data-step=services] h2")).toBeFocused();
  await page.keyboard.press("Tab");
  await page.keyboard.press("Space"); // ticks first service
  await expect(page.getByRole("checkbox").first()).toBeChecked();
  await page.getByTestId("next").focus();
  await page.keyboard.press("Enter");
  await expect(page.locator("[data-step=property] h2")).toBeFocused();
});
