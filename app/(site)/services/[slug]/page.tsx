import { notFound } from "next/navigation";
import Link from "next/link";
import { getAreas, getCostGuides, getProjects, getQuoteForm, getService, getServices, getSiteSettings } from "@/lib/content";
import { Phone } from "lucide-react";
import { telHref } from "@/lib/phone";
import { QuickQuoteForm } from "@/components/forms/QuickQuoteForm";
import { pageMetadata } from "@/lib/seo/metadata";
import { faqJsonLd, serviceJsonLd } from "@/lib/seo/jsonld";
import { Breadcrumbs, JsonLd } from "@/components/ui/misc";
import { fmt, siteConfig } from "@/config";
import { Media } from "@/components/ui/Media";
import { AnswerBox, CtaAside, FaqList, TextSections, TwoCol } from "@/components/page/Blocks";
import { CaseStudyCards, QuoteBand, TrustStrip } from "@/components/home/Sections";

export async function generateStaticParams() {
  return (await getServices()).map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const [sv, s] = await Promise.all([getService((await params).slug), getSiteSettings()]);
  if (!sv) return {};
  return pageMetadata({ path: `/services/${sv.slug}`, title: fmt(s.uiText.servicePageTitle, { service: sv.name, location: siteConfig.location.primary }), description: sv.summary, seo: sv.seo });
}

export default async function ServicePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [sv, s, areas, projects, costGuides, services, form] = await Promise.all([getService(slug), getSiteSettings(), getAreas(), getProjects(), getCostGuides(), getServices(), getQuoteForm()]);
  if (!sv) notFound();
  const phone = s.phones[0]?.number;
  const t = (template: string) => fmt(template, { service: sv.name.toLowerCase(), location: siteConfig.location.primary, businessName: s.businessName });
  const related = projects.filter((p) => p.serviceSlug === sv.slug).slice(0, 3);
  const cost = costGuides.find((c) => c.serviceSlug === sv.slug);
  return (
    <>
      {/* Ad landing ready: short quote form, tap-to-call and trust strip above the fold */}
      <section className="bg-ink pt-6 pb-8 text-white sm:pt-10 sm:pb-12" data-section="service-lead">
        <div className="container-x grid items-start gap-6 lg:grid-cols-[1fr_minmax(0,30rem)] lg:gap-12">
          <div>
            <Breadcrumbs items={[{ name: "Services", path: "/services" }, { name: sv.name, path: `/services/${sv.slug}` }]} />
            <h1 className="max-w-3xl text-3xl font-extrabold sm:text-5xl">{fmt(s.uiText.servicePageTitle, { service: sv.name, location: siteConfig.location.primary })}</h1>
            <p className="mt-3 max-w-2xl text-base text-white/80 sm:mt-4 sm:text-lg">{sv.summary}</p>
            {phone && (
              <a href={telHref(phone)} className="btn-outline mt-5 text-white" data-testid="service-call" data-track-location="service_page">
                <Phone className="size-5" aria-hidden /> Call {phone}
              </a>
            )}
          </div>
          <div id="quick-quote">
            <QuickQuoteForm
              heading={t(s.uiText.serviceQuickFormHeading)}
              services={services.map(({ slug, name }) => ({ slug, name }))}
              defaultProjectType={sv.slug}
              submitLabel={form.quickForm.submit}
              successText={form.quickForm.success.replace("{hours}", String(s.callbackHours))}
              addDetailText={form.quickForm.addDetail}
              consentText={form.quickForm.consent}
              location="service_page"
            />
          </div>
        </div>
      </section>
      <TrustStrip s={s} />
      <TwoCol aside={<CtaAside s={s} heading={t(s.uiText.serviceAsideHeading)} />}>
        <AnswerBox label={t(s.uiText.serviceAnswerLabel)} text={sv.answer} />
        <Media image={sv.image} className="mb-12 aspect-[16/9]" sizes="(min-width: 1024px) 700px, 100vw" priority />
        <TextSections sections={sv.sections} />
        {sv.formOptions.filter((o) => o !== "Not sure").length > 0 && (
          <p className="mt-8 text-lg"><strong>Types we build:</strong> {sv.formOptions.filter((o) => o !== "Not sure").join(", ")}.</p>
        )}
        {cost && <p className="mt-8"><Link href={`/cost-guides/${cost.slug}`} className="font-bold underline decoration-accent decoration-2 underline-offset-4">{cost.title}</Link></p>}
        <FaqList faqs={sv.faqs} heading={`${sv.name}: common questions`} />
        <section className="mt-14" aria-labelledby="areas-h">
          <h2 id="areas-h" className="mb-4 text-2xl font-extrabold">Where we build {sv.name.toLowerCase()}</h2>
          <ul className="flex flex-wrap gap-2">
            {areas.map((a) => <li key={a.slug}><Link href={`/areas/${a.slug}`} className="inline-block rounded-full border border-stone px-3 py-1.5 text-sm font-semibold hover:border-ink">{a.name}</Link></li>)}
          </ul>
        </section>
      </TwoCol>
      {related.length > 0 && (
        <section className="bg-sand py-14"><div className="container-x"><h2 className="h2 mb-8">Recent {sv.name.toLowerCase()} projects</h2><CaseStudyCards projects={related} /></div></section>
      )}
      <QuoteBand s={s} />
      <JsonLd data={serviceJsonLd(sv, areas)} />
      <JsonLd data={faqJsonLd(sv.faqs)} />
    </>
  );
}
