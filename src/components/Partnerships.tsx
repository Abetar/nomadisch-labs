    import Image from "next/image";

type Partner = {
  name: string;
  logoSrc?: string; // /media/partners/xxx.png
  href?: string;    // instagram u otro
};

function PartnerTile({ p }: { p: Partner }) {
  const hasLogo = Boolean(p.logoSrc);

  const inner = (
    <div className="group relative overflow-hidden rounded-2xl border border-white/12 bg-black p-5 transition hover:border-white/30">
      <div className="absolute inset-0 opacity-[0.08] bg-[repeating-linear-gradient(135deg,#fff_0,#fff_10px,transparent_10px,transparent_26px)]" />

      <div className="relative">
        {hasLogo ? (
          <div className="flex h-24 items-center justify-center">
            <Image
              src={p.logoSrc as string}
              alt={p.name}
              width={420}
              height={180}
              className="h-14 w-auto opacity-95 grayscale"
              priority={false}
            />
          </div>
        ) : (
          <div className="flex h-24 items-center justify-center text-center">
            <div className="text-lg font-extrabold tracking-[0.14em] [font-family:var(--font-display)]">
              {p.name.toUpperCase()}
            </div>
          </div>
        )}

        <div className="mt-3 text-xs font-bold tracking-[0.28em] text-white/55">
          PARTNERSHIP
        </div>
      </div>
    </div>
  );

  if (p.href) {
    return (
      <a href={p.href} target="_blank" rel="noreferrer" className="block">
        {inner}
      </a>
    );
  }

  return inner;
}

export function Partnerships() {
  const partners: Partner[] = [
    {
      name: "Nomadisch x KKINNESSISS",
      // Si tienes logo, ponlo aquí:
      // logoSrc: "/media/partners/kkinnessiss.png",
      href: "https://www.instagram.com/nomadischlabs/"
    }
  ];

  return (
    <section className="mt-10">
      <div className="flex items-end justify-between gap-4">
        <h2 className="text-xl font-extrabold tracking-tight [font-family:var(--font-display)]">
          PARTNERSHIPS
        </h2>
        <div className="text-xs font-bold tracking-[0.24em] text-white/55">
          COLLABS / HOSTS
        </div>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        {partners.map((p) => (
          <PartnerTile key={p.name} p={p} />
        ))}
      </div>
    </section>
  );
}
