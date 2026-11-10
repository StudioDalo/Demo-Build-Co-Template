import type { BeforeAfter, Project, Review, Stat, TeamMember, TikTokItem } from "@/lib/content/types";
import { ph } from "./helpers";

const TEST_TIKTOK = "https://www.tiktok.com/";

export const tiktokItems: TikTokItem[] = [
  { id: "tt-1", title: "[EDITABLE PLACEHOLDER] Latest build (video file)", projectType: "Loft conversion", url: TEST_TIKTOK, videoUrl: "/placeholders/hero-1.mp4", thumbnail: { url: "/placeholders/hero-1-poster.webp", alt: "Placeholder video thumbnail", width: 1080, height: 1350 }, hidden: false, order: 1 },
  { id: "tt-2", title: "[EDITABLE PLACEHOLDER] Site update (image thumbnail)", projectType: "Rear extension", url: TEST_TIKTOK, thumbnail: ph("TikTok thumbnail", "Placeholder TikTok thumbnail"), hidden: false, order: 2 },
  { id: "tt-3", title: "[EDITABLE PLACEHOLDER] Garden transformation", projectType: "Landscaping", url: TEST_TIKTOK, videoUrl: "/placeholders/hero-3.mp4", thumbnail: { url: "/placeholders/hero-3-poster.webp", alt: "Placeholder video thumbnail", width: 1080, height: 1350 }, hidden: false, order: 3 },
  { id: "tt-4", title: "[EDITABLE PLACEHOLDER] Handover day", projectType: "Wraparound extension", url: TEST_TIKTOK, thumbnail: ph("TikTok thumbnail", "Placeholder TikTok thumbnail"), hidden: false, order: 4 },
];

const projectBase = (n: number, title: string, serviceSlug: string): Project => ({
  slug: `example-project-${n}`,
  title: `[EDITABLE PLACEHOLDER] ${title}`,
  serviceSlug,
  area: "[Area]",
  summary: "[EDITABLE PLACEHOLDER] One-line summary of the project and the result for the homeowner.",
  brief: "[EDITABLE PLACEHOLDER] The brief: what the homeowners wanted and the problem with the existing space.",
  build: "[EDITABLE PLACEHOLDER] The build: structure, planning route, key decisions and how long it took.",
  finished: "[EDITABLE PLACEHOLDER] The finished space: what they got, and how it changed how they use the house.",
  facts: [
    { label: "Project", value: title },
    { label: "Area", value: "[Area]" },
    { label: "Duration", value: "[weeks on site]" },
    { label: "Planning route", value: "[PD / planning permission]" },
  ],
  images: [ph("Project photo: after"), ph("Project photo: during build"), ph("Project photo: before")],
  featured: true,
  placeholder: true,
  seo: {},
});

export const projects: Project[] = [
  projectBase(1, "Dormer loft conversion", "loft-conversions"),
  projectBase(2, "Wraparound kitchen extension", "wraparound-extensions"),
  projectBase(3, "Full garden landscaping", "landscaping"),
];

export const beforeAfters: BeforeAfter[] = [
  { id: "ba-1", title: "[EDITABLE PLACEHOLDER] Loft: before & after", caption: "Upload a matching before and after photo pair in Studio.", before: ph("BEFORE photo"), after: ph("AFTER photo"), hidden: false },
  { id: "ba-2", title: "[EDITABLE PLACEHOLDER] Garden: before & after", caption: "Upload a matching before and after photo pair in Studio.", before: ph("BEFORE photo"), after: ph("AFTER photo"), hidden: false },
];

const reviewPh = (n: number): Review => ({
  id: `review-${n}`,
  name: "[Customer first name]",
  area: "[Area]",
  projectType: "[Project type]",
  rating: 5,
  text: "[EDITABLE PLACEHOLDER] Paste a real Checkatrade or TikTok review here, word for word, with the customer's permission.",
  source: "Checkatrade",
  confirmed: false,
  placeholder: true,
  hidden: false,
});
export const reviews: Review[] = [reviewPh(1), reviewPh(2), reviewPh(3)];



export const team: TeamMember[] = [
  { name: "[EDITABLE PLACEHOLDER] Name", role: "Founder & Director", bio: "[EDITABLE PLACEHOLDER] Short bio: background, years in the trade, what you care about on site.", photo: ph("Team photo"), placeholder: true },
  { name: "[EDITABLE PLACEHOLDER] Name", role: "Project Manager", bio: "[EDITABLE PLACEHOLDER] Short bio.", photo: ph("Team photo"), placeholder: true },
];

export const stats: Stat[] = [
  { label: "projects completed", value: "[00]", placeholder: true },
  { label: "years trading", value: "[00]", placeholder: true },
  { label: "local areas covered", value: "6", placeholder: false },
];
