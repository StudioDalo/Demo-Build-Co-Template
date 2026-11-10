import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getCostGuides, getPage } from "@/lib/content";
import { pageMetadata } from "@/lib/seo/metadata";
import { PageHero } from "@/components/ui/misc";

export async function generateMetadata() {
  const p = await getPage("cost-guides");
  return pageMetadata({ path: "/cost-guides", title: p.title, description: p.intro, seo: p.seo });
}

export default async function CostGuidesPage() {
  const [p, guides] = await Promise.all([getPage("cost-guides"), getCostGuides()]);
  return (
    <>
      <PageHero title={p.title} intro={p.intro} crumbs={[{ name: "Cost guides", path: "/cost-guides" }]} />
      <ul className="container-x grid gap-5 py-14 md:grid-cols-3 lg:py-20">
        {guides.map((g) => (
          <li key={g.slug}>
            <Link href={`/cost-guides/${g.slug}`} className="card flex h-full flex-col p-6 hover:shadow-xl">
              <h2 className="text-xl font-bold">{g.title}</h2>
              <p className="mt-2 flex-1 text-muted">{g.summary}</p>
              <span className="mt-4 inline-flex items-center gap-1 font-bold">See what affects the price <ArrowRight className="size-4" aria-hidden /></span>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
