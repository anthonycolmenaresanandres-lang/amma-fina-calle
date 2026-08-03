import Link from "next/link";

export const metadata = {
  title: "Local Proof | Fina Calle OS",
  description:
    "A transparent first-30-day production snapshot from a live local cafe experience.",
};

const metrics = [
  { value: "2,874", label: "Visitors" },
  { value: "4,599", label: "Page views" },
] as const;

export default function ColattaoCaseStudyPage() {
  return (
    <main className="min-h-dvh overflow-hidden bg-[#07100d] px-5 py-6 text-[#f6f1e8] sm:px-8 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <header className="flex items-center justify-between text-[0.68rem] font-semibold uppercase tracking-[0.26em] text-[#d8c49a]">
          <Link href="/case-studies" className="focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#d8c49a]">
            Fina Calle
          </Link>
          <span>Verified local proof</span>
        </header>

        <section className="grid min-h-[calc(100dvh-4rem)] content-center gap-12 py-14 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#d8b36d]">
              First 30 days
            </p>
            <h1 className="mt-5 max-w-2xl text-5xl font-semibold leading-[0.94] tracking-[-0.045em] sm:text-7xl">
              A local menu people actually opened.
            </h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-[#c7cec8] sm:text-lg">
              One live cafe experience: mobile menu, branded game direction, and an owner update path.
            </p>
            <a
              href="https://colattao-cafe-rush.vercel.app/menu"
              className="mt-8 inline-flex min-h-11 items-center border-b border-[#d8b36d] text-sm font-semibold uppercase tracking-[0.16em] text-[#f4d99c] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#f4d99c]"
            >
              Open the live example
            </a>
          </div>

          <div>
            <div className="grid grid-cols-2 gap-x-6 border-y border-[#d8c49a]/30 py-8 sm:gap-x-12 sm:py-10">
              {metrics.map((metric) => (
                <div key={metric.label}>
                  <p className="text-4xl font-semibold tracking-[-0.04em] text-white sm:text-6xl">
                    {metric.value}
                  </p>
                  <p className="mt-2 text-xs font-semibold uppercase tracking-[0.22em] text-[#d8c49a]">
                    {metric.label}
                  </p>
                </div>
              ))}
            </div>
            <p className="mt-6 max-w-xl text-sm leading-6 text-[#aeb8b1]">
              Source: account-native Vercel Production Analytics, first 30-day window, verified by the business owner. These are traffic counts, not QR scans, customers, revenue, or sales lift.
            </p>
            <p className="mt-4 max-w-xl text-sm leading-6 text-[#aeb8b1]">
              Your result will depend on placement, traffic, offer, and execution. We start with one clearly scoped location and measure what happens.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
