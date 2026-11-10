/**
 * Facts about this trade that the template needs everywhere. No imports, so it's safe in any bundle.
 */
export const meta = {
  /** Folder name under /packs (clients choose a pack with `pack: "<slug>"` in clients/<client>/config.ts) */
  slug: "_blank",
  /** Human name, shown in docs only */
  name: "[EDITABLE PLACEHOLDER] Trade name",
  /**
   * schema.org LocalBusiness subtype for Google structured data. Pick the closest real type, e.g.
   * RoofingContractor, Plumber, Electrician, HVACBusiness, GeneralContractor, HomeAndConstructionBusiness.
   */
  businessType: "HomeAndConstructionBusiness",
  /** Topics the business is expert in (structured data). Plain nouns, no claims. */
  knowsAbout: ["[EDITABLE PLACEHOLDER] Main service"],
  /** Service icon keys. Must match the keys in ./icons.ts. Shown as a drop-down on each Service in Sanity. */
  iconKeys: ["main", "other"],
  /** Headings for the three paragraphs of a case study */
  caseStudyLabels: { brief: "The brief", build: "The work", finished: "The result" },
  /**
   * One entry per multiple-choice question in ./form (shared contact questions are added automatically).
   * key = the answer field name in ./form/schema.ts; title = what the owner sees in Sanity.
   * scored: true = the chosen option's points count towards the hot/warm/cold lead score
   * (also list the key in packForm.scoreFields).
   */
  optionGroups: [
    { key: "jobType", title: "Type of job" },
    { key: "timing", title: "Start date", scored: true },
  ],
} as const;
