import type { EventItem, Globals } from "@/lib/events";
import { formatEventCity, resolveTicketUrl } from "@/lib/events";

export function buildEventJsonLd(params: {
  event: EventItem;
  globals: Globals;
  siteUrl: string;
}) {
  const { event, globals, siteUrl } = params;

  const url = `${siteUrl}/events/${event.slug}`;
  const ticketUrl = resolveTicketUrl(event.ticketUrl, globals.ticketsCtaUrl);

  const cityLine = formatEventCity(event);
  const venue = event.venue && event.venue !== "TBA" ? event.venue : "";
  const address = event.address ?? "";

  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.title,
    startDate: event.dateStart,
    endDate: event.dateEnd || undefined,
    eventStatus:
      event.status === "cancelled"
        ? "https://schema.org/EventCancelled"
        : "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    location: {
      "@type": "Place",
      name: venue || cityLine,
      address: {
        "@type": "PostalAddress",
        addressLocality: event.city,
        addressRegion: event.state || undefined,
        addressCountry: event.country || "MX",
        streetAddress: address || undefined,
      }
    },
    image: event.cover ? [`${siteUrl}${event.cover}`] : undefined,
    description: event.description || `${event.title} — ${cityLine}.`,
    organizer: {
      "@type": "Organization",
      name: globals.brand,
      url: siteUrl
    },
    offers: ticketUrl
      ? {
          "@type": "Offer",
          url: ticketUrl,
          availability: "https://schema.org/InStock",
          priceCurrency: "MXN"
        }
      : undefined,
    url
  };
}
