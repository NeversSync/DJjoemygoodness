/** Public site booking / contact form (Equilateral Expedition / JoeMyGoodness). */
export const BOOKING_CONTACT_HREF = "https://joemygoodness.com/#booking";

/** Prefer same-origin `/#booking` when already on the public site. */
export function bookingContactHref(): string {
  if (typeof window === "undefined") return BOOKING_CONTACT_HREF;
  const host = window.location.hostname;
  if (
    host === "joemygoodness.com"
    || host === "www.joemygoodness.com"
    || host.endsWith("joemygoodness.netlify.app")
    || host.endsWith("joemygoodness.netlify.com")
  ) {
    return "/#booking";
  }
  return BOOKING_CONTACT_HREF;
}

export function isBookingContactHref(href: string): boolean {
  return /#booking\b/i.test(href) || /joemygoodness\.(com|netlify\.(com|app)).*booking/i.test(href);
}
