import type { Area, BeforeAfter, Faq, Guide, HomePage, Page, Project, Review, Section, Service, SiteSettings, Stat, TeamMember, TikTokItem, VideoRef } from "./types";
import { isPlaceholderValue } from "./placeholder";

/**
 * In production, anything still marked "[EDITABLE PLACEHOLDER]" or "[EDITABLE PLACEHOLDER: …]" (or flagged
 * placeholder) is removed, so visitors never see unfinished content. "[OWNER TO REVIEW…]" tags are stripped
 * from text (the sentence after them stays): they are reminders for the owner, shown in Studio and on previews.
 * The privacy policy and terms are NOT filtered: their gaps must be filled in before go-live.
 */
export const hasMarker = (v?: string | null) => Boolean(v && /\[EDITABLE PLACEHOLDER[^\]]*\]/i.test(v));
export const stripOwnerNotes = (v: string) => v.replace(/\[OWNER TO [A-Z ]+\]\s*/g, "").trim();

const sections = (ss: Section[]) =>
  ss
    .map((s) => ({ ...s, body: s.body.filter((b) => !hasMarker(b)).map(stripOwnerNotes).filter(Boolean) }))
    .filter((s) => s.body.length > 0 && !hasMarker(s.heading));

/** Labelled placeholder images (ph()) or the built-in /placeholders/ media */
const isPlaceholderImage = (i?: { url?: string; placeholder?: boolean }) => Boolean(i && (i.placeholder || /\/placeholders\//.test(i.url ?? "")));
const isPlaceholderVideo = (v: VideoRef) => Boolean(v.placeholder) || /\/placeholders\//.test(v.url ?? "") || /^placeholder/i.test(v.poster?.alt ?? "");

export const live = {
  settings: (s: SiteSettings): SiteSettings => ({
    ...s,
    // Never use a labelled placeholder as the social-share image
    seo: isPlaceholderImage(s.seo.ogImage) ? { ...s.seo, ogImage: undefined } : s.seo,
    insuranceNote: hasMarker(s.insuranceNote) ? "" : s.insuranceNote,
    accreditations: s.accreditations.filter((a) => !a.placeholder && !isPlaceholderValue(a.name)),
    promise: { ...s.promise, items: s.promise.items.filter((i) => !hasMarker(i.text) && !hasMarker(i.title)) },
  }),
  home: (h: HomePage): HomePage => ({
    ...h,
    hero: { ...h.hero, videos: h.hero.videos.filter((v) => !isPlaceholderVideo(v)) },
    questions: { ...h.questions, items: h.questions.items.filter((i) => !hasMarker(i.answer) && !hasMarker(i.question)) },
  }),
  services: (l: Service[]) => l.map((s) => ({ ...s, sections: sections(s.sections), faqs: live.faqs(s.faqs) })),
  tiktok: (l: TikTokItem[]) => l.filter((t) => !hasMarker(t.title)),
  projects: (l: Project[]) => l.filter((p) => !p.placeholder && !hasMarker(p.title)),
  beforeAfters: (l: BeforeAfter[]) => l.filter((b) => !hasMarker(b.title) && b.before.url && b.after.url && !b.before.placeholder && !b.after.placeholder),
  reviews: (l: Review[]) => l.filter((r) => !r.placeholder && !hasMarker(r.text) && !isPlaceholderValue(r.name)),
  faqs: (l: Faq[]) => l.filter((f) => !hasMarker(f.answer)),
  areas: (l: Area[]) => l.map((a) => ({ ...a, sections: sections(a.sections) })),
  guides: (l: Guide[]) => l.map((g) => ({ ...g, sections: sections(g.sections), faqs: live.faqs(g.faqs) })),
  team: (l: TeamMember[]) => l.filter((t) => !t.placeholder && !hasMarker(t.name)),
  stats: (l: Stat[]) => l.filter((s) => !s.placeholder && !isPlaceholderValue(s.value)),
  page: (p: Page): Page => ({ ...p, intro: hasMarker(p.intro) ? "" : stripOwnerNotes(p.intro), sections: sections(p.sections) }),
};
