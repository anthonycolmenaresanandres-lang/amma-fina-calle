import Link from "next/link";

const systems = [
  {
    name: "Digital storefronts",
    body: "Public-facing web surfaces for local-business identity, proof, and next-step routing.",
  },
  {
    name: "QR menu experiences",
    body: "Menu and customer journey patterns that can support restaurants and storefronts without pretending every client needs the same build.",
  },
  {
    name: "Interactive game layers",
    body: "Optional lightweight interaction loops that turn a static visit into a branded experience.",
  },
  {
    name: "Owner intake systems",
    body: "Structured request flow concepts for collecting what a build needs before automation is introduced.",
  },
  {
    name: "Clone/control infrastructure",
    body: "Internal registry, packet, and reconciliation discipline for keeping project facts visible and current.",
  },
];

export const metadata = {
  title: "Systems | Fina Calle OS",
  description:
    "Reusable frontend-only system shell for Fina Calle OS digital storefront infrastructure.",
};

export default function SystemsPage() {
  return (
    <main className="relative isolate min-h-dvh overflow-hidden bg-[#030405] px-5 py-5 text-[#f4f6f7] sm:px-8 lg:px-10">
      <div className="absolute inset-0 -z-30 bg-[radial-gradient(circle_at_50%_16%,rgba(205,214,219,0.13),transparent_30%),radial-gradient(circle_at_16%_80%,rgba(216,179,109,0.09),transparent_28%),linear-gradient(145deg,#020303_0%,#0d1012_46%,#050607_100%)]" />
      <div className="absolute inset-0 -z-20 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.022)_1px,transparent_1px)] bg-[size:68px_68px]" />

      <div className="mx-auto flex min-h-[calc(100dvh-2.5rem)] w-full max-w-6xl flex-col">
        <header className="flex items-center justify-between gap-4 text-[0.68rem] uppercase tracking-[0.28em] text-[#cfd6da]/62">
          <Link href="/" className="transition hover:text-white">
            Fina Calle OS
          </Link>
          <span className="hidden sm:inline">Systems</span>
        </header>

        <section className="grid flex-1 gap-8 py-10 lg:grid-cols-[0.72fr_1.28fr] lg:items-start lg:py-16">
          <div>
            <p className="text-xs uppercase tracking-[0.42em] text-[#d8b36d]">
              Product Systems
            </p>
            <h1 className="mt-5 text-4xl font-semibold tracking-normal text-[#f4f6f7] sm:text-5xl">
              Repeatable structure, not one-off decoration.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-[#c8d0d4] sm:text-lg">
              Fina Calle OS organizes local-business work into reusable
              frontend systems. This page is a static shell, not a platform
              dashboard.
            </p>
          </div>

          <div className="grid gap-4">
            {systems.map((system) => (
              <section
                key={system.name}
                className="rounded-lg border border-[#cfd6da]/14 bg-[#07090b]/76 p-5 sm:p-6"
              >
                <h2 className="text-xl font-semibold text-[#eef2f4]">
                  {system.name}
                </h2>
                <p className="mt-3 text-sm leading-6 text-[#aeb7bd]">
                  {system.body}
                </p>
              </section>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
