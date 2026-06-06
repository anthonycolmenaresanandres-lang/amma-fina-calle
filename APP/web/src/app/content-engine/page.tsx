import Link from "next/link";
import PromptSystemGrid from "./PromptSystemGrid";
import { PROMPT_SYSTEMS } from "./promptSystems";

export const metadata = {
  title: "Content Engine | Fina Calle OS",
  description:
    "A test brand surface for Fina Calle OS: a content-generation system that turns one idea into a month of Instagram-ready posts, carousels, scripts, and DM flows.",
};

const stats = [
  { value: `${PROMPT_SYSTEMS.length}`, label: "Prompt systems" },
  { value: "1 idea", label: "In" },
  { value: "30 days", label: "Of content out" },
];

export default function ContentEnginePage() {
  return (
    <main className="relative isolate min-h-dvh overflow-hidden bg-[#030405] px-5 py-5 text-[#f4f6f7] sm:px-8 lg:px-10">
      {/* Ambient brand layers — matched to the Fina Calle OS dark + gold system. */}
      <div className="absolute inset-0 -z-30 bg-[radial-gradient(circle_at_50%_8%,rgba(205,214,219,0.14),transparent_30%),radial-gradient(circle_at_85%_70%,rgba(216,179,109,0.1),transparent_30%),linear-gradient(150deg,#020303_0%,#0d1012_46%,#050607_100%)]" />
      <div className="absolute inset-0 -z-20 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.022)_1px,transparent_1px)] bg-[size:68px_68px]" />
      <div className="absolute inset-x-0 top-0 -z-10 h-32 bg-gradient-to-b from-[#dfe5e8]/8 to-transparent" />

      <div className="mx-auto w-full max-w-6xl">
        <header className="flex items-center justify-between gap-4 text-[0.68rem] uppercase tracking-[0.28em] text-[#cfd6da]/62">
          <Link href="/" className="transition hover:text-white">
            Fina Calle OS
          </Link>
          <span className="hidden sm:inline">Content Engine</span>
          <span className="rounded-full border border-[#d8b36d]/40 px-2.5 py-1 text-[0.55rem] tracking-[0.3em] text-[#d8b36d] sm:hidden">
            Test
          </span>
        </header>

        {/* Hero */}
        <section className="relative py-14 text-center sm:py-20">
          <p className="text-[0.7rem] uppercase tracking-[0.46em] text-[#d8b36d]">
            Fina Calle OS · Content Engine
          </p>
          <h1 className="mx-auto mt-6 max-w-4xl text-balance text-4xl font-semibold leading-[1.05] tracking-tight text-[#f4f6f7] sm:text-6xl">
            Turn one idea into a month of content that actually sells.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-balance text-base leading-7 text-[#c8d0d4] sm:text-lg">
            A named set of prompt systems that take a single product idea and
            spin it into hooks, carousels, captions, Reel scripts, and DM flows —
            warm, human, and on-brand. Built the Fina Calle way: premium, modular,
            and ready to ship.
          </p>

          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <a
              href="#systems"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[#d8b36d]/60 bg-[#f4f6f7] px-7 text-xs font-black uppercase tracking-[0.18em] text-[#050607] shadow-[0_18px_46px_-28px_rgba(216,179,109,0.95)] transition hover:-translate-y-0.5 hover:bg-white"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-[#d8b36d] shadow-[0_0_12px_rgba(216,179,109,0.8)]" />
              Explore the systems
            </a>
            <Link
              href="/systems"
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#cfd6da]/30 bg-[#080a0c]/76 px-7 text-xs font-semibold uppercase tracking-[0.16em] text-[#eef2f4] backdrop-blur transition hover:border-[#f0f3f4]/70 hover:bg-[#15191d]/88"
            >
              Fina Calle OS systems
            </Link>
          </div>

          <dl className="mx-auto mt-12 grid max-w-2xl grid-cols-3 gap-4">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-[#cfd6da]/12 bg-[#07090b]/70 px-3 py-5 backdrop-blur"
              >
                <dt className="sr-only">{stat.label}</dt>
                <dd className="text-2xl font-semibold text-[#f1f4f5] sm:text-3xl">
                  {stat.value}
                </dd>
                <p className="mt-1 text-[0.62rem] uppercase tracking-[0.24em] text-[#9aa3a9]">
                  {stat.label}
                </p>
              </div>
            ))}
          </dl>
        </section>

        {/* Systems grid */}
        <section id="systems" className="scroll-mt-8 pb-16">
          <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.42em] text-[#d8b36d]">
                The Prompt Systems
              </p>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-[#f4f6f7] sm:text-4xl">
                Plug in your inputs. Copy. Post.
              </h2>
            </div>
            <p className="max-w-sm text-sm leading-6 text-[#9aa3a9]">
              Every gold{" "}
              <span className="rounded-[0.3rem] bg-[#d8b36d]/12 px-1 font-medium text-[#e3c47f]">
                [input]
              </span>{" "}
              is yours to fill. Tap a card to copy the full prompt to your
              clipboard.
            </p>
          </div>

          <PromptSystemGrid />
        </section>

        {/* Brand footer — consistent with the live Fina Calle landing footer. */}
        <footer className="mx-auto w-full max-w-3xl pb-8 text-center">
          <div className="relative overflow-hidden rounded-[2rem] border border-[#cfd6da]/22 bg-[#050607]/78 px-5 py-7 shadow-[0_24px_70px_-46px_rgba(255,255,255,0.42)] backdrop-blur sm:px-8">
            <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-[#d8b36d]/70 to-transparent" />
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(216,179,109,0.12),transparent_38%)]" />
            <p className="relative text-[0.62rem] font-semibold uppercase tracking-[0.34em] text-[#d8b36d]/86">
              Content Engine · Test surface
            </p>
            <p className="relative mt-3 text-balance text-lg font-semibold leading-tight text-[#f4f6f7] sm:text-2xl">
              Same Fina Calle polish. New job: making content.
            </p>
            <a
              href="https://www.instagram.com/fina_calle?igsh=MXUyZjZwODg3a3hjag=="
              target="_blank"
              rel="noopener noreferrer"
              className="relative mt-5 inline-flex min-h-12 items-center justify-center rounded-full border border-[#d8b36d]/70 bg-[#f4f6f7] px-6 text-xs font-black uppercase tracking-[0.18em] text-[#050607] shadow-[0_18px_46px_-28px_rgba(216,179,109,0.95)] transition hover:-translate-y-0.5 hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#d8b36d]"
              aria-label="Open Fina Calle on Instagram"
            >
              @fina_calle
            </a>
          </div>
        </footer>
      </div>
    </main>
  );
}
