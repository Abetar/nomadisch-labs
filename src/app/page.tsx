// src/app/page.tsx
import Link from "next/link";
import { PosterCard } from "@/components/PosterCard";
import { Navbar } from "@/components/Navbar";
import { HeroVideo } from "@/components/HeroVideo";
import { FloatingTicketCTA } from "@/components/FloatingTicketCTA";
import { AboutNomadisch } from "@/components/AboutNomadisch";
import { Partnerships } from "@/components/Partnerships";
import { SocialMedia } from "@/components/SocialMedia";
import { MerchSection } from "@/components/MerchSection";
import { Gallery } from "@/components/Gallery";

import { listEvents, type AirtableEvent } from "@/lib/airtable";
import type { EventItem } from "@/lib/events";
import { resolveTicketUrl } from "@/lib/events";

// ⚠️ Ajusta esto a lo que ya tengas en tu proyecto (como lo resolviste tú)
// Si ya lo solucionaste, deja tu implementación actual.
async function getGlobals() {
  return {
    instagramUrl: "https://www.instagram.com/nomadischlabs/",
    ticketsCtaUrl: "",
    ticketsCtaText: "TICKETS",
    eventsCtaText: "VIEW ALL",
  };
}

function toEventItem(e: AirtableEvent): EventItem {
  return {
    id: e.id,
    slug: e.slug,
    title: e.title,
    status: e.status,
    dateStart: e.dateStart,
    dateEnd: e.dateEnd,
    city: e.city,
    state: e.state,
    country: e.country,
    venue: e.venue,
    address: e.address,
    ticketUrl: e.ticketUrl,
    instagramPostUrl: e.instagramPostUrl,
    description: e.description,
    coverUrl: e.coverUrl,
    lineup: [], // placeholder
  };
}

export default async function HomePage() {
  const globals = await getGlobals();

  const airtableEvents = await listEvents({ revalidateSeconds: 60 });
  const events = airtableEvents
    .map(toEventItem)
    // ✅ más reciente primero (por dateStart)
    .sort((a, b) => new Date(b.dateStart).getTime() - new Date(a.dateStart).getTime());

  const upcoming = events.find((e) => e.status === "upcoming") ?? null;

  const ticketUrl = resolveTicketUrl(upcoming?.ticketUrl, globals.ticketsCtaUrl);

  const floatingHref = ticketUrl || globals.instagramUrl;
  const floatingLabel = ticketUrl ? "TICKETS" : "IG";

  const primaryHref = ticketUrl || globals.instagramUrl;
  const primaryLabel = ticketUrl ? globals.ticketsCtaText : "FOLLOW / DM (IG)";

  return (
    <>
      <Navbar instagramUrl={globals.instagramUrl} />

      <HeroVideo src="/media/hero.mp4" poster="/media/hero-poster.jpg" defaultMuted />

      <header className="mt-6 border border-white/12 rounded-3xl p-6 md:p-10">
        <div className="text-xs font-semibold tracking-[0.34em] text-white/55">
          ROAMING EVENTS · MX
        </div>

        <h1 className="mt-3 font-extrabold tracking-tight text-5xl md:text-7xl [font-family:var(--font-display)]">
          NOMADISCH
          <span className="block opacity-90">LABS</span>
        </h1>

        <p className="mt-4 max-w-xl text-base leading-relaxed text-white/70">
          No corporate gloss. Just drops, lineups, and locations that move.
        </p>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link
            href={primaryHref}
            className="rounded-2xl bg-white px-5 py-3 text-center text-sm font-bold tracking-[0.18em] text-black"
            target={primaryHref.startsWith("http") ? "_blank" : undefined}
            rel={primaryHref.startsWith("http") ? "noreferrer" : undefined}
          >
            {primaryLabel}
          </Link>

          <Link
            href="/events"
            className="rounded-2xl border border-white/25 px-5 py-3 text-center text-sm font-bold tracking-[0.18em] text-white"
          >
            {globals.eventsCtaText}
          </Link>
        </div>

        <div className="mt-8 border-t border-white/10 pt-6">
          {upcoming ? (
            <div>
              <div className="text-xs font-semibold tracking-[0.24em] text-white/55">
                NEXT EVENT
              </div>
              <div className="mt-2 text-2xl font-extrabold tracking-tight">
                {upcoming.title}
              </div>
              <div className="mt-2 text-sm text-white/70">
                Live now. Get tickets before it disappears.
              </div>
            </div>
          ) : (
            <div>
              <div className="text-xs font-semibold tracking-[0.24em] text-white/55">
                NO UPCOMING EVENT
              </div>
              <div className="mt-2 text-2xl font-extrabold tracking-tight">
                NEXT DROP SOON.
              </div>
              <div className="mt-2 text-sm text-white/70">
                Follow IG for the next date & location.
              </div>
            </div>
          )}
        </div>
      </header>

      <AboutNomadisch />
      <Partnerships />
      <SocialMedia instagramUrl={globals.instagramUrl} />
      <MerchSection buyUrl={globals.instagramUrl} />
      <Gallery />

      <section className="mt-10">
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-xl font-extrabold tracking-tight [font-family:var(--font-display)]">
            EVENTS
          </h2>
          <Link
            href="/events"
            className="text-xs font-bold tracking-[0.24em] text-white/70 hover:text-white"
          >
            VIEW ALL
          </Link>
        </div>

        {/* ✅ ahora muestra 2 (los 2 más recientes) */}
        <div className="mt-5 grid gap-4">
          {events.slice(0, 2).map((event) => (
            <PosterCard key={event.slug} event={event} />
          ))}
        </div>
      </section>

      <FloatingTicketCTA href={floatingHref} label={floatingLabel} />
    </>
  );
}
