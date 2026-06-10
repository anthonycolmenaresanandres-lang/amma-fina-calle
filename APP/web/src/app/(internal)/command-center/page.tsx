import Link from "next/link";
import { sections, type LinkKind } from "./links";

// Private internal hub: noindex + unlinked from public nav (same model as Lead Arcade).
// Reachable by URL only — bookmark finacalleos.com/command-center.
export const metadata = {
  title: "Command Center — Fina Calle OS",
  robots: { index: false, follow: false },
};

const KIND_LABEL: Record<LinkKind, string> = {
  tool: "TOOL",
  doc: "DOC",
  folder: "FOLDER",
  pdf: "PDF",
  code: "CODE",
  external: "↗",
};

function isInternal(href: string): boolean {
  return href.startsWith("/");
}

export default function CommandCenterPage(): React.JSX.Element {
  const toolCount = sections.find((s) => s.title === "Live tools")?.links.length ?? 0;
  const linkCount = sections.reduce((n, s) => n + s.links.length, 0);

  return (
    <main className="relative isolate min-h-screen overflow-hidden bg-[#030405] text-[#f4f6f7]">
      <div className="absolute inset-0 -z-30 bg-[radial-gradient(circle_at_50%_0%,rgba(180,188,194,0.14),transparent_34%),linear-gradient(145deg,#020303_0%,#0d1012_48%,#050607_100%)]" />
      <div className="absolute inset-0 -z-20 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.022)_1px,transparent_1px)] bg-[size:72px_72px]" />

      <section className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8 lg:px-10">
        <header className="flex items-center justify-between text-[0.66rem] uppercase tracking-[0.32em] text-[#cfd6da]/58">
          <Link href="/" className="transition hover:text-[#f4f6f7]">AMMA Ventures</Link>
          <span>Command Center</span>
        </header>

        <div className="mt-10 mb-9">
          <p className="text-[0.68rem] uppercase tracking-[0.5em] text-[#d8b36d]/86">Fina Calle OS</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[#f4f6f7] sm:text-4xl">
            Command Center
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#c8d0d4] sm:text-base">
            One page to every idea, design, and tool. Bookmark it. {linkCount} links across {sections.length} areas
            ({toolCount} live tools). Docs open on GitHub; tools open in the app.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {sections.map((section) => (
            <section
              key={section.title}
              className="rounded-2xl border border-[#cfd6da]/16 bg-[#080a0c]/72 p-5 shadow-[0_24px_70px_-50px_rgba(255,255,255,0.4)] backdrop-blur"
            >
              <div className="mb-1 flex items-baseline justify-between gap-3">
                <h2 className="text-xs font-semibold uppercase tracking-[0.24em] text-[#eef2f4]">
                  {section.title}
                </h2>
                <span className="text-[0.6rem] uppercase tracking-[0.2em] text-[#cfd6da]/40">
                  {section.links.length}
                </span>
              </div>
              {section.blurb ? (
                <p className="mb-3 text-xs leading-5 text-[#c8d0d4]/70">{section.blurb}</p>
              ) : null}

              <ul className="flex flex-col gap-1.5">
                {section.links.map((link) => {
                  const chip = (
                    <span className="ml-3 shrink-0 rounded-full border border-[#cfd6da]/20 px-2 py-0.5 text-[0.55rem] font-semibold uppercase tracking-[0.14em] text-[#cfd6da]/55">
                      {KIND_LABEL[link.kind]}
                    </span>
                  );
                  const inner = (
                    <span className="flex w-full items-center justify-between">
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium text-[#eef2f4]">{link.label}</span>
                        {link.note ? (
                          <span className="block truncate text-[0.7rem] text-[#c8d0d4]/55">{link.note}</span>
                        ) : null}
                      </span>
                      {chip}
                    </span>
                  );
                  const cls =
                    "group flex min-h-11 items-center rounded-xl border border-transparent px-3 py-2 transition hover:border-[#d8b36d]/40 hover:bg-[#15191d]/80";
                  return (
                    <li key={link.href + link.label}>
                      {isInternal(link.href) ? (
                        <Link href={link.href} className={cls}>{inner}</Link>
                      ) : (
                        <a href={link.href} target="_blank" rel="noopener noreferrer" className={cls}>{inner}</a>
                      )}
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>

        <footer className="mt-10 border-t border-[#cfd6da]/12 pt-5 text-[0.62rem] uppercase tracking-[0.24em] text-[#cfd6da]/40">
          Private · not indexed · edit links in <span className="text-[#cfd6da]/60">command-center/links.ts</span>
        </footer>
      </section>
    </main>
  );
}
