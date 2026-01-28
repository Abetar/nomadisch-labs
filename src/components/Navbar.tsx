import Link from "next/link";

export function Navbar(props: { instagramUrl: string }) {
  const { instagramUrl } = props;

  return (
    <div className="sticky top-0 z-40 -mx-5 mb-6 border-b border-white/10 bg-black/70 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-3">
        <Link href="/" className="text-sm font-extrabold tracking-[0.22em] [font-family:var(--font-display)]">
          NOMADISCH LABS
        </Link>

        <nav className="flex items-center gap-3">
          <Link href="/events" className="rounded-xl border border-white/20 px-3 py-2 text-xs font-bold tracking-[0.2em] text-white/80 hover:text-white">
            EVENTS
          </Link>
          <Link
            href={instagramUrl}
            target="_blank"
            rel="noreferrer"
            className="rounded-xl bg-white px-3 py-2 text-xs font-bold tracking-[0.2em] text-black hover:opacity-95"
          >
            IG
          </Link>
        </nav>
      </div>
    </div>
  );
}
