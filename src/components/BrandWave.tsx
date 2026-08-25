/* VAI brand wave — recreated as a clean SVG in brand colors (Bri's call,
   2026-08-25) rather than exported from the Wix landing page. Decorative
   only: pinned to the bottom of the viewport behind the page content,
   echoing the landing page's water motif (the "vai" in VAI).

   Each layer drifts horizontally at its own pace for a gentle water feel.
   Paths are drawn wider than the viewBox so the sway never exposes an edge;
   the SVG clips the overdraw. Motion is disabled for reduced-motion users. */

export function BrandWave() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-0"
    >
      <style>{`
        @keyframes vai-wave-sway-a {
          from { transform: translateX(-60px); }
          to   { transform: translateX(60px); }
        }
        @keyframes vai-wave-sway-b {
          from { transform: translateX(75px); }
          to   { transform: translateX(-75px); }
        }
        @keyframes vai-wave-sway-c {
          from { transform: translateX(-45px); }
          to   { transform: translateX(45px); }
        }
        .vai-wave-a { animation: vai-wave-sway-a 7s ease-in-out infinite alternate; }
        .vai-wave-b { animation: vai-wave-sway-b 9s ease-in-out infinite alternate; }
        .vai-wave-c { animation: vai-wave-sway-c 11s ease-in-out infinite alternate; }
        @media (prefers-reduced-motion: reduce) {
          .vai-wave-a, .vai-wave-b, .vai-wave-c { animation: none; }
        }
      `}</style>
      <svg
        viewBox="0 0 1440 140"
        preserveAspectRatio="none"
        className="block w-full h-[90px] sm:h-[140px]"
      >
        {/* Back swell — Teal 500, the lighter water behind */}
        <path
          className="vai-wave-a"
          d="M-120,74 C160,22 440,122 720,80 C1000,38 1280,112 1560,58 L1560,140 L-120,140 Z"
          fill="#37C1C3"
        />
        {/* Mid swell — VAI Teal core */}
        <path
          className="vai-wave-b"
          d="M-120,102 C200,60 480,132 840,95 C1120,63 1340,122 1560,88 L1560,140 L-120,140 Z"
          fill="#209B9D"
        />
        {/* Front crest — VAI Navy */}
        <path
          className="vai-wave-c"
          d="M-120,122 C240,90 600,142 960,115 C1200,96 1400,132 1560,110 L1560,140 L-120,140 Z"
          fill="#244397"
        />
      </svg>
    </div>
  );
}
