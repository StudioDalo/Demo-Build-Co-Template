import Link from "next/link";
import clsx from "clsx";
import { ArrowUpRight, Star } from "lucide-react";
import { fallbackIcon, icons } from "@/packs/active/pack";
import type { ServiceIcon as IconKey } from "@/lib/content/types";
import { breadcrumbJsonLd } from "@/lib/seo/jsonld";
import { hidePlaceholders } from "@/lib/site";

export function ServiceIcon({ icon, className }: { icon: IconKey; className?: string }) {
  const I = icons[icon] ?? fallbackIcon;
  return <I className={className} aria-hidden />;
}

export function JsonLd({ data }: { data: object | null | undefined }) {
  if (!data) return null;
  // Escape "<" so content can never close the script tag
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}

export function Stars({ rating, className }: { rating: number; className?: string }) {
  return (
    <span className={clsx("inline-flex gap-0.5", className)} role="img" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} className={clsx("size-4", n <= rating ? "fill-accent text-accent" : "text-stone")} aria-hidden />
      ))}
    </span>
  );
}

/** Yellow "[EDITABLE PLACEHOLDER]" notes for the owner. Not shown on the live domain. */
export function PlaceholderNote({ children, className }: { children: React.ReactNode; className?: string }) {
  if (hidePlaceholders()) return null;
  return (
    <p data-placeholder="true" className={clsx("rounded-lg border-2 border-dashed border-accent bg-accent/10 px-3 py-2 text-sm font-semibold text-ink", className)}>
      {children}
    </p>
  );
}

export function SectionHeading({ eyebrow, title, intro, id, align = "left", dark }: { eyebrow?: string; title: string; intro?: string; id?: string; align?: "left" | "center"; dark?: boolean }) {
  return (
    <div className={clsx("mb-10 max-w-3xl", align === "center" && "mx-auto text-center")}>
      {eyebrow && <p className={clsx("eyebrow mb-3", dark ? "text-accent" : "text-muted")}>{eyebrow}</p>}
      <h2 id={id} className={clsx("h2", dark && "text-white")}>{title}</h2>
      {intro && <p className={clsx("lead mt-4", dark && "text-white/75")}>{intro}</p>}
    </div>
  );
}

export function Breadcrumbs({ items }: { items: { name: string; path: string }[] }) {
  const all = [{ name: "Home", path: "/" }, ...items];
  return (
    <>
      <nav aria-label="Breadcrumb" className="mb-6 text-sm text-white/70">
        <ol className="flex flex-wrap items-center gap-1.5">
          {all.map((it, i) => (
            <li key={it.path} className="flex items-center gap-1.5">
              {i > 0 && <span aria-hidden>/</span>}
              {i === all.length - 1 ? <span aria-current="page" className="text-white">{it.name}</span> : <Link href={it.path} className="hover:text-white hover:underline">{it.name}</Link>}
            </li>
          ))}
        </ol>
      </nav>
      <JsonLd data={breadcrumbJsonLd(all)} />
    </>
  );
}

/** Dark page header used on every inner page. The H1 lives here. */
export function PageHero({ title, intro, crumbs, children }: { title: string; intro?: string; crumbs: { name: string; path: string }[]; children?: React.ReactNode }) {
  return (
    <section className="bg-ink pt-10 pb-14 text-white sm:pt-14 sm:pb-20">
      <div className="container-x">
        <Breadcrumbs items={crumbs} />
        <h1 className="max-w-4xl text-4xl font-extrabold sm:text-5xl lg:text-6xl">{title}</h1>
        {intro && <p className="mt-5 max-w-3xl text-lg text-white/80 sm:text-xl">{intro}</p>}
        {children}
      </div>
    </section>
  );
}

export function ArrowLink({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) {
  return (
    <Link href={href} className={clsx("inline-flex items-center gap-1.5 font-bold underline decoration-accent decoration-2 underline-offset-4 hover:gap-2.5 transition-all", className)}>
      {children} <ArrowUpRight className="size-4" aria-hidden />
    </Link>
  );
}
