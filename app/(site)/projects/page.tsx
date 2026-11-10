import { getPage, getProjects } from "@/lib/content";
import { pageMetadata } from "@/lib/seo/metadata";
import { PageHero } from "@/components/ui/misc";
import { CaseStudyCards } from "@/components/home/Sections";

export async function generateMetadata() {
  const p = await getPage("projects");
  return pageMetadata({ path: "/projects", title: p.title, description: p.intro, seo: p.seo });
}

export default async function ProjectsPage() {
  const [p, projects] = await Promise.all([getPage("projects"), getProjects()]);
  return (
    <>
      <PageHero title={p.title} intro={p.intro} crumbs={[{ name: "Projects", path: "/projects" }]} />
      <div className="container-x py-14 lg:py-20"><CaseStudyCards projects={projects} /></div>
    </>
  );
}
