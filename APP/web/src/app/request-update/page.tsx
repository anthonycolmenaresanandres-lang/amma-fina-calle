import CustomerRequestForm from "@/components/CustomerRequestForm";
import { Eyebrow, PageShell, TopBar } from "@/components/ui";

export const metadata = {
  title: "Fina Calle OS Intake | AMMA Ventures",
  description:
    "Phase 1 build request intake for Fina Calle OS digital storefronts, QR menus, mini-games, and branded web systems.",
};

export default function RequestUpdatePage() {
  return (
    <PageShell>
      <TopBar backHref="/" backLabel="Fina Calle OS">
        <span className="hidden text-[#cfd6da]/62 sm:inline">Phase 1 Intake</span>
      </TopBar>

      <>
        <section className="pt-6 sm:pt-8" aria-label="Fina Calle OS intake hero">
          <img
            src="/assets/fina-calle-intake-hero.png"
            alt="Fina Calle OS Intake. Phase 1 Build Request. Tell us what your business needs."
            className="block h-auto w-full rounded-[1.75rem] border border-[#cfd6da]/14 bg-[#07090b] shadow-[0_34px_90px_-58px_rgba(255,255,255,0.55)]"
            loading="eager"
          />
        </section>

        <div className="grid flex-1 gap-8 py-8 lg:grid-cols-[0.78fr_1.22fr] lg:items-start lg:py-10">
          <section className="flex flex-col items-start">
            <Eyebrow>Request a Build</Eyebrow>
            <h2 className="fc-balance mt-4 text-3xl font-semibold tracking-[-0.02em] text-[#f4f6f7] sm:text-4xl">
              Tell us what your business needs.
            </h2>
            <p className="mt-4 max-w-xl text-base leading-7 text-[#c8d0d4] sm:text-lg">
              QR menus, branded web systems, mini-games, and customer journeys for
              local businesses — built to look bigger than you are.
            </p>

            <ol className="mt-8 w-full max-w-xl space-y-3">
              {[
                {
                  num: "01",
                  title: "You send the request",
                  body: "Tell us your business and what you want built. Takes two minutes.",
                },
                {
                  num: "02",
                  title: "We review and scope it",
                  body: "We reply with a clear direction, the right package, and a fixed quote.",
                },
                {
                  num: "03",
                  title: "Approve and we build",
                  body: "A deposit kicks off the build, and you review everything on mobile first.",
                },
              ].map((step) => (
                <li
                  key={step.num}
                  className="flex items-start gap-4 rounded-2xl border border-white/[0.08] bg-[#090c0f]/72 p-4 shadow-[0_24px_70px_-48px_rgba(255,255,255,0.42)] transition hover:border-[#d8b36d]/30"
                >
                  <span className="inline-flex h-9 w-9 flex-none items-center justify-center rounded-full border border-[#d8b36d]/30 bg-gradient-to-br from-[#d8b36d]/20 to-[#0b0e11] text-xs font-semibold text-[#f4d99c]">
                    {step.num}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-[#eef2f4]">{step.title}</p>
                    <p className="mt-1 text-sm leading-6 text-[#aeb7bd]">{step.body}</p>
                  </div>
                </li>
              ))}
            </ol>

            <p className="mt-5 max-w-xl text-xs leading-6 text-[#8f9aa1]">
              No payment is taken here. Packages and secure deposits arrive after we
              scope your build — and billing always stays separate from your POS.
            </p>
          </section>

          <section
            aria-label="Fina Calle OS intake form"
            className="rounded-[1.75rem] border border-[#cfd6da]/16 bg-[#07090b]/82 p-3 shadow-[0_36px_90px_-58px_rgba(255,255,255,0.55)] ring-1 ring-white/[0.03] backdrop-blur sm:p-4"
          >
            <CustomerRequestForm />
          </section>
        </div>
      </>
    </PageShell>
  );
}
