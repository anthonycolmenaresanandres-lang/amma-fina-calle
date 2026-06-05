import type { Metadata } from "next";
import Link from "next/link";

const statuses = [
  {
    label: "Pending",
    detail: "Customer submitted order context or started a mock handoff.",
    boundary: "No approval decision has been made.",
  },
  {
    label: "Approved",
    detail: "Merchant or external provider marked the request approved.",
    boundary: "Fina Calle only displays the external/merchant status.",
  },
  {
    label: "Paid",
    detail: "Merchant or external provider indicates payment is complete.",
    boundary: "Fina Calle does not settle funds in this R&D mock.",
  },
  {
    label: "Declined",
    detail: "Merchant or external provider could not approve or complete the request.",
    boundary: "Fina Calle does not decide declines.",
  },
];

const phasePath = [
  {
    phase: "Phase 0",
    name: "R&D mock",
    detail: "Static concept page and docs only. No live payment, provider, backend, or approval flow.",
  },
  {
    phase: "Phase 1",
    name: "Merchant intake prototype",
    detail: "Research owner setup, QR placement, order-number conventions, staff instructions, and support boundaries.",
  },
  {
    phase: "Phase 2",
    name: "Partner-link prototype",
    detail: "Explore an approved external or merchant-controlled handoff link without embedded payment or credit logic.",
  },
  {
    phase: "Phase 3",
    name: "Compliance review before production",
    detail: "Legal, privacy, security, provider, merchant-of-record, and support review before any public product.",
  },
];

export const metadata: Metadata = {
  title: "PayBridge R&D | Fina Calle OS",
  description:
    "Isolated R&D concept for a local-business payment-options connector. Not a lender, credit product, approval party, repayment servicer, or live payment system.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default function PayBridgeResearchPage() {
  return (
    <main className="relative isolate min-h-dvh overflow-hidden bg-[#060606] px-5 py-5 text-[#f7efe1] sm:px-8 lg:px-10">
      <div className="absolute inset-0 -z-30 bg-[radial-gradient(circle_at_18%_12%,rgba(216,179,109,0.16),transparent_28%),radial-gradient(circle_at_78%_34%,rgba(55,87,115,0.2),transparent_30%),linear-gradient(140deg,#070402_0%,#11100e_48%,#030405_100%)]" />
      <div className="absolute inset-0 -z-20 bg-[linear-gradient(rgba(216,179,109,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(216,179,109,0.035)_1px,transparent_1px)] bg-[size:72px_72px]" />

      <div className="mx-auto flex min-h-[calc(100dvh-2.5rem)] w-full max-w-6xl flex-col">
        <header className="flex items-center justify-between gap-4 text-[0.68rem] uppercase tracking-[0.28em] text-[#d8b36d]/72">
          <Link href="/rd" className="transition hover:text-[#f7efe1]">
            R&D Lab
          </Link>
          <span>R&D / Noindex</span>
        </header>

        <section className="grid flex-1 gap-8 py-10 lg:grid-cols-[0.78fr_1.22fr] lg:items-start lg:py-16">
          <div>
            <p className="text-xs uppercase tracking-[0.42em] text-[#d8b36d]">
              R&D Concept Only
            </p>
            <h1 className="mt-5 max-w-2xl text-4xl font-semibold tracking-[-0.04em] text-[#fff8ea] sm:text-5xl">
              Fina Calle PayBridge
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-[#d8cdb9] sm:text-lg">
              A local-business payment-options connector concept. The owner gets
              a QR code, the customer enters order context, and any payment or
              financing decision stays with the merchant or external provider.
            </p>

            <div className="mt-7 rounded-2xl border border-[#d8b36d]/24 bg-[#0d0906]/78 p-5 shadow-2xl shadow-black/30">
              <p className="text-[0.68rem] uppercase tracking-[0.28em] text-[#d8b36d]">
                Owner Friction Target
              </p>
              <h2 className="mt-4 text-2xl font-semibold tracking-[-0.03em] text-[#fff8ea]">
                One QR. One order number. Four plain statuses.
              </h2>
              <p className="mt-3 text-sm leading-6 text-[#bfb29f]">
                The owner should not manage underwriting, repayment terms,
                provider decision logic, card data, or financial complexity.
                The owner only needs to place the QR and watch whether a request
                is pending, approved, paid, or declined.
              </p>
            </div>

            <div className="mt-5 rounded-2xl border border-[#d8b36d]/24 bg-[#0d0906]/78 p-5 shadow-2xl shadow-black/30">
              <p className="text-[0.68rem] uppercase tracking-[0.28em] text-[#d8b36d]">
                Mock QR Flow
              </p>
              <div className="mt-5 grid grid-cols-[112px_1fr] gap-4">
                <div className="grid aspect-square place-items-center rounded-xl border border-[#d8b36d]/45 bg-[#f7efe1] p-3 text-[#120905]">
                  <div className="grid h-full w-full grid-cols-5 grid-rows-5 gap-1">
                    {Array.from({ length: 25 }).map((_, index) => (
                      <span
                        key={index}
                        className={
                          index % 2 === 0 || index === 7 || index === 18
                            ? "bg-[#120905]"
                            : "bg-[#d8b36d]/45"
                        }
                      />
                    ))}
                  </div>
                </div>
                <div className="self-center">
                  <h2 className="text-xl font-semibold text-[#fff8ea]">
                    Scan, enter order number, choose mock path.
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-[#bfb29f]">
                    This prototype shows the customer and owner surfaces only.
                    It does not process payments, collect card data, or submit
                    financing applications.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-5">
            <section className="rounded-2xl border border-[#d8b36d]/18 bg-[#090908]/82 p-5 shadow-2xl shadow-black/25 sm:p-6">
              <p className="text-[0.68rem] uppercase tracking-[0.28em] text-[#d8b36d]">
                Customer Mock Screen
              </p>
              <div className="mt-5 grid gap-4">
                <label className="grid gap-2 text-sm text-[#d8cdb9]">
                  Order number
                  <input
                    aria-label="Order number"
                    placeholder="A-1042"
                    className="rounded-xl border border-[#d8b36d]/22 bg-[#140d08] px-4 py-3 text-[#fff8ea] outline-none placeholder:text-[#8f806c]"
                  />
                </label>
                <label className="grid gap-2 text-sm text-[#d8cdb9]">
                  Amount
                  <input
                    aria-label="Amount"
                    inputMode="decimal"
                    placeholder="$42.00"
                    className="rounded-xl border border-[#d8b36d]/22 bg-[#140d08] px-4 py-3 text-[#fff8ea] outline-none placeholder:text-[#8f806c]"
                  />
                </label>
                <label className="grid gap-2 text-sm text-[#d8cdb9]">
                  Customer phone or email
                  <input
                    aria-label="Customer phone or email"
                    placeholder="customer@example.com"
                    className="rounded-xl border border-[#d8b36d]/22 bg-[#140d08] px-4 py-3 text-[#fff8ea] outline-none placeholder:text-[#8f806c]"
                  />
                </label>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  className="rounded-full border border-[#d8b36d] bg-[#d8b36d] px-5 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-[#120905]"
                >
                  Pay Now Mock
                </button>
                <button
                  type="button"
                  className="rounded-full border border-[#d8b36d]/62 px-5 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-[#fff8ea]"
                >
                  Request Payment Options Mock
                </button>
              </div>
              <p className="mt-4 text-xs leading-5 text-[#9f917e]">
                Both buttons are non-processing R&D controls. No payment,
                application, approval, SMS, or provider request is triggered.
              </p>
            </section>

            <section className="rounded-2xl border border-[#d8b36d]/18 bg-[#070707]/82 p-5 sm:p-6">
              <p className="text-[0.68rem] uppercase tracking-[0.28em] text-[#d8b36d]">
                Owner Status Lifecycle
              </p>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {statuses.map((status) => (
                  <article
                    key={status.label}
                    className="rounded-xl border border-[#d8b36d]/18 bg-[#130d08]/76 p-4"
                  >
                    <h2 className="text-lg font-semibold text-[#fff8ea]">
                      {status.label}
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-[#bfb29f]">
                      {status.detail}
                    </p>
                    <p className="mt-3 text-xs leading-5 text-[#d8b36d]/80">
                      {status.boundary}
                    </p>
                  </article>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-[#d8b36d]/18 bg-[#070707]/82 p-5 sm:p-6">
              <p className="text-[0.68rem] uppercase tracking-[0.28em] text-[#d8b36d]">
                Phase Path
              </p>
              <div className="mt-5 grid gap-3">
                {phasePath.map((phase) => (
                  <article
                    key={phase.phase}
                    className="rounded-xl border border-[#d8b36d]/16 bg-[#110c08]/72 p-4"
                  >
                    <p className="text-xs uppercase tracking-[0.22em] text-[#d8b36d]">
                      {phase.phase}
                    </p>
                    <h2 className="mt-2 text-lg font-semibold text-[#fff8ea]">
                      {phase.name}
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-[#bfb29f]">
                      {phase.detail}
                    </p>
                  </article>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-[#8c2f2f]/35 bg-[#140706]/82 p-5 text-sm leading-6 text-[#ead9c4] sm:p-6">
              <p className="font-semibold text-[#fff8ea]">Legal / safety note</p>
              <p className="mt-2">
                Fina Calle PayBridge connects customers to payment options.
                Financing, approvals, repayment terms, and lending decisions
                are handled by third-party providers or the merchant.
              </p>
              <p className="mt-3 text-[#c5a98a]">
                Fina Calle is connector only: not the lender, not the approval
                party, not the repayment servicer, and not the merchant of
                record unless future legal/compliance review explicitly says
                otherwise.
              </p>
              <p className="mt-3 text-[#c5a98a]">
                This page is an R&D mock. It has no payment processing, no
                Stripe SDK, no card storage, no approval engine, no SMS, no API,
                no database, and no production integration.
              </p>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}
