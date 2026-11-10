/**
 * Text for each area page (/areas/<slug>). The client lists the areas (clients/<client>/content/areas.ts);
 * this template turns each one into an intro, sections and SEO. Keep it specific to the area
 * (neighbourhoods, housing) so area pages aren't duplicates of each other.
 */
import type { AreaTemplate } from "@/lib/content/area-seed";

export const areaPage: AreaTemplate = (a, { businessName }) => ({
  intro: `${businessName} works in ${a.name}, including ${a.neighbourhoods}.`,
  sections: [
    {
      heading: `[EDITABLE PLACEHOLDER] Our work in ${a.name}`,
      body: ["[EDITABLE PLACEHOLDER] Add a sentence about a real job in this area, with a link to the case study."],
    },
  ],
  seo: { title: `[EDITABLE PLACEHOLDER] Trade in ${a.name} | ${businessName}`, description: `${businessName} in ${a.name} (${a.postcodes.join(", ")}).` },
});
