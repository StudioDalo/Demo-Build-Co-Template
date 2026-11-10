import { getPrivacyPolicy, getSiteSettings } from "@/lib/content";
import { pageMetadata } from "@/lib/seo/metadata";
import { trackingConfig } from "@/lib/tracking/config";
import { PageHero } from "@/components/ui/misc";
import { Inline, Prose } from "@/components/ui/Prose";
import { CtaAside, ReviewFlag, TwoCol } from "@/components/page/Blocks";
import { CookieSettingsButton } from "@/components/tracking/Tracking";

export async function generateMetadata() {
  const p = await getPrivacyPolicy();
  return pageMetadata({ path: "/privacy", title: p.title, description: p.intro.replace(/\[[^\]]+\]\s*/g, ""), seo: p.seo });
}

const fmtDate = (d: string) => {
  const t = new Date(`${d}T12:00:00Z`);
  return Number.isNaN(t.getTime()) ? d : t.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/London" });
};

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-h`} className="scroll-mt-28">
      <h2 id={`${id}-h`} className="mb-4 text-2xl font-extrabold sm:text-3xl">{title}</h2>
      {children}
    </section>
  );
}

/**
 * The privacy policy is ONE document (Sanity → Privacy & cookies policy). Every link to the policy
 * (quote form, quick form, checklist form, cookie banner, footer) opens this page, so there is no
 * second copy that can go out of date.
 */
export default async function PrivacyPage() {
  const [p, s] = await Promise.all([getPrivacyPolicy(), getSiteSettings()]);
  const tracking = trackingConfig();
  return (
    <>
      <PageHero title={p.title} intro={p.intro} crumbs={[{ name: "Privacy", path: "/privacy" }]} />
      <TwoCol aside={<CtaAside s={s} />}>
        <ReviewFlag show={p.ownerReview} />
        <p className="mb-10 text-sm font-semibold text-muted" data-testid="privacy-updated">Last updated: <time dateTime={p.lastUpdated}>{fmtDate(p.lastUpdated)}</time></p>
        <div className="space-y-12" data-testid="privacy-policy">
          <Section id="who-we-are" title="Who we are">
            <Prose body={[p.whoWeAre]} />
          </Section>

          <Section id="what-we-collect" title="What we collect">
            <Prose body={[p.collect.intro, ...p.collect.items.map((i) => `- ${i}`)]} />
          </Section>

          <Section id="why" title="Why we use it (lawful basis)">
            <Prose body={p.lawfulBasis} />
          </Section>

          <Section id="partial-enquiries" title="If you don't finish the quote form">
            <Prose body={[p.partialEnquiries]} />
          </Section>

          {p.checklist && (
            <Section id="checklist" title="The planning checklist">
              <Prose body={[p.checklist]} />
            </Section>
          )}

          <Section id="who-we-share-with" title="Who we share it with">
            <Prose body={[p.providersIntro]} />
            <ul className="mt-6 grid gap-4" data-testid="privacy-providers">
              {p.providers.map((pr) => (
                <li key={pr.name} className="rounded-2xl border border-stone p-5">
                  <h3 className="text-lg font-bold">{pr.name}</h3>
                  <p className="text-muted">{pr.role}</p>
                  <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-[10rem_1fr]">
                    <dt className="font-semibold">Data they receive</dt><dd><Inline text={pr.data} /></dd>
                    <dt className="font-semibold">Where</dt><dd><Inline text={pr.location} /></dd>
                    <dt className="font-semibold">Transfer safeguard</dt><dd><Inline text={pr.safeguard} /></dd>
                  </dl>
                </li>
              ))}
            </ul>
          </Section>

          <Section id="international-transfers" title="International transfers">
            <Prose body={p.transfers} />
          </Section>

          <Section id="cookies" title="Cookies">
            <Prose body={[p.cookies.intro]} />
            {!tracking.configured && (
              <p className="mt-4 rounded-xl bg-sand p-4 text-sm" data-testid="no-optional-cookies">
                At the moment this website doesn&apos;t use any analytics or advertising cookies. If we start using them, we&apos;ll ask you first.
              </p>
            )}
            <div className="mt-6 overflow-x-auto rounded-2xl border border-stone">
              <table className="w-full min-w-[36rem] text-left text-sm" data-testid="cookie-table">
                <thead className="bg-sand text-xs uppercase"><tr><th className="p-3">Category</th><th className="p-3">Who</th><th className="p-3">What it does</th><th className="p-3">How long</th></tr></thead>
                <tbody className="divide-y divide-stone">
                  {p.cookies.rows.map((r) => (
                    <tr key={r.category} className="align-top"><td className="p-3 font-semibold">{r.category}</td><td className="p-3">{r.provider}</td><td className="p-3"><Inline text={r.purpose} /></td><td className="p-3">{r.duration}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Prose body={[p.cookies.howToChange]} className="mt-4" />
            {tracking.configured && (
              <div className="mt-4 [&_button]:btn-dark"><CookieSettingsButton label={s.cookieBanner.settingsLabel} /></div>
            )}
          </Section>

          <Section id="retention" title="How long we keep your data">
            <Prose body={[p.retention.intro]} />
            <div className="mt-6 overflow-x-auto rounded-2xl border border-stone">
              <table className="w-full min-w-[30rem] text-left text-sm" data-testid="retention-table">
                <thead className="bg-sand text-xs uppercase"><tr><th className="p-3">What</th><th className="p-3">How long</th></tr></thead>
                <tbody className="divide-y divide-stone">
                  {p.retention.rows.map((r) => (
                    <tr key={r.what} className="align-top"><td className="p-3">{r.what}</td><td className="p-3 font-semibold">{r.period}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
            {p.retention.footnote && <p className="mt-3 text-sm text-muted">{p.retention.footnote}</p>}
          </Section>

          <Section id="your-rights" title="Your rights">
            <Prose body={p.rights} />
          </Section>

          <Section id="complaints" title="Complaints">
            <Prose body={[p.complaints]} />
          </Section>

          <Section id="changes" title="Changes to this policy">
            <Prose body={[p.changes]} />
          </Section>
        </div>
      </TwoCol>
    </>
  );
}
