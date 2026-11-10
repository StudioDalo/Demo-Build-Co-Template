import type { Service } from "@/lib/content/types";
import { ph } from "@/lib/content/ph";

const base = { showInForm: true, hidden: false, seo: {} } as const;

export const services: Service[] = [
  {
    ...base,
    slug: "loft-conversions",
    name: "Loft conversions",
    icon: "loft",
    order: 1,
    summary: "Dormer, hip-to-gable and mansard lofts that add a bedroom and bathroom without losing the garden.",
    image: ph("Loft conversion photo", "Finished loft conversion bedroom"),
    answer:
      "A loft conversion turns unused roof space into a bedroom, bathroom or office. In {location} the most common types are rear dormer, hip-to-gable and mansard. Many dormer and hip-to-gable lofts can be built under permitted development, while mansards usually need planning permission.",
    formOptions: ["Dormer", "Hip-to-gable", "Mansard", "Not sure"],
    sections: [
      {
        heading: "Which loft conversion is right for my house?",
        body: [
          "- **Rear dormer:** a box-shaped extension off the back roof slope. The most popular choice for {location} terraces because it adds the most headroom for the cost.",
          "- **Hip-to-gable:** for semis and end-of-terraces with a sloping side roof. The side slope is built up into a vertical gable wall, often combined with a rear dormer.",
          "- **Mansard:** the rear (and sometimes front) slope is rebuilt almost vertical. It gives the most space and is common in conservation areas, but usually needs planning permission.",
          "We confirm the best fit at your free survey after checking head height, the roof structure and the planning route.",
        ],
      },
      {
        heading: "What's included in our loft conversions",
        body: [
          "Structural steels and floor joists, the dormer or gable build, roofing, insulation to current building regulations, a new staircase, fire safety upgrades, electrics, plumbing for an en-suite, plastering, and finishing ready for decoration or fully decorated.",
          "We also arrange the drawings, structural calculations, building control and party wall notices where needed.",
        ],
      },
    ],
    faqs: [
      {
        id: "loft-1",
        question: "Do I need planning permission for a loft conversion?",
        answer:
          "Often not. Many dormer and hip-to-gable lofts on houses fall under permitted development. Flats, houses in conservation areas, and mansards usually need permission. We check your property before you commit.",
      },
      {
        id: "loft-2",
        question: "Is my loft high enough to convert?",
        answer:
          "As a rule of thumb, measure from the top of the ceiling joists to the underside of the ridge. Around 2.2m or more is usually workable. We measure properly at the free survey.",
      },
    ],
  },
  {
    ...base,
    slug: "rear-extensions",
    name: "Rear extensions",
    icon: "extension",
    order: 2,
    summary: "Single-storey rear extensions for a bigger kitchen, dining and family space that opens onto the garden.",
    image: ph("Rear extension photo", "Finished rear extension with bi-fold doors"),
    answer:
      "A single-storey rear extension adds open-plan kitchen and living space at the back of the house. Smaller extensions can often be built under permitted development or the prior approval scheme; larger ones need a householder planning application.",
    formOptions: [],
    sections: [
      {
        heading: "What can a rear extension include?",
        body: [
          "Steel or glulam beams to open up the back of the house, a flat roof with roof lights or a pitched roof, bi-fold or sliding doors, underfloor heating, and a full kitchen fit-out if you want one.",
        ],
      },
    ],
    faqs: [],
  },
  {
    ...base,
    slug: "side-return-extensions",
    name: "Side-return extensions",
    icon: "sideReturn",
    order: 3,
    summary: "Fill the narrow side passage of a Victorian or Edwardian terrace to create a wide, light kitchen.",
    image: ph("Side-return extension photo", "Side-return extension with glazed roof"),
    answer:
      "A side-return extension builds into the narrow alley beside the back of a terraced house, widening the kitchen. It often uses a glazed or partly glazed roof to keep the space bright and usually needs party wall notices.",
    formOptions: [],
    sections: [
      {
        heading: "Why side-return extensions suit {location} terraces",
        body: [
          "Most Victorian and Edwardian terraces have a dark, narrow back kitchen beside an unused side passage. Building into that space can add width without losing much garden.",
        ],
      },
    ],
    faqs: [],
  },
  {
    ...base,
    slug: "wraparound-extensions",
    name: "Wraparound extensions",
    icon: "wraparound",
    order: 4,
    summary: "An L-shaped extension that combines the side return and the rear for the biggest ground-floor space.",
    image: ph("Wraparound extension photo", "Wraparound extension kitchen"),
    answer:
      "A wraparound extension combines a side-return and a rear extension in one L-shaped build. It creates the largest ground-floor space and almost always needs a householder planning application.",
    formOptions: [],
    sections: [
      {
        heading: "Planning a wraparound extension",
        body: [
          "Because it extends both to the side and the rear, a wraparound normally falls outside permitted development. We prepare the drawings and submit the planning application for you.",
        ],
      },
    ],
    faqs: [],
  },
  {
    ...base,
    slug: "double-storey-extensions",
    name: "Double-storey extensions",
    icon: "storey",
    order: 5,
    summary: "Add space on two floors at once, such as a bigger kitchen below and an extra bedroom above.",
    image: ph("Double-storey extension photo", "Double-storey rear extension"),
    answer:
      "A double-storey extension adds space on the ground and first floors in one build. It usually needs planning permission and is often better value per square metre than two separate projects.",
    formOptions: [],
    sections: [
      {
        heading: "Is a double-storey extension worth it?",
        body: [
          "The foundations, scaffolding and roof are shared, so the extra floor costs less per square metre than a separate project later.",
        ],
      },
    ],
    faqs: [],
  },
  {
    ...base,
    slug: "landscaping",
    name: "Landscaping & gardens",
    icon: "garden",
    order: 6,
    summary: "Patios, porcelain paving, decking, fencing, garden walls, lawns and outdoor lighting.",
    image: ph("Landscaping photo", "Landscaped garden with porcelain patio"),
    answer:
      "We design and build complete gardens: porcelain and stone patios, decking, fencing, raised beds, lawns, drainage and lighting. Garden landscaping rarely needs planning permission unless it involves raised platforms, large outbuildings or listed properties.",
    formOptions: [],
    sections: [
      {
        heading: "Garden landscaping services",
        body: [
          "- Porcelain, sandstone and slate patios",
          "- Composite and timber decking",
          "- Fencing, gates and garden walls",
          "- Artificial and natural lawns",
          "- Drainage, lighting and raised beds",
        ],
      },
    ],
    faqs: [],
  },
  {
    ...base,
    slug: "kitchens-and-bathrooms",
    name: "Kitchens & bathrooms",
    icon: "kitchen",
    order: 7,
    summary: "Kitchen and bathroom fit-outs, on their own or as part of an extension or loft.",
    image: ph("Kitchen or bathroom photo", "Finished kitchen fit-out"),
    answer:
      "We install kitchens and bathrooms from strip-out to final finish, including plumbing, electrics, tiling and plastering. Most kitchen and bathroom refits don't need planning permission, but electrical and some plumbing work must meet building regulations.",
    formOptions: [],
    sections: [
      {
        heading: "Kitchen and bathroom fit-outs",
        body: ["Supply-and-fit or fit-only, with first and second fix plumbing and electrics, tiling, plastering and decoration."],
      },
    ],
    faqs: [],
  },
  {
    ...base,
    slug: "full-refurbishments",
    name: "Full refurbishments",
    icon: "refurb",
    order: 8,
    summary: "Whole-house renovations: rewires, replastering, new layouts, and everything in between.",
    image: ph("Full refurbishment photo", "Refurbished living room"),
    answer:
      "A full refurbishment brings a whole property up to date: structural alterations, rewiring, replumbing, new heating, plastering, flooring and decoration. It's often combined with a loft or extension so the house is finished in one programme.",
    formOptions: [],
    sections: [
      {
        heading: "One programme, one team",
        body: ["We sequence the trades so you're not managing them, and you get one fixed quote for the agreed scope."],
      },
    ],
    faqs: [],
  },
];
