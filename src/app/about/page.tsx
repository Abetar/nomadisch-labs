// src/app/about/page.tsx
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { AboutNomadisch } from "@/components/AboutNomadisch";

async function getGlobals() {
  return {
    instagramUrl: "https://www.instagram.com/nomadischlabs/",
    ticketsCtaText: "TICKETS",
  };
}

export default async function AboutPage() {
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

      <header className="mt-6 border border-white/12 rounded-3xl p-6 md:p-10">
        <div className="text-xs font-semibold tracking-[0.34em] text-white/55">
          ABOUT · NOMADISCH LABS
        </div>

        <h1 className="mt-3 font-extrabold tracking-tight text-4xl md:text-6xl [font-family:var(--font-display)]">
          WHAT IS
          <span className="block opacity-90">NOMADISCH?</span>
        </h1>

        <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/70">
          A roaming DJ project built around pop-ups, collabs and drops — where
          the sound matters more than the address.
        </p>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/events"
            className="rounded-2xl bg-white px-5 py-3 text-center text-sm font-bold tracking-[0.18em] text-black"
          >
            VIEW EVENTS
          </Link>

          <Link
            href={globals.instagramUrl}
            target="_blank"
            rel="noreferrer"
            className="rounded-2xl border border-white/25 px-5 py-3 text-center text-sm font-bold tracking-[0.18em] text-white"
          >
            FOLLOW / DM (IG)
          </Link>
        </div>
      </header>

      {/* Reutilizamos el componente existente */}
      <AboutNomadisch />

      {/* CTA final “high-trust” */}
      <section className="mt-10 border border-white/12 rounded-3xl p-6 md:p-10">
        <div className="text-xs font-semibold tracking-[0.34em] text-white/55">
          READY
        </div>
        <h2 className="mt-3 text-2xl md:text-3xl font-extrabold tracking-tight [font-family:var(--font-display)]">
          Catch the next drop.
        </h2>
        <p className="mt-3 max-w-2xl text-sm md:text-base text-white/70 leading-relaxed">
          Events are limited. Tickets go fast. If there’s no upcoming event, we
          announce the next one on IG first.
        </p>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/events"
            className="rounded-2xl bg-white px-5 py-3 text-center text-sm font-bold tracking-[0.18em] text-black"
          >
            SEE EVENTS
          </Link>

          <Link
            href={globals.instagramUrl}
            target="_blank"
            rel="noreferrer"
            className="rounded-2xl border border-white/25 px-5 py-3 text-center text-sm font-bold tracking-[0.18em] text-white"
          >
            GET UPDATES (IG)
          </Link>
        </div>
      </section>
    </>
  );
}
