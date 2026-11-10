import Link from "next/link";
import { ArrowRight, MessageCircle, Phone } from "lucide-react";
import type { Faq, Section, SiteSettings } from "@/lib/content/types";
import { telHref, whatsappHref } from "@/lib/phone";
import { Prose } from "@/components/ui/Prose";
import { ArrowLink, PlaceholderNote } from "@/components/ui/misc";
import { fmt } from "@/config";

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

export function TextSections({ sections, toc }: { sections: Section[]; toc?: boolean }) {
  return (
    <div className="space-y-12">
      {toc && sections.length > 2 && (
        <nav aria-label="On this page" className="rounded-2xl bg-sand p-5">
          <p className="mb-2 font-bold">On this page</p>
          <ol className="list-decimal space-y-1 pl-5">
            {sections.map((s) => <li key={s.heading}><a href={`#${slug(s.heading)}`} className="underline-offset-4 hover:underline">{s.heading}</a></li>)}
          </ol>
        </nav>
      )}
      {sections.map((s) => (
        <section key={s.heading} aria-labelledby={slug(s.heading)}>
          <h2 id={slug(s.heading)} className="mb-4 text-2xl font-extrabold sm:text-3xl">{s.heading}</h2>
          <Prose body={s.body} />
        </section>
      ))}
    </div>
  );
}

/** FAQs rendered open (not collapsed) so answers are visible to readers, Google and AI crawlers. */
export function FaqList({ faqs, heading = "Frequently asked questions" }: { faqs: Faq[]; heading?: string }) {
  if (!faqs.length) return null;
  return (
    <section aria-labelledby="faq-h" className="mt-14">
      <h2 id="faq-h" className="mb-6 text-2xl font-extrabold sm:text-3xl">{heading}</h2>
      <dl className="divide-y divide-stone rounded-2xl border border-stone">
        {faqs.map((f) => (
          <div key={f.id} className="p-5 sm:p-6">
            <dt className="text-lg font-bold">{f.question}</dt>
            <dd className="mt-2 leading-relaxed text-ink/80">
              {f.answer}
              {f.link && <> <ArrowLink href={f.link.href} className="ml-1">{f.link.label}</ArrowLink></>}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

/** Sticky sidebar call-to-action on content pages. */
export function CtaAside({ s, heading, text }: { s: SiteSettings; heading?: string; text?: string }) {
  const phone = s.phones[0]?.number;
  return (
    <aside className="rounded-2xl bg-ink p-6 text-white lg:sticky lg:top-28" data-section="cta-aside">
      <h2 className="text-2xl font-extrabold">{heading ?? s.uiText.ctaAsideHeading}</h2>
      <p className="mt-2 text-white/75">{text ?? fmt(s.uiText.ctaAsideText, { hours: s.callbackHours })}</p>
      <div className="mt-5 grid gap-3">
        <Link href="/get-a-quote" className="btn-primary">{s.uiText.ctaAsideButton} <ArrowRight className="size-5" aria-hidden /></Link>
        {phone && <a href={telHref(phone)} className="btn-outline text-white"><Phone className="size-5" aria-hidden /> {phone}</a>}
        <a href={whatsappHref(s.whatsappNumber, s.whatsappMessage)} target="_blank" rel="noopener noreferrer" className="btn-outline text-white"><MessageCircle className="size-5" aria-hidden /> WhatsApp us</a>
      </div>
    </aside>
  );
}

export function ReviewFlag({ show, children }: { show?: boolean; children?: React.ReactNode }) {
  if (!show) return null;
  return <PlaceholderNote className="mb-8">{children ?? "[OWNER TO REVIEW BEFORE PUBLISHING] Check this page and tick “reviewed” in Studio."}</PlaceholderNote>;
}

/** Short, quotable answer box shown at the top of service/guide pages (AEO / featured snippet target). */
export function AnswerBox({ label = "Short answer", text }: { label?: string; text: string }) {
  return (
    <div className="mb-10 rounded-2xl border-l-4 border-accent bg-sand p-5 sm:p-6" data-testid="answer-box">
      <p className="eyebrow mb-2 text-muted">{label}</p>
      <p className="text-lg leading-relaxed font-medium">{text}</p>
    </div>
  );
}

export function TwoCol({ children, aside }: { children: React.ReactNode; aside: React.ReactNode }) {
  return (
    <div className="container-x grid gap-12 py-14 lg:grid-cols-[1fr_340px] lg:py-20">
      <div className="min-w-0 max-w-3xl">{children}</div>
      <div>{aside}</div>
    </div>
  );
}
