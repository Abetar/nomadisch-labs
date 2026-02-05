import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { listEvents, type AirtableEvent } from "@/lib/airtable";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://nomadischlabs.com";

export const metadata = {
  title: "Events | Nomadisch Labs",
  description: "Nomadisch Labs events — upcoming drops and archived nights.",
  openGraph: {
    title: "Events | Nomadisch Labs",
    description:
      "Upcoming drops and archived nights. No fixed city. No fixed lineup.",
    url: `${SITE_URL}/events`,
    siteName: "Nomadisch Labs",
    type: "website",
    images: [
      // Pon tu OG real cuando lo tengas
      // { url: `${SITE_URL}/og.jpg`, width: 1200, height: 630, alt: "Nomadisch Labs" },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Events | Nomadisch Labs",
    description:
      "Upcoming drops and archived nights. No fixed city. No fixed lineup.",
    images: [
      // `${SITE_URL}/og.jpg`,
    ],
  },
};

function formatDate(iso: string) {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("es-MX", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  } catch {
    return iso;
  }
}

function locationLine(e: AirtableEvent) {
  const parts = [e.city, e.state, e.country].filter(Boolean);
  return parts.join(", ");
}

function StatusPill({ status }: { status: AirtableEvent["status"] }) {
  const label =
    status === "upcoming"
      ? "UPCOMING"
      : status === "past"
        ? "PAST"
        : "CANCELLED";

  return (
    <span className="rounded-full border border-white/20 px-3 py-1 text-[11px] font-bold tracking-[0.2em] text-white/75">
      {label}
    </span>
  );
}

function EventCard({ e }: { e: AirtableEvent }) {
  const detailsHref = `/events/${e.slug}`;
  const hasCover = Boolean(e.coverUrl?.trim());

  return (
    <article className="group relative overflow-hidden rounded-3xl border border-white/12 bg-black hover:border-white/30">
      {/* Cover (optional) */}
      {hasCover ? (
        <div className="relative h-56 md:h-64 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={e.coverUrl!}
            alt={e.title}
            className="h-full w-full object-cover grayscale"
            loading="lazy"
          />
          {/* Overlays */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black via-black/55 to-black/10" />
          <div className="pointer-events-none absolute inset-0 opacity-[0.12] mix-blend-screen noise-animate" />
        </div>
      ) : (
        <>
          {/* subtle texture (only when no cover) */}
          <div className="pointer-events-none absolute inset-0 opacity-[0.06] bg-[repeating-linear-gradient(135deg,#fff_0,#fff_10px,transparent_10px,transparent_26px)]" />
          <div className="pointer-events-none absolute inset-0 opacity-[0.10] mix-blend-screen noise-animate" />
        </>
      )}

      <div className="relative p-5 md:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs font-bold tracking-[0.28em] text-white/55">
            {formatDate(e.dateStart)} · {locationLine(e) || "MX"}
          </div>
          <StatusPill status={e.status} />
        </div>

        <h3 className="mt-3 text-2xl md:text-3xl font-extrabold tracking-tight [font-family:var(--font-display)]">
          {e.title}
        </h3>

        {e.description ? (
          <p className="mt-2 max-w-3xl text-sm text-white/70 line-clamp-2">
            {e.description}
          </p>
        ) : (
          <p className="mt-2 max-w-3xl text-sm text-white/70">
            No fixed city. No fixed lineup. Just the drop.
          </p>
        )}

        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          {/* ✅ Tickets */}
          {e.ticketUrl ? (
            <a
              href={e.ticketUrl}
              target="_blank"
              rel="noreferrer"
              className="rounded-2xl bg-white px-5 py-3 text-center text-sm font-bold tracking-[0.18em] text-black hover:opacity-95"
            >
              TICKETS
            </a>
          ) : null}

          {/* ✅ IG post */}
          {e.instagramPostUrl ? (
            <a
              href={e.instagramPostUrl}
              target="_blank"
              rel="noreferrer"
              className="rounded-2xl border border-white/25 px-5 py-3 text-center text-sm font-bold tracking-[0.18em] text-white hover:border-white/40"
            >
              IG POST →
            </a>
          ) : null}

          {/* ✅ Details (internal) */}
          <Link
            href={detailsHref}
            className="rounded-2xl border border-white/12 px-5 py-3 text-center text-sm font-bold tracking-[0.18em] text-white/75 hover:border-white/25 hover:text-white"
          >
            DETAILS →
          </Link>
        </div>
      </div>
    </article>
  );
}

export default async function EventsPage() {
  const events = await listEvents({ revalidateSeconds: 60 });

  const upcoming = events
    .filter((e) => e.status === "upcoming")
    .sort(
      (a, b) =>
        new Date(a.dateStart).getTime() - new Date(b.dateStart).getTime(),
    );

  const past = events
    .filter((e) => e.status === "past")
    .sort(
      (a, b) =>
        new Date(b.dateStart).getTime() - new Date(a.dateStart).getTime(),
    );

  const cancelled = events
    .filter((e) => e.status === "cancelled")
    .sort(
      (a, b) =>
        new Date(b.dateStart).getTime() - new Date(a.dateStart).getTime(),
    );

  const instagramUrl = "https://www.instagram.com/nomadischlabs/";

  async function getGlobals() {
    return {
      instagramUrl: "https://www.instagram.com/nomadischlabs/",
      ticketsCtaText: "TICKETS",
    };
  }

   const globals = await getGlobals();

  return (
    <>
      <Navbar
        instagramUrl={globals.instagramUrl}
        logoSrc="/media/nomadisch-logo.png"
        logoBoxWidth={64}
        logoBoxHeight={64}
        logoFit="cover"
        logoPosition="center"
      />

      <main>
        {/* Header */}
        <header className="rounded-3xl border border-white/12 p-6 md:p-10">
          <div className="text-xs font-semibold tracking-[0.34em] text-white/55">
            NOMADISCH LABS
          </div>

          <h1 className="mt-3 text-4xl md:text-6xl font-extrabold [font-family:var(--font-display)]">
            EVENTS
          </h1>

          <p className="mt-4 max-w-2xl text-sm md:text-base leading-relaxed text-white/70">
            Upcoming drops + archived nights. No fixed city. No fixed lineup.
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              href={instagramUrl}
              target="_blank"
              rel="noreferrer"
              className="rounded-2xl bg-white px-5 py-3 text-center text-sm font-bold tracking-[0.18em] text-black"
            >
              FOLLOW / DM (IG)
            </Link>

            <Link
              href="/"
              className="rounded-2xl border border-white/25 px-5 py-3 text-center text-sm font-bold tracking-[0.18em] text-white"
            >
              HOME
            </Link>
          </div>
        </header>

        {/* Upcoming */}
        <section className="mt-10">
          <div className="flex items-end justify-between gap-4">
            <h2 className="text-xl font-extrabold tracking-tight [font-family:var(--font-display)]">
              UPCOMING
            </h2>
            <div className="text-xs font-bold tracking-[0.24em] text-white/55">
              NEXT DROPS
            </div>
          </div>

          {upcoming.length > 0 ? (
            <div className="mt-5 grid gap-4">
              {upcoming.map((e) => (
                <EventCard key={e.id} e={e} />
              ))}
            </div>
          ) : (
            <div className="mt-5 rounded-3xl border border-white/12 p-6 md:p-8">
              <div className="text-xs font-bold tracking-[0.28em] text-white/55">
                NO UPCOMING EVENT
              </div>
              <div className="mt-2 text-2xl font-extrabold tracking-tight [font-family:var(--font-display)]">
                NEXT DROP SOON.
              </div>
              <div className="mt-2 text-sm text-white/70">
                Follow IG to catch the next date & location.
              </div>

              <div className="mt-5">
                <Link
                  href={instagramUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex rounded-2xl bg-white px-5 py-3 text-sm font-bold tracking-[0.18em] text-black"
                >
                  OPEN INSTAGRAM
                </Link>
              </div>
            </div>
          )}
        </section>

        {/* Past */}
        <section className="mt-10">
          <div className="flex items-end justify-between gap-4">
            <h2 className="text-xl font-extrabold tracking-tight [font-family:var(--font-display)]">
              PAST
            </h2>
            <div className="text-xs font-bold tracking-[0.24em] text-white/55">
              ARCHIVE
            </div>
          </div>

          {past.length > 0 ? (
            <div className="mt-5 grid gap-4">
              {past.map((e) => (
                <EventCard key={e.id} e={e} />
              ))}
            </div>
          ) : (
            <div className="mt-5 rounded-3xl border border-white/12 p-6 md:p-8 text-sm text-white/70">
              No past events yet.
            </div>
          )}
        </section>

        {/* Cancelled */}
        {cancelled.length > 0 ? (
          <section className="mt-10">
            <div className="flex items-end justify-between gap-4">
              <h2 className="text-xl font-extrabold tracking-tight [font-family:var(--font-display)]">
                CANCELLED
              </h2>
              <div className="text-xs font-bold tracking-[0.24em] text-white/55">
                STATUS
              </div>
            </div>

            <div className="mt-5 grid gap-4">
              {cancelled.map((e) => (
                <EventCard key={e.id} e={e} />
              ))}
            </div>
          </section>
        ) : null}

        <footer className="mt-12 border-t border-white/10 pt-8 text-xs text-white/55">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div className="font-bold tracking-[0.22em]">NOMADISCH LABS</div>
            <a
              href={instagramUrl}
              target="_blank"
              rel="noreferrer"
              className="font-bold tracking-[0.22em] hover:text-white"
            >
              INSTAGRAM →
            </a>
          </div>
        </footer>
      </main>
    </>
  );
}
