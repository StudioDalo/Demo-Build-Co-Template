import { getPage, getReviews, getSiteSettings } from "@/lib/content";
import { pageMetadata } from "@/lib/seo/metadata";
import { PageHero } from "@/components/ui/misc";
import { ReviewCards } from "@/components/home/Sections";

export async function generateMetadata() {
  const p = await getPage("reviews");
  return pageMetadata({ path: "/reviews", title: p.title, description: p.intro, seo: p.seo });
}

export default async function ReviewsPage() {
  const [p, reviews, s] = await Promise.all([getPage("reviews"), getReviews(), getSiteSettings()]);
  return (
    <>
      <PageHero title={p.title} intro={p.intro} crumbs={[{ name: "Reviews", path: "/reviews" }]} />
      <div className="container-x py-14 lg:py-20"><ReviewCards reviews={reviews} checkatradeUrl={s.checkatrade.url || s.social.checkatrade} /></div>
    </>
  );
}
