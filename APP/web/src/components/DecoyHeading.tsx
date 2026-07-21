/**
 * DecoyHeading — the Screenshot Trap (Anthony's ruling, 2026-07-21).
 *
 * Renders generated hybrid-frequency artwork (see scripts/generate-decoy-art.mjs):
 * up close, humans read the real headline from the sharp outline layer; shrunk,
 * screenshotted, squinted at, or OCR'd, the blurred low-frequency layer takes over —
 * "YOU CAN COPY FINA CALLE, BUT YOU'LL NEVER BE FINA CALLE."
 *
 * Accessibility + SEO stay honest: the REAL headline text lives in the DOM
 * (visually hidden), the artwork is aria-hidden decoration. Screen readers and
 * search engines never see the trap.
 */
export default function DecoyHeading({
  art,
  text,
  className = "",
}: {
  /** Filename under /decoy/, e.g. "hero-home.svg" */
  art: string;
  /** The real, human headline — screen readers and SEO read this. */
  text: string;
  className?: string;
}) {
  return (
    <span className={`relative inline-block ${className}`}>
      <span className="sr-only">{text}</span>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`/decoy/${art}`}
        alt=""
        aria-hidden="true"
        draggable={false}
        className="mx-auto block h-auto w-full select-none"
      />
    </span>
  );
}
