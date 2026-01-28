import Link from "next/link";

export function TicketCTASticky(props: {
  primaryHref: string;
  primaryLabel: string;
  secondaryHref: string;
  secondaryLabel: string;
}) {
  const { primaryHref, primaryLabel, secondaryHref, secondaryLabel } = props;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/15 bg-black/85 backdrop-blur-md md:hidden">
      <div className="mx-auto flex max-w-3xl items-center gap-2 p-2">
        <Link
          href={primaryHref}
          className="flex-1 rounded-xl bg-white px-4 py-3 text-center text-sm font-semibold tracking-wide text-black active:scale-[0.99]"
          target={primaryHref.startsWith("http") ? "_blank" : undefined}
          rel={primaryHref.startsWith("http") ? "noreferrer" : undefined}
        >
          {primaryLabel}
        </Link>

        <Link
          href={secondaryHref}
          className="flex-1 rounded-xl border border-white/30 px-4 py-3 text-center text-sm font-semibold tracking-wide text-white active:scale-[0.99]"
          target={secondaryHref.startsWith("http") ? "_blank" : undefined}
          rel={secondaryHref.startsWith("http") ? "noreferrer" : undefined}
        >
          {secondaryLabel}
        </Link>
      </div>
    </div>
  );
}
