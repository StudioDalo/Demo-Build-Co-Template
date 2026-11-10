# Creating a trade pack

A **trade pack** (`/packs/<slug>/`) holds everything specific to one trade: services, guides, FAQs, the quote form's questions, lead scoring, email wording, area-page text and structured-data defaults. A **client** (`/clients/<slug>/`) picks one pack with `pack: "<slug>"` in its `config.ts`.

Budget **3–5 hours** for a new pack. Most of it is writing honest starter content.

## 1. Copy the scaffold

```bash
cp -r packs/_blank packs/roofing
```

Change `slug` in `packs/roofing/meta.ts` to `"roofing"`. Every file in `_blank` explains what it's for.

| File | What to change |
|---|---|
| `meta.ts` | Trade name, schema.org business type (e.g. `RoofingContractor`), `knowsAbout`, icon keys, case-study headings, and the list of multiple-choice questions (`optionGroups`, with `scored: true` on the ones that count towards the lead score) |
| `icons.ts` | One [lucide](https://lucide.dev/icons) icon per key in `meta.iconKeys` |
| `email.ts` | Customer email wording (next step, links, checklist email) |
| `content/services.ts` | The trade's services |
| `content/guides.ts` | Guides and cost guides (can be empty) |
| `content/faqs.ts` | Starter FAQs |
| `content/quote-form.ts` | Step titles and help text, answer options and points for every question, and the score thresholds |
| `content/area-page.ts` | Area page intro, sections and SEO |
| `form/schema.ts` | **The questions:** step order, Zod validation per step, `scoreFields`, owner-email rows, CSV columns, analytics values |
| `form/StepFields.tsx` | **The questions as people see them:** one `case` per step |

## 2. Rules for the quote form

- **Steps:** `steps` must start with `"services"` and end with `"detail", "contact"`. Those three are shared steps the template renders. Put the trade's own steps in between.
- **Field names match everywhere:** each multiple-choice field name (e.g. `roofType`) must be:
  - a key in `stepSchemas`,
  - a `<Radios name="roofType" options={options("roofType")}>` in `StepFields.tsx`,
  - an `optionGroups` entry in both `meta.ts` and `content/quote-form.ts`.
- **Shared contact questions:** `content/quote-form.ts` must also include `contactMethod`, `contactTime` and `heardAbout`.
- **Postcode:** a field called `postcode` is saved to the lead's postcode column (shown in `/admin` and the CSV).
- **Scoring:** `scoreFields` lists the questions whose option `points` add up to the lead score. The owner can change the points and the hot/warm thresholds in Sanity.
- **No personal data in analytics:** `conversionParams` must never return names, emails, phone numbers, addresses or free text.

`npm test` (`tests/unit/packs.test.ts`) checks all of this for every pack listed in the test. Add your pack to the `packs` array there.

## 3. Content rules

- **Placeholders:** mark anything the business must confirm with `[EDITABLE PLACEHOLDER]`. These blocks are hidden automatically on the live domain.
- **No invented facts:** no prices, guarantees, accreditations, ratings or "years trading". Cost guides show figures only after the owner ticks "I approve these figures".
- **Tokens:** write `{location}` and `{businessName}` instead of a town or company name. They're filled in from the client's config and Site settings.
- **Review:** guides start unreviewed, which shows an `[OWNER TO REVIEW]` note until the owner ticks "reviewed" in Studio.

## 4. Try it

1. Point a client at the pack: `pack: "roofing"` in `clients/<client>/config.ts`.
2. Run:

```bash
CLIENT=<client> npm run dev
```

3. Check `/`, `/services/<slug>`, `/get-a-quote` (send a test quote), `/admin` (the lead, its rows and the CSV), and Studio → Quote form → Answer options.
4. Run:

```bash
CLIENT=<client> npm test
```

## What owners can and can't change

| In Sanity (no developer) | In code (needs a developer) |
|---|---|
| Step titles and help text, answer options and their points, hot/warm thresholds, consent and thank-you text | Which questions exist, their labels, order and validation, which questions count towards the score, owner-email rows, CSV columns |
