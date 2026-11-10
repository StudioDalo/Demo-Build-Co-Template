import { getPage, getSiteSettings } from "@/lib/content";
import { PageHero } from "@/components/ui/misc";
import { CtaAside, ReviewFlag, TextSections, TwoCol } from "./Blocks";

/** Generic CMS text page (About, How we work, Privacy, Terms …). */
export async function TextPage({ slug, path, crumb, children, after }: { slug: string; path: string; crumb: string; children?: React.ReactNode; after?: React.ReactNode }) {
  const [p, s] = await Promise.all([getPage(slug), getSiteSettings()]);
  return (
    <>
      <PageHero title={p.title} intro={p.intro} crumbs={[{ name: crumb, path }]} />
      <TwoCol aside={<CtaAside s={s} />}>
        <ReviewFlag show={p.ownerReview} />
        <TextSections sections={p.sections} />
        {children}
      </TwoCol>
      {after}
    </>
  );
}
