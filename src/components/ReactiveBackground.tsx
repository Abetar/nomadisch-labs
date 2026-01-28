"use client";

import { useEffect } from "react";

export function ReactiveBackground({ active }: { active: boolean }) {
  useEffect(() => {
    document.documentElement.style.setProperty(
      "--reactive-intensity",
      active ? "1" : "0.35"
    );
  }, [active]);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[-1] overflow-hidden bg-black"
    >
      {/* Base vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(255,255,255,0.08),transparent_40%),radial-gradient(circle_at_80%_80%,rgba(255,255,255,0.06),transparent_45%)]" />

      {/* Energy blobs */}
      <div className="energy-blob blob-1" />
      <div className="energy-blob blob-2" />
      <div className="energy-blob blob-3" />

      {/* Grain leve */}
      <div className="absolute inset-0 opacity-[0.12] mix-blend-screen noise-animate" />
    </div>
  );
}
