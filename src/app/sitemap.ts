import type { MetadataRoute } from "next";
import { getAllEvents } from "@/lib/events";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { events } = await getAllEvents();

  const base: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: new Date() },
    { url: `${SITE_URL}/events`, lastModified: new Date() },
  ];

  const eventUrls = events.map((e) => ({
    url: `${SITE_URL}/events/${e.slug}`,
    lastModified: new Date(e.dateStart),
  }));

  return [...base, ...eventUrls];
}
