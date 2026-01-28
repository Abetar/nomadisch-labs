import Image from "next/image";
import Link from "next/link";

type MerchItem = {
  name: string;
  price?: string;      // "350 MXN" (opcional)
  status?: "available" | "soldout" | "drop-soon";
  imageSrc?: string;   // "/media/merch/tee-01.jpg"
  buyUrl?: string;     // link específico del producto (opcional)
};

function StatusPill({ status }: { status?: MerchItem["status"] }) {
  if (!status) return null;

  const label =
    status === "available" ? "AVAILABLE" : status === "soldout" ? "SOLD OUT" : "DROP SOON";

  return (
    <span className="rounded-full border border-white/20 px-3 py-1 text-[11px] font-bold tracking-[0.2em] text-white/75">
      {label}
    </span>
  );
}

function MerchCard({ item, fallbackBuyUrl }: { item: MerchItem; fallbackBuyUrl: string }) {
  const href = item.buyUrl || fallbackBuyUrl;

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-white/12 bg-black p-5 transition hover:border-white/30">
      <div className="absolute inset-0 opacity-[0.07] bg-[repeating-linear-gradient(135deg,#fff_0,#fff_10px,transparent_10px,transparent_26px)]" />

      <div className="relative">
        {/* Image / fallback poster */}
        <div className="relative overflow-hidden rounded-xl border border-white/10 bg-black">
          {item.imageSrc ? (
            <>
              <Image
                src={item.imageSrc}
                alt={item.name}
                width={1200}
                height={1200}
                className="h-48 w-full object-cover grayscale"
              />
              <div className="pointer-events-none absolute inset-0 opacity-[0.12] mix-blend-screen noise-animate" />
            </>
          ) : (
            <div className="flex h-48 items-center justify-center p-6 text-center">
              <div className="text-xl font-extrabold tracking-[0.12em] [font-family:var(--font-display)]">
                {item.name.toUpperCase()}
              </div>
            </div>
          )}
        </div>

        <div className="mt-4 flex items-start justify-between gap-3">
          <div>
            <div className="text-sm font-extrabold tracking-tight text-white">
              {item.name}
            </div>
            <div className="mt-1 text-xs font-bold tracking-[0.22em] text-white/55">
              {item.price ? item.price : "LIMITED DROP"}
            </div>
          </div>

          <StatusPill status={item.status} />
        </div>

        <div className="mt-4 flex gap-2">
          <Link
            href={href}
            target={href.startsWith("http") ? "_blank" : undefined}
            rel={href.startsWith("http") ? "noreferrer" : undefined}
            className="flex-1 rounded-xl bg-white px-4 py-3 text-center text-xs font-extrabold tracking-[0.18em] text-black hover:opacity-95"
            aria-label={`Comprar ${item.name}`}
          >
            COMPRAR
          </Link>

          <Link
            href="/contact"
            className="rounded-xl border border-white/20 px-4 py-3 text-center text-xs font-extrabold tracking-[0.18em] text-white/80 hover:text-white"
          >
            INFO
          </Link>
        </div>
      </div>
    </div>
  );
}

export function MerchSection(props: { buyUrl: string }) {
  const { buyUrl } = props;

  // ✅ Puedes editar aquí rápido.
  // Si luego quieres, lo movemos a JSON igual que eventos.
  const items: MerchItem[] = [
    {
      name: "Nomadisch Hat",
      price: "350 MXN",
      status: "drop-soon",
      imageSrc: "/media/merch/hat-merch.png",
      // buyUrl: "https://..."
    },
    {
      name: "Sticker Pack",
      price: "80 MXN",
      status: "drop-soon",
      imageSrc: "/media/merch/sticket-merch.png",
    }
  ];

  return (
    <section className="mt-10">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight [font-family:var(--font-display)]">
            MERCH
          </h2>
          <div className="mt-2 text-sm text-white/70">
            Limited drops. No restocks promised.
          </div>
        </div>

        <Link
          href={buyUrl}
          target="_blank"
          rel="noreferrer"
          className="rounded-2xl border border-white/25 px-4 py-3 text-xs font-bold tracking-[0.22em] text-white/85 hover:text-white"
        >
          SHOP →
        </Link>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        {items.map((item) => (
          <MerchCard key={item.name} item={item} fallbackBuyUrl={buyUrl} />
        ))}
      </div>

      <div className="mt-4 text-xs text-white/55">
        * Purchase link can change anytime. If it’s broken, DM on IG.
      </div>
    </section>
  );
}
