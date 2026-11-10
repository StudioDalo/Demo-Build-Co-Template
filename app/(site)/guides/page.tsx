import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getGuides, getPage } from "@/lib/content";
import { pageMetadata } from "@/lib/seo/metadata";
import { PageHero } from "@/components/ui/misc";

export async function generateMetadata() {
  const p = await getPage("guides");
  return pageMetadata({ path: "/guides", title: p.title, description: p.intro, seo: p.seo });
}

export default async function GuidesPage() {
  const [p, guides] = await Promise.all([getPage("guides"), getGuides()]);
  return (
    <>
      <PageHero title={p.title} intro={p.intro} crumbs={[{ name: "Guides", path: "/guides" }]} />
      <ul className="container-x grid gap-5 py-14 md:grid-cols-2 lg:py-20">
        {guides.map((g) => (
          <li key={g.slug}>
            <Link href={`/guides/${g.slug}`} className="group card flex h-full flex-col p-6 hover:shadow-xl">
              <h2 className="text-xl font-bold">{g.title}</h2>
              <p className="mt-2 flex-1 text-muted">{g.summary}</p>
              <span className="mt-4 inline-flex items-center gap-1 font-bold">Read the guide <ArrowRight className="size-4" aria-hidden /></span>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
