// src/app/admin/actions.ts
"use server";

import { revalidatePath } from "next/cache";
import {
  createEvent,
  listEvents,
  updateEventById,
  type UpsertEventInput,
  type EventStatus,
} from "@/lib/airtable";

export type AdminEventPayload = {
  password: string;
  id?: string;

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

  /**
   * ✅ Attachment control:
   * - undefined => DO NOT TOUCH (update keeps whatever is in Airtable)
   * - ""        => CLEAR attachment
   * - "https://" => SET attachment
   */
  coverUrl?: string;
};

function requireAdmin(password: string) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) throw new Error("Missing ADMIN_PASSWORD");
  if (password !== expected) throw new Error("Invalid admin password");
}

function cleanStr(v: any): string {
  return (v ?? "").toString();
}

function cleanOptStr(v: any): string | undefined {
  const s = cleanStr(v).trim();
  return s ? s : undefined;
}

/**
 * coverUrl normalization:
 * - if key not present => undefined
 * - if present but ""  => "" (clear)
 * - if present url     => trimmed url
 */
function normalizeCoverUrl(input: any): string | undefined {
  if (input === undefined) return undefined;
  const s = cleanStr(input).trim();
  // "" is meaningful (clear)
  return s;
}

function toUpsertInput(payload: AdminEventPayload): UpsertEventInput {
  return {
    slug: cleanStr(payload.slug),
    title: cleanStr(payload.title),
    status: payload.status,

    dateStart: cleanStr(payload.dateStart),
    dateEnd: cleanOptStr(payload.dateEnd),

    city: cleanStr(payload.city),
    state: cleanOptStr(payload.state),
    country: cleanOptStr(payload.country) ?? "MX",
    venue: cleanOptStr(payload.venue),
    address: cleanOptStr(payload.address),

    ticketUrl: cleanOptStr(payload.ticketUrl),
    instagramPostUrl: cleanOptStr(payload.instagramPostUrl),
    description: cleanOptStr(payload.description),

    coverUrl: normalizeCoverUrl(payload.coverUrl),
  };
}

// ✅ LIST: password as string (no FormData)
export async function adminListEventsAction(password: string) {
  requireAdmin(password);
  return await listEvents({ revalidateSeconds: 0 });
}

// ✅ CREATE: payload JSON
export async function adminCreateEventAction(payload: AdminEventPayload) {
  requireAdmin(payload.password);

  const input = toUpsertInput(payload);

  console.log("[ADMIN CREATE] coverUrl:", input.coverUrl);
  console.log("[ADMIN CREATE] coverUrl typeof:", typeof input.coverUrl);

  const created = await createEvent(input);

  revalidatePath("/");
  revalidatePath("/events");
  revalidatePath(`/events/${created.slug}`);

  return created;
}

// ✅ UPDATE: payload JSON
export async function adminUpdateEventAction(payload: AdminEventPayload) {
  requireAdmin(payload.password);

  const id = cleanStr(payload.id).trim();
  if (!id) throw new Error("Missing record id");

  const input = toUpsertInput(payload);

  console.log("[ADMIN UPDATE] id:", id);
  console.log("[ADMIN UPDATE] coverUrl:", input.coverUrl);
  console.log("[ADMIN UPDATE] coverUrl typeof:", typeof input.coverUrl);

  const updated = await updateEventById(id, input);

  revalidatePath("/");
  revalidatePath("/events");
  revalidatePath(`/events/${updated.slug}`);

  return updated;
}
