import { getPage } from "@/lib/content";
import { pageMetadata } from "@/lib/seo/metadata";
import { TextPage } from "@/components/page/TextPage";

export async function generateMetadata() {
  const p = await getPage("terms");
  return pageMetadata({ path: "/terms", title: p.title, description: p.intro, seo: p.seo });
}

export default function TermsPage() {
  return <TextPage slug="terms" path="/terms" crumb="Terms" />;
}
