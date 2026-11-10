import { expect, type Page } from "@playwright/test";
import { BUSINESS, HEARD_ABOUT } from "./client";

export const PNG = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==", "base64");

export async function next(page: Page) {
  await page.getByTestId("next").click();
}

export async function completeSteps1to7(page: Page) {
  // Step 1: validation, then choose loft (dormer) + landscaping
  await next(page);
  await expect(page.getByText("Choose at least one option")).toBeVisible();
  await page.getByLabel("Loft conversions").check();
  await page.getByRole("button", { name: "Dormer" }).click();
  await expect(page.getByRole("button", { name: "Dormer" })).toHaveAttribute("aria-pressed", "true");
  await page.getByLabel("Landscaping & gardens").check();
  await next(page);
  // Step 2
  await expect(page.locator("[data-step=property]")).toBeVisible();
  await next(page);
  await expect(page.getByText("Choose a property type")).toBeVisible();
  await page.getByLabel("Terraced").check();
  await page.getByLabel("Pre-1900 (Victorian)").check();
  await page.getByLabel("I own it").check();
  await page.getByLabel("Postcode").fill("nope");
  await next(page);
  await expect(page.getByText("Please enter a valid UK postcode")).toBeVisible();
  await page.getByLabel("Postcode").fill("sw16 3aa");
  await next(page);
  // Step 3
  await page.getByLabel("As soon as possible").check();
  await next(page);
  // Step 4
  await page.getByLabel("£50,000 – £100,000").check();
  await next(page);
  // Step 5
  await page.getByLabel("Yes, drawings are done").check();
  await page.getByLabel("Permission granted / LDC approved").check();
  await page.getByRole("radiogroup", { name: /arrange an architect/ }).getByLabel("No, I have an architect").check();
  await page.getByRole("radiogroup", { name: /party wall/ }).getByLabel("Not sure", { exact: true }).check();
  await next(page);
  // Step 6
  await page.getByLabel("Yes, we'll stay in").check();
  await page.getByLabel("Driveway").check();
  await page.getByLabel("Access notes (optional)").fill("Side gate on the left");
  await next(page);
  // Step 7 (with upload)
  await page.getByLabel("Describe your project (optional)").fill("Rear dormer with en-suite, plus new patio.");
  await page.getByTestId("file-input").setInputFiles({ name: "loft.png", mimeType: "image/png", buffer: PNG });
  await expect(page.getByTestId("upload-list")).toContainText("loft.png");
  await next(page);
  await expect(page.locator("[data-step=contact]")).toBeVisible();
}


/** Step 8 with valid answers, then submit. */
export async function finishContact(page: Page, name: string, email = "test@example.com") {
  await page.getByLabel("Full name").fill(name);
  await page.getByLabel("Mobile number").fill("07700 900456");
  await page.getByRole("textbox", { name: "Email" }).fill(email);
  await page.getByLabel("Phone call").check();
  await page.getByLabel("Morning").check();
  await page.getByLabel(HEARD_ABOUT, { exact: true }).check();
  await page.getByRole("checkbox", { name: new RegExp(`I agree to ${BUSINESS} storing`) }).check();
  await page.getByTestId("submit").click();
  await page.waitForURL("**/get-a-quote/thank-you");
}
