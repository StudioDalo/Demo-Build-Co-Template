import Link from "next/link";
import { ArrowRight, PlayCircle } from "lucide-react";
import {
  getBeforeAfters, getHomePage, getProjects, getQuoteForm, getReviews, getServices, getSiteSettings, getTikTokItems,
} from "@/lib/content";
import { pageMetadata } from "@/lib/seo/metadata";
import { faqJsonLd, howToJsonLd } from "@/lib/seo/jsonld";
import { HeroVideos } from "@/components/home/HeroVideos";
import { TikTokGallery } from "@/components/home/TikTokGallery";
import { BeforeAfterSlider } from "@/components/home/BeforeAfterSlider";
import {
  CaseStudyCards, HowItWorksSteps, PromiseSection, Questions, QuoteBand, ReviewCards, ServicesGrid, TrustStrip,
} from "@/components/home/Sections";
import { QuickQuoteForm } from "@/components/forms/QuickQuoteForm";
import { JsonLd, SectionHeading } from "@/components/ui/misc";
import { hidePlaceholders } from "@/lib/content/placeholder";
import { fmt } from "@/config";

export async function generateMetadata() {
  const [s, h] = await Promise.all([getSiteSettings(), getHomePage()]);
  return pageMetadata({ path: "/", title: s.businessName, seo: { ...s.seo, ...Object.fromEntries(Object.entries(h.seo).filter(([, v]) => v)) } });
}

export default async function HomePage() {
  const [s, h, services, tiktok, projects, beforeAfters, reviews, form] = await Promise.all([
    getSiteSettings(), getHomePage(), getServices(), getTikTokItems(), getProjects(), getBeforeAfters(), getReviews(), getQuoteForm(),
  ]);
  const featured = projects.filter((p) => p.featured).slice(0, 3);
  const videos = h.hero.mode === "single" ? h.hero.videos.slice(0, 1) : h.hero.videos.slice(0, 3);
  const fill = (t: string) => t.replace("{hours}", String(s.callbackHours));

  return (
    <>
      {/* 1. HERO */}
      <section className="relative overflow-hidden bg-ink text-white" data-section="hero" aria-labelledby="hero-h">
        <div aria-hidden className="absolute inset-0 bg-[radial-gradient(60%_60%_at_80%_20%,color-mix(in_srgb,var(--accent)_18%,transparent),transparent_70%)]" />
        <div className="container-x relative grid items-center gap-10 pt-7 pb-10 lg:grid-cols-12 lg:gap-14 lg:pt-16 lg:pb-16">
          <div className={videos.length ? "lg:col-span-7" : "lg:col-span-12"}>
            <p className="eyebrow mb-3 text-xs text-accent sm:mb-4 sm:text-sm">{fmt(s.uiText.heroEyebrow, { businessName: s.businessName })}</p>
            <h1 id="hero-h" className="text-[1.9rem] leading-[1.1] font-black sm:text-5xl lg:text-[3.6rem]">{h.hero.headline}</h1>
            <p className="mt-4 max-w-2xl text-base text-white/80 sm:mt-5 sm:text-xl">{h.hero.subheadline}</p>
            <div className="mt-6 flex flex-col gap-3 sm:mt-8 sm:flex-row">
              <Link href={h.hero.primaryCta.href} className="btn-primary text-lg" data-track-location="hero">
                {h.hero.primaryCta.label} <ArrowRight className="size-5" aria-hidden />
              </Link>
              <a href={h.hero.secondaryCta.href} className="btn-outline text-white">
                <PlayCircle className="size-5" aria-hidden /> {h.hero.secondaryCta.label}
              </a>
            </div>
          </div>
          {videos.length > 0 && (
            <div className="lg:col-span-5">
              <HeroVideos videos={videos} />
            </div>
          )}
        </div>
        {h.hero.showQuickForm && (
          <div className="container-x relative pb-12 lg:pb-16" id="quick-quote">
            <div className="mx-auto max-w-xl lg:max-w-none">
              <QuickQuoteForm
                heading={h.hero.quickFormHeading}
                services={services.map(({ slug, name }) => ({ slug, name }))}
                submitLabel={form.quickForm.submit}
                successText={fill(form.quickForm.success)}
                addDetailText={form.quickForm.addDetail}
                consentText={form.quickForm.consent}
                location="hero"
                layout="inline"
              />
            </div>
          </div>
        )}
      </section>

      {/* 2. TRUST STRIP */}
      <TrustStrip s={s} />

      {/* 3. SERVICES */}
      <section className="section" data-section="services" aria-labelledby="services-h">
        <div className="container-x">
          <SectionHeading id="services-h" eyebrow="Services" title={h.services.heading} intro={h.services.intro} />
          <ServicesGrid services={services} />
        </div>
      </section>

      {/* 4. TIKTOK GALLERY */}
      {tiktok.length > 0 && <section id="watch-us-build" className="section bg-sand" data-section="tiktok" aria-labelledby="tiktok-h">
        <div className="container-x">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <SectionHeading id="tiktok-h" eyebrow="Watch us build" title={h.tiktok.heading} intro={h.tiktok.intro} />
            <a href={h.tiktok.profileCta.href} target="_blank" rel="noopener noreferrer" className="btn-dark mb-10 shrink-0">{h.tiktok.profileCta.label}</a>
          </div>
          <TikTokGallery items={tiktok} viewLabel={h.tiktok.viewLabel} />
        </div>
      </section>}

      {/* 5. CASE STUDIES */}
      {featured.length > 0 && (
        <section className="section" data-section="case-studies" aria-labelledby="cases-h">
          <div className="container-x">
            <SectionHeading id="cases-h" eyebrow="Case studies" title={h.caseStudies.heading} intro={h.caseStudies.intro} />
            <CaseStudyCards projects={featured} />
          </div>
        </section>
      )}

      {/* 6. BEFORE & AFTER */}
      {beforeAfters.length > 0 && (
        <section className="section bg-sand" data-section="before-after" aria-labelledby="ba-h">
          <div className="container-x">
            <SectionHeading id="ba-h" eyebrow="Transformations" title={h.beforeAfter.heading} intro={h.beforeAfter.intro} />
            <div className="grid gap-8 md:grid-cols-2">
              {beforeAfters.slice(0, 2).map((b) => <BeforeAfterSlider key={b.id} item={b} />)}
            </div>
          </div>
        </section>
      )}

      {/* 7. REVIEWS */}
      {reviews.length > 0 && <section className="section" data-section="reviews" aria-labelledby="reviews-h">
        <div className="container-x">
          <SectionHeading id="reviews-h" eyebrow="Reviews" title={h.reviews.heading} intro={h.reviews.intro} />
          <ReviewCards reviews={reviews.slice(0, 3)} checkatradeUrl={s.checkatrade.url || s.social.checkatrade} ctaText={s.uiText.reviewsCta} />
        </div>
      </section>}

      {/* 8. QUESTIONS (AEO: question headings + direct answers) */}
      <section className="section bg-sand" data-section="questions" aria-labelledby="questions-h">
        <div className="container-x">
          <SectionHeading id="questions-h" eyebrow="Before you call" title={h.questions.heading} intro={h.questions.intro} />
          <Questions q={h.questions} />
        </div>
      </section>

      {/* 9. HOW IT WORKS */}
      <section className="section bg-ink" data-section="how-it-works" aria-labelledby="how-h">
        <div className="container-x">
          <SectionHeading id="how-h" eyebrow="Our process" title={h.howItWorks.heading} intro={h.howItWorks.intro} dark />
          <HowItWorksSteps steps={h.howItWorks.steps} />
        </div>
      </section>

      {/* 10. PROMISE */}
      {!(s.promise.placeholder && hidePlaceholders()) && (
        <section className="section" data-section="promise">
          <div className="container-x">
            <PromiseSection p={s.promise} />
          </div>
        </section>
      )}

      {/* 11. QUOTE BAND (footer follows from layout) */}
      <QuoteBand s={s} />

      <JsonLd data={faqJsonLd(h.questions.items.map((i) => ({ question: i.question, answer: i.answer })))} />
      <JsonLd data={howToJsonLd(h.howItWorks.heading, h.howItWorks.steps)} />
    </>
  );
}
