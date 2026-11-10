import type { Area } from "@/lib/content/types";
import { buildAreas, type AreaSeed } from "@/lib/content/area-seed";
import { areaPage } from "@/packs/active/content";
import { config } from "../config";
import { siteSettings } from "./settings";


/**
 * DEMO areas: fictional neighbourhoods of the fictional town of Exampleton.
 * ZZ postcodes don't exist (safe to show). Replace with the client's real areas.
 */
const AREAS: AreaSeed[] = [
  { name: "Exampleton Central", council: "Exampleton Council", housing: "Victorian terraces and converted flats", neighbourhoods: "the Market Quarter, Station Road and Canal Side", postcodes: ["ZZ1"], nearby: ["Northside", "Riverside", "Old Town"] },
  { name: "Northside", council: "Exampleton Council", housing: "1930s semis and Edwardian terraces", neighbourhoods: "Northgate, Elm Park and the Common", postcodes: ["ZZ2"], nearby: ["Exampleton Central", "Hillcrest"] },
  { name: "Riverside", council: "Exampleton Council", housing: "Victorian terraces, many in a conservation area", neighbourhoods: "Mill Lane, the Wharf and Boatyard Row", postcodes: ["ZZ3"], nearby: ["Exampleton Central", "Old Town"] },
  { name: "Old Town", council: "Exampleton Council", housing: "Georgian and Victorian townhouses, mostly in a conservation area", neighbourhoods: "Church Street, the Green and Abbey Walk", postcodes: ["ZZ4"], nearby: ["Riverside", "Exampleton Central"] },
  { name: "Hillcrest", council: "Westshire District Council", housing: "1960s semis and detached family homes", neighbourhoods: "Hillcrest Village, Beacon Rise and Orchard Way", postcodes: ["ZZ5"], nearby: ["Northside", "Parkview"] },
  { name: "Parkview", council: "Westshire District Council", housing: "1930s semis and bungalows", neighbourhoods: "Parkview Estate, Lakeside and Meadow Lane", postcodes: ["ZZ6"], nearby: ["Hillcrest"] },
];

export const areas: Area[] = buildAreas(AREAS, areaPage, {
  businessName: siteSettings.businessName,
  location: config.location.primary,
  defaultBorough: (name) => `Borough of ${name}`,
});
