# Legal, privacy and tracking defaults

> **DRAFT for the business owner to review. This is not legal advice.** It describes what the template does out of the box and what each client's owner must check, fill in or decide before going live. If in doubt, take advice from a qualified data-protection adviser or the ICO (ico.org.uk).

The template is built for **UK businesses** under the **UK GDPR**, the **Data Protection Act 2018** and **PECR** (cookies and electronic marketing).

## 1. What the template does by default

### Cookies and tracking
- **No tracking without consent.** Analytics and advertising scripts don't load, and set no cookies, until the visitor accepts. With no Google IDs configured, there's no banner and nothing loads at all.
- **The banner:** "Accept all", "Reject all" and "Manage preferences" are equally prominent. It has Necessary (always on), Analytics and Advertising categories, and names each third party: "Google Analytics (Google)" and "Google Ads (Google)".
- **Google Consent Mode v2:** every Google consent signal starts as **denied** and only changes when the visitor chooses.
- **The choice:** stored for **6 months**, then the visitor is asked again. "Cookie settings" in the footer reopens it at any time. Withdrawing consent deletes the Google cookies and the site's attribution cookie.
- **Production only:** tracking loads only on the production deployment, never on previews or local machines.
- **No personal data in analytics events:** no names, emails, phone numbers, addresses or free text.
- **Enhanced conversions** send only **SHA-256 hashes** of email and phone, and only after **advertising** consent.
- **Attribution:** ad click IDs and campaign tags go in a first-party cookie for 90 days with consent, or for the visit only without it.
- Full detail: `TRACKING.md`.

### Enquiries (personal data)
- **Storage:** quote and callback requests, uploaded photos and plans, and partial answers are stored in **Supabase**. Access is server-side only: no public database policies, a private file bucket and short-lived links. They're never stored on the web server's disk in production.
- **Partial enquiries:** once a visitor has typed their name and phone number, unfinished answers are saved. The privacy policy and the consent wording say the business may contact them about that enquiry.
- **Email:** sent through **Resend**: an owner notification and a customer auto-reply.
- **Retention:** clean-up is built in. `/admin` shows enquiries past their retention period and deletes them with their files; won jobs are never deleted automatically. An optional daily job does it automatically (`RETENTION_AUTO_DELETE=1`).
- **Admin:** `/admin` is protected by a strong password and a session secret from environment variables. `/studio` requires a Sanity login.

### The privacy policy (Studio → Privacy & cookies policy)
- **One document:** every link to the policy opens the same page (forms, banner, footer), so there's no second copy to go out of date.
- **Ships with:**
  - who we are, what we collect, the lawful basis for each use, partial enquiries and the checklist email
  - **named providers**, with what each receives, where it's processed and the transfer safeguard
  - international transfers, a cookie table, a retention table, rights, complaints to the ICO, changes, and a **Last updated** date
- **Tokens** (`{legalName}`, `{companyNumber}`, `{registeredAddress}`, `{icoNumber}`, `{privacyEmail}`) are filled in from Site settings. Missing values show as `[EDITABLE PLACEHOLDER: …]`.

### Provider facts in the default policy
Checked against each provider's own documents on **9 November 2026**. Re-check yearly, and whenever a provider, plan or region changes.

| Provider | What it does | Where data is processed (default setup) | Transfer safeguard in its terms |
|---|---|---|---|
| **Vercel Inc.** (USA) | Hosting | Functions in London (`lhr1`, set in `vercel.json`); pages from the nearest CDN edge | EU SCCs + UK International Data Transfer Addendum; EU-US DPF + UK Extension. DPA applies to **Pro/Enterprise** plans |
| **Supabase Pte. Ltd** (Singapore) | Enquiry database + files | The project's chosen region (e.g. Frankfurt or London) | EU SCCs + UK Addendum (in the DPA, accepted with the Terms) |
| **Resend** (Plus Five Five, Inc., USA) | Email | **Account data and logs in the USA**, whatever the sending region | EU SCCs + UK Addendum; EU-US DPF + UK Extension |
| **Sanity** (Sanity AS, Norway / Sanity US Inc.) | Website content (no enquiry data) | Google Cloud, EU (Belgium) | EU SCCs + UK Addendum |
| **Google Analytics / Google Ads** (Google LLC / Google Ireland) | Measurement and ads (with consent only) | Google data centres worldwide | EU-US DPF + UK Extension; SCCs. GA doesn't store UK users' IP addresses. Google Ads is a separate controller |

### Default retention periods (all marked [OWNER TO CONFIRM])

| Data | Default |
|---|---|
| Enquiries that don't go ahead (with photos and plans) | 24 months, then deleted |
| Partial enquiries | 6 months, then deleted |
| Customers whose job goes ahead | 6 years after completion, or the guarantee length if longer |
| Cookie choice | 6 months |
| Google Analytics | 14 months (the GA4 data retention setting) |

The periods used by the clean-up are editable in Studio → Privacy & cookies policy → Retention. The cookie-choice period is fixed in code (6 months).

## 2. What the owner must do before go-live

### Company details (Studio → Site settings → Business details)
- [ ] **Legal company name**
- [ ] **Company number** and **Registered in** line
- [ ] **Registered office address** (a limited company must show its registered office and number on its website)
- [ ] **ICO registration number.** Check whether the **ICO data protection fee** applies (most businesses that handle customer details must pay it: ico.org.uk/fee). Pay it, then add the number
- [ ] **Privacy email** for data-protection requests, monitored by a real person

### Privacy policy (Studio → Privacy & cookies policy)
- [ ] Read it in full. Remove anything that doesn't apply, and add anything the business does that isn't covered (e.g. a CRM, accounting software, WhatsApp Business)
- [ ] **Providers and transfers:** confirm the list matches the services actually used, and their plans and regions:
  - [ ] the **Supabase region** chosen for this client
  - [ ] the **Resend** account and sending region
  - [ ] the **Vercel plan is Pro**
- [ ] **Retention:** confirm or change each period. Make the clean-up months match. Set **GA4 → Admin → Data retention** to the period stated
- [ ] **Lawful basis:** confirm each use (especially following up partial enquiries under legitimate interests)
- [ ] **Checklist download:** keep the wording only if the site offers it
- [ ] Untick **Still needs owner review** and set **Last updated** to today

### Forms and consent
- [ ] **Quote form consent text** (Studio → Quote form): it must match the policy, including partial enquiries
- [ ] **Quick form text** (Studio → Quote form → Quick form → consent)
- [ ] **No marketing emails** are sent by the template. If the business wants a newsletter, it needs its own opt-in (PECR) and a policy update

### Cookies
- [ ] If any other tracking or embedded service is added (Meta, TikTok, Hotjar, YouTube embeds, chat widgets…), it must go behind the consent banner, be **named** in the banner and the cookie table, and be added to the providers list

### Claims and content
- [ ] **Trust claims** (insured, accredited, guarantee, years trading, ratings) are off by default. Switch on only what can be evidenced
- [ ] **Reviews:** only real reviews, word for word, with the customer's permission; tick the confirmation box
- [ ] **Photos and videos:** only the business's own work, or with permission. No stock images presented as the business's work
- [ ] **Terms of use page:** review and adapt
- [ ] **Cost guides:** figures show only after **I approve these figures** is ticked. Make sure they're current

### Operating the site
- [ ] Someone checks **/admin → Data clean-up** monthly (or turn on automatic deletion)
- [ ] There's a process for **subject access, deletion and objection** requests: reply within one month, free of charge
- [ ] There's a process for **data breaches**: assess, and report to the ICO within 72 hours where required
- [ ] On handover, **all keys are rotated** and the developer's access is removed or agreed
