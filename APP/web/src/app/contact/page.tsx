import Link from "next/link";

export const metadata = {
  title: "Contact | Fina Calle OS",
  description:
    "Static contact and next-step shell for AMMA Ventures LLC DBA Fina Calle.",
};

export default function ContactPage() {
  return (
    <main className="relative isolate min-h-dvh overflow-hidden bg-[#030405] px-5 py-5 text-[#f4f6f7] sm:px-8 lg:px-10">
      <div className="absolute inset-0 -z-30 bg-[radial-gradient(circle_at_50%_18%,rgba(205,214,219,0.13),transparent_30%),radial-gradient(circle_at_20%_78%,rgba(216,179,109,0.09),transparent_28%),linear-gradient(145deg,#020303_0%,#0d1012_46%,#050607_100%)]" />
      <div className="absolute inset-0 -z-20 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.022)_1px,transparent_1px)] bg-[size:68px_68px]" />
      <div className="absolute inset-x-0 bottom-0 -z-10 h-44 bg-gradient-to-t from-black to-transparent" />

      <div className="mx-auto flex min-h-[calc(100dvh-2.5rem)] w-full max-w-6xl flex-col">
        <header className="flex items-center justify-between gap-4 text-[0.68rem] uppercase tracking-[0.28em] text-[#cfd6da]/62">
          <Link href="/" className="transition hover:text-white">
            Fina Calle OS
          </Link>
          <span className="hidden sm:inline">Contact</span>
        </header>

        <section className="grid flex-1 gap-8 py-10 lg:grid-cols-[0.72fr_1.28fr] lg:items-start lg:py-16">
          <div>
            <p className="text-xs uppercase tracking-[0.42em] text-[#d8b36d]">
              Next Step
            </p>
            <h1 className="mt-5 text-4xl font-semibold tracking-normal text-[#f4f6f7] sm:text-5xl">
              Contact Anthony directly.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-[#c8d0d4] sm:text-lg">
              This is a static contact route shell. No form, booking system,
              inbox automation, or payment flow is connected here.
            </p>
          </div>

          <section className="rounded-lg border border-[#cfd6da]/16 bg-[#07090b]/82 p-5 shadow-[0_30px_80px_-58px_rgba(255,255,255,0.5)] ring-1 ring-white/[0.03] backdrop-blur sm:p-6">
            <h2 className="text-xl font-semibold text-[#eef2f4]">
              Direct contact
            </h2>
            <p className="mt-4 text-sm leading-6 text-[#aeb7bd]">
              Direct contact details intentionally withheld for now.
            </p>
            <p className="mt-4 text-sm leading-6 text-[#aeb7bd]">
              For now, this page exists to mark the public next-step route
              without collecting personal data or pretending a booking system is
              live.
            </p>
            <div className="mt-6 flex flex-col gap-2 sm:flex-row">
              <Link
                href="/case-studies"
                className="inline-flex min-h-11 items-center justify-center rounded-full border border-[#d8b36d]/38 bg-[#d8b36d]/10 px-5 text-xs font-semibold uppercase tracking-[0.14em] text-[#f4d99c] transition hover:border-[#f4d99c]/70 hover:bg-[#d8b36d]/16"
              >
                View Proof
              </Link>
              <Link
                href="/request-update"
                className="inline-flex min-h-11 items-center justify-center rounded-full border border-[#cfd6da]/24 px-5 text-xs font-semibold uppercase tracking-[0.14em] text-[#cfd6da] transition hover:border-[#f0f3f4]/60 hover:text-white"
              >
                Existing Intake
              </Link>
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}
