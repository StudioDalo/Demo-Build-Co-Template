# Trade website template: how it works

A reusable lead-generation website for local trades. Each client gets their own copy of the site, made by **changing configuration and content, not code**. A new trade needs a **trade pack** (a few hours of developer work). A new client in an existing trade needs a **client folder** (about a day, mostly content).

The template ships with a fictional demo client, **Demo Build Co** (`clients/demo-builder`), on the **loft & extension** pack.

## 1. What every site includes

- A home page with hero videos, services, TikTok gallery, case studies, before/after, reviews, FAQs, "how it works" and a quote band
- Pages for services, areas, guides, cost guides, projects, reviews, FAQs, contact, about, terms, privacy and the checklist download
- A quick 3-field quote form and an 8-step quote form, with photo upload, partial-lead capture, lead scoring and a thank-you page
- Leads saved in Supabase. A `/admin` dashboard with status, notes, CSV export, Google Ads offline-conversion export, data clean-up and a review-request link
- Emails through Resend: an owner notification with the score, and a customer auto-reply
- Sanity Studio at `/studio`: almost every word, image, video and answer option is editable
- SEO, GEO and AEO: structured data, sitemap, robots, `llms.txt`, direct-answer boxes and FAQ markup
- A UK GDPR / PECR cookie banner, Google Consent Mode v2, and GTM, GA4 and Ads events (see `TRACKING.md`)
- Production safety: startup settings check, no placeholders, and no other client's content

## 2. Folder structure

```
clients/
  demo-builder/           ← one folder per client
    config.ts             name, colours, radius, location, review site, lead magnet, storage prefix, pack
    brand.tsx             vector logo + favicon
    content/              starter content: settings.ts (Site settings + homepage), areas.ts, pages.ts,
                          privacy.ts, misc.ts (reviews, projects, TikTok… placeholders), index.ts
  active/                 GENERATED: points at the selected client (don't edit)
packs/
  loft-extension/         ← one folder per trade
    meta.ts               business type, icons, case-study labels, the quote form's option groups
    icons.ts  email.ts  checklist.ts
    content/              services, guides, cost guides, FAQs, quote-form defaults, area-page template
    form/                 schema.ts (steps, validation, scoring, email rows, CSV, analytics) + StepFields.tsx
  _blank/                 commented scaffold for a new trade
  active/                 GENERATED: the selected client's pack
config/                   ClientConfig type + helpers (siteConfig, fmt, storageKey)
app/  components/  lib/   the site itself (shared by every client)
sanity/                   Sanity schemas (shared, adapt to the active pack)
supabase/                 database migrations; setup.sql = everything in one script
scripts/                  select-client, seed-sanity, make-checklist-pdf, make-placeholder-media,
                          parity-snapshot / parity-compare, check-leaks
docs/                     this file, NEW-PACK.md, PRE-DEMO-CHECKLIST.md, LEGAL-DEFAULTS.md, OWNER-GUIDE.md
```

## 3. Where each kind of setting lives

| What | Where | Who changes it |
|---|---|---|
| Name, colours, radius, location, review platform, storage prefix, which pack | `clients/<slug>/config.ts` | Developer |
| Logo (vector) and favicon | `clients/<slug>/brand.tsx` | Developer (the owner can also upload a logo in Studio) |
| Contact details, social links, trust claims, announcement, footer, UI text, cookie banner text, SEO defaults | Sanity → Site settings (starter values in `content/settings.ts`) | Owner |
| Services, guides, FAQs, areas, projects, reviews, pages, privacy policy | Sanity documents (starter values from the pack and the client folder) | Owner |
| Quote form: step titles, answer options and points, score thresholds, consent and thank-you text | Sanity → Quote form (defaults in `packs/<pack>/content/quote-form.ts`) | Owner |
| Quote form: which questions exist, labels, validation, which answers score | `packs/<pack>/form/` | Developer |
| Keys, emails, admin password, analytics IDs | Environment variables (`.env.example`) | Developer |

Starter content is used **until Sanity is connected** (and copied into Sanity by `npm run seed:sanity`). After that, Sanity is the source of truth. Singletons fall back field by field to the starter values, so a missing field never breaks a page.

**Choosing the client:**
- `CLIENT=<slug>` selects the client (and through it, the pack). It runs automatically before `dev`, `build`, `test` and `typecheck`.
- With no `CLIENT`, the committed selection (`demo-builder`) is used.
- On Vercel, set `CLIENT` as an environment variable for the project.

## 4. Starting a new client (manual steps)

The `npm run new-client` command was deferred, so follow these steps. Budget about one working day for a client in an existing trade, plus their content and photos.

### A. Code (about 1–2 hours)
1. **Make a new repository from the template**, so each client has their own code and history:

```bash
git clone <template repo> <client-slug>
cd <client-slug>
git remote set-url origin <new client repo>
```

2. **Copy the demo client:**

```bash
cp -r clients/demo-builder clients/<client-slug>
```

3. **Edit `clients/<client-slug>/config.ts`:**
   - `slug`, `pack`, `brand.appName` and `brand.shortName`
   - `theme` colours: check the contrast of the accent against the dark colour
   - `location`: town and `geoRegion`, e.g. `GB-MAN`
   - `reviewPlatform`, `leadMagnet` (or `null`), and a new short `storagePrefix` (lowercase, never reused)
4. **Replace `brand.tsx`** with the client's vector logo and favicon (SVG).
5. **Rewrite the starter content in `content/`:**
   - `settings.ts`: real contact details, **trust claims left off**, announcement, homepage text
   - `areas.ts`: real areas, their housing and neighbourhoods
   - `pages.ts`, plus the heard-about options and consent wording in `index.ts`
   - Remove the demo banner text
6. **Privacy policy:** in `content/privacy.ts`, check every provider, region and retention period still applies (see [LEGAL-DEFAULTS.md](LEGAL-DEFAULTS.md)).
7. **Select the client and build the checklist:**

```bash
node scripts/select-client.mjs <client-slug>
npm run make:pdf
```

8. **Make it the default:** commit `clients/active`, `packs/active` and the generated PDF. Delete `clients/demo-builder` from the client's repo, or keep it there for tests.
9. **Check it:**

```bash
npm run typecheck
npm test
npm run check:leaks
```

### B. Accounts (create under **your** accounts during the build, never the client's)
Stop and agree costs before anything paid.

1. **Supabase:** create a project in a UK or EU region (London `eu-west-2` if offered), then run `supabase/setup.sql` in the SQL editor. Keep RLS on and add no public policies.
2. **Sanity:**
   - Create a project with a `production` dataset.
   - Allow the site's addresses in CORS (with credentials).
   - Seed it, then delete the token: `SANITY_API_WRITE_TOKEN=… npm run seed:sanity`.
3. **Resend:** add and verify the client's domain, choosing the **Ireland** region. Create an API key.
4. **Vercel:** import the repo. A commercial site needs a **Pro** team (Hobby is non-commercial, and Vercel's DPA covers Pro and Enterprise only).

### C. Settings (Vercel → Settings → Environment Variables)
1. Set every **[REQUIRED IN PRODUCTION]** variable in `.env.example`, plus `CLIENT=<client-slug>`, then redeploy. The build lists anything missing.
2. Set Google IDs (`NEXT_PUBLIC_GTM_ID`) for **Production only**, once the client has created their GTM, GA4 and Ads accounts (see `TRACKING.md`).
3. Optional: Turnstile keys, `SANITY_REVALIDATE_SECRET` with a Sanity webhook, and `RETENTION_AUTO_DELETE=1`.

### D. Content, test and launch
1. The owner (or you) adds the logo, photos, videos, real reviews and case studies in Studio, and confirms trust claims.
2. Run [PRE-DEMO-CHECKLIST.md](PRE-DEMO-CHECKLIST.md) on a Preview deployment, then again on production.
3. Point the domain at Vercel, set `NEXT_PUBLIC_SITE_URL=https://<domain>`, and add the domain to Sanity CORS.
4. Submit the sitemap in Google Search Console (in the client's account).

### E. Handover after payment (write `TRANSFER.md` for the client)
Transfer nothing until payment is confirmed. Then:

1. **GitHub:** transfer the repository.
2. **Vercel:** transfer the project to the client's **Pro** team, and move the domain.
3. **Supabase:** transfer the project to the client's organisation.
4. **Sanity:**
   - Invite the client as Administrator.
   - Transfer the project.
   - **Delete every API token created during the build.**
5. **Resend:** verify the domain in the client's own Resend account and swap the API key.
6. **Google:** GTM, GA4 and Ads should already be in the client's accounts, with you added as a user.
7. **Rotate every secret after transfer:**
   - `SUPABASE_SERVICE_ROLE_KEY` and `RESEND_API_KEY`
   - `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET` and `CRON_SECRET`
   - Sanity tokens and webhook secret, and the Turnstile secret
8. Remove your own access, unless you're kept on for maintenance.
9. Send a final test quote on the real domain.

## 5. Adding a trade

See **[NEW-PACK.md](NEW-PACK.md)**. Copy `packs/_blank`, write the services and FAQs, define the quote form's questions in `form/`, and run `npm test` (the pack consistency tests check it). Budget 3–5 hours plus content.

## 6. Quality tools

| Command | Checks |
|---|---|
| `npm run typecheck` / `npm test` | Types; unit tests, including safety rules, the settings check, pack consistency and the leak checker |
| `npx playwright test` | Browser tests for the active client (they read expected values from `clients/active`) |
| `npm run check:leaks` | No previous-client identifiers, real phone numbers or real emails anywhere in the repo |
| `npm run check:leaks:build` | After a production build: no placeholder content in any page |
| `npm run parity` + `parity:compare` | Snapshot 31 pages before and after a refactor; fails on any visible text change |

## 7. Production safety (what the template enforces)

- **Startup settings check.** If a required setting is missing or unsafe, a Vercel production build stops, and a production server refuses to start. Either way you get a list by name. Warnings appear in `/admin`.
- **Sanity outage.** Public pages keep their last good version; starter or demo content never shows in production. Saving leads and `/admin` keep working.
- **Leads.** Never stored on the server's disk in production. If Supabase isn't configured, the form asks visitors to call instead of losing the enquiry.
- **Placeholders.** Hidden on every production deployment (labelled blocks, `[EDITABLE PLACEHOLDER…]` text, placeholder media and share images). `[OWNER TO REVIEW]` tags are stripped.
- **Trust claims.** Default OFF.
- **Reviews.** Only shown when real review content exists. Only confirmed reviews reach Google's review markup.
- **Search engines.** Previews, vercel.app addresses and the thank-you page are `noindex` (meta tag and `X-Robots-Tag`).
- **Admin.** Needs a strong password and a 32+ character session secret from the environment.
- **Studio.** Requires a Sanity login.
- **Tracking.** Production only, after consent, with no personal data in events.

## 8. Known limits (v0.1)

- **UK only:** phone validation, postcodes, `en-GB`, GBP and the Europe/London time zone are fixed.
- **Quote form questions are code per pack.** Owners can edit answers, points and wording, but not add questions.
- **Fonts** are fixed (Inter + Archivo), and there are **no feature switches**. Sections hide when empty, but you can't turn the TikTok gallery or checklist off with a setting.
- **Rate limiting** is per server instance (in memory), so Turnstile is recommended for spam.
- **No ESLint** is configured. The type check, unit and browser tests, and leak checker are the quality gate.
- **Browser tests run against one client at a time.** There's no build matrix across clients.
- **Starter content is per client, and Sanity is per client.** There's no multi-tenant setup: one repo, one Vercel project and one Supabase project per client.
- **The `_blank` pack** is a scaffold, not a finished trade. Only `loft-extension` is production-ready.
