import Link from "next/link";
import { FileText, Mail, MapPin, MessageCircle, Phone, ShieldCheck } from "lucide-react";
import type { Area, Service, SiteSettings } from "@/lib/content/types";
import { telHref, whatsappHref } from "@/lib/phone";
import { Logo } from "@/components/ui/Logo";
import { CookieSettingsButton } from "@/components/tracking/Tracking";
import { hidePlaceholders } from "@/lib/content/placeholder";
import { siteConfig } from "@/config";

export function AnnouncementBar({ a }: { a: SiteSettings["announcement"] }) {
  if (!a.enabled || !a.text) return null;
  return (
    <div className="bg-accent text-ink" data-section="announcement">
      <p className="container-x py-2 text-center text-xs font-semibold sm:text-sm">
        {a.text}{" "}
        {a.link && <Link href={a.link.href} className="underline underline-offset-2" data-track-location="banner">{a.link.label} →</Link>}
      </p>
    </div>
  );
}

/** Sticky bottom bar on mobile: Call / WhatsApp / Quote. */
export function MobileBar({ s }: { s: SiteSettings }) {
  const phone = s.phones[0]?.number;
  return (
    <nav aria-label="Quick contact" data-testid="mobile-bar" data-section="mobile-bar" className="fixed inset-x-0 bottom-0 z-50 grid grid-cols-3 border-t border-white/10 bg-ink pb-[env(safe-area-inset-bottom)] text-white md:hidden">
      {phone && (
        <a href={telHref(phone)} className="flex flex-col items-center gap-0.5 py-2.5 text-xs font-bold" data-track-location="sticky_bar">
          <Phone className="size-5 text-accent" aria-hidden /> {s.mobileBar.callLabel}
        </a>
      )}
      <a href={whatsappHref(s.whatsappNumber, s.whatsappMessage)} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-0.5 py-2.5 text-xs font-bold">
        <MessageCircle className="size-5 text-[#25D366]" aria-hidden /> {s.mobileBar.whatsappLabel}
      </a>
      <Link href="/get-a-quote" className="flex flex-col items-center gap-0.5 bg-accent py-2.5 text-xs font-bold text-ink" data-track-location="sticky_bar">
        <FileText className="size-5" aria-hidden /> {s.mobileBar.quoteLabel}
      </Link>
    </nav>
  );
}

export function Footer({ s, areas, services, cookieSettings }: { s: SiteSettings; areas: Area[]; services: Service[]; cookieSettings?: boolean }) {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-ink pb-24 text-white/80 md:pb-0" data-section="footer">
      <div className="container-x grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-4">
          <Logo className="w-32" />
          <p className="text-sm leading-relaxed">{s.footer.blurb}</p>
          {s.insured && s.trustStrip.showInsured === true && (
            <p className="flex items-center gap-2 text-sm font-semibold text-white"><ShieldCheck className="size-5 text-accent" aria-hidden /> {s.trustStrip.insuredLabel}</p>
          )}
        </div>
        {/* NAP: kept identical to the LocalBusiness schema for local SEO consistency */}
        <div>
          <h2 className="mb-4 font-display text-lg font-bold text-white">Contact</h2>
          <address className="space-y-3 text-sm not-italic">
            <p className="font-semibold text-white">{s.legalName}</p>
            {s.phones.map((p) => (
              <a key={p.number} href={telHref(p.number)} className="flex items-center gap-2 hover:text-accent" data-track-location="footer"><Phone className="size-4 text-accent" aria-hidden />{p.number}</a>
            ))}
            <a href={whatsappHref(s.whatsappNumber, s.whatsappMessage)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-accent"><MessageCircle className="size-4 text-accent" aria-hidden />WhatsApp {s.whatsappNumber}</a>
            {s.email && <a href={`mailto:${s.email}`} className="flex items-center gap-2 hover:text-accent"><Mail className="size-4 text-accent" aria-hidden />{s.email}</a>}
            <p className="flex items-center gap-2"><MapPin className="size-4 text-accent" aria-hidden />{[s.address.streetAddress, s.address.locality, s.address.postalCode].filter(Boolean).join(", ")}</p>
            {s.openingHours.map((h) => <p key={h.days}>{h.days}: {h.hours}</p>)}
          </address>
        </div>
        <div>
          <h2 className="mb-4 font-display text-lg font-bold text-white">Services</h2>
          <ul className="space-y-2 text-sm">
            {services.map((sv) => <li key={sv.slug}><Link href={`/services/${sv.slug}`} className="hover:text-accent">{sv.name}</Link></li>)}
            <li><Link href="/cost-guides" className="hover:text-accent">{s.uiText.footerCostGuidesLink}</Link></li>
            <li><Link href="/guides" className="hover:text-accent">{s.uiText.footerGuidesLink}</Link></li>
          </ul>
        </div>
        <div>
          <h2 className="mb-4 font-display text-lg font-bold text-white">Areas we cover</h2>
          <ul className="grid grid-cols-2 gap-x-3 gap-y-2 text-sm">
            {areas.map((a) => <li key={a.slug}><Link href={`/areas/${a.slug}`} className="hover:text-accent">{a.name}</Link></li>)}
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-x flex flex-col gap-4 py-6 text-xs sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            {s.accreditations.filter((a) => !(a.placeholder && hidePlaceholders())).map((a) => <span key={a.name} className="rounded border border-white/20 px-2 py-1">{a.name}</span>)}
            {s.social.tiktok && <a href={s.social.tiktok} target="_blank" rel="noopener noreferrer" className="font-semibold hover:text-accent">TikTok</a>}
            {s.social.checkatrade && <a href={s.social.checkatrade} target="_blank" rel="noopener noreferrer" className="font-semibold hover:text-accent">{siteConfig.reviewPlatform.name}</a>}
            {s.social.instagram && <a href={s.social.instagram} target="_blank" rel="noopener noreferrer" className="font-semibold hover:text-accent">Instagram</a>}
            {s.social.facebook && <a href={s.social.facebook} target="_blank" rel="noopener noreferrer" className="font-semibold hover:text-accent">Facebook</a>}
            {s.social.googleBusiness && <a href={s.social.googleBusiness} target="_blank" rel="noopener noreferrer" className="font-semibold hover:text-accent">Google reviews</a>}
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <span data-testid="legal-line">
              © {year} {s.legalName}.
              {s.companyNumber && <> {[s.registeredIn, `company no. ${s.companyNumber}`].filter(Boolean).join(", ")}.</>}
              {s.registeredAddress && <> Registered office: {s.registeredAddress}.</>}
              {s.footer.legalLine && <> {s.footer.legalLine}</>}
            </span>
            {s.footer.links.map((l) => <Link key={l.href} href={l.href} className="hover:text-accent">{l.label}</Link>)}
            {cookieSettings && <CookieSettingsButton label={s.cookieBanner.settingsLabel} />}
          </div>
        </div>
      </div>
    </footer>
  );
}
