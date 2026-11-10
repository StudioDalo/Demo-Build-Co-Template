/**
 * Small, dependency-free facts about the pack (safe to import from Sanity Studio and the browser).
 */
export const meta = {
  slug: "loft-extension",
  name: "Loft conversions & extensions",
  /** schema.org LocalBusiness subtype */
  businessType: "HomeAndConstructionBusiness",
  knowsAbout: ["Loft conversions", "House extensions", "Permitted development", "Building regulations", "Party Wall Act", "Landscaping"],
  /** Service icon keys (must match ./icons.ts) */
  iconKeys: ["loft", "extension", "sideReturn", "wraparound", "storey", "garden", "kitchen", "refurb", "other"],
  /** Labels for the three case-study paragraphs */
  caseStudyLabels: { brief: "The brief", build: "The build", finished: "The finished space" },
  /** Answer-option groups this pack's quote form uses (Sanity → Quote form → Answer options). scored = counts towards hot/warm/cold. */
  optionGroups: [
    { key: "propertyType", title: "Property type" },
    { key: "propertyAge", title: "Approximate age" },
    { key: "ownership", title: "Do you own the property?" },
    { key: "timing", title: "Start date", scored: true },
    { key: "budget", title: "Budget range", scored: true },
    { key: "drawings", title: "Do you have drawings?", scored: true },
    { key: "planningStatus", title: "Planning permission", scored: true },
    { key: "architect", title: "Arrange an architect / drawings?", scored: true },
    { key: "partyWall", title: "Party wall issues" },
    { key: "staying", title: "Staying in during the works" },
    { key: "parking", title: "Parking" },
  ],
} as const;
