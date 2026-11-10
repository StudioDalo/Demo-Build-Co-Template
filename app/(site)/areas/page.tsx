import Link from "next/link";
import { MapPin } from "lucide-react";
import { getAreas, getPage } from "@/lib/content";
import { pageMetadata } from "@/lib/seo/metadata";
import { PageHero } from "@/components/ui/misc";

export async function generateMetadata() {
  const p = await getPage("areas");
  return pageMetadata({ path: "/areas", title: p.title, description: p.intro, seo: p.seo });
}

export default async function AreasPage() {
  const [p, areas] = await Promise.all([getPage("areas"), getAreas()]);
  return (
    <>
      <PageHero title={p.title} intro={p.intro} crumbs={[{ name: "Areas", path: "/areas" }]} />
      <ul className="container-x grid gap-4 py-14 sm:grid-cols-2 lg:grid-cols-3 lg:py-20">
        {areas.map((a) => (
          <li key={a.slug}>
            <Link href={`/areas/${a.slug}`} className="card flex h-full items-start gap-4 p-5 hover:shadow-xl">
              <MapPin className="mt-1 size-6 shrink-0 text-accent" aria-hidden />
              <span><span className="block text-lg font-bold">{a.name}</span><span className="text-sm text-muted">{a.postcodes.join(", ")}</span></span>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
