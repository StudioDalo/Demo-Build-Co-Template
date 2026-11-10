import { Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { getPage, getQuoteForm, getServices, getSiteSettings } from "@/lib/content";
import { pageMetadata } from "@/lib/seo/metadata";
import { telHref, whatsappHref } from "@/lib/phone";
import { PageHero } from "@/components/ui/misc";
import { QuickQuoteForm } from "@/components/forms/QuickQuoteForm";

export async function generateMetadata() {
  const p = await getPage("contact");
  return pageMetadata({ path: "/contact", title: p.title, description: p.intro, seo: p.seo });
}

export default async function ContactPage() {
  const [p, s, services, form] = await Promise.all([getPage("contact"), getSiteSettings(), getServices(), getQuoteForm()]);
  return (
    <>
      <PageHero title={p.title} intro={p.intro} crumbs={[{ name: "Contact", path: "/contact" }]} />
      <div className="container-x grid gap-12 py-14 lg:grid-cols-2 lg:py-20">
        <address className="space-y-5 text-lg not-italic">
          <h2 className="text-2xl font-extrabold">{s.legalName}</h2>
          {s.phones.map((ph) => (
            <a key={ph.number} href={telHref(ph.number)} className="flex items-center gap-3 font-bold" data-track-location="contact_page"><Phone className="size-6 text-accent" aria-hidden />{ph.number} <span className="text-sm font-normal text-muted">({ph.label})</span></a>
          ))}
          <a href={whatsappHref(s.whatsappNumber, s.whatsappMessage)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 font-bold"><MessageCircle className="size-6 text-[#25D366]" aria-hidden />WhatsApp {s.whatsappNumber}</a>
          {s.email && <a href={`mailto:${s.email}`} className="flex items-center gap-3 font-bold"><Mail className="size-6 text-accent" aria-hidden />{s.email}</a>}
          <p className="flex items-center gap-3"><MapPin className="size-6 text-accent" aria-hidden />{[s.address.streetAddress, s.address.locality, s.address.postalCode].filter(Boolean).join(", ")}</p>
          {s.openingHours.length > 0 && (
            <div className="flex gap-3"><Clock className="size-6 shrink-0 text-accent" aria-hidden /><ul>{s.openingHours.map((h) => <li key={h.days}>{h.days}: {h.hours}</li>)}</ul></div>
          )}
        </address>
        <QuickQuoteForm
          heading={s.uiText.contactFormHeading}
          services={services.map(({ slug, name }) => ({ slug, name }))}
          submitLabel={form.quickForm.submit}
          successText={form.quickForm.success.replace("{hours}", String(s.callbackHours))}
          addDetailText={form.quickForm.addDetail}
          consentText={form.quickForm.consent}
          location="contact"
        />
      </div>
    </>
  );
}
