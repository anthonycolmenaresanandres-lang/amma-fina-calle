import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import {
  lasPalmasLynnhavenMenuSections,
  lasPalmasLynnhavenMenuSourcePreview,
} from "@/table-os/menu/las-palmas-lynnhaven";
import LasPalmasGuestNoteForm from "./LasPalmasGuestNoteForm";

// Las Palmas prospect demo menu — PENDING CLIENT APPROVAL, unlinked + noindex.
// Static preview only: it reuses the curated public-source Lynnhaven dataset
// (single source of truth in src/table-os/menu/las-palmas-lynnhaven.ts) and
// never touches Supabase or the Client OS routes (/m, /owner, /customers).
// Visual direction: the owner's tropical storefront hero translated into an
// original, logo-free paradise menu — lagoon turquoise, sky blue, palm green,
// coral warmth, and sun-sand neutrals. Menu + game remain one system.

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
    <main className="min-h-dvh bg-[#f7efdc] text-[#123f3a]">
      <div className="mx-auto w-full max-w-5xl bg-[#fffaf0] shadow-[0_24px_80px_rgba(8,69,72,0.13)]">
        <header className="relative isolate flex min-h-[30rem] items-center justify-center overflow-hidden px-6 py-16 text-center sm:min-h-[34rem]">
          <Image
            src="/assets/laspalmas/paradise-hero-v1.webp"
            alt=""
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 1024px"
            className="-z-20 object-cover object-[58%_center]"
          />
          <div aria-hidden className="absolute inset-0 -z-10 bg-[#04383d]/40" />

          <div className="max-w-3xl text-white [text-shadow:0_3px_18px_rgba(0,38,43,0.7)]">
            <p className="text-[0.68rem] font-bold uppercase tracking-[0.32em] text-[#fff1b9]">
              Paradise at the table
            </p>
            <h1 className="mt-4 font-serif text-5xl leading-[0.9] tracking-[0.08em] sm:text-7xl">
              LAS PALMAS
            </h1>
            <p className="mt-4 text-xs font-semibold uppercase tracking-[0.3em] text-white">
              Mexican Restaurant &amp; Cantina
            </p>
            <p className="mt-2 text-[0.68rem] uppercase tracking-[0.22em] text-white/80">
              Lynnhaven · Virginia Beach · Desde 2010
            </p>
            <Link
              href="/penalty-shootout?skin=laspalmas"
              className="mt-8 inline-flex min-h-11 items-center rounded-full bg-[#ef5d43] px-6 text-xs font-bold uppercase tracking-[0.18em] text-white shadow-[0_12px_30px_rgba(99,29,20,0.32)] transition hover:bg-[#d94c36] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
            >
              Play the Cantina Shootout
            </Link>
            <p className="mt-3 text-[0.65rem] uppercase tracking-[0.18em] text-white/78">
              Beat the blue keeper · 5 shots from the spot
            </p>
          </div>
        </header>

        <div className="mx-auto w-full max-w-2xl px-5 sm:px-8">
          <p className="mt-6 border-l-2 border-[#ef5d43] pl-3 text-left text-[0.72rem] leading-5 text-[#4c6b65]">
            <span className="block font-semibold uppercase tracking-[0.12em] text-[#d94832]">
              Pending client approval · Demo only
            </span>
            {notice}
          </p>
        </div>

        <nav
          aria-label="Menu sections"
          className="sticky top-0 z-10 mt-7 flex gap-6 overflow-x-auto border-b border-[#17aeb4]/20 bg-[#fffaf0]/95 px-5 py-4 shadow-[0_8px_24px_rgba(6,74,75,0.08)] backdrop-blur [scrollbar-width:none] sm:px-8"
        >
          {sections.map((section) => (
            <a
              key={section.name}
              href={`#sec-${slugify(section.name)}`}
              className="shrink-0 border-b-2 border-transparent py-1 text-xs font-semibold text-[#267370] transition hover:border-[#ef5d43] hover:text-[#bd3f2c] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0b8d94]"
            >
              {section.name}
            </a>
          ))}
        </nav>

        <div className="mx-auto w-full max-w-2xl px-5 pb-12 sm:px-8">
          <div className="mt-10 space-y-12">
            {sections.map((section) => (
              <section
                key={section.name}
                id={`sec-${slugify(section.name)}`}
                className="scroll-mt-24"
              >
                <h2 className="border-b border-[#18aeb4]/25 pb-3 text-sm font-bold uppercase tracking-[0.23em] text-[#087f85]">
                  {section.name}
                </h2>
                <ul className="mt-3">
                  {section.items.map((item) => {
                    const hasMedia = Boolean(item.photo || item.description);
                    const row = (
                      <span className="flex w-full items-baseline gap-3">
                        <span className="font-semibold text-[#153f3b]">{item.name}</span>
                        <span
                          aria-hidden
                          className="mb-1 flex-1 self-end border-b border-dotted border-[#1e8e8e]/30"
                        />
                        <span className="shrink-0 font-bold tabular-nums text-[#c84a35]">
                          {item.priceDisplay}
                        </span>
                      </span>
                    );
                    return (
                      <li key={item.name} className="border-b border-[#187e7f]/10">
                        {hasMedia ? (
                          <details className="group">
                            <summary className="flex min-h-12 cursor-pointer list-none items-center gap-2 py-3 [&::-webkit-details-marker]:hidden">
                              {row}
                              <ChevronDown
                                aria-hidden
                                className="h-4 w-4 shrink-0 text-[#0b8d94] transition-transform group-open:rotate-180"
                                strokeWidth={2}
                              />
                            </summary>
                            <div className="pb-5 pr-6">
                              {item.description ? (
                                <p className="text-sm leading-6 text-[#52716b]">
                                  {item.description}
                                </p>
                              ) : null}
                              {item.photo ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={item.photo}
                                  alt={item.name}
                                  loading="lazy"
                                  className="mt-4 aspect-square w-full max-w-xs rounded-3xl object-cover shadow-[0_16px_36px_rgba(14,83,78,0.16)] sm:max-w-sm"
                                />
                              ) : null}
                            </div>
                          </details>
                        ) : (
                          <div className="flex min-h-12 items-center py-3 pr-5">{row}</div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </section>
            ))}
          </div>

          <div className="mt-14 border-t border-[#18aeb4]/25 pt-7 text-center">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-[#547b74]">
              Full table experience concept
            </p>
            <Link
              href="/table/las-palmas-lynnhaven/1"
              className="mt-3 inline-block text-sm font-bold text-[#07858c] underline decoration-[#ef5d43]/60 underline-offset-4 hover:decoration-[#ef5d43] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#07858c]"
            >
              Open Table 1 — menu, service requests &amp; table game
            </Link>
          </div>

          <LasPalmasGuestNoteForm />

          <footer className="mt-10 pb-2 text-center text-[0.62rem] uppercase tracking-[0.28em] text-[#4d7770]/55">
            Owner-review concept · Menu by Fina Calle
          </footer>
        </div>
      </div>
    </main>
  );
}
