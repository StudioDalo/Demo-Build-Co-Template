import { notFound } from "next/navigation";
import Link from "next/link";
import { getArea, getAreas, getQuoteForm, getServices, getSiteSettings } from "@/lib/content";
import { pageMetadata } from "@/lib/seo/metadata";
import { ORG_ID } from "@/lib/seo/jsonld";
import { absoluteUrl } from "@/lib/site";
import { JsonLd, PageHero, ServiceIcon } from "@/components/ui/misc";
import { TextSections, TwoCol } from "@/components/page/Blocks";
import { QuickQuoteForm } from "@/components/forms/QuickQuoteForm";
import { fmt, siteConfig } from "@/config";

export async function generateStaticParams() {
  return (await getAreas()).map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const [a, s] = await Promise.all([getArea((await params).slug), getSiteSettings()]);
  if (!a) return {};
  return pageMetadata({ path: `/areas/${a.slug}`, title: fmt(s.uiText.areaMetaTitle, { area: a.name }), description: a.intro, seo: a.seo });
}

export default async function AreaPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [a, areas, services, s, form] = await Promise.all([getArea(slug), getAreas(), getServices(), getSiteSettings(), getQuoteForm()]);
  if (!a) notFound();
  const nearby = areas.filter((x) => a.nearby.includes(x.slug));
  return (
    <>
      <PageHero title={fmt(s.uiText.areaPageTitle, { area: a.name })} intro={a.intro} crumbs={[{ name: "Areas", path: "/areas" }, { name: a.name, path: `/areas/${a.slug}` }]}>
        <p className="mt-4 text-sm text-white/60">Covering {a.postcodes.join(", ")} and surrounding postcodes.</p>
      </PageHero>
      <TwoCol
        aside={
          <QuickQuoteForm
            heading={fmt(s.uiText.areaQuickFormHeading, { area: a.name })}
            services={services.map(({ slug, name }) => ({ slug, name }))}
            submitLabel={form.quickForm.submit}
            successText={form.quickForm.success.replace("{hours}", String(s.callbackHours))}
            addDetailText={form.quickForm.addDetail}
            consentText={form.quickForm.consent}
            location={`area-${a.slug}`}
          />
        }
      >
        <h2 className="mb-5 text-2xl font-extrabold sm:text-3xl">Our services in {a.name}</h2>
        <ul className="mb-12 grid gap-3 sm:grid-cols-2">
          {services.map((sv) => (
            <li key={sv.slug}><Link href={`/services/${sv.slug}`} className="flex items-center gap-3 rounded-xl border border-stone p-3 font-semibold hover:border-ink"><ServiceIcon icon={sv.icon} className="size-5 text-accent" />{sv.name} in {a.name}</Link></li>
          ))}
        </ul>
        <TextSections sections={a.sections} />
        {nearby.length > 0 && (
          <nav aria-label="Nearby areas" className="mt-12">
            <h2 className="mb-4 text-2xl font-extrabold">Nearby areas we cover</h2>
            <ul className="flex flex-wrap gap-2">{nearby.map((n) => <li key={n.slug}><Link href={`/areas/${n.slug}`} className="inline-block rounded-full border border-stone px-3 py-1.5 text-sm font-semibold hover:border-ink">{n.name}</Link></li>)}</ul>
          </nav>
        )}
      </TwoCol>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Service",
          name: fmt(s.uiText.areaPageTitle, { area: a.name }).replace(/ & /g, " and "),
          serviceType: s.uiText.areaServiceType,
          provider: { "@id": ORG_ID() },
          areaServed: { "@type": "AdministrativeArea", name: a.borough || a.name, containedInPlace: { "@type": "City", name: siteConfig.location.primary } },
          url: absoluteUrl(`/areas/${a.slug}`),
        }}
      />
    </>
  );
}
