import { getPage, getServices } from "@/lib/content";
import { pageMetadata } from "@/lib/seo/metadata";
import { PageHero } from "@/components/ui/misc";
import { ServicesGrid } from "@/components/home/Sections";

export async function generateMetadata() {
  const p = await getPage("services");
  return pageMetadata({ path: "/services", title: p.title, description: p.intro, seo: p.seo });
}

export default async function ServicesPage() {
  const [p, services] = await Promise.all([getPage("services"), getServices()]);
  return (
    <>
      <PageHero title={p.title} intro={p.intro} crumbs={[{ name: "Services", path: "/services" }]} />
      <div className="container-x py-14 lg:py-20"><ServicesGrid services={services} /></div>
    </>
  );
}
