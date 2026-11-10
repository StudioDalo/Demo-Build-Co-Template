import { Blocks, ChefHat, Fence, Hammer, Home, Layers, PanelsTopLeft, Sprout, Wrench, type LucideIcon } from "lucide-react";

/** Service icons this pack offers (Sanity → Service → icon). The key is stored on each service. */
export const icons: Record<string, LucideIcon> = {
  loft: Home, extension: Blocks, sideReturn: PanelsTopLeft, wraparound: Layers, storey: Hammer,
  garden: Sprout, kitchen: ChefHat, refurb: Wrench, other: Fence,
};
export const fallbackIcon: LucideIcon = Hammer;
