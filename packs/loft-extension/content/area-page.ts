import type { AreaTemplate } from "@/lib/content/area-seed";

/** Area page text for loft & extension builders. [OWNER TO REVIEW] */
export const areaPage: AreaTemplate = (a, { businessName }) => ({
  intro: `${businessName} builds loft conversions, extensions and gardens in ${a.name}, including ${a.neighbourhoods}. Homes here are mostly ${a.housing}, and we know how to get the most space out of them.`,
  sections: [
    {
      heading: `Loft conversions in ${a.name}`,
      body: [
        `Rear dormers and hip-to-gable lofts are the most common way to add a bedroom and bathroom to ${a.housing.split(",")[0].toLowerCase()}. Many can be built under permitted development; homes in conservation areas or flats usually need planning permission from ${a.council}.`,
      ],
    },
    {
      heading: `House extensions in ${a.name}`,
      body: [
        `Side-return, rear and wraparound extensions open up the ground floor for kitchen and family space. We prepare drawings, handle planning or prior approval with ${a.council} where needed, and serve party wall notices on your neighbours.`,
      ],
    },
    {
      heading: `Do I need planning permission in ${a.name}?`,
      body: [
        `It depends on your property type, whether it's in a conservation area, and whether permitted development rights still apply. Always check with ${a.council} for your specific address. We check this for you at the free survey visit.`,
        "[EDITABLE PLACEHOLDER] Add a sentence about a real project you've completed in this area, with a link to the case study.",
      ],
    },
  ],
  seo: {
    title: `Loft Conversions & Extensions in ${a.name} | ${businessName}`,
    description: `Loft conversions, house extensions and landscaping in ${a.name} (${a.postcodes.join(", ")}). Free survey visit and fixed written quote from ${businessName}.`,
  },
});
