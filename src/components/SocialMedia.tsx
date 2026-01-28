import Link from "next/link";

type Social = {
  label: string;
  href: string;
  hint: string;
};

export function SocialMedia(props: { instagramUrl: string }) {
  const socials: Social[] = [
    { label: "INSTAGRAM", href: props.instagramUrl, hint: "drops / flyers / recaps" },
    // Opcionales a futuro:
    // { label: "SOUNDCLOUD", href: "https://soundcloud.com/...", hint: "sets / demos" },
    // { label: "SPOTIFY", href: "https://open.spotify.com/...", hint: "releases" },
    { label: "YOUTUBE", href: "https://www.youtube.com/@NOMADISCHLABS", hint: "aftermovies" },
  ];

  return (
    <section className="mt-10 rounded-3xl border border-white/12 p-6 md:p-10">
      <div className="text-xs font-bold tracking-[0.28em] text-white/55">
        SOCIAL
      </div>

      <h2 className="mt-3 text-3xl md:text-5xl font-extrabold tracking-tight [font-family:var(--font-display)]">
        FOLLOW THE DROPS.
      </h2>

      <div className="mt-6 grid gap-3 md:grid-cols-2">
        {socials.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            target="_blank"
            rel="noreferrer"
            className="group rounded-2xl border border-white/12 p-5 hover:border-white/30"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="text-sm font-extrabold tracking-[0.22em]">
                {s.label}
              </div>
              <div className="text-xs font-bold tracking-[0.22em] text-white/55 group-hover:text-white/70">
                OPEN →
              </div>
            </div>
            <div className="mt-2 text-sm text-white/70">{s.hint}</div>
          </Link>
        ))}
      </div>
    </section>
  );
}
