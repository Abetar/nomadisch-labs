// src/components/PosterCard.tsx
import Link from "next/link";
import type { EventItem } from "@/lib/events";
import { formatEventCity, formatEventDate, resolveTicketUrl } from "@/lib/events";

export function PosterCard({ event }: { event: EventItem }) {
  const ticketHref = resolveTicketUrl(event.ticketUrl, undefined);

  return (
    <div className="group overflow-hidden rounded-3xl border border-white/12 bg-black transition hover:border-white/25">
      {/* Cover */}
      {event.coverUrl ? (
        <div className="relative h-40 md:h-44">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={event.coverUrl}
            alt={event.title}
            className="h-full w-full object-cover grayscale"
            loading="lazy"
          />
          {/* subtle fade like your screenshot */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/10 via-black/30 to-black/90" />
        </div>
      ) : (
        <div className="h-32 md:h-36 bg-white/5" />
      )}

      {/* Body */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="text-xs font-semibold tracking-[0.24em] text-white/55">
            {formatEventDate(event.dateStart)} · {formatEventCity(event)}
          </div>

          <div className="shrink-0 rounded-full border border-white/20 px-3 py-1 text-[11px] font-bold tracking-[0.2em] text-white/70">
            {event.status.toUpperCase()}
          </div>
        </div>

        <h3 className="mt-3 text-2xl font-extrabold tracking-tight text-white group-hover:opacity-95">
          {event.title}
        </h3>

        {event.description ? (
          <p className="mt-2 max-w-prose text-sm leading-relaxed text-white/70">
            {event.description}
          </p>
        ) : null}

        <div className="mt-5 flex flex-wrap gap-3">
          {ticketHref ? (
            <Link
              href={ticketHref}
              target={ticketHref.startsWith("http") ? "_blank" : undefined}
              rel={ticketHref.startsWith("http") ? "noreferrer" : undefined}
              className="rounded-2xl bg-white px-5 py-3 text-xs font-extrabold tracking-[0.18em] text-black"
            >
              TICKETS
            </Link>
          ) : (
            <button
              disabled
              className="rounded-2xl bg-white/10 px-5 py-3 text-xs font-extrabold tracking-[0.18em] text-white/40"
              title="No ticket link available"
            >
              TICKETS
            </button>
          )}

          {/* ✅ Quitamos IG POST */}
          <Link
            href={`/events/${event.slug}`}
            className="rounded-2xl border border-white/25 px-5 py-3 text-xs font-extrabold tracking-[0.18em] text-white/90 hover:border-white/40"
          >
            DETAILS →
          </Link>
        </div>
      </div>
    </div>
  );
}
