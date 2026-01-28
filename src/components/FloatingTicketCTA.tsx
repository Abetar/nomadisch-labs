import Link from "next/link";

function TicketIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
      <path
        d="M5 7a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v2a2 2 0 1 0 0 4v2a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-2a2 2 0 1 0 0-4V7Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M9 8.5h6M9 12h6M9 15.5h4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function FloatingTicketCTA(props: { href: string; label: string }) {
  const { href, label } = props;

  return (
    <Link
      href={href}
      target={href.startsWith("http") ? "_blank" : undefined}
      rel={href.startsWith("http") ? "noreferrer" : undefined}
      className="fixed bottom-20 right-4 z-50 flex items-center gap-2 rounded-full bg-white px-4 py-3 text-xs font-extrabold tracking-[0.18em] text-black shadow-[0_10px_40px_rgba(0,0,0,0.45)] active:scale-[0.99]"
      aria-label={label}
    >
      <TicketIcon />
      {label}
    </Link>
  );
}
