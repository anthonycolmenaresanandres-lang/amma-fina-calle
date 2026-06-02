const landingLinks = [
  {
    label: "View Colattao Café Rush",
    href: "https://colattao-cafe-rush.vercel.app",
    tone: "primary",
  },
  {
    label: "Play Conquest Demo",
    href: "/conquest",
    tone: "secondary",
  },
  {
    label: "Request a Build",
    href: "/request-update",
    tone: "secondary",
  },
];

export default function Home() {
  return (
    <main className="relative isolate flex min-h-screen overflow-hidden bg-[#090604] text-[#f5e8cf]">
      <div className="absolute inset-0 -z-30 bg-[#090604]" />
      <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_50%_22%,rgba(215,169,92,0.28),transparent_26%),radial-gradient(circle_at_18%_72%,rgba(82,47,28,0.62),transparent_34%),linear-gradient(145deg,#080504_0%,#170d08_44%,#27160d_68%,#050403_100%)]" />
      <div className="absolute inset-x-[-18%] top-[10%] -z-10 h-[38rem] rotate-[-7deg] bg-[linear-gradient(90deg,transparent,rgba(245,220,171,0.14),transparent)] blur-3xl" />
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.42),transparent_34%,rgba(0,0,0,0.72))]" />

      <section className="mx-auto flex min-h-screen w-full max-w-5xl flex-col justify-between px-5 py-6 sm:px-8 lg:px-10">
        <header className="flex items-center justify-between text-[0.68rem] uppercase tracking-[0.28em] text-[#d7b16f]/78">
          <span>AMMA Ventures</span>
          <span className="text-[#f1dfbc]/52">Virginia Beach</span>
        </header>

        <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center py-12 text-center">
          <div className="mb-9 flex flex-col items-center">
            <p className="text-[0.68rem] uppercase tracking-[0.56em] text-[#d7b16f]/80">
              Fina Calle OS
            </p>
            <h1 className="mt-4 text-5xl font-semibold uppercase leading-none tracking-[0.18em] text-[#fff5df] drop-shadow-[0_0_34px_rgba(215,177,111,0.22)] sm:text-7xl lg:text-8xl">
              FINA CALLE
            </h1>
            <p className="mt-4 text-sm uppercase tracking-[0.32em] text-[#c9a86d]/76">
              by AMMA Ventures
            </p>
          </div>

          <div className="h-px w-24 bg-gradient-to-r from-transparent via-[#d7b16f] to-transparent" />

          <div className="mt-9">
            <h2 className="text-balance text-4xl font-semibold leading-tight tracking-normal text-[#fff8e8] sm:text-5xl">
              Digital storefronts that feel alive.
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-[#e7d2ac] sm:text-lg">
              QR menus, mini-games, customer journeys, and branded web systems
              for local businesses.
            </p>
          </div>

          <nav
            aria-label="Primary landing links"
            className="mt-10 flex w-full flex-col items-stretch justify-center gap-3 sm:w-auto sm:flex-row sm:items-center"
          >
            {landingLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={
                  link.tone === "primary"
                    ? "inline-flex min-h-12 items-center justify-center rounded-full border border-[#f2d28b] bg-[#e0b965] px-6 text-sm font-semibold uppercase tracking-[0.14em] text-[#140d08] shadow-[0_18px_42px_-24px_rgba(224,185,101,0.9)] transition hover:bg-[#f0d08a]"
                    : "inline-flex min-h-12 items-center justify-center rounded-full border border-[#d7b16f]/52 bg-[#100a07]/38 px-6 text-sm font-semibold uppercase tracking-[0.14em] text-[#f3dfb6] transition hover:border-[#e8c681] hover:bg-[#d7b16f]/10"
                }
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>

        <footer className="pb-1 text-center text-xs uppercase tracking-[0.22em] text-[#d7b16f]/62">
          Built in Virginia Beach · Powered by Fina Calle
        </footer>
      </section>
    </main>
  );
}
