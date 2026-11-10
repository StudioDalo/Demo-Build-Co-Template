import { getPage, getStats, getTeam } from "@/lib/content";
import { pageMetadata } from "@/lib/seo/metadata";
import { TextPage } from "@/components/page/TextPage";
import { Media } from "@/components/ui/Media";

export async function generateMetadata() {
  const p = await getPage("about");
  return pageMetadata({ path: "/about", title: p.title, description: p.intro, seo: p.seo });
}

export default async function AboutPage() {
  const [team, stats] = await Promise.all([getTeam(), getStats()]);
  return (
    <TextPage slug="about" path="/about" crumb="About">
      <dl className="mt-12 grid grid-cols-3 gap-3">
        {stats.map((st) => (
          <div key={st.label} className="rounded-2xl bg-sand p-4 text-center" data-placeholder={st.placeholder || undefined}>
            <dt className="text-sm text-muted">{st.label}</dt>
            <dd className="order-first font-display text-3xl font-black">{st.value}</dd>
          </div>
        ))}
      </dl>
      <h2 className="mt-14 mb-6 text-2xl font-extrabold sm:text-3xl">Meet the team</h2>
      <ul className="grid gap-6 sm:grid-cols-2">
        {team.map((m, i) => (
          <li key={i} className="card overflow-hidden">
            <Media image={m.photo} className="aspect-square" rounded={false} sizes="(min-width: 640px) 350px, 100vw" />
            <div className="p-5"><h3 className="text-lg font-bold">{m.name}</h3><p className="text-sm font-semibold text-muted">{m.role}</p><p className="mt-2 text-sm">{m.bio}</p></div>
          </li>
        ))}
      </ul>
    </TextPage>
  );
}
