/**
 * Plain-English guides (/guides) and cost guides (/cost-guides). Leave the arrays empty if the trade
 * doesn't need them: the pages then show nothing. Guides start with ownerReviewed: false, which shows
 * an [OWNER TO REVIEW] note. Cost guides need ownerApproved: true before any figure is shown.
 */
import type { CostGuide, Guide } from "@/lib/content/types";

export const guides: Guide[] = [];
export const costGuides: CostGuide[] = [];
