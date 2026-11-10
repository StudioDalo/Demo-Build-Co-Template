import type { CostGuide, Guide } from "@/lib/content/types";

const REVIEW = "[OWNER TO REVIEW BEFORE PUBLISHING]";
const lastReviewed = "2026-11-05";

export const guides: Guide[] = [
  {
    slug: "permitted-development",
    title: "Permitted development for lofts and extensions: a plain-English guide",
    summary: "What you can build without a full planning application, and when permitted development doesn't apply.",
    answer:
      "Permitted development (PD) rights let you carry out some extensions and loft conversions on a house without applying for planning permission, as long as you stay within set size and design limits. PD rights don't apply to flats or maisonettes, are restricted in conservation areas, and can be removed by an Article 4 direction. Always check with your own council for your property.",
    lastReviewed,
    ownerReviewed: false,
    sections: [
      {
        heading: "What does permitted development cover?",
        body: [
          "In England, houses (not flats) have permitted development rights for some types of work. The main ones for homeowners are:",
          "- **Single-storey rear extensions** within depth and height limits",
          "- **Loft conversions** within a volume allowance",
          "- **Some side extensions** (single storey, no more than half the width of the original house)",
          "- **Outbuildings** within size and height limits",
        ],
      },
      {
        heading: "Rear extension limits (general rules)",
        body: [
          "- A single-storey rear extension can usually go up to **3m** from the original rear wall on an attached or semi-detached house, and **4m** on a detached house.",
          "- Under the larger home extension (prior approval) scheme this can be up to **6m** (attached/semi) or **8m** (detached), but you must notify the council and neighbours first.",
          "- Maximum height is **4m**, and eaves within 2m of a boundary can't be higher than **3m**.",
          "- Extensions and outbuildings together can't cover more than half the land around the original house.",
        ],
      },
      {
        heading: "Loft conversion limits (general rules)",
        body: [
          "- Volume allowance of **40 cubic metres** for terraced houses and **50 cubic metres** for semi-detached and detached houses.",
          "- No extension beyond the roof slope facing the road at the front.",
          "- Nothing higher than the highest part of the existing roof.",
          "- Materials similar in appearance to the existing house.",
          "- Side-facing windows must be obscure-glazed and non-opening below 1.7m from the floor.",
          "- Dormers set back at least 20cm from the eaves as far as practicable.",
        ],
      },
      {
        heading: "When permitted development doesn't apply",
        body: [
          "- Flats and maisonettes",
          "- Many changes in conservation areas, national parks and other designated land",
          "- Listed buildings (listed building consent is needed)",
          "- Where an **Article 4 direction** has removed PD rights",
          "- Where previous planning conditions removed PD rights",
          "- Mansard roofs and most wraparound extensions usually need full planning permission",
        ],
      },
      {
        heading: "Should I get a Lawful Development Certificate?",
        body: [
          "A Lawful Development Certificate (LDC) is a formal confirmation from your council that the work is permitted development. It isn't legally required, but we recommend it: buyers' solicitors often ask for it when you sell.",
          `${REVIEW} These are general rules for houses in England, current as of the last review date. Check the Planning Portal and your own council before starting work.`,
        ],
      },
    ],
    faqs: [
      { id: "pd-1", question: "Do flats have permitted development rights?", answer: "No. Flats and maisonettes don't have householder permitted development rights, so most extensions and loft conversions to flats need planning permission." },
      { id: "pd-2", question: "Can I do a loft conversion under permitted development in a conservation area?", answer: "Generally no. Roof extensions in conservation areas usually need planning permission. Check with your council." },
    ],
    seo: {
      title: "Permitted Development for Lofts & Extensions ({location} Guide)",
      description: "Plain-English guide to permitted development rights for loft conversions and rear extensions in {location}: size limits, exceptions and Lawful Development Certificates.",
    },
  },
  {
    slug: "planning-permission",
    title: "Planning permission for extensions and lofts: what to expect",
    summary: "When you need a householder planning application, what's involved and how long it takes.",
    answer:
      "You need planning permission when your project goes beyond permitted development: for example most wraparound and double-storey extensions, mansard lofts, work to flats, and many projects in conservation areas. A householder application usually takes around 8 weeks to decide once validated. Always check with your own council for your property.",
    lastReviewed,
    ownerReviewed: false,
    sections: [
      {
        heading: "When do I need planning permission?",
        body: [
          "- Wraparound and most double-storey extensions",
          "- Mansard roof extensions and front dormers",
          "- Any work to flats and maisonettes",
          "- Many projects in conservation areas or on listed buildings",
          "- Anything bigger than the permitted development limits",
        ],
      },
      {
        heading: "What does a householder application involve?",
        body: [
          "- A site location plan and block plan",
          "- Existing and proposed floor plans, elevations and sometimes sections",
          "- An application form and the council's fee",
          "- A design and access statement or heritage statement in some areas",
          "The council consults your neighbours, who can comment. A planning officer then decides the application, sometimes with conditions such as materials.",
        ],
      },
      {
        heading: "How long does planning permission take?",
        body: [
          "Councils aim to decide householder applications within **8 weeks** of the application being validated. Validation itself can take a week or two. Prior approval for larger single-storey rear extensions has a **42-day** decision period.",
          "Permission usually lasts **3 years**, so you must start work within that time.",
        ],
      },
      {
        heading: "Can I get advice before applying?",
        body: [
          "Most {location} councils offer paid pre-application advice. It can be worth it for larger or sensitive projects. We'll tell you at the survey whether we think it's needed.",
          `${REVIEW} General information only. Check with your own council for your property.`,
        ],
      },
    ],
    faqs: [
      { id: "pp-1", question: "Can I start building before planning permission is granted?", answer: "You can, but it's at your own risk: if permission is refused you may be required to remove the work. We don't start structural work until the right approval is in place." },
    ],
    seo: {
      title: "Do I Need Planning Permission for an Extension or Loft? ({location})",
      description: "When you need planning permission for a loft conversion or extension in {location}, what a householder application involves, and how long it takes.",
    },
  },
  {
    slug: "building-regulations",
    title: "Building regulations and building control: a homeowner's guide",
    summary: "Building regulations are separate from planning, and almost every loft and extension needs them.",
    answer:
      "Building regulations set minimum standards for structure, fire safety, insulation, ventilation, drainage and stairs. Almost every loft conversion and extension needs building regulations approval, even when planning permission isn't required. At the end you should receive a completion certificate, which you'll need when you sell.",
    lastReviewed,
    ownerReviewed: false,
    sections: [
      {
        heading: "What do building regulations cover?",
        body: [
          "- **Structure (Part A):** beams, joists and foundations, backed by structural calculations",
          "- **Fire safety (Part B):** escape routes, fire doors and interlinked mains smoke alarms, especially for lofts",
          "- **Ventilation (Part F) and energy efficiency (Part L):** insulation, glazing and extract fans",
          "- **Drainage (Part H):** including build-over agreements if you build near a public sewer",
          "- **Stairs (Part K):** headroom and pitch, critical in loft conversions",
        ],
      },
      {
        heading: "Who checks the work?",
        body: [
          "Building control is carried out either by your council or by a registered building control approver. An inspector visits at key stages (foundations, steels, insulation, completion) and issues a **completion certificate** when the work complies.",
        ],
      },
      {
        heading: "Full plans or building notice?",
        body: [
          "A **full plans** application has the drawings checked before work starts. A **building notice** lets work start sooner but carries more risk of changes on site. For lofts and extensions we generally recommend full plans.",
          `${REVIEW} General information only. Check with your own council or building control body.`,
        ],
      },
    ],
    faqs: [
      { id: "br-1", question: "Do I need building regulations if I don't need planning permission?", answer: "Yes, usually. Planning and building regulations are separate. A permitted development loft still needs building regulations approval." },
    ],
    seo: {
      title: "Building Regulations for Lofts & Extensions Explained",
      description: "Plain-English guide to building regulations and building control for loft conversions and extensions: what's checked and why you need a completion certificate.",
    },
  },
  {
    slug: "party-wall",
    title: "Party wall basics: what {location} homeowners need to know",
    summary: "When the Party Wall etc. Act 1996 applies, what notices to serve, and how long it takes.",
    answer:
      "The Party Wall etc. Act 1996 applies when you work on a shared wall, build on the boundary, or dig foundations close to a neighbour's. You must serve written notice on affected neighbours, normally 1 to 2 months before work starts. If a neighbour doesn't consent, surveyors agree a party wall award. Most {location} loft conversions and extensions involve party wall notices.",
    lastReviewed,
    ownerReviewed: false,
    sections: [
      {
        heading: "When does the Party Wall Act apply?",
        body: [
          "- Cutting into a shared (party) wall, e.g. to bear steel beams for a loft",
          "- Building a new wall on or at the boundary line",
          "- Excavating within 3m of a neighbour's building (or 6m in some cases) and deeper than their foundations",
        ],
      },
      {
        heading: "How much notice do I need to give?",
        body: [
          "- **2 months** for work to a party wall",
          "- **1 month** for a new wall on the boundary or for excavation",
          "Your neighbour has **14 days** to respond. If they don't consent, or don't reply, a dispute is treated as having arisen and surveyors are appointed.",
        ],
      },
      {
        heading: "What is a party wall award?",
        body: [
          "A party wall award is a document drawn up by the surveyor(s) setting out what work will be done, how and when, usually with a schedule of condition of the neighbour's property. The building owner usually pays the surveyors' fees.",
          `${REVIEW} General information only, not legal advice.`,
        ],
      },
    ],
    faqs: [
      { id: "pw-1", question: "Can my neighbour stop my extension under the Party Wall Act?", answer: "No. The Act doesn't let a neighbour block work that has planning permission or is permitted development, but it sets out how the work must be done to protect their property." },
    ],
    seo: {
      title: "Party Wall Act Explained for Lofts & Extensions ({location})",
      description: "When you need party wall notices for a loft conversion or extension, notice periods, and how party wall awards work. Plain-English guide.",
    },
  },
];

const costReview = "[EDITABLE PLACEHOLDER: owner to approve figures]";

export const costGuides: CostGuide[] = [
  {
    slug: "loft-conversion-cost",
    title: "How much does a loft conversion cost in {location}?",
    serviceSlug: "loft-conversions",
    summary: "What drives the price of a dormer, hip-to-gable or mansard loft, and how we quote.",
    ranges: [
      { label: "Rear dormer loft", from: costReview, note: "Typical terrace, en-suite included" },
      { label: "Hip-to-gable + rear dormer", from: costReview, note: "Semi-detached or end of terrace" },
      { label: "Mansard loft", from: costReview, note: "Usually needs planning permission" },
    ],
    factors: [
      "Type of loft and size of the dormer",
      "Structural steels and roof condition",
      "Bathroom or en-suite, and its specification",
      "Staircase design and fire-safety upgrades",
      "Windows: dormer glazing, Velux or Juliet balcony",
      "Access, scaffolding and parking",
      "Level of finish: plastered, or fully decorated and floored",
    ],
    ownerApproved: false,
    seo: { title: "Loft Conversion Cost in {location}: What Affects the Price", description: "What drives the cost of a loft conversion in {location} and how to get a fixed written quote." },
  },
  {
    slug: "extension-cost",
    title: "How much does a house extension cost in {location}?",
    serviceSlug: "rear-extensions",
    summary: "Rear, side-return and wraparound extension cost factors explained.",
    ranges: [
      { label: "Single-storey rear extension", from: costReview, note: "Shell, roof, doors and finishes" },
      { label: "Side-return extension", from: costReview, note: "Including glazed roof" },
      { label: "Wraparound extension", from: costReview, note: "Planning permission usually required" },
    ],
    factors: [
      "Size and shape of the extension",
      "Foundations and ground conditions",
      "Steel beams and opening up the back of the house",
      "Roof type, roof lights and glazing",
      "Kitchen and flooring specification",
      "Drainage and build-over agreements",
    ],
    ownerApproved: false,
    seo: { title: "House Extension Cost in {location}: What Affects the Price", description: "What drives the cost of rear, side-return and wraparound extensions in {location}." },
  },
  {
    slug: "landscaping-cost",
    title: "How much does garden landscaping cost in {location}?",
    serviceSlug: "landscaping",
    summary: "Patios, decking, fencing and full garden makeovers.",
    ranges: [
      { label: "Porcelain patio", from: costReview, note: "Per square metre, laid on a full sub-base" },
      { label: "Full garden makeover", from: costReview, note: "Typical {location} terrace garden" },
    ],
    factors: ["Garden size and access", "Paving material", "Levels, steps and retaining walls", "Drainage", "Lighting and electrics"],
    ownerApproved: false,
    seo: { title: "Garden Landscaping Cost in {location}", description: "What drives the cost of patios, decking and garden landscaping in {location}." },
  },
];
