import { notFound } from "next/navigation";
import Link from "next/link";
import { getProject, getProjects, getServices, getSiteSettings } from "@/lib/content";
import { pageMetadata } from "@/lib/seo/metadata";
import { PageHero, PlaceholderNote } from "@/components/ui/misc";
import { Media } from "@/components/ui/Media";
import { CtaAside, TwoCol } from "@/components/page/Blocks";
import { meta } from "@/packs/active/pack";

export async function generateStaticParams() {
  return (await getProjects()).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const p = await getProject((await params).slug);
  if (!p) return {};
  return pageMetadata({ path: `/projects/${p.slug}`, title: p.title, description: p.summary, seo: { ...p.seo, noindex: p.seo.noindex || p.placeholder } });
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [p, s, services] = await Promise.all([getProject(slug), getSiteSettings(), getServices()]);
  if (!p) notFound();
  const service = services.find((x) => x.slug === p.serviceSlug);
  return (
    <>
      <PageHero title={p.title} intro={p.summary} crumbs={[{ name: "Projects", path: "/projects" }, { name: p.title, path: `/projects/${p.slug}` }]} />
      <TwoCol aside={<CtaAside s={s} heading={s.uiText.projectAsideHeading} />}>
        {p.placeholder && <PlaceholderNote className="mb-8">[EDITABLE PLACEHOLDER] Example case study. Replace it with a real project in Studio. (Hidden from Google until then.)</PlaceholderNote>}
        <Media image={p.images[0]} className="aspect-[16/10]" sizes="(min-width: 1024px) 700px, 100vw" priority />
        <dl className="my-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {p.facts.map((f) => (<div key={f.label} className="rounded-xl bg-sand p-4"><dt className="text-xs font-bold text-muted uppercase">{f.label}</dt><dd className="mt-1 font-bold">{f.value}</dd></div>))}
        </dl>
        {([[meta.caseStudyLabels.brief, p.brief], [meta.caseStudyLabels.build, p.build], [meta.caseStudyLabels.finished, p.finished]] as const).map(([h, t]) => (
          <section key={h} className="mb-10"><h2 className="mb-3 text-2xl font-extrabold">{h}</h2><p className="text-lg leading-relaxed text-ink/85">{t}</p></section>
        ))}
        {p.images.length > 1 && (
          <div className="grid gap-4 sm:grid-cols-2">{p.images.slice(1).map((img, i) => <Media key={i} image={img} className="aspect-[4/3]" sizes="(min-width: 1024px) 350px, 100vw" />)}</div>
        )}
        {service && <p className="mt-10">More about our <Link href={`/services/${service.slug}`} className="font-bold underline decoration-accent decoration-2 underline-offset-4">{service.name.toLowerCase()}</Link>.</p>}
      </TwoCol>
    </>
  );
}
