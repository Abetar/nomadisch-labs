export function NoiseBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[-1] bg-black overflow-hidden">
      {/* vignette (static) */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(255,255,255,0.08),transparent_42%),radial-gradient(circle_at_80%_80%,rgba(255,255,255,0.06),transparent_45%)]" />

      {/* animated grain layer */}
      <div className="absolute inset-0 opacity-[0.14] mix-blend-screen noise-animate" />

      {/* subtle moving haze (super low) */}
      <div className="absolute -inset-20 opacity-[0.07] blur-3xl bg-[radial-gradient(circle_at_30%_20%,#fff,transparent_40%),radial-gradient(circle_at_70%_80%,#fff,transparent_45%)] haze-drift" />

      {/* diagonal accent ONLY on right side */}
      <div className="absolute right-0 top-0 h-full w-[42%] opacity-[0.08] bg-[repeating-linear-gradient(135deg,#fff_0,#fff_10px,transparent_10px,transparent_28px)] diagonal-slow" />
    </div>
  );
}
