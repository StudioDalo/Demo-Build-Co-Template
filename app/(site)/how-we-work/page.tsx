import { getHomePage, getPage } from "@/lib/content";
import { pageMetadata } from "@/lib/seo/metadata";
import { howToJsonLd } from "@/lib/seo/jsonld";
import { JsonLd } from "@/components/ui/misc";
import { TextPage } from "@/components/page/TextPage";

export async function generateMetadata() {
  const p = await getPage("how-we-work");
  return pageMetadata({ path: "/how-we-work", title: p.title, description: p.intro, seo: p.seo });
}

export default async function HowWeWorkPage() {
  const [p, h] = await Promise.all([getPage("how-we-work"), getHomePage()]);
  return (
    <TextPage slug="how-we-work" path="/how-we-work" crumb="How we work">
      <JsonLd data={howToJsonLd(p.title, p.sections.length ? p.sections.map((s) => ({ title: s.heading, text: s.body.join(" ") })) : h.howItWorks.steps)} />
    </TextPage>
  );
}
