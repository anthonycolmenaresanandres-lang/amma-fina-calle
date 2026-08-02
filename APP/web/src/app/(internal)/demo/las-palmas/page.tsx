import type { Metadata } from "next";
import Link from "next/link";
import {
  lasPalmasLynnhavenMenuSections,
  lasPalmasLynnhavenMenuSourcePreview,
} from "@/table-os/menu/las-palmas-lynnhaven";
import LasPalmasGuestNoteForm from "./LasPalmasGuestNoteForm";
import LasPalmasSilverPalmMotion from "./LasPalmasSilverPalmMotion";

// Las Palmas prospect demo menu — PENDING CLIENT APPROVAL, unlinked + noindex.
// Static preview only: it reuses the curated public-source Lynnhaven dataset
// (single source of truth in src/table-os/menu/las-palmas-lynnhaven.ts) and
// never touches Supabase or the Client OS routes (/m, /owner, /customers).
// Visual direction: the original green cantina system with Anthony's supplied
// red sign isolated from its beach background. Silver palms resolve into the
// permanent semantic menu dock. Menu + game + table preview remain one
// pending-approval prospect experience.

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

export default function LasPalmasDemoMenuPage(): React.JSX.Element {
  const sections = lasPalmasLynnhavenMenuSections;
  const notice = lasPalmasLynnhavenMenuSourcePreview.prominentNotice;

  return (
    <main className="min-h-dvh bg-[linear-gradient(180deg,#0b2b1b_0%,#071a11_28%,#06130d_100%)] px-5 text-[#f2ead6] sm:px-8">
      <div className="mx-auto w-full max-w-2xl">
        <header>
          <LasPalmasSilverPalmMotion />
        </header>

        <nav
          id="menu"
          aria-label="Menu sections"
          aria-labelledby="las-palmas-menu-heading"
          className="sticky top-0 z-10 -mx-5 flex gap-2 overflow-x-auto border-b border-[#c8ced3]/20 bg-[#06130d]/95 px-5 py-3 backdrop-blur [scrollbar-width:none] sm:-mx-8 sm:px-8"
        >
          {sections.map((section) => (
            <a
              key={section.name}
              href={`#sec-${slugify(section.name)}`}
              className="shrink-0 border border-[#a9b8a9]/25 px-3.5 py-1.5 text-xs font-medium text-[#cfd8c8] transition hover:border-[#dfe3e6]/70 hover:text-[#f3f5f6] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#dfe3e6]"
            >
              {section.name}
            </a>
          ))}
        </nav>

        <p className="mt-6 border-l-2 border-[#b9c0c6]/70 pl-3 text-left text-[0.72rem] leading-5 text-[#d8cfc1]">
          <span className="block font-semibold uppercase tracking-[0.12em] text-[#dfe3e6]">
            Pending client approval · Demo only
          </span>
          {notice}
        </p>

        <div className="mt-8 space-y-10">
          {sections.map((section) => (
            <section
              key={section.name}
              id={`sec-${slugify(section.name)}`}
              className="scroll-mt-20"
            >
              <h2 className="flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.24em] text-[#dfe3e6]">
                <span aria-hidden className="h-px w-7 bg-[#aeb5bb]/60" />
                {section.name}
                <span
                  aria-hidden
                  className="h-px flex-1 bg-gradient-to-r from-[#aeb5bb]/40 to-transparent"
                />
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
                      <span className="shrink-0 font-semibold tabular-nums text-[#e6e9eb]">
                        {item.priceDisplay}
                      </span>
                    </span>
                  );

                  return (
                    <li key={item.name} className="border-b border-[#dfe3e6]/10">
                      {hasMedia ? (
                        <details className="group">
                          <summary className="flex min-h-11 cursor-pointer list-none items-center gap-2 py-2.5 [&::-webkit-details-marker]:hidden">
                            {row}
                            <svg
                              aria-hidden
                              viewBox="0 0 12 8"
                              className="h-2 w-3 shrink-0 text-[#c7cdd1]/80 transition-transform group-open:rotate-180"
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
                              <p className="text-sm leading-6 text-[#c9d4c2]">
                                {item.description}
                              </p>
                            ) : null}
                            {item.photo ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={item.photo}
                                alt={item.name}
                                loading="lazy"
                                className="mt-3 aspect-square w-full max-w-xs rounded-xl border border-[#dfe3e6]/20 object-cover ring-1 ring-white/[0.03] sm:max-w-sm"
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

        <div className="mt-12 border-t border-[#c8ced3]/20 pt-7 text-center">
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-[#dfe3e6]">
            Table service preview
          </p>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#b8c5ba]">
            One table QR can open the menu, preview a server call or refill request, and start
            the shared table game. Nothing is sent to staff until the restaurant approves its
            routing.
          </p>
          <Link
            href="/table/las-palmas-lynnhaven/1"
            className="mt-4 inline-block text-sm font-semibold text-[#eef1f3] underline decoration-[#aeb5bb]/60 underline-offset-4 hover:decoration-[#f4f6f7] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#eef1f3]"
          >
            Open Table 1 — menu, service requests &amp; table game
          </Link>
        </div>

        <LasPalmasGuestNoteForm />

        <footer className="mt-10 pb-2 text-center text-[0.62rem] uppercase tracking-[0.3em] text-[#cfd8c8]/40">
          Owner-review concept · Menu by Fina Calle
        </footer>
      </div>
    </main>
  );
}
