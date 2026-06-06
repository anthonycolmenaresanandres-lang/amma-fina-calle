import Link from "next/link";

export const metadata = {
  title: "Contact | Fina Calle OS",
  description:
    "Get in touch with AMMA Ventures LLC DBA Fina Calle — start a build, send a request, or email directly.",
};

const CONTACT_EMAIL = "anthonycolmenaresanandres@gmail.com";
const EMAIL_SUBJECT = "Fina Calle — new project";
const EMAIL_BODY =
  "Hi Anthony,\n\nBusiness name:\nWhat I want built:\nTimeline:\n\nThanks!";

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
              Let&apos;s build something premium.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-[#c8d0d4] sm:text-lg">
              The fastest way in is the build request — two minutes and we reply
              with a clear direction, the right package, and a fixed quote. Prefer
              email? Reach Anthony directly.
            </p>
          </div>

          <section className="rounded-lg border border-[#cfd6da]/16 bg-[#07090b]/82 p-5 shadow-[0_30px_80px_-58px_rgba(255,255,255,0.5)] ring-1 ring-white/[0.03] backdrop-blur sm:p-6">
            <h2 className="text-sm font-semibold uppercase tracking-[0.22em] text-[#d8b36d]">
              Start a project
            </h2>
            <p className="mt-4 text-sm leading-6 text-[#aeb7bd]">
              Tell us your business and what you want built — QR menus, branded
              web systems, mini-games, and customer journeys for local business.
            </p>
            <div className="mt-6 flex flex-col gap-2 sm:flex-row">
              <Link
                href="/request-update"
                className="inline-flex min-h-12 flex-1 items-center justify-center rounded-full border border-[#d8b36d]/60 bg-[#f4f6f7] px-5 text-xs font-black uppercase tracking-[0.16em] text-[#050607] shadow-[0_18px_46px_-28px_rgba(216,179,109,0.95)] transition hover:-translate-y-0.5 hover:bg-white"
              >
                Request a Build
              </Link>
              <a
                href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
                  EMAIL_SUBJECT,
                )}&body=${encodeURIComponent(EMAIL_BODY)}`}
                className="inline-flex min-h-12 flex-1 items-center justify-center rounded-full border border-[#cfd6da]/28 bg-[#080a0c]/76 px-5 text-xs font-semibold uppercase tracking-[0.14em] text-[#eef2f4] transition hover:border-[#f0f3f4]/70 hover:bg-[#15191d]/88"
              >
                Email Directly
              </a>
            </div>

            <div className="mt-6 border-t border-[#cfd6da]/10 pt-5">
              <p className="text-[0.66rem] uppercase tracking-[0.22em] text-[#cfd6da]/56">
                Direct email
              </p>
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="mt-1 block break-words text-sm font-medium text-[#f4d99c] transition hover:text-[#f8e7bc]"
              >
                {CONTACT_EMAIL}
              </a>
              <p className="mt-4 text-sm leading-6 text-[#aeb7bd]">
                Want proof first?{" "}
                <Link href="/case-studies" className="text-[#eef2f4] underline-offset-4 hover:underline">
                  See the Colattao case study
                </Link>
                . No booking system or payment flow runs on this page — billing
                always stays separate from your POS.
              </p>
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}
