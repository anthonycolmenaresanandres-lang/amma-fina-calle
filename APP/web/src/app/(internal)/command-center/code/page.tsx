import Link from "next/link";
import { tiers, type Move } from "./atlas";

// Private internal page (noindex), same model as the Command Center hub it hangs off.
export const metadata = {
  title: "Project Code Atlas — Fina Calle OS",
  robots: { index: false, follow: false },
};

// Accent per portfolio move: gold = act, neutral = keep/salvage, dim = park/archive.
const MOVE_CLASS: Record<Move, string> = {
  "Double-down": "border-[#d8b36d]/55 text-[#e7c884]",
  Ship: "border-[#d8b36d]/55 text-[#e7c884]",
  Productize: "border-[#d8b36d]/55 text-[#e7c884]",
  Keep: "border-[#cfd6da]/30 text-[#cfd6da]/75",
  Salvage: "border-[#cfd6da]/30 text-[#cfd6da]/75",
  Park: "border-[#cfd6da]/18 text-[#cfd6da]/45",
  Archive: "border-[#b06a6a]/30 text-[#c89292]/70",
};

export default function CodeAtlasPage(): React.JSX.Element {
  const projectCount = tiers.reduce((n, t) => n + t.projects.length, 0);
  const remoteCount = tiers.reduce((n, t) => n + t.projects.filter((p) => p.remote).length, 0);

  return (
    <main className="relative isolate min-h-screen overflow-hidden bg-[#030405] text-[#f4f6f7]">
      <div className="absolute inset-0 -z-30 bg-[radial-gradient(circle_at_50%_0%,rgba(180,188,194,0.14),transparent_34%),linear-gradient(145deg,#020303_0%,#0d1012_48%,#050607_100%)]" />
      <div className="absolute inset-0 -z-20 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.022)_1px,transparent_1px)] bg-[size:72px_72px]" />

      <section className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8 lg:px-10">
        <header className="flex items-center justify-between text-[0.66rem] uppercase tracking-[0.32em] text-[#cfd6da]/58">
          <Link href="/command-center" className="transition hover:text-[#f4f6f7]">← Command Center</Link>
          <span>Code Atlas</span>
        </header>

        <div className="mt-10 mb-9">
          <p className="text-[0.68rem] uppercase tracking-[0.5em] text-[#d8b36d]/86">Fina Calle OS</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[#f4f6f7] sm:text-4xl">
            Project Code Atlas
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#c8d0d4] sm:text-base">
            Every project&apos;s code infrastructure — stack, type, state, where the code lives, and the
            one decided <span className="text-[#e7c884]">move</span>. {projectCount} projects across {tiers.length} tiers
            ({remoteCount} on GitHub). Tiers from the portfolio triage; details from the local code inventory.
          </p>
        </div>

        <div className="flex flex-col gap-7">
          {tiers.map((tier) => (
            <section key={tier.title}>
              <div className="mb-3 flex items-baseline justify-between gap-3 border-b border-[#cfd6da]/12 pb-2">
                <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-[#eef2f4]">{tier.title}</h2>
                <span className="text-[0.62rem] uppercase tracking-[0.18em] text-[#cfd6da]/45">{tier.projects.length}</span>
              </div>
              <p className="mb-4 text-xs leading-5 text-[#c8d0d4]/70">{tier.blurb}</p>

              <div className="grid gap-4 md:grid-cols-2">
                {tier.projects.map((p) => (
                  <article
                    key={p.name}
                    className={`rounded-2xl border bg-[#080a0c]/72 p-5 shadow-[0_24px_70px_-50px_rgba(255,255,255,0.4)] backdrop-blur ${
                      p.flagship ? "border-dashed border-[#d8b36d]/55" : "border-[#cfd6da]/16"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-sm font-semibold text-[#f4f6f7]">
                        {p.flagship ? <span className="mr-1.5 text-[#d8b36d]">★</span> : null}
                        {p.name}
                      </h3>
                      <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[0.55rem] font-semibold uppercase tracking-[0.12em] ${MOVE_CLASS[p.move]}`}>
                        {p.move}
                      </span>
                    </div>

                    <p className="mt-1 text-xs text-[#c8d0d4]/80">{p.type}</p>
                    <p className="mt-2 font-mono text-[0.68rem] leading-5 text-[#aeb7bd]">{p.stack}</p>

                    <div className="mt-3 flex flex-wrap items-center gap-2 text-[0.58rem] uppercase tracking-[0.12em]">
                      <span className="rounded-full border border-[#cfd6da]/18 px-2 py-0.5 text-[#cfd6da]/60">{p.state}</span>
                      {p.remote ? (
                        <a
                          href={p.remote}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-full border border-[#cfd6da]/22 px-2 py-0.5 text-[#cfd6da]/75 transition hover:border-[#d8b36d]/50 hover:text-[#e7c884]"
                        >
                          GitHub ↗
                        </a>
                      ) : (
                        <span className="rounded-full border border-[#cfd6da]/12 px-2 py-0.5 text-[#cfd6da]/40">local only</span>
                      )}
                    </div>

                    {p.note ? (
                      <p className="mt-3 border-t border-[#cfd6da]/10 pt-3 text-[0.72rem] leading-5 text-[#c8d0d4]/65">{p.note}</p>
                    ) : null}
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>

        <footer className="mt-10 border-t border-[#cfd6da]/12 pt-5 text-[0.62rem] uppercase tracking-[0.24em] text-[#cfd6da]/40">
          Private · not indexed · edit in <span className="text-[#cfd6da]/60">command-center/code/atlas.ts</span>
        </footer>
      </section>
    </main>
  );
}
