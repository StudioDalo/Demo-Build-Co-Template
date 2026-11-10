import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { getQuoteForm, getSiteSettings } from "@/lib/content";
import { pageMetadata } from "@/lib/seo/metadata";
import { telHref } from "@/lib/phone";
import { ThankYouName } from "./ThankYouName";
import { ThankYouGate } from "./ThankYouGate";
import { fmt } from "@/config";

export async function generateMetadata() {
  return pageMetadata({ path: "/get-a-quote/thank-you", title: "Thank you", seo: { noindex: true } });
}

export default async function ThankYouPage() {
  const [form, s] = await Promise.all([getQuoteForm(), getSiteSettings()]);
  const phone = s.phones[0]?.number;
  return (
    <ThankYouGate>
    <section className="container-x py-20 text-center" data-testid="thank-you">
      <CheckCircle2 className="mx-auto size-16 text-green-600" aria-hidden />
      <h1 className="mt-6 text-4xl font-extrabold sm:text-5xl">{form.thankYou.heading}<ThankYouName /></h1>
      <p className="mx-auto mt-4 max-w-xl text-lg text-muted">{form.thankYou.text.replace("{hours}", String(s.callbackHours))}</p>
      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        {phone && <a href={telHref(phone)} className="btn-dark">{fmt(s.uiText.thankYouCallButton, { phone })}</a>}
        <Link href="/guides" className="btn-outline">{s.uiText.thankYouGuidesButton}</Link>
        {s.social.tiktok && <a href={s.social.tiktok} target="_blank" rel="noopener noreferrer" className="btn-outline">{s.uiText.thankYouSocialButton}</a>}
      </div>
    </section>
    </ThankYouGate>
  );
}
