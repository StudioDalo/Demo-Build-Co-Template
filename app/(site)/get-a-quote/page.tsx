import { getPage, getQuoteForm, getServices, getSiteSettings } from "@/lib/content";
import { pageMetadata } from "@/lib/seo/metadata";
import { PageHero } from "@/components/ui/misc";
import { QuoteWizard } from "@/components/forms/QuoteWizard";

export async function generateMetadata() {
  const p = await getPage("get-a-quote");
  return pageMetadata({ path: "/get-a-quote", title: p.title, description: p.intro, seo: p.seo });
}

export default async function QuotePage() {
  const [p, form, services, s] = await Promise.all([getPage("get-a-quote"), getQuoteForm(), getServices(), getSiteSettings()]);
  return (
    <>
      <PageHero title={p.title} intro={p.intro} crumbs={[{ name: "Get a quote", path: "/get-a-quote" }]} />
      <div className="bg-sand px-4 py-10 sm:py-14">
        <QuoteWizard
          form={form}
          services={services.filter((sv) => sv.showInForm).map(({ slug, name, formOptions }) => ({ slug, name, formOptions }))}
          callbackHours={s.callbackHours}
        />
      </div>
    </>
  );
}
