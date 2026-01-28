// src/lib/events.ts
import {
  listEvents,
  type AirtableEvent,
  type EventStatus,
} from "@/lib/airtable";

export type EventItem = {
  id: string;
  slug: string;
  title: string;
  status: EventStatus;
  dateStart: string;
  dateEnd?: string;
  city: string;
  state?: string;
  country?: string;
  venue?: string;
  address?: string;
  ticketUrl?: string;
  instagramPostUrl?: string;
  description?: string;
  coverUrl?: string;
  lineup?: string[]; // ✅ tu PosterCard lo usa
};

export type Globals = {
  brand: string; // ✅ AÑADIR ESTO
  instagramUrl: string;
  ticketsCtaUrl?: string;
  ticketsCtaText?: string;
  eventsCtaText?: string;
};

// ✅ fallback inmediato para que compile HOY.
// Si luego quieres mover esto a Airtable “Globals” table o config, lo hacemos.
const DEFAULT_GLOBALS: Globals = {
  brand: "Nomadisch Labs",
  instagramUrl: "https://www.instagram.com/nomadischlabs/",
  ticketsCtaUrl: "",
  ticketsCtaText: "TICKETS",
  eventsCtaText: "VIEW ALL",
};

/**
 * Si tú ya tenías este helper, lo dejo compatible.
 */
export function formatEventDate(iso: string) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString("es-MX", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

export function formatEventCity(
  e: Pick<EventItem, "city" | "state" | "country">,
) {
  const parts = [e.city, e.state, e.country].filter(Boolean);
  return parts.join(", ");
}

/**
 * ✅ Mapea lo que viene de Airtable a tu EventItem esperado por la UI.
 * - lineup: intenta leerlo si existe en Airtable normalizado
 */
export function toEventItemFromAirtable(
  a: AirtableEvent & { lineup?: any },
): EventItem {
  let lineup: string[] = [];
  const raw = (a as any)?.lineup;

  if (Array.isArray(raw)) {
    lineup = raw.map((x) => String(x).trim()).filter(Boolean);
  } else if (typeof raw === "string") {
    lineup = raw
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean);
  }

  return {
    id: a.id,
    slug: a.slug,
    title: a.title,
    status: a.status,
    dateStart: a.dateStart,
    dateEnd: a.dateEnd,
    city: a.city,
    state: a.state,
    country: a.country,
    venue: a.venue,
    address: a.address,
    ticketUrl: a.ticketUrl,
    instagramPostUrl: a.instagramPostUrl,
    description: a.description,
    coverUrl: a.coverUrl,
    lineup,
  };
}

/**
 * ✅ Decide qué link usar para tickets.
 * - si eventTicketUrl es http(s) => úsalo
 * - si no, usa fallback global
 */
export function resolveTicketUrl(
  eventTicketUrl?: string,
  fallbackGlobalUrl?: string,
): string {
  const a = (eventTicketUrl || "").trim();
  if (a.startsWith("http")) return a;

  const b = (fallbackGlobalUrl || "").trim();
  if (b.startsWith("http")) return b;

  return "";
}

/**
 * ✅ Orden útil para UI:
 * - upcoming primero por dateStart ASC (el más cercano arriba)
 * - past después por dateStart DESC
 * - cancelled al final por dateStart DESC
 */
function sortEventsForUI(events: EventItem[]) {
  const ts = (x?: string) => (x ? new Date(x).getTime() : 0);

  const bucket = (s: EventStatus) => {
    if (s === "upcoming") return 0;
    if (s === "past") return 1;
    return 2; // cancelled
  };

  return [...events].sort((a, b) => {
    const ba = bucket(a.status);
    const bb = bucket(b.status);
    if (ba !== bb) return ba - bb;

    // upcoming asc, others desc
    if (a.status === "upcoming") return ts(a.dateStart) - ts(b.dateStart);
    return ts(b.dateStart) - ts(a.dateStart);
  });
}

/**
 * ✅ Reemplaza tu getAllEvents() anterior:
 * - Ahora trae events desde Airtable
 * - Retorna globals + events (compat con tu HomePage)
 */
export async function getAllEvents(): Promise<{
  globals: Globals;
  events: EventItem[];
}> {
  const airtableEvents = await listEvents({ revalidateSeconds: 60 });
  const events = sortEventsForUI(airtableEvents.map(toEventItemFromAirtable));

  // Si en algún momento quieres que globals venga de Airtable, aquí se cambia.
  const globals: Globals = DEFAULT_GLOBALS;

  return { globals, events };
}

/**
 * ✅ Reemplaza tu getUpcomingEvent() anterior.
 * - Devuelve el evento upcoming más cercano.
 */
export async function getUpcomingEvent(): Promise<{
  upcoming: EventItem | null;
}> {
  const airtableEvents = await listEvents({ revalidateSeconds: 60 });
  const events = airtableEvents.map(toEventItemFromAirtable);

  const upcomingSorted = events
    .filter((e) => e.status === "upcoming")
    .sort(
      (a, b) =>
        new Date(a.dateStart).getTime() - new Date(b.dateStart).getTime(),
    );

  return { upcoming: upcomingSorted[0] ?? null };
}
