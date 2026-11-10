# Tracking, consent and conversions

How analytics and ad tracking work on a site built from this template, what to set up in Google, and how to check it.

**Today nothing is switched on.** The Google IDs below are empty, so there is no cookie banner, no "Cookie settings" link, no Google script and no tracking. Everything turns on when the IDs are added in Vercel.

## 1. Rules the code follows

- **UK GDPR + PECR.** No analytics or advertising tag loads, and no tracking cookie is set, until the visitor clicks **Accept all** or turns a category on in **Manage preferences**.
- **Google Consent Mode v2.** Before anything else, the page sets `ad_storage`, `ad_user_data`, `ad_personalization` and `analytics_storage` to `denied` (`lib/tracking/config.ts`). The visitor's choice then updates them.
- **Production only.** Google scripts load only on the production deployment (`VERCEL_ENV=production`). They never load on preview deployments or `localhost`, so test enquiries don't end up in the owner's reports.
- **No personal data in events.** Names, emails, phone numbers, addresses and free text never go into event parameters. The only exception is Enhanced Conversions, which sends **SHA-256 hashes** of the email and phone, and only when advertising consent has been given.
- **The consent choice** is saved in `localStorage` and a first-party cookie called `<prefix>_consent` (prefix = `storagePrefix` in the client config), with a timestamp. After **6 months** the banner asks again. The footer **Cookie settings** link reopens it at any time.
- **Withdrawing consent** (Reject all, or unticking both categories) deletes `_ga*`, `_gcl*` and the `<prefix>_attr` cookie.

## 2. Environment variables

Set these in Vercel → Project → Settings → Environment Variables, ticking **Production only**, then redeploy.

| Variable | Example | Needed? |
|---|---|---|
| `NEXT_PUBLIC_GTM_ID` | `GTM-ABC1234` | **Recommended.** Set up GA4 and Google Ads inside GTM (section 4). |
| `NEXT_PUBLIC_GA4_ID` | `G-ABC123XYZ` | Only if **not** using GTM. The site then loads gtag.js directly. |
| `NEXT_PUBLIC_GADS_ID` | `AW-1234567890` | Only if **not** using GTM. |
| `NEXT_PUBLIC_GADS_CONVERSION_LABEL` | `AbC-D_efG` | Only if **not** using GTM. This is the label of the "Quote request" conversion. |

The banner appears as soon as any one of these IDs is set. An ID in the wrong format (for example `GTM-` followed by anything other than letters and numbers) is ignored. These IDs are public by design, so the `NEXT_PUBLIC_` warning in Vercel is expected and safe to ignore.

## 3. Events (`window.dataLayer`)

Every event goes through one helper, `track(event, params)` in `lib/track.ts`. It pushes to `window.dataLayer` **only after consent**. Clicks are tracked by one listener for the whole site (`components/tracking/Tracking.tsx`), so any call-to-action or phone link the owner adds in Sanity is tracked automatically.

| Event | When it fires | Parameters |
|---|---|---|
| `cta_click` | Any link to `/get-a-quote` (Get a Free Quote / Get My Free Quote / Book yours…) | `cta_text`, `cta_location` (`header`, `hero`, `banner`, `footer`, `service_page`, `sticky_bar`, `quote_band`, `page_aside`, `hero_add_detail`…) |
| `phone_click` | Any `tel:` link | `phone_location` |
| `whatsapp_click` | Any WhatsApp link | `whatsapp_location` |
| `quick_quote_submit` | The 3-field quick form, **after the server confirms it was saved** | `project_type`, `form_location` (`hero` / `service_page`) |
| `quote_form_start` | First interaction with the 8-step form (once per page load) | none |
| `quote_form_step` | Each step completed | `step_number` (1–8), `step_name` (`services`, `property`, `timing`, `budget`, `planning`, `living`, `detail`, `contact`) |
| `quote_form_submit` | **Once per lead, on the thank-you page**, after the server saved the lead | `lead_id`, `transaction_id` (= `lead_id`), `services` (list), `budget_band`, `timescale`, `planning_status`, `lead_score` (`hot`/`warm`/`cold`), `value` (0), `currency` (`GBP`), `user_data` (hashed, advertising consent only) |
| `tiktok_thumbnail_click` | A TikTok gallery tile | `post_title`, `project_type` |
| `hero_video_interaction` | Pause/play, swipe, dot or arrow-key change on the hero video | `action` (`play`, `pause`, `swipe`, `select`, `next`, `previous`) |
| `review_badge_click` | Any link to the client's review platform (`reviewPlatform.host` in the client config) | none |
| `checklist_download` | Planning checklist form sent | `location` |

**When the conversion is counted:**
- `quote_form_submit` and `quick_quote_submit` fire only from the success response of `/api/leads`, never on the button click. A failed, invalid or spam submission is never counted.
- The thank-you page (`/get-a-quote/thank-you`) only opens after a successful submission in the same browser tab. Otherwise it redirects to the home page.
- The page sets a sessionStorage key (`<prefix>-conv-<lead_id>`), so refreshing it never fires the conversion twice.
- The page is `noindex`, both as a meta tag and as an `X-Robots-Tag` header.

**Enhanced Conversions:** the email is trimmed and lower-cased, and the phone number is converted to E.164 format (`+447…`). Both are then SHA-256 hashed in the browser and sent as:

```js
user_data: { sha256_email_address, sha256_phone_number }
```

They are sent only if the visitor accepted **Advertising**. The raw email and phone are never sent.

## 4. Set up in Google (in the client's own accounts, with the developer added as a user)

### Google Tag Manager (web container)

1. **Consent:** Admin → Container settings → tick **Enable consent overview**. Google tags have built-in consent checks, so leave those as they are.
2. **Variables.** Create these Data Layer Variables:
   - `lead_id`, `transaction_id`, `services`, `budget_band`, `timescale`, `planning_status`, `lead_score`, `value`, `currency`
   - `cta_text`, `cta_location`, `phone_location`, `whatsapp_location`, `project_type`, `step_number`, `step_name`, `post_title`, `action`
   - `user_data.sha256_email_address` and `user_data.sha256_phone_number`
3. **Google tag:** the GA4 Measurement ID, firing on *Initialization – All Pages*.
4. **GA4 event tags.** Create one tag per event in section 3, each with a Custom Event trigger of the same name and the matching parameters. Or create a single tag with event name `{{Event}}` and a trigger on the regex `^(cta_click|phone_click|whatsapp_click|quick_quote_submit|quote_form_start|quote_form_step|quote_form_submit|tiktok_thumbnail_click|hero_video_interaction|review_badge_click|checklist_download)$`.
5. **Google Ads conversion tag "Quote request":**
   - Trigger: Custom Event `quote_form_submit`.
   - Transaction ID: `{{transaction_id}}`. Value: `{{value}}`. Currency: `GBP`.
   - Tick **Include user-provided data from your website** → Manual configuration, with Email = `{{user_data.sha256_email_address}}` and Phone = `{{user_data.sha256_phone_number}}` (the values are already hashed).
6. Optional: a second Ads conversion "Quick callback" on `quick_quote_submit`. Also add a **Conversion Linker** tag on All Pages.
7. Publish the container.

### GA4

- **Key events:** Admin → Events → mark `quote_form_submit` and `quick_quote_submit` as key events. You can also mark `phone_click` and `whatsapp_click`.
- **Data retention:** Admin → Data collection → Data retention. Choose the shortest period the owner is happy with (2 months or 14 months) and put the same period in the privacy policy.
- **Enhanced measurement:** keep **Page changes based on browser history events** on, so page views are counted as visitors move around the site.

### Google Ads

- **"Quote request":** Goals → Conversions → New → Website → manual setup with Google Tag Manager. Turn on **Enhanced conversions** (method: Google Tag Manager).
- **"Won Job":** Goals → Conversions → New → **Import** → Other data sources or CRMs → Track conversions from clicks. The name must be exactly `Won Job`.
- **Monthly upload:**
  1. In `/admin`, set won leads to **Won** and enter the **Job value (£)**.
  2. Click **Export Google Ads offline conversions**.
  3. In Google Ads, go to Goals → Conversions → Uploads and upload the CSV.

  The file contains only Won leads that have a Google click ID. It starts with `Parameters:TimeZone=Europe/London`, with the columns `Google Click ID, Conversion Name, Conversion Time, Conversion Value, Conversion Currency`. Google accepts clicks up to 90 days old, so upload at least once a month.

## 5. Ad attribution on leads

When a visitor first lands, the site reads `gclid`, `gbraid`, `wbraid`, `utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content`, the landing page and the referrer (`lib/tracking/attribution.ts`).

- **Storage:** they go in a first-party cookie `<prefix>_attr` for 90 days if the visitor accepted cookies. Otherwise they are kept in sessionStorage for that visit only.
- **New clicks:** a new ad click (a new gclid or utm value) replaces the stored values.
- **Saved with the lead:** every quick quote, quote and checklist submission sends them, and they are saved to the matching columns on the Supabase `leads` table (migration `supabase/migrations/20261106000000_won_and_attribution.sql`). A lead keeps the attribution from when it was first created.
- **Where you see them:** the `/admin` list (Source column, plus a `gclid` badge), the lead page ("Where this lead came from") and the owner's email (e.g. "Source: Google Ads, campaign: loft-conversions (Google click ID saved)").
- **Between pages:** campaign parameters are kept in the address bar as the visitor moves around the site during that visit.

## 6. Checking it works

**Debug mode, on any page:** add `?debug_tracking=1` to the address. Every event is logged in the browser console as `[tracking] …`, and Google scripts are not loaded, so nothing is sent. Add `?debug_tracking=0` to turn it off. This is a good check before the IDs exist.

**After the IDs are set (production):**
1. In GTM, click **Preview** and enter the live site address. Tag Assistant opens.
2. The banner shows. In Tag Assistant → Consent, everything is *Denied*, and no GA4 or Ads tag has fired.
3. Click **Reject all** and browse. Still no GA4 or Ads hits.
4. Clear the site data, reload and click **Accept all**. Consent shows *Granted*, and the GA4 tag fires.
5. Click a phone link, a Get a Quote button and a TikTok tile. You should see `phone_click`, `cta_click` and `tiktok_thumbnail_click`.
6. Fill in the quote form using a test name such as "TEST tracking". You should see `quote_form_start`, `quote_form_step` 1–8, then on the thank-you page **one** `quote_form_submit` with `lead_id`. The "Quote request" Ads tag should fire with user-provided data.
7. Refresh the thank-you page. `quote_form_submit` does **not** fire again.
8. In **GA4 → Admin → DebugView**, the same events appear.
9. In **Supabase → Table editor → leads**, the test lead has `utm_*` values. If you visited with `?gclid=TEST123&utm_source=google&utm_campaign=test`, `gclid` is also filled in. Delete the test lead afterwards.
10. In `/admin`, mark the test lead **Won** with a value, then export the Google Ads CSV. The row appears with your test gclid. Don't upload test rows to Google Ads.

**Automated tests:**
- `npx playwright test tracking.spec` covers the banner, Consent Mode defaults, accept/reject/manage, the 6-month re-ask, the events, consent granted and denied, the single conversion, attribution, the thank-you guard, debug mode and the CSV export.
- `npx vitest run` covers the CSV format, the source labels, ID validation and E.164 formatting.

## 7. Files

| File | What it does |
|---|---|
| `lib/tracking/config.ts` | Reads and validates the IDs, decides production-only loading, holds the Consent Mode defaults script |
| `lib/track.ts` | Consent storage, `track()`, debug mode, hashing for Enhanced Conversions |
| `components/tracking/Tracking.tsx` | Cookie banner, GTM/gtag loader, click tracking, footer "Cookie settings" button |
| `lib/tracking/attribution.ts` | gclid/utm capture and keeping them between pages |
| `app/(site)/get-a-quote/thank-you/ThankYouGate.tsx` | Thank-you guard and the single conversion |
| `lib/leads/gads.ts`, `app/api/admin/export/google-ads/route.ts` | Offline conversions CSV |
| Sanity → Site settings → Shared sections → Cookie banner | All banner text, including the named third parties |
