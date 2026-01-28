"use client";

import { useEffect, useMemo, useRef, useState } from "react";

function VolumeIcon({ muted }: { muted: boolean }) {
  return muted ? (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
      <path
        d="M11 5 6.5 8.5H4a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h2.5L11 19V5Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M22 9 16 15M16 9l6 6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
      <path
        d="M11 5 6.5 8.5H4a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h2.5L11 19V5Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M15.5 9.5a3.5 3.5 0 0 1 0 5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M17.8 7.2a7 7 0 0 1 0 9.6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function HeroVideo(props: {
  src?: string;
  poster?: string;
  defaultMuted?: boolean;
  onSoundChange?: (active: boolean) => void; // ✅ NUEVO
}) {
  const { src, poster, defaultMuted = true, onSoundChange } = props;

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [muted, setMuted] = useState(defaultMuted);

  const canRender = useMemo(() => Boolean(src), [src]);

  useEffect(() => {
    if (!videoRef.current) return;
    videoRef.current.muted = muted;
    onSoundChange?.(!muted); // ✅ notifica si hay SOUND
  }, [muted, onSoundChange]);

  if (!canRender) return null;

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/12">
      <div className="absolute inset-0 bg-black/35" />

      <video
        ref={videoRef}
        className="h-[240px] w-full object-cover md:h-[380px]"
        src={src}
        autoPlay
        muted={muted}
        loop
        playsInline
        preload="metadata"
        poster={poster}
      />

      <div className="pointer-events-none absolute inset-0 opacity-[0.12] mix-blend-screen noise-animate" />

      <div className="absolute bottom-3 right-3 flex items-center gap-2">
        <button
          type="button"
          onClick={() => setMuted((v) => !v)}
          className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/60 px-3 py-2 text-xs font-extrabold tracking-[0.18em] text-white backdrop-blur-md hover:border-white/35"
          aria-label={muted ? "Activar sonido" : "Silenciar"}
        >
          <VolumeIcon muted={muted} />
          {muted ? "MUTE" : "SOUND"}
        </button>
      </div>
    </div>
  );
}
