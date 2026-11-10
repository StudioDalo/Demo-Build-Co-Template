import { getBeforeAfters, getPage } from "@/lib/content";
import { pageMetadata } from "@/lib/seo/metadata";
import { PageHero } from "@/components/ui/misc";
import { BeforeAfterSlider } from "@/components/home/BeforeAfterSlider";

export async function generateMetadata() {
  const p = await getPage("before-and-after");
  return pageMetadata({ path: "/before-and-after", title: p.title, description: p.intro, seo: p.seo });
}

export default async function BeforeAfterPage() {
  const [p, items] = await Promise.all([getPage("before-and-after"), getBeforeAfters()]);
  return (
    <>
      <PageHero title={p.title} intro={p.intro} crumbs={[{ name: "Before & after", path: "/before-and-after" }]} />
      <div className="container-x grid gap-10 py-14 md:grid-cols-2 lg:py-20">{items.map((b) => <BeforeAfterSlider key={b.id} item={b} />)}</div>
    </>
  );
}
