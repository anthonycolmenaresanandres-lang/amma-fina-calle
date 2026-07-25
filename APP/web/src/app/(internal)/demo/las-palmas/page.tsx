import type { Metadata } from "next";
import Link from "next/link";
import {
  lasPalmasLynnhavenMenuSections,
  lasPalmasLynnhavenMenuSourcePreview,
} from "@/table-os/menu/las-palmas-lynnhaven";

// Las Palmas prospect demo menu — PENDING CLIENT APPROVAL, unlinked + noindex.
// Static preview only: it reuses the curated public-source Lynnhaven dataset
// (single source of truth in src/table-os/menu/las-palmas-lynnhaven.ts) and
// never touches Supabase or the Client OS routes (/m, /owner, /customers).
// Visual direction: the engraved-steel business card (palm pattern, monogram)
// translated to a palm-dusk cantina menu — same identity as the game's
// "laspalmas" skin so menu + game read as one system.

export const metadata: Metadata = {
  title: "Las Palmas · Menu concept | Fina Calle OS",
  description:
    "Private owner-review menu concept for Las Palmas Mexican Restaurant & Cantina — prospect preview, prices pending owner confirmation.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false, noimageindex: true },
  },
};

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

/** Small engraved-style palm frond, echoing the steel business card pattern. */
function Palm({ className }: { className?: string }): React.JSX.Element {
  return (
    <svg viewBox="0 0 32 40" aria-hidden className={className} fill="currentColor">
      <path d="M15 38c-1-8-1-16 .4-24l1.6.2c-1.2 8-1 16 0 23.8z" />
      <path d="M16 15C11 11 5.6 10 1 12.4c4.4 3 9.8 3.4 15 1.4z" />
      <path d="M16 15c5-4 10.4-5 15-2.6-4.4 3-9.8 3.4-15 1.4z" />
      <path d="M16 14.6C12.4 9.6 8 7 3.4 7.6 6 12 10.8 14.6 16 14.6z" />
      <path d="M16 14.6c3.6-5 8-7.6 12.6-7C26 12 21.2 14.6 16 14.6z" />
      <path d="M15.6 14c-1.2-5.4 0-9.6 2.4-11.6 1.6 3.6.8 8-1.2 11.8z" />
    </svg>
  );
}

export default function LasPalmasDemoMenuPage(): React.JSX.Element {
  const sections = lasPalmasLynnhavenMenuSections;
  const notice = lasPalmasLynnhavenMenuSourcePreview.prominentNotice;

  return (
    <main className="min-h-dvh bg-[linear-gradient(180deg,#0b2b1b_0%,#071a11_28%,#06130d_100%)] px-5 py-10 text-[#f2ead6] sm:px-8">
      <div className="mx-auto w-full max-w-2xl">
        {/* Engraved header band — the steel-card palm pattern, in cantina green */}
        <header className="border-y-2 border-[#e8b45a]/70 py-8 text-center">
          <div className="flex items-center justify-center gap-4 text-[#e8b45a]/45">
            <Palm className="h-6 w-5" />
            <Palm className="h-8 w-6" />
            <Palm className="h-6 w-5" />
          </div>
          <h1 className="mt-4 font-serif text-5xl tracking-[0.14em] text-[#f7f1e0]">
            LAS PALMAS
          </h1>
          <p className="mt-3 text-xs font-semibold uppercase tracking-[0.34em] text-[#e8b45a]">
            Mexican Restaurant &amp; Cantina
          </p>
          <p className="mt-2 text-[0.7rem] uppercase tracking-[0.26em] text-[#a9b8a9]">
            Lynnhaven · Virginia Beach · Desde 2010
          </p>
        </header>

        <p className="mt-5 border-l-2 border-[#e8b45a]/60 pl-3 text-left text-[0.72rem] leading-5 text-[#d8c99a]">
          <span className="block font-semibold uppercase tracking-[0.12em] text-[#e8b45a]">
            Pending client approval · Demo only
          </span>
          {notice}
        </p>

        {/* The hook: menu + game are one experience */}
        <div className="mt-7 text-center">
          <Link
            href="/penalty-shootout?skin=laspalmas"
            className="inline-flex min-h-11 items-center gap-2 border border-[#d5322d] bg-[#d5322d] px-6 text-xs font-bold uppercase tracking-[0.2em] text-[#fff6ec] transition hover:bg-[#b7241f]"
          >
            Play the Cantina Shootout
          </Link>
          <p className="mt-2 text-[0.68rem] uppercase tracking-[0.22em] text-[#a9b8a9]">
            Beat the blue keeper · 5 shots from the spot
          </p>
        </div>

        <nav
          aria-label="Menu sections"
          className="sticky top-0 z-10 -mx-5 mt-8 flex gap-2 overflow-x-auto border-b border-[#e8b45a]/20 bg-[#06130d]/90 px-5 py-3 backdrop-blur [scrollbar-width:none] sm:-mx-8 sm:px-8"
        >
          {sections.map((section) => (
            <a
              key={section.name}
              href={`#sec-${slugify(section.name)}`}
              className="shrink-0 border border-[#a9b8a9]/25 px-3.5 py-1.5 text-xs font-medium text-[#cfd8c8] transition hover:border-[#e8b45a]/70 hover:text-[#f4d99c]"
            >
              {section.name}
            </a>
          ))}
        </nav>

        <div className="mt-8 space-y-10">
          {sections.map((section) => (
            <section key={section.name} id={`sec-${slugify(section.name)}`} className="scroll-mt-20">
              <h2 className="flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.24em] text-[#e8b45a]">
                <Palm className="h-4 w-3.5 shrink-0 text-[#e8b45a]/60" />
                {section.name}
                <span aria-hidden className="h-px flex-1 bg-gradient-to-r from-[#e8b45a]/40 to-transparent" />
              </h2>
              <ul className="mt-3">
                {section.items.map((item) => {
                  const hasMedia = Boolean(item.photo || item.description);
                  const row = (
                    <span className="flex w-full items-baseline gap-3">
                      <span className="font-medium text-[#f2ead6]">{item.name}</span>
                      <span
                        aria-hidden
                        className="mb-1 flex-1 self-end border-b border-dotted border-[#a9b8a9]/30"
                      />
                      <span className="shrink-0 font-semibold tabular-nums text-[#f4d99c]">
                        {item.priceDisplay}
                      </span>
                    </span>
                  );
                  return (
                    <li key={item.name} className="border-b border-[#e8b45a]/10">
                      {hasMedia ? (
                        // Dropdown per item: name + price always visible; the
                        // photo + description reveal on tap. Native details/
                        // summary keeps it JS-free and keyboard-accessible.
                        <details className="group">
                          <summary className="flex min-h-11 cursor-pointer list-none items-center gap-2 py-2.5 [&::-webkit-details-marker]:hidden">
                            {row}
                            <svg
                              aria-hidden
                              viewBox="0 0 12 8"
                              className="h-2 w-3 shrink-0 text-[#e8b45a]/70 transition-transform group-open:rotate-180"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                            >
                              <path d="M1 1.5 6 6.5 11 1.5" />
                            </svg>
                          </summary>
                          <div className="pb-4 pl-1 pr-6">
                            {item.description ? (
                              <p className="text-sm leading-6 text-[#c9d4c2]">{item.description}</p>
                            ) : null}
                            {item.photo ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={item.photo}
                                alt={item.name}
                                loading="lazy"
                                className="mt-3 aspect-square w-full max-w-xs rounded-xl border border-[#e8b45a]/20 object-cover ring-1 ring-white/[0.03] sm:max-w-sm"
                              />
                            ) : null}
                          </div>
                        </details>
                      ) : (
                        <div className="flex min-h-11 items-center py-2.5 pr-5">{row}</div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>

        <div className="mt-12 border-t border-[#e8b45a]/20 pt-6 text-center">
          <p className="text-[0.7rem] uppercase tracking-[0.22em] text-[#a9b8a9]">
            Full table experience concept
          </p>
          <Link
            href="/table/las-palmas-lynnhaven/1"
            className="mt-2 inline-block text-sm font-semibold text-[#f4d99c] underline decoration-[#e8b45a]/50 underline-offset-4 hover:decoration-[#e8b45a]"
          >
            Open Table 1 — menu, service requests &amp; table game
          </Link>
        </div>

        <footer className="mt-10 pb-2 text-center text-[0.62rem] uppercase tracking-[0.3em] text-[#cfd8c8]/40">
          Owner-review concept · Menu by Fina Calle
        </footer>
      </div>
    </main>
  );
}
