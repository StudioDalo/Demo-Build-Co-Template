import { expect, test } from "@playwright/test";
import { adminLogin, quiet, readLeads, readOutbox, uniq } from "./helpers";
import { completeSteps1to7, next, PNG } from "./wizard";
import { BUSINESS, HEARD_ABOUT, PREFIX } from "./client";

test.beforeEach(async ({ page }) => quiet(page));

test("8-step quote form → thank-you → stored, scored, emailed → visible in admin with status, notes and CSV", async ({ page }) => {
  const name = `Priya Test ${uniq()}`;
  await page.goto("/get-a-quote");
  await expect(page.getByText("Step 1 of 8")).toBeVisible();
  await expect(page.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "13");
  await completeSteps1to7(page);
  await expect(page.getByText("Step 8 of 8")).toBeVisible();

  // Back keeps answers (autosave/state)
  await page.getByRole("button", { name: "Back" }).click();
  await expect(page.getByLabel("Describe your project (optional)")).toHaveValue(/Rear dormer/);
  await next(page);

  // Step 8 validation
  await page.getByTestId("submit").click();
  await expect(page.getByText("Please enter your name")).toBeVisible();
  await expect(page.getByText("Please tick to agree so we can contact you")).toBeVisible();
  await page.getByLabel("Full name").fill(name);
  await page.getByLabel("Mobile number").fill("07700 900456");
  await page.getByRole("textbox", { name: "Email" }).fill("priya@example.com");
  await page.getByLabel("Phone call").check();
  await page.getByLabel("Morning").check();
  await page.getByLabel(HEARD_ABOUT, { exact: true }).check();
  await page.getByRole("checkbox", { name: new RegExp(`I agree to ${BUSINESS} storing`) }).check();

  await page.getByTestId("submit").click();
  await page.waitForURL("**/get-a-quote/thank-you");
  await expect(page.getByTestId("thank-you")).toContainText(`Thanks, your request is in, ${name.split(" ")[0]}`);
  await expect(page.getByTestId("thank-you")).toContainText("We'll call you within 24 hours");

  // Stored + scored HOT (ASAP 3 + £50-100k 3 + drawings 2 + granted 2 + architect 1 = 11)
  const lead = readLeads().find((l) => l.name === name)!;
  expect(lead).toBeTruthy();
  expect(lead.type).toBe("quote");
  expect(lead.complete).toBe(true);
  expect(lead.score).toBe("hot");
  expect(lead.services).toEqual(["loft-conversions", "landscaping"]);
  expect(lead.uploads).toHaveLength(1);
  expect(lead.answers.serviceOptions).toEqual({ "loft-conversions": ["Dormer"] });
  expect(readLeads().filter((l) => l.name === name)).toHaveLength(1); // partial + final = one lead

  // Emails: owner summary with score + customer auto-reply
  const mails = readOutbox().filter((m) => m.text.includes(name) || m.subject.includes(name.split(" ")[0]));
  const owner = mails.find((m) => m.to === "owner@example.com")!;
  expect(owner.subject).toMatch(/^\[HOT\] Quote request: Priya Test .*, SW16 3AA$/);
  expect(owner.html).toContain("Loft conversions (Dormer), Landscaping &amp; gardens");
  expect(owner.html).toContain("£50,000 – £100,000");
  const reply = readOutbox().find((m) => m.to === "priya@example.com" && m.subject.startsWith("Thanks Priya"))!;
  expect(reply.text).toContain("We'll call you within 24 hours");

  // Admin
  await adminLogin(page);
  const row = page.getByTestId("lead-row").filter({ hasText: name });
  await expect(row).toContainText("hot");
  await expect(row).toContainText("SW16 3AA");
  await row.getByRole("combobox").selectOption("contacted");
  await row.getByRole("button", { name: "Save" }).click();
  await expect(page.getByTestId("lead-row").filter({ hasText: name }).getByRole("combobox")).toHaveValue("contacted");
  await page.getByRole("link", { name }).click();
  await expect(page.getByTestId("lead-detail")).toContainText("Side gate on the left");
  await expect(page.getByTestId("lead-uploads").locator("img")).toHaveCount(1);
  const imgSrc = await page.getByTestId("lead-uploads").locator("img").getAttribute("src");
  const imgRes = await page.request.get(imgSrc!);
  expect(imgRes.status()).toBe(200);
  expect(imgRes.headers()["content-type"]).toBe("image/png");
  await page.getByTestId("detail-status").selectOption("survey_booked");
  await page.getByRole("button", { name: "Update" }).click();
  await expect(page.getByTestId("detail-status")).toHaveValue("survey_booked");
  await page.getByLabel("Add a note").fill("Survey booked for Tuesday 10am");
  await page.getByRole("button", { name: "Add note" }).click();
  await expect(page.getByTestId("lead-notes")).toContainText("Survey booked for Tuesday 10am");
  expect(readLeads().find((l) => l.name === name)!.status).toBe("survey_booked");

  // Won: value + date captured for Google Ads offline conversions
  await page.getByTestId("detail-status").selectOption("won");
  await page.getByRole("button", { name: "Update" }).click();
  await expect(page.getByTestId("won-form")).toBeVisible();
  await page.getByLabel("Job value (£)").fill("£48,500");
  await page.getByRole("button", { name: "Save value" }).click();
  await expect(page.getByLabel("Job value (£)")).toHaveValue("48500");
  const won = readLeads().find((l) => l.name === name) as unknown as { status: string; wonValue: number; wonAt: string };
  expect(won.status).toBe("won");
  expect(won.wonValue).toBe(48500);
  expect(won.wonAt).toBeTruthy();
  await page.getByTestId("detail-status").selectOption("survey_booked");
  await page.getByRole("button", { name: "Update" }).click();
  await expect(page.getByTestId("won-form")).toHaveCount(0);

  // Filters + CSV export
  await page.goto("/admin?status=survey_booked&score=hot");
  await expect(page.getByTestId("lead-row").filter({ hasText: name })).toHaveCount(1);
  const csvHref = await page.getByTestId("export-csv").getAttribute("href");
  expect(csvHref).toContain("status=survey_booked");
  const csv = await page.request.get(csvHref!);
  expect(csv.headers()["content-type"]).toContain("text/csv");
  expect(csv.headers()["content-disposition"]).toMatch(/attachment; filename="leads-/);
  const body = await csv.text();
  expect(body).toContain(name);
  expect(body).toContain("Survey booked");
  expect(body).toContain("Survey booked for Tuesday 10am");
});

test("form autosaves progress and restores it after reload", async ({ page }) => {
  await page.goto("/get-a-quote");
  await page.getByLabel("Rear extensions").check();
  await next(page);
  await page.getByLabel("Semi-detached").check();
  await page.reload();
  await expect(page.locator("[data-step=property]")).toBeVisible();
  await expect(page.getByLabel("Semi-detached")).toBeChecked();
  await page.getByRole("button", { name: "Back" }).click();
  await expect(page.getByLabel("Rear extensions")).toBeChecked();
});

test("abandoned form: lead is captured as partial once name + phone are entered", async ({ page }) => {
  const name = `Abandon ${uniq()}`;
  await page.goto("/get-a-quote");
  await completeSteps1to7(page);
  await page.getByLabel("Full name").fill(name);
  await page.getByLabel("Mobile number").fill("07700 900789");
  await expect.poll(() => readLeads().find((l) => l.name === name), { timeout: 10_000 }).toBeTruthy();
  const lead = readLeads().find((l) => l.name === name)!;
  expect(lead.complete).toBe(false);
  expect(lead.answers.timing).toBe("asap");
  expect(lead.answers.postcode).toBe("sw16 3aa");
  await adminLogin(page);
  await page.goto("/admin?complete=no");
  await expect(page.getByTestId("lead-row").filter({ hasText: name })).toContainText("Partial");
});

test("hero quick form → callback lead → 'add detail' continues the SAME lead", async ({ page }) => {
  const name = `Quick ${uniq()}`;
  await page.goto("/");
  const form = page.getByTestId("quick-form").first();
  await form.getByRole("button", { name: "Call me back" }).click();
  await expect(form.getByText("Please enter your name")).toBeVisible();
  await expect(form.getByText("Please enter a valid UK phone number")).toBeVisible();
  await expect(form.getByText("Choose a project type")).toBeVisible();
  await form.getByLabel("Your name").fill(name);
  await form.getByLabel("Mobile number").fill("07700900456");
  await form.getByLabel("Project type").selectOption("wraparound-extensions");
  await form.getByRole("button", { name: "Call me back" }).click();
  await expect(page.getByTestId("quick-success")).toContainText("We'll call you within 24 hours");
  const quick = readLeads().find((l) => l.name === name)!;
  expect(quick).toMatchObject({ type: "quick", complete: true, services: ["wraparound-extensions"] });
  expect(readOutbox().some((m) => m.to === "owner@example.com" && m.subject === `Quick callback request: ${name}`)).toBe(true);

  await page.getByRole("link", { name: /Add a few details/ }).click();
  await page.waitForURL("**/get-a-quote?resume=1");
  await expect(page.getByLabel("Wraparound extensions")).toBeChecked();
  await next(page);
  await page.getByLabel("Detached", { exact: true }).check();
  await page.getByLabel("1980 or newer").check();
  await page.getByLabel("I own it").check();
  await page.getByLabel("Postcode").fill("CR0 1AA");
  await next(page);
  await page.getByLabel("Just researching").check();
  await next(page);
  await page.getByLabel("Not sure yet").check();
  await next(page);
  await page.getByLabel("Not yet").check();
  await page.getByLabel("Not applied yet").check();
  await page.getByRole("radiogroup", { name: /arrange an architect/ }).getByLabel("Not sure", { exact: true }).check();
  await page.getByRole("radiogroup", { name: /party wall/ }).getByLabel("No", { exact: true }).check();
  await next(page);
  await page.getByLabel("Not sure yet").check();
  await page.getByLabel("On-street (permit)").check();
  await next(page);
  await next(page);
  await expect(page.getByLabel("Full name")).toHaveValue(name);
  await expect(page.getByLabel("Mobile number")).toHaveValue("07700900456");
  await page.getByRole("textbox", { name: "Email" }).fill("quick@example.com");
  await page.getByLabel("WhatsApp", { exact: true }).check();
  await page.getByLabel("Any time").check();
  await page.getByLabel("Google").check();
  await page.getByRole("checkbox", { name: /I agree/ }).check();
  await page.getByTestId("submit").click();
  await page.waitForURL("**/thank-you");
  const all = readLeads().filter((l) => l.name === name);
  expect(all).toHaveLength(1);
  expect(all[0]).toMatchObject({ id: quick.id, type: "quote", complete: true, score: "cold" });
});

test("upload rejects non-image files and more than 5 files", async ({ page }) => {
  await page.addInitScript((prefix) => localStorage.setItem(`${prefix}-quote-draft`, JSON.stringify({ step: 6, answers: { services: ["landscaping"], serviceOptions: {}, uploads: [] } })), PREFIX);
  await page.goto("/get-a-quote");
  await expect(page.locator("[data-step=detail]")).toBeVisible();
  await page.getByTestId("file-input").setInputFiles({ name: "evil.png", mimeType: "image/png", buffer: Buffer.from("<script>alert(1)</script>") });
  await expect(page.getByRole("alert").filter({ hasText: "only photos" })).toBeVisible();
  const files = Array.from({ length: 6 }, (_, i) => ({ name: `p${i}.png`, mimeType: "image/png", buffer: PNG }));
  await page.getByTestId("file-input").setInputFiles(files);
  await expect(page.getByTestId("upload-list").locator("li")).toHaveCount(5);
  await expect(page.getByTestId("file-input")).toBeDisabled();
});
