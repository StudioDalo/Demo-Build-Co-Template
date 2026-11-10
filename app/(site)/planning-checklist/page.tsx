import { getPage, getSiteSettings } from "@/lib/content";
import { pageMetadata } from "@/lib/seo/metadata";
import { PageHero } from "@/components/ui/misc";
import { TextSections } from "@/components/page/Blocks";
import { ChecklistForm } from "@/components/forms/ChecklistForm";

export async function generateMetadata() {
  const p = await getPage("planning-checklist");
  return pageMetadata({ path: "/planning-checklist", title: p.title, description: p.intro, seo: p.seo });
}

export default async function ChecklistPage() {
  const [p, s] = await Promise.all([getPage("planning-checklist"), getSiteSettings()]);
  return (
    <>
      <PageHero title={p.title} intro={p.intro} crumbs={[{ name: "Planning checklist", path: "/planning-checklist" }]} />
      <div className="container-x grid gap-12 py-14 lg:grid-cols-2 lg:py-20">
        <TextSections sections={p.sections} />
        <div className="card p-6 shadow-xl"><ChecklistForm cta={s.checklistPrompt.cta} location="checklist-page" /></div>
      </div>
    </>
  );
}
