import type { Metadata } from "next";
import Link from "next/link";

// Public orientation facts were verified from https://www.gatorssportsbar.com/
// on 2026-07-24. Menu content remains deliberately generic because the
// official menu varies by location and no owner approval has been received.
export const metadata: Metadata = {
  title: "A.J. Gators · Menu + game concept | Fina Calle",
  description:
    "Private owner-review concept showing how a location-specific digital menu and table game could work together.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
};

const conceptSections = [
  {
    number: "01",
    title: "Shareables",
    note: "Owner-confirmed starters and table favorites.",
  },
  {
    number: "02",
    title: "Handhelds",
    note: "Current burgers, sandwiches, and wraps by location.",
  },
  {
    number: "03",
    title: "Bowls & sides",
    note: "The right supporting menu for this specific kitchen.",
  },
  {
    number: "04",
    title: "Location specials",
    note: "Only what this location confirms is available.",
  },
];

export default function AjGatorsDemoPage(): React.JSX.Element {
  return (
    <main className="min-h-dvh bg-[#09110d] px-5 py-6 text-[#f5f0df] sm:px-8 sm:py-10">
      <div className="mx-auto w-full max-w-3xl">
        <p className="bg-[#e0a52f] px-4 py-2 text-center text-[0.68rem] font-black uppercase tracking-[0.22em] text-[#10130e]">
          Pending client approval · Demo only
        </p>

        <header className="relative overflow-hidden py-12 text-center sm:py-16">
          <div
            aria-hidden
            className="absolute inset-x-0 top-1/2 h-px bg-gradient-to-r from-transparent via-[#e0a52f]/50 to-transparent"
          />
          <div className="relative mx-auto w-fit bg-[#09110d] px-5">
            <p className="text-[0.7rem] font-bold uppercase tracking-[0.36em] text-[#e0a52f]">
              Sports bar menu + game concept
            </p>
            <h1 className="mt-3 text-5xl font-black uppercase leading-none tracking-[-0.06em] sm:text-7xl">
              A.J. Gators
            </h1>
            <p className="mt-4 text-xs font-semibold uppercase tracking-[0.24em] text-[#9cac9f]">
              One scan · the right location · the whole table in the game
            </p>
          </div>
        </header>

        <section className="grid gap-px bg-[#dce5dd]/15 sm:grid-cols-3" aria-label="Public-source orientation">
          <div className="bg-[#101a14] px-5 py-5 text-center">
            <strong className="block text-2xl font-black text-[#f5f0df]">Since 1996</strong>
            <span className="mt-1 block text-[0.65rem] uppercase tracking-[0.18em] text-[#9cac9f]">
              Local tradition
            </span>
          </div>
          <div className="bg-[#101a14] px-5 py-5 text-center">
            <strong className="block text-2xl font-black text-[#f5f0df]">8 locations</strong>
            <span className="mt-1 block text-[0.65rem] uppercase tracking-[0.18em] text-[#9cac9f]">
              Virginia + North Carolina
            </span>
          </div>
          <div className="bg-[#101a14] px-5 py-5 text-center">
            <strong className="block text-2xl font-black text-[#e0a52f]">1 QR</strong>
            <span className="mt-1 block text-[0.65rem] uppercase tracking-[0.18em] text-[#9cac9f]">
              Menu + game entry
            </span>
          </div>
        </section>

        <section className="py-12" aria-labelledby="menu-direction-title">
          <div className="max-w-xl">
            <p className="text-[0.65rem] font-bold uppercase tracking-[0.28em] text-[#e0a52f]">
              Menu direction
            </p>
            <h2 id="menu-direction-title" className="mt-2 text-3xl font-black uppercase tracking-[-0.03em]">
              Fast to scan. Easy to update.
            </h2>
            <p className="mt-3 text-sm leading-6 text-[#b9c4bb]">
              This is a layout proof, not a published menu. The official menu varies by location, so the selected
              location must confirm every item, price, modifier, and availability before launch.
            </p>
          </div>

          <div className="mt-7 divide-y divide-[#dce5dd]/15 border-y border-[#dce5dd]/15">
            {conceptSections.map((section) => (
              <div key={section.number} className="grid grid-cols-[2.5rem_1fr] gap-3 py-4 sm:grid-cols-[3rem_12rem_1fr]">
                <span className="font-mono text-xs font-bold text-[#e0a52f]">{section.number}</span>
                <h3 className="text-sm font-black uppercase tracking-[0.12em]">{section.title}</h3>
                <p className="col-start-2 text-sm text-[#9cac9f] sm:col-start-3">{section.note}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-[#e8eee8] px-6 py-9 text-[#10130e] sm:px-9" aria-labelledby="game-title">
          <p className="text-[0.65rem] font-black uppercase tracking-[0.28em] text-[#5c6f60]">Table game proof</p>
          <div className="mt-3 grid items-end gap-6 sm:grid-cols-[1fr_auto]">
            <div>
              <h2 id="game-title" className="text-3xl font-black uppercase leading-[0.95] tracking-[-0.04em]">
                Five shots.
                <br />
                One table champion.
              </h2>
              <p className="mt-4 max-w-lg text-sm leading-6 text-[#465248]">
                Preview the existing Fina Calle penalty engine. A final A.J. Gators-specific skin, copy, rewards, and
                table rules remain pending owner approval.
              </p>
            </div>
            <Link
              href="/penalty-shootout"
              className="inline-flex min-h-12 items-center justify-center bg-[#10130e] px-6 text-xs font-black uppercase tracking-[0.18em] text-[#f5f0df] transition hover:bg-[#263129]"
            >
              Play engine preview
            </Link>
          </div>
        </section>

        <section className="py-10 text-center">
          <p className="text-xl font-black uppercase tracking-[-0.02em]">Built location by location.</p>
          <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-[#9cac9f]">
            The QR can stay in place while approved menu content changes behind it. No prices or location-specific
            menu claims are included in this demo.
          </p>
        </section>

        <footer className="border-t border-[#dce5dd]/15 py-5 text-center text-[0.6rem] uppercase tracking-[0.2em] text-[#708076]">
          Private owner review · Typography-only concept · Unlinked and noindex
        </footer>
      </div>
    </main>
  );
}
