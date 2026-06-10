import Link from "next/link";
import { atlas, updatedAt, type Move } from "./atlas";

// Private internal page: noindex, reachable by URL only.
// The code-infrastructure map of every local project. Edit data in ./atlas.ts.
export const metadata = {
  title: "Project Code Atlas — Fina Calle OS",
  robots: { index: false, follow: false },
};

// Move → accent color (gold = active/ship, steel = keep/consolidate, dim = park/archive).
const MOVE_TONE: Record<Move, string> = {
  "Double-down": "border-[#d8b36d]/55 text-[#e7cd92]",
  "Productize / Sell": "border-[#d8b36d]/55 text-[#e7cd92]",
  Ship: "border-[#9ec7a6]/45 text-[#bfe0c5]",
  Integrate: "border-[#9ec7a6]/45 text-[#bfe0c5]",
  "Keep (internal)": "border-[#9bb4c9]/45 text-[#cfdcea]",
  Salvage: "border-[#9bb4c9]/40 text-[#bcc9d6]",
  Park: "border-[#cfd6da]/22 text-[#aeb7bd]",
  Archive: "border-[#cfd6da]/16 text-[#8a9298]",
};

function MoveChip({ move }: { move: Move }): React.JSX.Element {
  return (
    <span
      className={`ml-3 shrink-0 rounded-full border px-2 py-0.5 text-[0.55rem] font-semibold uppercase tracking-[0.12em] ${MOVE_TONE[move]}`}
    >
      {move}
    </span>
  );
}

export default function CodeAtlasPage(): React.JSX.Element {
  const projectCount = atlas.reduce((n, t) => n + t.projects.length, 0);

  return (
    <main className="relative isolate min-h-screen overflow-hidden bg-[#030405] text-[#f4f6f7]">
      <div className="absolute inset-0 -z-30 bg-[radial-gradient(circle_at_50%_0%,rgba(180,188,194,0.14),transparent_34%),linear-gradient(145deg,#020303_0%,#0d1012_48%,#050607_100%)]" />
      <div className="absolute inset-0 -z-20 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.022)_1px,transparent_1px)] bg-[size:72px_72px]" />

      <section className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8 lg:px-10">
        <header className="flex items-center justify-between text-[0.66rem] uppercase tracking-[0.32em] text-[#cfd6da]/58">
          <Link href="/command-center" className="transition hover:text-[#f4f6f7]">
            ← Command Center
          </Link>
          <span>Code Atlas</span>
        </header>

        <div className="mt-10 mb-9">
          <p className="text-[0.68rem] uppercase tracking-[0.5em] text-[#d8b36d]/86">Fina Calle OS</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[#f4f6f7] sm:text-4xl">
            Project Code Atlas
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#c8d0d4] sm:text-base">
            The code-infrastructure map of every local project — stack, type, state, git, and the{" "}
            <span className="text-[#e7cd92]">move</span>. {projectCount} projects across {atlas.length} tiers.
            WIP-capped to 1–2 active builds; everything else ships, parks, or archives.
          </p>
          <p className="mt-2 text-xs text-[#c8d0d4]/55">
            Derived from{" "}
            <a
              href="https://github.com/anthonycolmenaresanandres-lang/amma-fina-calle/blob/main/HANDOFFS/LOCAL_CODE_INVENTORY.md"
              target="_blank"
              rel="noopener noreferrer"
              className="underline decoration-[#cfd6da]/30 underline-offset-2 hover:text-[#eef2f4]"
            >
              Local Code Inventory
            </a>{" "}
            +{" "}
            <a
              href="https://github.com/anthonycolmenaresanandres-lang/amma-fina-calle/blob/main/BUSINESS/PROJECT_PORTFOLIO_TRIAGE.md"
              target="_blank"
              rel="noopener noreferrer"
              className="underline decoration-[#cfd6da]/30 underline-offset-2 hover:text-[#eef2f4]"
            >
              Portfolio Triage
            </a>
            . Updated {updatedAt}.
          </p>
        </div>

        <div className="flex flex-col gap-8">
          {atlas.map((tier) => (
            <section key={tier.title}>
              <div className="mb-1 flex items-baseline justify-between gap-3">
                <h2 className="text-xs font-semibold uppercase tracking-[0.24em] text-[#eef2f4]">
                  {tier.title}
                </h2>
                <span className="text-[0.6rem] uppercase tracking-[0.2em] text-[#cfd6da]/40">
                  {tier.projects.length}
                </span>
              </div>
              <p className="mb-4 text-xs leading-5 text-[#c8d0d4]/70">{tier.blurb}</p>

              <div className="grid gap-4 md:grid-cols-2">
                {tier.projects.map((p) => {
                  const inner = (
                    <>
                      <div className="flex items-start justify-between gap-2">
                        <span className="min-w-0">
                          <span className="flex items-center gap-2">
                            {p.flagship ? (
                              <span
                                aria-hidden
                                className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#d8b36d] shadow-[0_0_12px_rgba(216,179,109,0.8)]"
                              />
                            ) : null}
                            <span className="truncate text-sm font-semibold text-[#eef2f4]">{p.name}</span>
                          </span>
                          <span className="mt-0.5 block font-mono text-[0.66rem] text-[#c8d0d4]/45">{p.path}</span>
                        </span>
                        <MoveChip move={p.move} />
                      </div>

                      <p className="mt-3 text-[0.78rem] leading-5 text-[#aeb7bd]">{p.stack}</p>

                      <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-[0.7rem] leading-5">
                        <dt className="uppercase tracking-[0.16em] text-[#cfd6da]/40">Type</dt>
                        <dd className="text-[#c8d0d4]/80">{p.type}</dd>
                        <dt className="uppercase tracking-[0.16em] text-[#cfd6da]/40">State</dt>
                        <dd className="text-[#c8d0d4]/80">{p.state}</dd>
                        <dt className="uppercase tracking-[0.16em] text-[#cfd6da]/40">Git</dt>
                        <dd className="text-[#c8d0d4]/80">{p.git}</dd>
                      </dl>

                      <p className="mt-3 border-t border-[#cfd6da]/10 pt-3 text-[0.78rem] leading-5 text-[#c8d0d4]">
                        {p.note}
                      </p>
                    </>
                  );
                  const cls =
                    "block h-full rounded-2xl border border-[#cfd6da]/16 bg-[#080a0c]/72 p-5 shadow-[0_24px_70px_-50px_rgba(255,255,255,0.4)] backdrop-blur transition";
                  return p.repo ? (
                    <a
                      key={p.name}
                      href={p.repo}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`${cls} hover:border-[#d8b36d]/40 hover:bg-[#0c0f12]/80`}
                    >
                      {inner}
                    </a>
                  ) : (
                    <div key={p.name} className={cls}>
                      {inner}
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>

        <footer className="mt-10 border-t border-[#cfd6da]/12 pt-5 text-[0.62rem] uppercase tracking-[0.24em] text-[#cfd6da]/40">
          Private · not indexed · edit data in{" "}
          <span className="text-[#cfd6da]/60">command-center/code/atlas.ts</span>
        </footer>
      </section>
    </main>
  );
}
