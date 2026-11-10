/**
 * Service icons. Keys are stored on each Service document; values are lucide-react icons
 * (https://lucide.dev/icons). Add a key here AND in meta.iconKeys.
 */
import { Hammer, Wrench, type LucideIcon } from "lucide-react";

export const icons: Record<string, LucideIcon> = { main: Wrench, other: Hammer };
/** Used when a service has no icon or an unknown one */
export const fallbackIcon: LucideIcon = Wrench;
