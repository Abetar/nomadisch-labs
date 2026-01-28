import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Navbar } from "@/components/Navbar";
import { getEventBySlug } from "@/lib/airtable";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://nomadischlabs.com";

function formatDateLong(iso: string) {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("es-MX", {
      year: "numeric",
      month: "long",
      day: "2-digit",
    });
  } catch {
    return iso;
  }
}

function locationLine(e: { city?: string; state?: string; country?: string }) {
  const parts = [e.city, e.state, e.country].filter(Boolean);
  return parts.join(", ");
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;

  const event = await getEventBySlug(slug, { revalidateSeconds: 60 });
  if (!event) return { title: "Event not found | Nomadisch Labs" };

  const title = `${event.title} | Nomadisch Labs`;
  const desc =
    event.description?.slice(0, 160) ||
    "Nomadisch Labs event — roaming drops, archived nights, no fixed city.";

  const url = `${SITE_URL}/events/${event.slug}`;

  return {
    title,
    description: desc,
    alternates: { canonical: url },
    openGraph: {
      title,
      description: desc,
      type: "article",
      url,
      siteName: "Nomadisch Labs",
      images: event.coverUrl ? [{ url: event.coverUrl }] : undefined,
    },
    twitter: {
      card: event.coverUrl ? "summary_large_image" : "summary",
      title,
      description: desc,
      images: event.coverUrl ? [event.coverUrl] : undefined,
    },
  };
}

export default async function EventDetailPage(
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const event = await getEventBySlug(slug, { revalidateSeconds: 60 });
  if (!event) return notFound();

  const instagramUrl = "https://www.instagram.com/nomadischlabs/";
  const loc = locationLine(event) || "MX";

  // JSON-LD básico para SEO (Event)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.title,
    startDate: event.dateStart,
    endDate: event.dateEnd || undefined,
    eventStatus:
      event.status === "cancelled"
        ? "https://schema.org/EventCancelled"
        : event.status === "upcoming"
        ? "https://schema.org/EventScheduled"
        : "https://schema.org/EventCompleted",
    location: {
      "@type": "Place",
      name: event.venue || loc || "Nomadisch Labs",
      address: {
        "@type": "PostalAddress",
        addressLocality: event.city || undefined,
        addressRegion: event.state || undefined,
        addressCountry: event.country || undefined,
        streetAddress: event.address || undefined,
      },
    },
    image: event.coverUrl ? [event.coverUrl] : undefined,
    description: event.description || undefined,
    url: `${SITE_URL}/events/${event.slug}`,
    offers: event.ticketUrl
      ? {
          "@type": "Offer",
          url: event.ticketUrl,
          availability:
            event.status === "upcoming"
              ? "https://schema.org/InStock"
              : "https://schema.org/SoldOut",
        }
      : undefined,
  };

  return (
    <>
      <Navbar instagramUrl={instagramUrl} />

      <main>
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

        <header className="rounded-3xl border border-white/12 p-6 md:p-10">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="text-xs font-bold tracking-[0.28em] text-white/55">
                {formatDateLong(event.dateStart)} · {loc}
              </div>

              <h1 className="mt-3 text-4xl md:text-6xl font-extrabold tracking-tight [font-family:var(--font-display)]">
                {event.title}
              </h1>

              <div className="mt-4 text-sm md:text-base text-white/70 max-w-2xl leading-relaxed">
                {event.description || "Roaming event. No fixed city. No fixed lineup."}
              </div>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                {event.ticketUrl ? (
                  <a
                    href={event.ticketUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-2xl bg-white px-5 py-3 text-center text-sm font-bold tracking-[0.18em] text-black hover:opacity-95"
                  >
                    TICKETS
                  </a>
                ) : (
                  <a
                    href={instagramUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-2xl bg-white px-5 py-3 text-center text-sm font-bold tracking-[0.18em] text-black hover:opacity-95"
                  >
                    FOLLOW / DM (IG)
                  </a>
                )}

                {event.instagramPostUrl ? (
                  <a
                    href={event.instagramPostUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-2xl border border-white/25 px-5 py-3 text-center text-sm font-bold tracking-[0.18em] text-white hover:border-white/40"
                  >
                    IG POST →
                  </a>
                ) : null}

                <Link
                  href="/events"
                  className="rounded-2xl border border-white/12 px-5 py-3 text-center text-sm font-bold tracking-[0.18em] text-white/75 hover:border-white/25 hover:text-white"
                >
                  BACK TO EVENTS →
                </Link>
              </div>
            </div>

            <div className="w-full md:w-[360px]">
              <div className="rounded-3xl border border-white/12 overflow-hidden bg-black">
                {event.coverUrl ? (
                  <div className="relative h-[320px] w-full">
                    <Image
                      src={event.coverUrl}
                      alt={event.title}
                      fill
                      className="object-cover grayscale"
                      sizes="(max-width: 768px) 100vw, 360px"
                      priority
                    />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    <div className="pointer-events-none absolute inset-0 opacity-[0.12] mix-blend-screen noise-animate" />
                  </div>
                ) : (
                  <div className="flex h-[320px] items-center justify-center p-8 text-center">
                    <div className="text-xl font-extrabold tracking-[0.12em] [font-family:var(--font-display)]">
                      NOMADISCH
                      <br />
                      LABS
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-3 text-xs text-white/55">
                Status:{" "}
                <span className="font-bold tracking-[0.18em] text-white/75">
                  {event.status.toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </header>

        <section className="mt-8 rounded-3xl border border-white/12 p-6 md:p-8">
          <div className="text-xs font-bold tracking-[0.28em] text-white/55">
            INFO
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-white/10 p-5">
              <div className="text-xs font-bold tracking-[0.24em] text-white/55">
                DATE
              </div>
              <div className="mt-2 text-sm text-white/85">
                {formatDateLong(event.dateStart)}
                {event.dateEnd ? ` — ${formatDateLong(event.dateEnd)}` : ""}
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 p-5">
              <div className="text-xs font-bold tracking-[0.24em] text-white/55">
                LOCATION
              </div>
              <div className="mt-2 text-sm text-white/85">
                {loc}
                {event.venue ? ` · ${event.venue}` : ""}
              </div>
              {event.address ? (
                <div className="mt-2 text-xs text-white/60">{event.address}</div>
              ) : null}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
