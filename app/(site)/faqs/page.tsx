import { getFaqs, getPage, getSiteSettings } from "@/lib/content";
import { pageMetadata } from "@/lib/seo/metadata";
import { faqJsonLd } from "@/lib/seo/jsonld";
import { JsonLd, PageHero } from "@/components/ui/misc";
import { CtaAside, FaqList, TwoCol } from "@/components/page/Blocks";

export async function generateMetadata() {
  const p = await getPage("faqs");
  return pageMetadata({ path: "/faqs", title: p.title, description: p.intro, seo: p.seo });
}

export default async function FaqsPage() {
  const [p, faqs, s] = await Promise.all([getPage("faqs"), getFaqs(), getSiteSettings()]);
  const groups = [...new Set(faqs.map((f) => f.category || "General"))];
  return (
    <>
      <PageHero title={p.title} intro={p.intro} crumbs={[{ name: "FAQs", path: "/faqs" }]} />
      <TwoCol aside={<CtaAside s={s} heading={s.uiText.faqAsideHeading} text={s.uiText.faqAsideText} />}>
        {groups.map((g) => <FaqList key={g} heading={g} faqs={faqs.filter((f) => (f.category || "General") === g)} />)}
      </TwoCol>
      <JsonLd data={faqJsonLd(faqs)} />
    </>
  );
}
