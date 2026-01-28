import Image from "next/image";

type GalleryItem = {
  src: string; // /media/gallery/xxx.jpg
  alt: string;
};

export function Gallery() {
  // Mete imágenes en: public/media/gallery/
  const items: GalleryItem[] = [
    // Si aún no tienes, déjalo vacío y no se renderiza.
    { src: "/media/gallery/event-1.jpg", alt: "Nomadisch night 01" },
    { src: "/media/gallery/event-2.jpg", alt: "Nomadisch crowd 02" },
    { src: "/media/gallery/event-3.jpg", alt: "Nomadisch halloween" }
  ];

  if (items.length === 0) return null;

  return (
    <section className="mt-10">
      <div className="flex items-end justify-between gap-4">
        <h2 className="text-xl font-extrabold tracking-tight [font-family:var(--font-display)]">
          GALLERY
        </h2>
        <div className="text-xs font-bold tracking-[0.24em] text-white/55">
          RECAPS / FRAMES
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 md:grid-cols-3">
        {items.map((img) => (
          <div
            key={img.src}
            className="relative overflow-hidden rounded-2xl border border-white/12 bg-black"
          >
            <Image
              src={img.src}
              alt={img.alt}
              width={1200}
              height={1200}
              className="h-56 w-full object-cover grayscale"
            />
            <div className="pointer-events-none absolute inset-0 opacity-[0.10] mix-blend-screen noise-animate" />
          </div>
        ))}
      </div>
    </section>
  );
}
