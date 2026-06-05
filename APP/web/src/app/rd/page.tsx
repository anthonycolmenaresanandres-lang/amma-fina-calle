import Link from "next/link";

const researchTracks = [
  {
    name: "Fina Calle PayBridge",
    status: "Payment-options connector R&D",
    body: "QR-based local-business payment-options connector concept. Not a lender, not an approval party, not a repayment servicer, and not a live payment system.",
    href: "/research-and-development/paybridge",
  },
  {
    name: "Shadow Engineer / CLONE_CONTROL",
    status: "Internal infrastructure",
    body: "Windows-first local command and reporting infrastructure for handoff, packet coverage, reconciliation, and planning discipline.",
    href: undefined,
  },
  {
    name: "Franchise Certainty",
    status: "R&D prototype",
    body: "Fast-food automation research. It should be described as research until hardware and operating facts are verified for a specific release.",
    href: undefined,
  },
  {
    name: "PermitReady",
    status: "Professional tool R&D",
    body: "Reviewer-facing permit packet tooling research under the APP Designs / PermitReady direction.",
    href: undefined,
  },
  {
    name: "LA72",
    status: "Creative/game R&D",
    body: "Unity game prototype research. It is not presented here as a finished public product.",
    href: undefined,
  },
];

export const metadata = {
  title: "R&D | Fina Calle OS",
  description:
    "Static research and development shell for internal Fina Calle OS projects.",
};

export default function ResearchPage() {
  return (
    <main className="relative isolate min-h-dvh overflow-hidden bg-[#030405] px-5 py-5 text-[#f4f6f7] sm:px-8 lg:px-10">
      <div className="absolute inset-0 -z-30 bg-[radial-gradient(circle_at_48%_18%,rgba(205,214,219,0.13),transparent_30%),radial-gradient(circle_at_80%_76%,rgba(216,179,109,0.09),transparent_28%),linear-gradient(145deg,#020303_0%,#0d1012_46%,#050607_100%)]" />
      <div className="absolute inset-0 -z-20 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.022)_1px,transparent_1px)] bg-[size:68px_68px]" />

      <div className="mx-auto flex min-h-[calc(100dvh-2.5rem)] w-full max-w-6xl flex-col">
        <header className="flex items-center justify-between gap-4 text-[0.68rem] uppercase tracking-[0.28em] text-[#cfd6da]/62">
          <Link href="/" className="transition hover:text-white">
            Fina Calle OS
          </Link>
          <span className="hidden sm:inline">R&D Lab</span>
        </header>

        <section className="grid flex-1 gap-8 py-10 lg:grid-cols-[0.72fr_1.28fr] lg:items-start lg:py-16">
          <div>
            <p className="text-xs uppercase tracking-[0.42em] text-[#d8b36d]">
              Internal Lab
            </p>
            <h1 className="mt-5 text-4xl font-semibold tracking-normal text-[#f4f6f7] sm:text-5xl">
              Research stays labeled as research.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-[#c8d0d4] sm:text-lg">
              AMMA/Fina Calle keeps experimental systems separate from finished
              product claims. This page lists verified R&D directions only.
            </p>
          </div>

          <div className="grid gap-4">
            {researchTracks.map((track) => {
              const card = (
                <section className="rounded-lg border border-[#cfd6da]/14 bg-[#07090b]/76 p-5 transition hover:border-[#d8b36d]/42 sm:p-6">
                  <p className="text-[0.66rem] uppercase tracking-[0.22em] text-[#d8b36d]">
                    {track.status}
                  </p>
                  <h2 className="mt-3 text-xl font-semibold text-[#eef2f4]">
                    {track.name}
                  </h2>
                  <p className="mt-3 text-sm leading-6 text-[#aeb7bd]">
                    {track.body}
                  </p>
                  {track.href ? (
                    <p className="mt-4 text-xs uppercase tracking-[0.2em] text-[#d8b36d]">
                      Review concept
                    </p>
                  ) : null}
                </section>
              );

              return track.href ? (
                <Link key={track.name} href={track.href} className="block">
                  {card}
                </Link>
              ) : (
                <div key={track.name}>{card}</div>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}
