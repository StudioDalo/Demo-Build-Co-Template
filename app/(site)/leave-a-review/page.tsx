import { Star } from "lucide-react";
import { getPage, getSiteSettings } from "@/lib/content";
import { pageMetadata } from "@/lib/seo/metadata";
import { PageHero, PlaceholderNote } from "@/components/ui/misc";
import { fmt, siteConfig } from "@/config";

export async function generateMetadata() {
  const p = await getPage("leave-a-review");
  return pageMetadata({ path: "/leave-a-review", title: p.title, description: p.intro, seo: { ...p.seo, noindex: true } });
}

/** The page the owner sends customers to. It links out to the review platforms the owner has set up. */
export default async function LeaveReviewPage() {
  const [p, s] = await Promise.all([getPage("leave-a-review"), getSiteSettings()]);
  const links = [
    { label: fmt(s.uiText.reviewPlatformLink, { platform: siteConfig.reviewPlatform.name }), href: s.checkatrade.url || s.social.checkatrade },
    { label: "Review us on Google", href: s.social.googleBusiness },
    { label: "Comment on our TikTok", href: s.social.tiktok },
  ].filter((l): l is { label: string; href: string } => Boolean(l.href));
  return (
    <>
      <PageHero title={p.title} intro={p.intro} crumbs={[{ name: "Leave a review", path: "/leave-a-review" }]} />
      <div className="container-x max-w-2xl py-14" data-testid="review-links">
        <div className="mb-6 flex justify-center gap-1">{[1, 2, 3, 4, 5].map((n) => <Star key={n} className="size-10 fill-accent text-accent" aria-hidden />)}</div>
        <ul className="grid gap-3">
          {links.map((l) => <li key={l.href}><a href={l.href} target="_blank" rel="noopener noreferrer" className="btn-primary w-full text-lg">{l.label}</a></li>)}
        </ul>
        {!s.checkatrade.url && !s.social.checkatrade && <PlaceholderNote className="mt-6">[EDITABLE PLACEHOLDER] Add your {siteConfig.reviewPlatform.name} and Google review links in Site settings → Social & profile links.</PlaceholderNote>}
      </div>
    </>
  );
}
