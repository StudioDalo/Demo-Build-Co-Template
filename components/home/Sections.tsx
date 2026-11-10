import Link from "next/link";
import { ArrowRight, BadgeCheck, CalendarClock, Check, ClipboardCheck, FileSignature, HardHat, KeyRound, MessageCircle, Phone, ShieldCheck, Star } from "lucide-react";
import type { HomePage, Project, Review, Service, SiteSettings } from "@/lib/content/types";
import { telHref, whatsappHref } from "@/lib/phone";
import { Media } from "@/components/ui/Media";
import { ArrowLink, PlaceholderNote, ServiceIcon, Stars } from "@/components/ui/misc";
import { hidePlaceholders, isPlaceholderValue } from "@/lib/content/placeholder";
import { fmt, siteConfig } from "@/config";
import { meta } from "@/packs/active/pack";

const platform = siteConfig.reviewPlatform.name;

export function TrustStrip({ s }: { s: SiteSettings }) {
  const t = s.trustStrip;
  const hide = hidePlaceholders();
  const items: { icon: React.ReactNode; text: React.ReactNode; placeholder?: boolean }[] = [];
  const star = <Star className="size-5 fill-accent text-accent" aria-hidden />;
  if (t.showRating === true) {
    if (s.checkatrade.rating) items.push({ icon: star, text: <><strong>{s.checkatrade.rating}/10</strong> on {platform}</> });
    else items.push({ icon: star, text: `[${platform} rating]`, placeholder: true });
  }
  if (t.showReviewCount === true) {
    if (s.checkatrade.reviewCount) items.push({ icon: <BadgeCheck className="size-5 text-accent" aria-hidden />, text: <><strong>{s.checkatrade.reviewCount}</strong> {t.reviewsLabel}</> });
    else items.push({ icon: <BadgeCheck className="size-5 text-accent" aria-hidden />, text: `[Number of] ${t.reviewsLabel}`, placeholder: true });
  }
  if (t.showYears === true) {
    if (s.yearsTrading) items.push({ icon: <CalendarClock className="size-5 text-accent" aria-hidden />, text: <><strong>{s.yearsTrading}</strong> {t.yearsLabel}</> });
    else items.push({ icon: <CalendarClock className="size-5 text-accent" aria-hidden />, text: `[00] ${t.yearsLabel}`, placeholder: true });
  }
  if (s.insured && t.showInsured === true) items.push({ icon: <ShieldCheck className="size-5 text-accent" aria-hidden />, text: t.insuredLabel });
  if (t.showAccreditations === true) s.accreditations.forEach((a) => items.push({ icon: <ClipboardCheck className="size-5 text-accent" aria-hidden />, text: a.name, placeholder: a.placeholder || isPlaceholderValue(a.name) }));
  // Placeholders like "[Checkatrade rating]" never render on the live domain
  const shown = hide ? items.filter((it) => !it.placeholder) : items;
  if (!shown.length) return null;

  const Wrapper = ({ children }: { children: React.ReactNode }) =>
    s.checkatrade.url ? <a href={s.checkatrade.url} target="_blank" rel="noopener noreferrer" className="contents">{children}</a> : <>{children}</>;

  return (
    <section aria-label="Why homeowners trust us" className="border-y border-white/10 bg-ink text-white" data-section="trust-strip" data-testid="trust-strip">
      <Wrapper>
        <ul className="container-x flex flex-wrap items-center justify-center gap-x-8 gap-y-3 py-5 text-sm sm:text-base">
          {shown.map((it, i) => (
            <li key={i} className="flex items-center gap-2" data-placeholder={it.placeholder || undefined}>
              {it.icon}
              <span className={it.placeholder ? "text-white/60 italic" : undefined}>{it.text}</span>
            </li>
          ))}
        </ul>
      </Wrapper>
    </section>
  );
}

export function ServicesGrid({ services }: { services: Service[] }) {
  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" data-testid="services-grid">
      {services.map((s) => (
        <li key={s.slug}>
          <Link href={`/services/${s.slug}`} className="group card flex h-full flex-col p-6 transition-shadow hover:shadow-xl">
            <span className="grid size-12 place-items-center rounded-xl bg-ink text-accent"><ServiceIcon icon={s.icon} className="size-6" /></span>
            <h3 className="mt-4 text-xl font-bold">{s.name}</h3>
            <p className="mt-2 flex-1 text-muted">{s.summary}</p>
            {s.formOptions.filter((o) => o !== "Not sure").length > 0 && (
              <p className="mt-3 text-sm font-semibold">{s.formOptions.filter((o) => o !== "Not sure").join(" · ")}</p>
            )}
            <span className="mt-4 inline-flex items-center gap-1 font-bold group-hover:gap-2 transition-all">Learn more <ArrowRight className="size-4" aria-hidden /></span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function CaseStudyCards({ projects }: { projects: Project[] }) {
  return (
    <ul className="grid gap-6 lg:grid-cols-3" data-testid="case-studies">
      {projects.map((p) => (
        <li key={p.slug} className="card flex flex-col overflow-hidden">
          <Media image={p.images[0]} className="aspect-[4/3]" rounded={false} />
          <div className="flex flex-1 flex-col p-6">
            <p className="eyebrow text-muted">{p.area}</p>
            <h3 className="mt-1 text-xl font-bold">{p.title}</h3>
            <dl className="mt-4 space-y-3 text-sm">
              {([[meta.caseStudyLabels.brief, p.brief], [meta.caseStudyLabels.build, p.build], [meta.caseStudyLabels.finished, p.finished]] as const).map(([k, v]) => (
                <div key={k}><dt className="font-bold">{k}</dt><dd className="line-clamp-3 text-muted">{v}</dd></div>
              ))}
            </dl>
            <ArrowLink href={`/projects/${p.slug}`} className="mt-5">Read the case study</ArrowLink>
          </div>
        </li>
      ))}
    </ul>
  );
}

export function ReviewCards({ reviews, checkatradeUrl, ctaText = "Read all our reviews on {platform}" }: { reviews: Review[]; checkatradeUrl?: string; ctaText?: string }) {
  return (
    <>
      <ul className="grid gap-5 md:grid-cols-3" data-testid="reviews">
        {reviews.map((r) => (
          <li key={r.id} className="card flex flex-col p-6" data-placeholder={r.placeholder || undefined}>
            {r.placeholder || !r.rating ? <span className="text-sm font-semibold text-muted">[Star rating]</span> : <Stars rating={r.rating} />}
            <blockquote className="mt-4 flex-1 text-lg leading-relaxed">&ldquo;{r.text}&rdquo;</blockquote>
            <p className="mt-5 font-bold">{r.name}, {r.area}</p>
            <p className="text-sm text-muted">{r.projectType} · via {r.source}</p>
          </li>
        ))}
      </ul>
      <div className="mt-8 flex flex-wrap items-center gap-4">
        {checkatradeUrl ? (
          <a href={checkatradeUrl} target="_blank" rel="noopener noreferrer" className="btn-dark" data-testid="checkatrade-badge">
            <BadgeCheck className="size-5 text-accent" aria-hidden /> {fmt(ctaText, { platform })}
          </a>
        ) : (
          <PlaceholderNote>[EDITABLE PLACEHOLDER] Add your {platform} profile URL in Site settings to show the {platform} badge link.</PlaceholderNote>
        )}
      </div>
    </>
  );
}

export function Questions({ q }: { q: HomePage["questions"] }) {
  return (
    <div className="grid gap-5 md:grid-cols-2" data-testid="questions">
      {q.items.map((it) => (
        <article key={it.question} className="card p-6">
          <h3 className="text-xl font-bold">{it.question}</h3>
          <p className="mt-3 leading-relaxed text-ink/80">{it.answer}</p>
          <ArrowLink href={it.link.href} className="mt-4">{it.link.label}</ArrowLink>
        </article>
      ))}
    </div>
  );
}

const STEP_ICONS = [HardHat, FileSignature, ClipboardCheck, CalendarClock, KeyRound];
export function HowItWorksSteps({ steps }: { steps: HomePage["howItWorks"]["steps"] }) {
  return (
    <ol className="grid gap-4 md:grid-cols-5" data-testid="how-it-works">
      {steps.map((st, i) => {
        const I = STEP_ICONS[i] ?? Check;
        return (
          <li key={st.title} className="relative rounded-2xl bg-white/5 p-6 ring-1 ring-white/10">
            <span className="font-display text-5xl font-black text-accent">{i + 1}</span>
            <I className="absolute top-6 right-6 size-6 text-white/40" aria-hidden />
            <h3 className="mt-3 text-lg font-bold text-white">{st.title}</h3>
            <p className="mt-2 text-sm text-white/70">{st.text}</p>
          </li>
        );
      })}
    </ol>
  );
}

export function PromiseSection({ p }: { p: SiteSettings["promise"] }) {
  // Unconfirmed promises are never shown on the live domain
  if ((p.placeholder && hidePlaceholders()) || !p.items.length) return null;
  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr]" data-testid="promise">
      <div>
        <h2 className="h2">{p.heading}</h2>
        {p.placeholder ? <PlaceholderNote className="mt-4">{p.intro}</PlaceholderNote> : <p className="lead mt-4">{p.intro}</p>}
      </div>
      <ul className="grid gap-4 sm:grid-cols-2">
        {p.items.map((it) => (
          <li key={it.title} className="flex gap-4 rounded-2xl bg-sand p-5">
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-accent"><Check className="size-5 text-ink" aria-hidden /></span>
            <div>
              <h3 className="font-bold">{it.title}</h3>
              <p className="mt-1 text-sm text-muted">{it.text}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function QuoteBand({ s }: { s: SiteSettings }) {
  const phone = s.phones[0]?.number;
  return (
    <section className="bg-accent" data-section="quote-band" data-testid="quote-band" aria-labelledby="quote-band-h">
      <div className="container-x flex flex-col gap-6 py-14 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-2xl">
          <h2 id="quote-band-h" className="h2 text-ink">{s.quoteBand.heading}</h2>
          <p className="mt-3 text-lg text-ink/80">{s.quoteBand.text}</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link href={s.quoteBand.cta.href} className="btn-dark" data-track-location="quote_band">{s.quoteBand.cta.label} <ArrowRight className="size-5" aria-hidden /></Link>
          {phone && <a href={telHref(phone)} className="btn-outline text-ink"><Phone className="size-5" aria-hidden /> {phone}</a>}
          <a href={whatsappHref(s.whatsappNumber, s.whatsappMessage)} target="_blank" rel="noopener noreferrer" className="btn-outline text-ink"><MessageCircle className="size-5" aria-hidden /> WhatsApp</a>
        </div>
      </div>
    </section>
  );
}
