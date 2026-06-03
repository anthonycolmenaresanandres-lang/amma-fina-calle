import Link from "next/link";

const companyNav = [
  { label: "Case Studies", href: "/case-studies" },
  { label: "Systems", href: "/systems" },
  { label: "R&D", href: "/rd" },
  { label: "Contact", href: "/contact" },
];

const landingLinks = [
  {
    label: "Case Studies",
    href: "/case-studies",
    position:
      "md:left-0 md:top-[46%] md:w-[clamp(13rem,20vw,18rem)]",
    line: "md:-right-16 md:top-1/2 md:h-px md:w-14",
  },
  {
    label: "Play Conquest Demo",
    href: "/conquest",
    position:
      "md:right-0 md:top-[46%] md:w-[clamp(13rem,20vw,18rem)]",
    line: "md:-left-16 md:top-1/2 md:h-px md:w-14",
  },
  {
    label: "Request a Build",
    href: "/request-update",
    position:
      "md:bottom-[3%] md:left-1/2 md:w-[clamp(13rem,22vw,19rem)] md:-translate-x-1/2",
    line: "md:-top-14 md:left-1/2 md:h-12 md:w-px md:-translate-x-1/2",
  },
];

export default function Home() {
  return (
    <main className="relative isolate flex min-h-screen overflow-hidden bg-[#030405] text-[#f4f6f7]">
      <div className="absolute inset-0 -z-30 bg-[radial-gradient(circle_at_50%_45%,rgba(180,188,194,0.16),transparent_31%),radial-gradient(circle_at_50%_78%,rgba(149,118,66,0.1),transparent_26%),linear-gradient(145deg,#020303_0%,#0d1012_45%,#050607_100%)]" />
      <div className="absolute inset-0 -z-20 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.026)_1px,transparent_1px)] bg-[size:72px_72px]" />
      <div className="absolute inset-x-0 top-0 -z-10 h-32 bg-gradient-to-b from-[#dfe5e8]/10 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 -z-10 h-48 bg-gradient-to-t from-black to-transparent" />

      <section className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-5 py-6 sm:px-8 lg:px-10">
        <header className="flex items-center justify-between text-[0.66rem] uppercase tracking-[0.32em] text-[#cfd6da]/58">
          <span>AMMA Ventures</span>
          <nav
            aria-label="Company sections"
            className="hidden items-center gap-4 tracking-[0.22em] sm:flex"
          >
            {companyNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="transition hover:text-[#f4f6f7]"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <span className="sm:hidden">Virginia Beach</span>
        </header>

        <div className="flex flex-1 flex-col items-center justify-center py-8 text-center">
          <div className="mb-5">
            <p className="text-xs uppercase tracking-[0.58em] text-[#f1f4f5] sm:text-sm">
              FINA CALLE OS
            </p>
            <p className="mt-3 text-[0.68rem] uppercase tracking-[0.34em] text-[#aeb7bd]">
              by AMMA Ventures
            </p>
          </div>

          <div className="relative w-full max-w-6xl">
            <div className="pointer-events-none absolute left-1/2 top-1/2 hidden h-px w-[82%] -translate-x-1/2 bg-gradient-to-r from-transparent via-[#c9d0d5]/24 to-transparent md:block" />
            <div className="pointer-events-none absolute left-1/2 top-[42%] hidden h-[54%] w-px -translate-x-1/2 bg-gradient-to-b from-[#c9d0d5]/20 via-[#d8b36d]/14 to-transparent md:block" />

            <div className="relative mx-auto flex min-h-[46vh] w-full max-w-[min(92vw,39rem)] items-center justify-center md:min-h-[62vh] md:max-w-[min(54vw,43rem)]">
              <div className="absolute inset-[10%] rounded-full bg-[#d9e1e5]/10 blur-3xl" />
              <img
                src="/assets/fina-calle-os-logo.png"
                alt="Fina Calle OS mechanical logo"
                className="relative z-10 block h-auto w-full select-none drop-shadow-[0_34px_70px_rgba(0,0,0,0.7)]"
                loading="eager"
              />
            </div>

            <nav
              aria-label="Primary landing links"
              className="mt-7 grid gap-3 sm:grid-cols-3 md:pointer-events-none md:absolute md:inset-0 md:mt-0 md:block"
            >
              {landingLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className={`group relative inline-flex min-h-12 items-center justify-center rounded-full border border-[#cfd6da]/34 bg-[#080a0c]/76 px-5 text-xs font-semibold uppercase tracking-[0.16em] text-[#eef2f4] shadow-[0_18px_44px_-28px_rgba(255,255,255,0.34)] backdrop-blur transition hover:border-[#f0f3f4]/70 hover:bg-[#15191d]/88 md:pointer-events-auto md:absolute ${link.position}`}
                >
                  <span
                    className={`pointer-events-none absolute hidden bg-gradient-to-r from-transparent via-[#d8b36d]/50 to-transparent md:block ${link.line}`}
                  />
                  <span className="mr-3 h-1.5 w-1.5 rounded-full bg-[#d8b36d] shadow-[0_0_16px_rgba(216,179,109,0.72)]" />
                  {link.label}
                </a>
              ))}
            </nav>
          </div>

          <p className="mt-8 max-w-2xl text-balance text-sm leading-6 text-[#c8d0d4] sm:text-base">
            Digital storefronts, branded experiences, and interactive systems
            for local business.
          </p>
        </div>

        <footer className="pb-1 text-center text-[0.68rem] uppercase tracking-[0.3em] text-[#aeb7bd]/64">
          Built in Virginia Beach
        </footer>
      </section>
    </main>
  );
}
