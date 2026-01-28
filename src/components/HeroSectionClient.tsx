"use client";

import { useState } from "react";
import { ReactiveBackground } from "@/components/ReactiveBackground";
import { HeroVideo } from "@/components/HeroVideo";

export function HeroSectionClient() {
  const [soundActive, setSoundActive] = useState(false);

  return (
    <>
      {/* Fondo fake-reactivo controlado por SOUND */}
      <ReactiveBackground active={soundActive} />

      {/* Video hero */}
      <HeroVideo
        src="/media/hero.mp4"
        poster="/media/hero-poster.jpg"
        defaultMuted
        onSoundChange={setSoundActive}
      />
    </>
  );
}
