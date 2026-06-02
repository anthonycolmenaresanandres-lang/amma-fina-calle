const productLines = [
  {
    name: "Digital Storefronts",
    description:
      "Mobile-first storefront shells that help local businesses present offers, proof, and next steps with discipline.",
  },
  {
    name: "QR Menu Experiences",
    description:
      "Interactive menu systems designed for quick scanning, clear item hierarchy, and brand-specific atmosphere.",
  },
  {
    name: "Interactive Game Layers",
    description:
      "Lightweight web game concepts that turn customer attention into a memorable business touchpoint.",
  },
  {
    name: "Owner Intake Systems",
    description:
      "Simple capture flows for understanding the owner, the business identity, and the right digital package.",
  },
  {
    name: "R&D Automation / Clone Control",
    description:
      "Internal operating infrastructure for safer handoffs, project memory, and repeatable software execution.",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#16100c] text-[#f7ead4]">
      <section className="relative isolate overflow-hidden border-b border-[#d9b66d]/20">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_18%_12%,rgba(51,91,112,0.42),transparent_32%),linear-gradient(135deg,#16100c_0%,#25170f_44%,#0f1d25_100%)]" />
        <div className="absolute inset-x-0 bottom-0 -z-10 h-28 bg-gradient-to-t from-[#16100c] to-transparent" />

        <div className="mx-auto flex min-h-[88vh] w-full max-w-6xl flex-col justify-between px-5 py-8 sm:px-8 lg:px-10">
          <header className="flex items-center justify-between gap-5 text-xs uppercase tracking-[0.28em] text-[#d9b66d]">
            <span>AMMA / Fina Calle</span>
            <span className="hidden text-[#91b9c6] sm:inline">Virginia Beach</span>
          </header>

          <div className="max-w-4xl py-20 sm:py-24">
            <p className="mb-5 text-sm uppercase tracking-[0.34em] text-[#91b9c6]">
              Parent operating company
            </p>
            <h1 className="max-w-4xl text-balance text-5xl font-semibold leading-[0.96] tracking-normal text-[#fff7e8] sm:text-7xl lg:text-8xl">
              AMMA Ventures LLC DBA Fina Calle
            </h1>
            <p className="mt-8 max-w-2xl text-lg leading-8 text-[#ead7b6] sm:text-xl">
              A company platform for digital storefronts, interactive menus,
              and local-business web systems with Colombian soul and practical
              technical discipline.
            </p>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <a
                href="/conquest"
                className="inline-flex min-h-12 items-center justify-center border border-[#d9b66d] bg-[#d9b66d] px-5 text-sm font-semibold uppercase tracking-[0.16em] text-[#1a120c] transition hover:bg-[#f1cf83]"
              >
                Explore the Conquest Prototype
              </a>
              <span
                aria-disabled="true"
                className="inline-flex min-h-12 cursor-not-allowed items-center justify-center border border-[#ead7b6]/30 px-5 text-sm font-semibold uppercase tracking-[0.16em] text-[#ead7b6]/55"
              >
                View Case Study Pipeline
              </span>
            </div>
          </div>

          <div className="grid gap-4 border-t border-[#f7ead4]/15 py-5 text-sm text-[#ead7b6] sm:grid-cols-3">
            <p>Reusable systems, not disposable templates.</p>
            <p>Local business experiences with owner-first workflows.</p>
            <p>R&D infrastructure before premature automation.</p>
          </div>
        </div>
      </section>

      <section className="bg-[#f4e6cb] px-5 py-16 text-[#24170f] sm:px-8 lg:px-10">
        <div className="mx-auto max-w-6xl">
          <p className="text-sm uppercase tracking-[0.3em] text-[#335b70]">
            Operating System
          </p>
          <div className="mt-5 grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
            <h2 className="text-4xl font-semibold leading-tight tracking-normal sm:text-5xl">
              The company builds repeatable product systems, not one-off pages.
            </h2>
            <div className="space-y-5 text-lg leading-8 text-[#4c382a]">
              <p>
                Fina Calle treats every storefront, menu, game layer, and intake
                flow as part of a larger operating system. The goal is to reuse
                strong patterns while still letting each business keep its own
                identity.
              </p>
              <p>
                The parent portal exists to organize that work: proof of
                concept, reusable modules, internal automation research, and the
                next disciplined build step.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#1b2528] px-5 py-16 text-[#f7ead4] sm:px-8 lg:px-10">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-[#d9b66d]">
                Product Lines
              </p>
              <h2 className="mt-4 text-4xl font-semibold tracking-normal">
                Built for practical local-business deployment.
              </h2>
            </div>
            <p className="max-w-md text-base leading-7 text-[#b8d2d9]">
              Each line is designed to become a reusable company capability
              before it becomes a public-facing package.
            </p>
          </div>

          <div className="divide-y divide-[#f7ead4]/14 border-y border-[#f7ead4]/14">
            {productLines.map((line) => (
              <div
                key={line.name}
                className="grid gap-3 py-6 sm:grid-cols-[0.42fr_0.58fr] sm:gap-8"
              >
                <h3 className="text-xl font-semibold text-[#fff7e8]">
                  {line.name}
                </h3>
                <p className="text-base leading-7 text-[#d5c2a5]">
                  {line.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#f8efd9] px-5 py-16 text-[#20140d] sm:px-8 lg:px-10">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-2">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-[#8d6a25]">
              Proof of Concept
            </p>
            <h2 className="mt-4 text-4xl font-semibold leading-tight tracking-normal">
              Colattao Cafe Rush is the flagship case study.
            </h2>
          </div>
          <div className="space-y-5 text-lg leading-8 text-[#4c382a]">
            <p>
              Colattao Cafe Rush anchors the first visible proof of concept:
              a local-business digital experience that can connect menu design,
              brand atmosphere, and interactive customer engagement.
            </p>
            <p>
              It is referenced here as a company learning asset only. This page
              does not invent performance metrics or claim public product
              readiness that has not been verified.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-[#15100d] px-5 py-16 text-[#f7ead4] sm:px-8 lg:px-10">
        <div className="mx-auto max-w-6xl">
          <p className="text-sm uppercase tracking-[0.3em] text-[#91b9c6]">
            R&D / Clone Control
          </p>
          <div className="mt-5 grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
            <h2 className="text-4xl font-semibold leading-tight tracking-normal">
              Shadow Engineer and CLONE_CONTROL are internal infrastructure.
            </h2>
            <div className="space-y-5 text-lg leading-8 text-[#d5c2a5]">
              <p>
                Shadow Engineer supports local-first monitoring, handoffs, and
                company project discipline. CLONE_CONTROL keeps verified facts,
                queues, and reports in one place so future runs do not guess.
              </p>
              <p>
                This infrastructure is not presented as a public product here.
                It is company operating material used to make future builds
                safer, clearer, and easier to audit.
              </p>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-[#d9b66d]/20 bg-[#0f0b08] px-5 py-8 text-[#d5c2a5] sm:px-8 lg:px-10">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 text-sm sm:flex-row sm:items-center sm:justify-between">
          <p className="font-semibold text-[#fff7e8]">
            AMMA Ventures LLC DBA Fina Calle
          </p>
          <p>Virginia Beach / Colombia-inspired digital systems</p>
          <p>Built as company infrastructure, not disposable templates.</p>
        </div>
      </footer>
    </main>
  );
}
