import { notFound } from "next/navigation";
import Link from "next/link";
import { getGuide, getGuides, getSiteSettings } from "@/lib/content";
import { pageMetadata } from "@/lib/seo/metadata";
import { articleJsonLd, faqJsonLd } from "@/lib/seo/jsonld";
import { JsonLd, PageHero } from "@/components/ui/misc";
import { AnswerBox, CtaAside, FaqList, ReviewFlag, TextSections, TwoCol } from "@/components/page/Blocks";

export async function generateStaticParams() {
  return (await getGuides()).map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const g = await getGuide((await params).slug);
  if (!g) return {};
  return pageMetadata({ path: `/guides/${g.slug}`, title: g.title, description: g.summary, seo: g.seo });
}

const fmt = (d: string) => new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

export default async function GuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [g, s, all] = await Promise.all([getGuide(slug), getSiteSettings(), getGuides()]);
  if (!g) notFound();
  return (
    <>
      <PageHero title={g.title} intro={g.summary} crumbs={[{ name: "Guides", path: "/guides" }, { name: g.title, path: `/guides/${g.slug}` }]}>
        <p className="mt-6 text-sm text-white/60">Last reviewed <time dateTime={g.lastReviewed}>{fmt(g.lastReviewed)}</time> · General information for homeowners in England. Always check with your own council for your property.</p>
      </PageHero>
      <TwoCol aside={<CtaAside s={s} heading={s.uiText.guideAsideHeading} text={s.uiText.guideAsideText} />}>
        <ReviewFlag show={!g.ownerReviewed} />
        <AnswerBox text={g.answer} />
        <TextSections sections={g.sections} toc />
        <FaqList faqs={g.faqs} />
        <nav aria-label="More guides" className="mt-14">
          <h2 className="mb-4 text-2xl font-extrabold">{s.uiText.guidesMoreHeading}</h2>
          <ul className="space-y-2">
            {all.filter((x) => x.slug !== g.slug).map((x) => <li key={x.slug}><Link href={`/guides/${x.slug}`} className="font-semibold underline decoration-accent decoration-2 underline-offset-4">{x.title}</Link></li>)}
          </ul>
        </nav>
      </TwoCol>
      <JsonLd data={articleJsonLd(g)} />
      <JsonLd data={faqJsonLd(g.faqs)} />
    </>
  );
}
