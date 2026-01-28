export function AboutNomadisch() {
  return (
    <section className="mt-10 rounded-3xl border border-white/12 p-6 md:p-10">
      <div className="text-xs font-bold tracking-[0.28em] text-white/55">
        WHAT IS NOMADISCH
      </div>

      <h2 className="mt-3 text-3xl md:text-5xl font-extrabold tracking-tight [font-family:var(--font-display)]">
        A NOMADIC DJ PROJECT.
      </h2>

      <p className="mt-4 max-w-2xl text-sm md:text-base leading-relaxed text-white/75">
        Nomadisch Labs is not tied to one venue, one city, or one fixed lineup.
        We build nights that move — pop-ups, collabs, and drops where the sound matters more than the address.
      </p>

      <div className="mt-6 grid gap-3 md:grid-cols-1">
        <div className="rounded-2xl border border-white/12 p-5">
          <div className="text-xs font-bold tracking-[0.28em] text-white/55">FORMAT</div>
          <div className="mt-2 text-lg font-extrabold">Flexible lineups · rotating locations</div>
          <div className="mt-2 text-sm text-white/70">The project adapts. The identity stays.</div>
        </div>

        {/* <div className="rounded-2xl border border-white/12 p-5">
          <div className="text-xs font-bold tracking-[0.28em] text-white/55">HEAD</div>
          <div className="mt-2 text-lg font-extrabold">Arrazate</div>
          <div className="mt-2 text-sm text-white/70">Main selector / direction / sound curation.</div>
        </div> */}
      </div>
    </section>
  );
}
