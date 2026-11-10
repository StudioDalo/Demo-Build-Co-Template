import { notFound } from "next/navigation";
import { getCostGuide, getCostGuides, getSiteSettings } from "@/lib/content";
import { pageMetadata } from "@/lib/seo/metadata";
import { PageHero, PlaceholderNote } from "@/components/ui/misc";
import { AnswerBox, CtaAside, TwoCol } from "@/components/page/Blocks";
import { fmt } from "@/config";

export async function generateStaticParams() {
  return (await getCostGuides()).map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const g = await getCostGuide((await params).slug);
  if (!g) return {};
  return pageMetadata({ path: `/cost-guides/${g.slug}`, title: g.title, description: g.summary, seo: g.seo });
}

export default async function CostGuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [g, s] = await Promise.all([getCostGuide(slug), getSiteSettings()]);
  if (!g) notFound();
  return (
    <>
      <PageHero title={g.title} intro={g.summary} crumbs={[{ name: "Cost guides", path: "/cost-guides" }, { name: g.title, path: `/cost-guides/${g.slug}` }]} />
      <TwoCol aside={<CtaAside s={s} heading="Get an exact price" text="Guide ranges only go so far. After a free survey you get a fixed written quote." />}>
        <AnswerBox text={fmt(s.uiText.costGuideAnswer, { factors: g.factors.slice(0, 3).map((f) => f.toLowerCase()).join(", ") })} />
        <h2 className="mb-4 text-2xl font-extrabold sm:text-3xl">Guide prices</h2>
        {!g.ownerApproved ? (
          <PlaceholderNote className="mb-6">[EDITABLE PLACEHOLDER] Guide prices will appear here once the owner has approved the figures in Studio. Until then, ask us for a free fixed quote.</PlaceholderNote>
        ) : null}
        <table className="w-full overflow-hidden rounded-2xl border border-stone text-left">
          <thead className="bg-sand text-sm"><tr><th scope="col" className="p-4">Project</th><th scope="col" className="p-4">From</th><th scope="col" className="hidden p-4 sm:table-cell">Notes</th></tr></thead>
          <tbody className="divide-y divide-stone">
            {g.ranges.map((r) => (
              <tr key={r.label}><th scope="row" className="p-4 font-semibold">{r.label}</th><td className="p-4 font-bold">{g.ownerApproved ? r.from : "Ask for a quote"}</td><td className="hidden p-4 text-sm text-muted sm:table-cell">{r.note}</td></tr>
            ))}
          </tbody>
        </table>
        <h2 className="mt-12 mb-4 text-2xl font-extrabold sm:text-3xl">What affects the price?</h2>
        <ul className="space-y-2 text-lg">{g.factors.map((f) => <li key={f} className="flex gap-3"><span aria-hidden className="mt-2.5 size-2 shrink-0 rounded-full bg-accent" />{f}</li>)}</ul>
      </TwoCol>
    </>
  );
}
