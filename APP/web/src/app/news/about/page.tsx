import Link from "next/link";

export const metadata = {
  title: "About Fina Calle | Editorial standards, corrections, contact",
  description:
    "Fina Calle is an independent local newsroom by AMMA Ventures LLC. How we verify stories, how we correct mistakes, and how to reach us.",
};

const instagramUrl = process.env.NEXT_PUBLIC_FINA_CALLE_INSTAGRAM_URL;

const standards = [
  {
    title: "Truth above virality",
    body: "We publish what we can verify, not what spreads fastest. A story that can't be confirmed waits — or doesn't run.",
  },
  {
    title: "Verification before publishing",
    body: "Every story passes through automated source verification, and anything uncertain is held for human review before it reaches you. No exceptions, including our own deadlines.",
  },
  {
    title: "No manufactured sides",
    body: "We don't frame our community as Side A versus Side B. We report what happened, with the context to understand it.",
  },
  {
    title: "Independence",
    body: "Sponsored placements are always labeled. Sponsors never see, shape, or veto editorial coverage.",
  },
];

export default function NewsAboutPage() {
  return (
    <main className="relative isolate min-h-dvh overflow-hidden bg-[#030405] px-5 py-6 text-[#f4f6f7] sm:px-8">
      <div className="absolute inset-0 -z-30 bg-[radial-gradient(circle_at_52%_14%,rgba(205,214,219,0.12),transparent_30%),linear-gradient(145deg,#020303_0%,#0d1012_46%,#050607_100%)]" />
      <div className="absolute inset-x-0 bottom-0 -z-10 h-44 bg-gradient-to-t from-black to-transparent" />

      <div className="mx-auto w-full max-w-2xl">
        <header className="flex items-center justify-between gap-4 text-[0.68rem] uppercase tracking-[0.28em] text-[#cfd6da]/62">
          <Link href="/news" className="transition hover:text-white">
            ← Fina Calle
          </Link>
          <span>About</span>
        </header>

        <section className="pt-10">
          <p className="text-xs uppercase tracking-[0.42em] text-[#d8b36d]">Masthead</p>
          <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">
            About Fina Calle
          </h1>
          <p className="mt-5 text-base leading-8 text-[#c8d0d4]">
            Fina Calle is an independent local newsroom published by AMMA Ventures
            LLC. We cover the stories that matter to our community — verified,
            visual, and published daily, starting with Instagram and now here.
          </p>
        </section>

        <section className="mt-12">
          <h2 className="text-xl font-semibold text-[#eef2f4]">Editorial standards</h2>
          <div className="mt-5 space-y-4">
            {standards.map((s) => (
              <div
                key={s.title}
                className="rounded-lg border border-[#cfd6da]/14 bg-[#07090b]/70 p-5"
              >
                <h3 className="text-base font-semibold text-[#f4d99c]">{s.title}</h3>
                <p className="mt-2 text-sm leading-7 text-[#aeb7bd]">{s.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-12">
          <h2 className="text-xl font-semibold text-[#eef2f4]">Corrections</h2>
          <p className="mt-3 text-sm leading-7 text-[#aeb7bd]">
            When we get something wrong, we say so. Corrections are made on the
            story itself and acknowledged plainly — not quietly edited away. If
            you believe we&apos;ve published an error, tell us and we will review it
            against the original sources.
          </p>
        </section>

        <section className="mt-12">
          <h2 className="text-xl font-semibold text-[#eef2f4]">Contact</h2>
          <p className="mt-3 text-sm leading-7 text-[#aeb7bd]">
            News tips, corrections, and general inquiries:{" "}
            <Link href="/contact" className="text-[#d8b36d] transition hover:text-[#f4d99c]">
              contact AMMA Ventures
            </Link>
            {instagramUrl ? (
              <>
                {" "}or message us on{" "}
                <a href={instagramUrl} className="text-[#d8b36d] transition hover:text-[#f4d99c]">
                  Instagram
                </a>
              </>
            ) : null}
            . Sponsor and partnership inquiries are handled separately from the
            newsroom.
          </p>
        </section>

        <footer className="mt-14 border-t border-[#cfd6da]/12 pt-6 pb-4 text-xs leading-6 text-[#aeb7bd]">
          <p>© AMMA Ventures LLC, DBA Fina Calle.</p>
        </footer>
      </div>
    </main>
  );
}
