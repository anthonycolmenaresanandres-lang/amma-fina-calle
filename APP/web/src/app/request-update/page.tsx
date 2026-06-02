import Link from "next/link";
import CustomerRequestForm from "@/components/CustomerRequestForm";

export const metadata = {
  title: "Fina Calle OS Intake | AMMA Ventures",
  description:
    "Phase 1 build request intake for Fina Calle OS digital storefronts, QR menus, mini-games, and branded web systems.",
};

export default function RequestUpdatePage() {
  return (
    <main className="relative isolate min-h-dvh overflow-hidden bg-[#030405] px-5 py-5 text-[#f4f6f7] sm:px-8 lg:px-10">
      <div className="absolute inset-0 -z-30 bg-[radial-gradient(circle_at_50%_18%,rgba(205,214,219,0.14),transparent_28%),radial-gradient(circle_at_15%_78%,rgba(216,179,109,0.08),transparent_26%),linear-gradient(145deg,#020303_0%,#0d1012_46%,#050607_100%)]" />
      <div className="absolute inset-0 -z-20 bg-[linear-gradient(rgba(255,255,255,0.032)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.024)_1px,transparent_1px)] bg-[size:68px_68px]" />
      <div className="absolute inset-x-0 top-0 -z-10 h-32 bg-gradient-to-b from-[#dfe5e8]/10 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 -z-10 h-44 bg-gradient-to-t from-black to-transparent" />

      <div className="mx-auto flex min-h-[calc(100dvh-2.5rem)] w-full max-w-6xl flex-col">
        <header className="flex items-center justify-between gap-4 text-[0.68rem] uppercase tracking-[0.28em] text-[#cfd6da]/62">
          <Link href="/" className="transition hover:text-white">
            Back to Fina Calle OS
          </Link>
          <span className="hidden sm:inline">Phase 1 Intake</span>
        </header>

        <div className="grid flex-1 gap-8 py-8 lg:grid-cols-[0.82fr_1.18fr] lg:items-center lg:py-10">
          <section className="flex flex-col items-start">
            <div className="flex items-center gap-4">
              <img
                src="/assets/fina-calle-os-logo.png"
                alt="Fina Calle OS"
                className="h-16 w-16 rounded-2xl border border-[#cfd6da]/18 bg-black/30 object-cover shadow-[0_18px_42px_-26px_rgba(255,255,255,0.5)] sm:h-20 sm:w-20"
                loading="eager"
              />
              <div>
                <p className="text-xs uppercase tracking-[0.42em] text-[#d8b36d]">
                  Phase 1 Build Request
                </p>
                <p className="mt-2 text-sm uppercase tracking-[0.24em] text-[#aeb7bd]">
                  Fina Calle OS Intake
                </p>
              </div>
            </div>

            <h1 className="mt-8 max-w-xl text-balance text-4xl font-semibold leading-tight tracking-normal text-white sm:text-5xl lg:text-6xl">
              Tell us what your business needs.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-[#c8d0d4] sm:text-lg">
              Request a QR menu, branded web system, mini-game, customer
              journey, or digital storefront upgrade.
            </p>

            <div className="mt-8 w-full max-w-xl rounded-2xl border border-[#cfd6da]/14 bg-[#090c0f]/72 p-4 text-sm leading-6 text-[#aeb7bd] shadow-[0_24px_70px_-48px_rgba(255,255,255,0.42)]">
              <p className="font-semibold uppercase tracking-[0.18em] text-[#eef2f4]">
                Transparent Phase 1
              </p>
              <p className="mt-2">
                This intake creates a reference ID only. No payment, storage,
                or automated approval is connected yet.
              </p>
            </div>
          </section>

          <section
            aria-label="Fina Calle OS intake form"
            className="rounded-[1.75rem] border border-[#cfd6da]/16 bg-[#07090b]/82 p-3 shadow-[0_36px_90px_-58px_rgba(255,255,255,0.55)] ring-1 ring-white/[0.03] backdrop-blur sm:p-4"
          >
            <CustomerRequestForm />
          </section>
        </div>
      </div>
    </main>
  );
}
