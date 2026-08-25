/* VAI brand wave — recreated as a clean SVG in brand colors (Bri's call,
   2026-08-25) rather than exported from the Wix landing page. Decorative
   only: pinned to the bottom of the viewport behind the page content,
   echoing the landing page's water motif (the "vai" in VAI). */

export function BrandWave() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-0"
    >
      <svg
        viewBox="0 0 1440 140"
        preserveAspectRatio="none"
        className="block w-full h-[90px] sm:h-[140px]"
      >
        {/* Back swell — teal tint */}
        <path
          d="M0,70 C240,20 480,120 720,80 C960,40 1200,110 1440,60 L1440,140 L0,140 Z"
          fill="#D7EDED"
        />
        {/* Mid swell — navy tint */}
        <path
          d="M0,100 C280,60 560,130 840,95 C1080,65 1280,120 1440,90 L1440,140 L0,140 Z"
          fill="#D8DDEC"
        />
        {/* Front crest — brand teal, kept light so it stays a whisper */}
        <path
          d="M0,120 C320,90 640,140 960,115 C1180,98 1330,130 1440,112 L1440,140 L0,140 Z"
          fill="#209B9D"
          fillOpacity="0.35"
        />
      </svg>
    </div>
  );
}
