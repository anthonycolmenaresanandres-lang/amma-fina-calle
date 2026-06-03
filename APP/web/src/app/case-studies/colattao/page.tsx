import Link from "next/link";

export const metadata = {
  title: "Colattao Case Study | Fina Calle OS",
  description:
    "Static shell for the Colattao Cafe Rush flagship proof of concept.",
};

export default function ColattaoCaseStudyPage() {
  return (
    <main className="relative isolate min-h-dvh overflow-hidden bg-[#030405] px-5 py-5 text-[#f4f6f7] sm:px-8 lg:px-10">
      <div className="absolute inset-0 -z-30 bg-[radial-gradient(circle_at_48%_16%,rgba(205,214,219,0.13),transparent_30%),radial-gradient(circle_at_76%_78%,rgba(216,179,109,0.1),transparent_28%),linear-gradient(145deg,#020303_0%,#0d1012_46%,#050607_100%)]" />
      <div className="absolute inset-0 -z-20 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.022)_1px,transparent_1px)] bg-[size:68px_68px]" />
      <div className="absolute inset-x-0 bottom-0 -z-10 h-44 bg-gradient-to-t from-black to-transparent" />

      <div className="mx-auto flex min-h-[calc(100dvh-2.5rem)] w-full max-w-6xl flex-col">
        <header className="flex items-center justify-between gap-4 text-[0.68rem] uppercase tracking-[0.28em] text-[#cfd6da]/62">
          <Link href="/case-studies" className="transition hover:text-white">
            Case Studies
          </Link>
          <span className="hidden sm:inline">Colattao</span>
        </header>

        <section className="grid flex-1 gap-8 py-10 lg:grid-cols-[0.78fr_1.22fr] lg:items-start lg:py-16">
          <div>
            <p className="text-xs uppercase tracking-[0.42em] text-[#d8b36d]">
              Flagship Proof
            </p>
            <h1 className="mt-5 text-4xl font-semibold tracking-normal text-[#f4f6f7] sm:text-5xl">
              Colattao Cafe Rush
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-[#c8d0d4] sm:text-lg">
              A flagship Fina Calle proof of concept for a local-business
              digital experience with game and QR menu direction.
            </p>
            <div className="mt-7 flex flex-col gap-2 sm:flex-row">
              <a
                href="https://colattao-cafe-rush.vercel.app"
                className="inline-flex min-h-11 items-center justify-center rounded-full border border-[#d8b36d]/38 bg-[#d8b36d]/10 px-5 text-xs font-semibold uppercase tracking-[0.14em] text-[#f4d99c] transition hover:border-[#f4d99c]/70 hover:bg-[#d8b36d]/16"
              >
                Public URL
              </a>
              <Link
                href="/systems"
                className="inline-flex min-h-11 items-center justify-center rounded-full border border-[#cfd6da]/24 px-5 text-xs font-semibold uppercase tracking-[0.14em] text-[#cfd6da] transition hover:border-[#f0f3f4]/60 hover:text-white"
              >
                System Layer
              </Link>
            </div>
          </div>

          <div className="grid gap-5">
            <section className="rounded-lg border border-[#cfd6da]/16 bg-[#07090b]/82 p-5 shadow-[0_30px_80px_-58px_rgba(255,255,255,0.5)] ring-1 ring-white/[0.03] backdrop-blur sm:p-6">
              <h2 className="text-xl font-semibold text-[#eef2f4]">
                Verified scope
              </h2>
              <ul className="mt-4 grid gap-3 text-sm leading-6 text-[#aeb7bd]">
                <li>Colattao Cafe Rush is the flagship proof of concept.</li>
                <li>
                  The direction includes a game layer plus QR menu and digital
                  experience patterns.
                </li>
                <li>
                  Public URL: https://colattao-cafe-rush.vercel.app
                </li>
              </ul>
            </section>

            <section className="rounded-lg border border-[#d8b36d]/18 bg-[#0b0c0a]/72 p-5 sm:p-6">
              <h2 className="text-xl font-semibold text-[#eef2f4]">
                Deliberately not claimed
              </h2>
              <p className="mt-4 text-sm leading-6 text-[#aeb7bd]">
                This shell does not claim revenue impact, customer counts,
                conversion lift, testimonials, or performance metrics. Those
                facts stay out until they are verified.
              </p>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}
