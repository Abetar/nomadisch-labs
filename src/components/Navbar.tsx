import Link from "next/link";
import Image from "next/image";

type NavbarProps = {
  instagramUrl: string;

  /** Optional logo image */
  logoSrc?: string; // ideal: /public/... or allowed remote domain
  logoAlt?: string;

  /** Logo box size (px). This is the visible "window" that can crop whitespace. */
  logoBoxWidth?: number; // default: 44 (monograma)
  logoBoxHeight?: number; // default: 44

  /**
   * How the image should fill the box:
   * - "cover"  => zooms in (best when PNG has lots of whitespace)
   * - "contain" => shows full image (will look small if PNG has whitespace)
   */
  logoFit?: "cover" | "contain";

  /** Optional tweak for positioning when using cover */
  logoPosition?: string; // default: "center"
};

export function Navbar({
  instagramUrl,
  logoSrc,
  logoAlt = "Nomadisch Labs",
  logoBoxWidth = 44,
  logoBoxHeight = 44,
  logoFit = "cover",
  logoPosition = "center",
}: NavbarProps) {
  const showLogo = Boolean(logoSrc);

  return (
    <div className="sticky top-0 z-40 -mx-5 mb-6 border-b border-white/10 bg-black/70 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4 md:py-5">
        <Link href="/" aria-label="Nomadisch Labs" className="flex items-center gap-3">
          {showLogo ? (
            <span
              className="relative overflow-hidden rounded-xl border border-white/10 bg-white/0"
              style={{ width: `${logoBoxWidth}px`, height: `${logoBoxHeight}px` }}
              title="Nomadisch Labs"
            >
              <Image
                src={logoSrc!}
                alt={logoAlt}
                fill
                priority
                sizes={`${Math.max(logoBoxWidth, logoBoxHeight)}px`}
                className={logoFit === "cover" ? "object-cover" : "object-contain"}
                style={{ objectPosition: logoPosition }}
              />
            </span>
          ) : (
            <span className="text-sm font-extrabold tracking-[0.22em] [font-family:var(--font-display)]">
              NOMADISCH LABS
            </span>
          )}
        </Link>

        <nav className="flex items-center gap-3">
          <Link
            href="/events"
            className="rounded-xl border border-white/20 px-3 py-2 text-xs font-bold tracking-[0.2em] text-white/80 hover:text-white"
          >
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
