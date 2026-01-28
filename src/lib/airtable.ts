// src/lib/airtable.ts

export type EventStatus = "upcoming" | "past" | "cancelled";

export type AirtableEvent = {
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
  coverUrl?: string; // derived from attachment
};

const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
const AIRTABLE_EVENTS_TABLE = process.env.AIRTABLE_EVENTS_TABLE || "Events";

/**
 * IMPORTANT:
 * Your Airtable attachment field is named exactly "coverURL"
 * Keep this aligned with Airtable.
 */
const AIRTABLE_COVER_FIELD = "coverURL";

function assertEnv() {
  if (!AIRTABLE_TOKEN) throw new Error("Missing AIRTABLE_TOKEN");
  if (!AIRTABLE_BASE_ID) throw new Error("Missing AIRTABLE_BASE_ID");
}

function baseUrl() {
  assertEnv();
  return `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(
    AIRTABLE_EVENTS_TABLE
  )}`;
}

function headers() {
  assertEnv();
  return {
    Authorization: `Bearer ${AIRTABLE_TOKEN}`,
    "Content-Type": "application/json",
  };
}

function normalizeRecord(rec: any): AirtableEvent | null {
  const f = rec?.fields ?? {};
  const slug = (f.slug ?? "").toString().trim();
  const title = (f.title ?? "").toString().trim();
  const status = (f.status ?? "").toString().trim() as EventStatus;
  const dateStart = f.dateStart ? new Date(f.dateStart).toISOString() : "";

  if (!slug || !title || !dateStart) return null;

  const coverArr = Array.isArray(f[AIRTABLE_COVER_FIELD])
    ? f[AIRTABLE_COVER_FIELD]
    : Array.isArray(f.cover)
      ? f.cover
      : null;

  const coverAttachment = Array.isArray(coverArr) ? coverArr[0] : null;

  const coverUrl =
    coverAttachment?.thumbnails?.large?.url ||
    coverAttachment?.url ||
    undefined;

  return {
    id: rec.id,
    slug,
    title,
    status: (status || "past") as EventStatus,
    dateStart,
    dateEnd: f.dateEnd ? new Date(f.dateEnd).toISOString() : undefined,
    city: (f.city ?? "").toString(),
    state: f.state?.toString(),
    country: f.country?.toString(),
    venue: f.venue?.toString(),
    address: f.address?.toString(),
    ticketUrl: f.ticketUrl?.toString(),
    instagramPostUrl: f.instagramPostUrl?.toString(),
    description: f.description?.toString(),
    coverUrl,
  };
}

async function airtableFetchJson(url: string, init?: RequestInit) {
  const res = await fetch(url, init);
  const text = await res.text();

  let data: any = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    // ignore JSON parse errors
  }

  if (!res.ok) {
    throw new Error(
      `Airtable request failed: ${res.status} ${text || "(no body)"}`
    );
  }

  return data;
}

/**
 * ✅ Validates that the URL is publicly reachable and looks like an image.
 * This catches the "200 update but no attachment" silent failure.
 */
async function validateRemoteImageUrlOrThrow(url: string) {
  const u = url.trim();
  if (!u) return;

  // Basic sanity
  if (!/^https?:\/\//i.test(u)) {
    throw new Error(
      `[Airtable attach] coverUrl is not http/https: ${u.slice(0, 80)}`
    );
  }

  const tryHead = async () => {
    const res = await fetch(u, {
      method: "HEAD",
      redirect: "follow",
      // Some CDNs behave differently without UA
      headers: { "User-Agent": "NomadischLabs-AirtableAttach/1.0" },
    });
    return res;
  };

  const tryGet = async () => {
    const res = await fetch(u, {
      method: "GET",
      redirect: "follow",
      headers: { "User-Agent": "NomadischLabs-AirtableAttach/1.0" },
    });
    return res;
  };

  let res: Response | null = null;

  // HEAD sometimes blocked; fallback to GET
  try {
    res = await tryHead();
    if (res.status === 405 || res.status === 403) {
      res = await tryGet();
    }
  } catch {
    // network/head blocked
    res = await tryGet();
  }

  if (!res.ok) {
    throw new Error(
      `[Airtable attach] coverUrl not reachable. HTTP ${res.status} ${res.statusText}. URL: ${u}`
    );
  }

  const ct = res.headers.get("content-type") || "";
  if (!ct.toLowerCase().startsWith("image/")) {
    // If GET was used, try to read a tiny snippet to help debugging
    let snippet = "";
    try {
      const txt = await res.text();
      snippet = txt.slice(0, 200);
    } catch {
      // ignore
    }
    throw new Error(
      `[Airtable attach] coverUrl is not an image. content-type="${ct}". URL: ${u}.` +
        (snippet ? ` Body starts with: ${JSON.stringify(snippet)}` : "")
    );
  }
}

export async function listEvents(opts?: { revalidateSeconds?: number }) {
  const revalidateSeconds = opts?.revalidateSeconds ?? 60;

  const all: AirtableEvent[] = [];
  let offset: string | undefined = undefined;

  for (let i = 0; i < 10; i++) {
    const url = new URL(baseUrl());
    url.searchParams.set("pageSize", "100");
    url.searchParams.set("sort[0][field]", "dateStart");
    url.searchParams.set("sort[0][direction]", "desc");
    if (offset) url.searchParams.set("offset", offset);

    const data = await airtableFetchJson(url.toString(), {
      headers: headers(),
      next: { revalidate: revalidateSeconds },
    });

    const records = Array.isArray(data?.records) ? data.records : [];
    const normalized = records
      .map(normalizeRecord)
      .filter(Boolean) as AirtableEvent[];

    all.push(...normalized);

    offset = data?.offset;
    if (!offset) break;
  }

  return all;
}

export async function getEventBySlug(
  slug: string,
  opts?: { revalidateSeconds?: number }
) {
  const events = await listEvents({
    revalidateSeconds: opts?.revalidateSeconds ?? 60,
  });
  return events.find((e) => e.slug === slug) ?? null;
}

export type UpsertEventInput = {
  slug: string;
  title: string;
  status: EventStatus;
  dateStart: string; // ISO or datetime-local
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
   * Admin provides a PUBLIC image URL (e.g. Cloudinary secure_url).
   * We write it into Airtable attachment field "coverURL".
   *
   * - ""        => clear attachment
   * - "https://" => set attachment
   * - undefined => do not touch field (only if you truly omit it)
   */
  coverUrl?: string;
};

function toAirtableFields(input: UpsertEventInput) {
  const dateStart = new Date(input.dateStart).toISOString();
  const dateEnd = input.dateEnd ? new Date(input.dateEnd).toISOString() : undefined;

  const fields: any = {
    slug: input.slug.trim(),
    title: input.title.trim(),
    status: input.status,
    dateStart,
    dateEnd,
    city: input.city?.trim() ?? "",
    state: input.state?.trim() || undefined,
    country: input.country?.trim() || "MX",
    venue: input.venue?.trim() || undefined,
    address: input.address?.trim() || undefined,
    ticketUrl: input.ticketUrl?.trim() || undefined,
    instagramPostUrl: input.instagramPostUrl?.trim() || undefined,
    description: input.description?.trim() || undefined,
  };

  // Attachments
  if (input.coverUrl !== undefined) {
    const url = input.coverUrl.trim();
    fields[AIRTABLE_COVER_FIELD] = url ? [{ url, filename: "cover.jpg" }] : [];
  }

  return fields;
}

function assertAttachmentIfProvided(input: UpsertEventInput, data: any, mode: "create" | "update") {
  if (!input.coverUrl) return; // only when truthy (non-empty)
  const arr = data?.fields?.[AIRTABLE_COVER_FIELD];
  const ok = Array.isArray(arr) && arr.length > 0;

  if (!ok) {
    throw new Error(
      `Airtable ${mode} succeeded but did NOT attach the image. ` +
        `This usually means Airtable could not fetch the URL (not public / blocked / not a direct image).`
    );
  }
}

export async function createEvent(input: UpsertEventInput) {
  if (input.coverUrl) {
    await validateRemoteImageUrlOrThrow(input.coverUrl);
  }

  const payload = { fields: toAirtableFields(input), typecast: true };

  const data = await airtableFetchJson(baseUrl(), {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(payload),
  });

  assertAttachmentIfProvided(input, data, "create");

  const normalized = normalizeRecord(data);
  if (!normalized) throw new Error("Created event could not be normalized");
  return normalized;
}

export async function updateEventById(id: string, input: UpsertEventInput) {
  if (input.coverUrl) {
    await validateRemoteImageUrlOrThrow(input.coverUrl);
  }

  const payload = { fields: toAirtableFields(input), typecast: true };

  // Helpful server logs (no secrets)
  console.log("[Airtable updateEventById] id:", id);
  console.log("[Airtable updateEventById] coverUrl:", input.coverUrl);
  console.log("[Airtable updateEventById] coverFieldName:", AIRTABLE_COVER_FIELD);
  console.log("[Airtable updateEventById] sending cover field?:", input.coverUrl !== undefined);

  const data = await airtableFetchJson(`${baseUrl()}/${id}`, {
    method: "PATCH",
    headers: headers(),
    body: JSON.stringify(payload),
  });

  console.log(
    "[Airtable updateEventById] returned cover field:",
    data?.fields?.[AIRTABLE_COVER_FIELD] ?? null
  );

  assertAttachmentIfProvided(input, data, "update");

  const normalized = normalizeRecord(data);
  if (!normalized) throw new Error("Updated event could not be normalized");
  return normalized;
}
