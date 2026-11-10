# Pre-demo checklist

Run this before showing a client their site, and again before go-live. It takes about 20 minutes. Tick each box.

**Which deployment?** Show prospects a **Preview** deployment. Placeholders stay visible there, so they can see what they'll fill in. Production deployments hide every placeholder.

## 1. Automated checks (on your machine)

- [ ] `CLIENT=<slug> npm run typecheck` passes
- [ ] `CLIENT=<slug> npm test` passes (unit tests, including the leak checker)
- [ ] `npm run check:leaks` reports **OK**
- [ ] `PW_CHROMIUM_PATH=... npx playwright test` passes, or at least `quote.spec`, `tracking.spec` and `privacy.spec`
- [ ] Production-mode build: `VERCEL_ENV=production` with the real settings loaded, `npm run build`, then `npm run check:leaks:build`. Only `/privacy` may be reported (as an owner item), and only until the owner fills in their company and ICO details.

## 2. A full test quote, on a phone

Use your own phone on mobile data, not office Wi-Fi, and put **TEST** in the name.

- [ ] Open the site, accept or reject cookies, and check the banner goes away and stays away after a reload
- [ ] Fill in the **full quote form**, all steps, and upload one photo
- [ ] The thank-you page shows your first name. Refreshing it doesn't break anything
- [ ] Back on a laptop, the lead appears in **/admin** with the right score, answers, photo thumbnail and "Where this lead came from"
- [ ] The **owner email** arrives at `LEAD_NOTIFY_EMAIL`, with the score in the subject and a working "Open in leads dashboard" button
- [ ] The **customer auto-reply** arrives at the email you entered, from the client's own domain (not `resend.dev`), and isn't in spam
- [ ] Send a **quick quote** (3-field form) too, and check it appears and its email arrives
- [ ] In **/admin**, change the test lead's status, add a note, and export the CSV. The CSV opens in Excel or Sheets

## 3. Content editing

- [ ] Log in to **/studio** and change one short piece of text (e.g. the announcement bar). Publish
- [ ] The change shows on the live page within about a minute, or straight away if the Sanity webhook is set up
- [ ] Change it back and publish again

## 4. Security and privacy

In a **private / incognito window** (logged out):

- [ ] `/admin` asks for the password, and a wrong password is refused
- [ ] `/studio` asks for a Sanity login, and nothing can be edited without one
- [ ] `/admin` shows **no "Settings to check" box** in production. If it does, fix those settings first
- [ ] `/privacy` has no `[EDITABLE PLACEHOLDER]` left for go-live: company number, registered office, ICO number, privacy email. Retention periods are confirmed and **Last updated** is today
- [ ] The cookie banner names the third parties. Reject all sets no `_ga` or `_gcl` cookies (check in DevTools → Application → Cookies)

## 5. Nothing unfinished is visible

- [ ] On a **Preview** deployment: every placeholder is clearly labelled `[EDITABLE PLACEHOLDER]`, and none looks like a real claim
- [ ] On **production**: search the home, services, areas, reviews and about pages for `[` and for "PLACEHOLDER". There should be none
- [ ] Trust strip: only claims the client has confirmed are switched on (Studio → Site settings → Trust & reviews)
- [ ] No reviews, case studies or before/after photos appear unless they're real and the customer agreed
- [ ] Phone numbers, WhatsApp and email in the header, footer and contact page are the client's own

## 6. Search engines

- [ ] **Preview** deployment: View source shows `<meta name="robots" content="noindex…">`, and the response has an `X-Robots-Tag: noindex` header
- [ ] **Thank-you page** (`/get-a-quote/thank-you`): `noindex` on every deployment
- [ ] **Production on the real domain:** no `noindex` on public pages, `/robots.txt` allows them, and `/sitemap.xml` lists them

## 7. Clean up

- [ ] Delete every **TEST** lead and its photos in Supabase (Table editor → `leads`, and Storage → `lead-uploads`). The dashboard has no single-lead delete button
- [ ] Delete test emails from the owner's inbox if they'd confuse the client
- [ ] If tracking is live, exclude your own visits or note the test conversion date
