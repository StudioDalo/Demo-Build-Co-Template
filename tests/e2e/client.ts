/**
 * Expected values for the browser tests, read from the ACTIVE client's starter content
 * (clients/active), so the tests never hard-code one client's name, numbers or areas.
 */
import { config } from "@/clients/active/config";
import { areas, homePage, quoteForm, services, siteSettings, tiktokItems } from "@/clients/active/content";
import { toE164 } from "@/lib/phone";

export { areas, config, homePage, quoteForm, services, siteSettings, tiktokItems };
export const PHONE = siteSettings.phones[0].number;
export const PHONE2 = siteSettings.phones[1]?.number ?? PHONE;
export const PHONE_E164 = toE164(PHONE);
export const FIRST_AREA = areas[0];
export const LOCATION = config.location.primary;
export const BUSINESS = siteSettings.businessName;
export const LEGAL = siteSettings.legalName;
export const PREFIX = config.storagePrefix;
/** A valid UK mobile in Ofcom's drama range (never a real person) for form tests */
export const TEST_PHONE = "07700 900456";
export const TEST_PHONE_DIGITS = "07700900456";
export const TEST_PHONE2 = "07700 900789";
/** First "How did you hear about us?" option label */
export const HEARD_ABOUT = quoteForm.optionGroups.find((g) => g.key === "heardAbout")!.options[0].label;
