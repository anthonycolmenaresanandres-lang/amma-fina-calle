import Link from "next/link";
import Aurora from "@/components/reactbits/Aurora";
import ShinyText from "@/components/reactbits/ShinyText";

const nav = [
  { label: "See a live menu", href: "/m/colattao" },
  { label: "Case study", href: "/case-studies/colattao" },
  { label: "Contact", href: "/contact" },
];

const benefits = [
  {
    title: "A QR menu",
    es: "Un menú QR",
    body: "Customers scan and your menu opens on their phone — clean, fast, and always current.",
  },
  {
    title: "Always up to date",
    es: "Siempre al día",
    body: "One professional page for your menu. No more outdated PDFs, no reprinting.",
  },
  {
    title: "You ask, we change it",
    es: "Usted pide, lo hacemos",
    body: "Want a price changed? Just ask — we handle it, and every change is recorded.",
  },
];

export default function Home() {
  return (
    <main className="relative isolate flex min-h-screen overflow-hidden bg-[#030405] text-[#f4f6f7]">
      <div className="absolute inset-0 -z-30 bg-[radial-gradient(circle_at_50%_40%,rgba(180,188,194,0.16),transparent_31%),radial-gradient(circle_at_50%_82%,rgba(149,118,66,0.12),transparent_28%),linear-gradient(145deg,#020303_0%,#0d1012_45%,#050607_100%)]" />
      <Aurora className="absolute inset-0 -z-[25]" />
      <div className="absolute inset-0 -z-20 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.026)_1px,transparent_1px)] bg-[size:72px_72px]" />
      <div className="absolute inset-x-0 top-0 -z-10 h-32 bg-gradient-to-b from-[#dfe5e8]/10 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 -z-10 h-56 bg-gradient-to-t from-black to-transparent" />

      <section className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-5 py-6 sm:px-8 lg:px-10">
        <header className="flex items-center justify-between text-[0.66rem] uppercase tracking-[0.32em] text-[#cfd6da]/58">
          <span>
            <ShinyText>Fina Calle OS</ShinyText>
            <span className="ml-3 hidden text-[#8f979d]/70 sm:inline">by AMMA Ventures</span>
          </span>
          <nav
            aria-label="Sections"
            className="hidden items-center gap-4 tracking-[0.22em] sm:flex"
          >
            {nav.map((item) => (
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

        {/* HERO */}
        <div className="flex flex-1 flex-col items-center justify-center py-10 text-center">
          <div className="relative mb-6 flex h-20 w-20 items-center justify-center sm:h-24 sm:w-24">
            <div className="rb-glow-pulse absolute inset-0 rounded-full bg-[#d9e1e5]/10 blur-2xl" />
            <img
              src="/assets/fina-calle-os-logo.png"
              alt="Fina Calle OS"
              className="relative z-10 block h-full w-full select-none object-contain drop-shadow-[0_20px_44px_rgba(0,0,0,0.7)]"
              loading="eager"
            />
          </div>

          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.42em] text-[#d8b36d]/90">
            For local restaurants &amp; cafés · Virginia Beach
          </p>

          <h1 className="mt-5 max-w-3xl text-balance text-3xl font-semibold leading-[1.08] tracking-tight text-[#f4f6f7] sm:text-5xl">
            Your menu, <span className="text-[#d8b36d]">modern</span> — and we
            handle the tech <span className="italic">for you</span>.
          </h1>
          <p className="mt-4 text-balance font-medium text-[#c8d0d4] sm:text-lg">
            Su menú, moderno — nosotros nos encargamos de la tecnología por usted.
          </p>

          <p className="mt-6 max-w-xl text-balance text-sm leading-6 text-[#aeb7bd] sm:text-base">
            A clean menu your customers scan with a QR code, always current, and
            updated whenever you ask. No apps to manage. No website to learn.
            You focus on the food — we keep your digital side sharp.
          </p>

          {/* CTAs */}
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
            <Link
              href="/m/colattao"
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#d8b36d]/70 bg-[#f4f6f7] px-7 text-xs font-black uppercase tracking-[0.18em] text-[#050607] shadow-[0_18px_46px_-28px_rgba(216,179,109,0.95)] transition hover:-translate-y-0.5 hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#d8b36d]"
            >
              See a live menu
            </Link>
            <Link
              href="/contact"
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#cfd6da]/34 bg-[#080a0c]/76 px-7 text-xs font-semibold uppercase tracking-[0.16em] text-[#eef2f4] backdrop-blur transition hover:border-[#f0f3f4]/70 hover:bg-[#15191d]/88 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#d8b36d]"
            >
              Talk to us
            </Link>
          </div>

          {/* Pricing line */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-[0.7rem] uppercase tracking-[0.22em] text-[#aeb7bd]">
            <span className="rounded-full border border-[#cfd6da]/22 px-3 py-1">
              Basic <span className="text-[#f4f6f7]">$150</span>/mo
            </span>
            <span className="rounded-full border border-[#d8b36d]/40 px-3 py-1">
              Pro <span className="text-[#f4f6f7]">$200</span>/mo
            </span>
            <span className="text-[#8f979d]">No setup fee · cancel anytime</span>
          </div>
        </div>

        {/* BENEFITS */}
        <div className="mx-auto grid w-full max-w-5xl gap-4 sm:grid-cols-3">
          {benefits.map((b) => (
            <div
              key={b.title}
              className="rounded-2xl border border-[#cfd6da]/16 bg-[#070809]/70 p-5 text-left backdrop-blur"
            >
              <div className="mb-3 h-1.5 w-8 rounded-full bg-[#d8b36d] shadow-[0_0_16px_rgba(216,179,109,0.6)]" />
              <p className="text-base font-semibold text-[#f4f6f7]">{b.title}</p>
              <p className="text-xs uppercase tracking-[0.18em] text-[#d8b36d]/80">
                {b.es}
              </p>
              <p className="mt-2 text-sm leading-6 text-[#aeb7bd]">{b.body}</p>
            </div>
          ))}
        </div>

        {/* PROOF */}
        <div className="mx-auto mt-4 w-full max-w-5xl">
          <div className="flex flex-col items-center justify-between gap-3 rounded-2xl border border-[#cfd6da]/16 bg-[#050607]/70 px-6 py-4 text-center backdrop-blur sm:flex-row sm:text-left">
            <p className="text-sm text-[#c8d0d4]">
              <span className="font-semibold text-[#f4f6f7]">
                It&apos;s already running at Colattao
              </span>{" "}
              — a real café here in Virginia Beach. Scan, and see exactly what
              yours would look like.
            </p>
            <Link
              href="/m/colattao"
              className="inline-flex min-h-11 flex-none items-center justify-center rounded-full border border-[#d8b36d]/60 px-5 text-xs font-semibold uppercase tracking-[0.16em] text-[#f4f6f7] transition hover:bg-[#15191d]/88 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#d8b36d]"
            >
              See the live menu
            </Link>
          </div>
        </div>

        {/* FOOTER */}
        <footer className="mx-auto mt-8 w-full max-w-3xl pb-1 text-center">
          <div className="relative overflow-hidden rounded-[2rem] border border-[#cfd6da]/22 bg-[#050607]/78 px-5 py-6 shadow-[0_24px_70px_-46px_rgba(255,255,255,0.42)] backdrop-blur sm:px-8">
            <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-[#d8b36d]/70 to-transparent" />
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(216,179,109,0.12),transparent_38%)]" />
            <p className="relative text-[0.62rem] font-semibold uppercase tracking-[0.34em] text-[#d8b36d]/86">
              Built in Virginia Beach
            </p>
            <p className="relative mt-3 text-balance text-lg font-semibold leading-tight text-[#f4f6f7] sm:text-2xl">
              Real food deserves a real menu.
            </p>
            <p className="relative mx-auto mt-3 max-w-xl text-balance text-sm leading-6 text-[#c8d0d4] sm:text-base">
              Let&apos;s make your restaurant look as good online as it does in
              person. Reach out — or follow along.
            </p>
            <div className="relative mt-5 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/contact"
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#d8b36d]/70 bg-[#f4f6f7] px-6 text-xs font-black uppercase tracking-[0.18em] text-[#050607] shadow-[0_18px_46px_-28px_rgba(216,179,109,0.95)] transition hover:-translate-y-0.5 hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#d8b36d]"
              >
                Talk to us
              </Link>
              <a
                href="https://www.instagram.com/fina_calle?igsh=MXUyZjZwODg3a3hjag=="
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#cfd6da]/34 bg-[#080a0c]/76 px-6 text-xs font-semibold uppercase tracking-[0.18em] text-[#eef2f4] backdrop-blur transition hover:border-[#f0f3f4]/70 hover:bg-[#15191d]/88 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#d8b36d]"
                aria-label="Open Fina Calle on Instagram"
              >
                @fina_calle
              </a>
            </div>
            <nav
              aria-label="More"
              className="relative mt-5 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[0.6rem] uppercase tracking-[0.28em] text-[#8f979d]/70"
            >
              <Link href="/case-studies" className="transition hover:text-[#cfd6da]">
                Case Studies
              </Link>
              <Link href="/systems" className="transition hover:text-[#cfd6da]">
                Systems
              </Link>
              <Link href="/rd" className="transition hover:text-[#cfd6da]">
                R&amp;D
              </Link>
              <Link href="/conquest" className="transition hover:text-[#cfd6da]">
                Conquest
              </Link>
            </nav>
          </div>
        </footer>
      </section>
    </main>
  );
}
