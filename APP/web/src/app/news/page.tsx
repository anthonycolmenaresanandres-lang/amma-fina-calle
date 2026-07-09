import Link from "next/link";
import { formatNewsDate, getNewsFeed } from "@/lib/news/feed";

export const revalidate = 300;

export const metadata = {
  title: "Fina Calle — Local News",
  description:
    "Fina Calle is an independent local newsroom. Verified local stories, published daily.",
  openGraph: {
    title: "Fina Calle — Local News",
    description: "Verified local stories, published daily.",
    type: "website",
  },
};

const instagramUrl = process.env.NEXT_PUBLIC_FINA_CALLE_INSTAGRAM_URL;

function NewsChrome({ children }: { children: React.ReactNode }) {
  return (
    <main className="relative isolate min-h-dvh overflow-hidden bg-[#030405] px-5 py-6 text-[#f4f6f7] sm:px-8">
      <div className="absolute inset-0 -z-30 bg-[radial-gradient(circle_at_52%_14%,rgba(205,214,219,0.12),transparent_30%),radial-gradient(circle_at_16%_80%,rgba(216,179,109,0.08),transparent_28%),linear-gradient(145deg,#020303_0%,#0d1012_46%,#050607_100%)]" />
      <div className="absolute inset-x-0 bottom-0 -z-10 h-44 bg-gradient-to-t from-black to-transparent" />
      <div className="mx-auto w-full max-w-3xl">
        <header className="flex items-center justify-between gap-4 text-[0.68rem] uppercase tracking-[0.28em] text-[#cfd6da]/62">
          <Link href="/news" className="transition hover:text-white">
            Fina Calle
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/news/about" className="transition hover:text-white">
              About
            </Link>
            {instagramUrl ? (
              <a href={instagramUrl} className="transition hover:text-white">
                Instagram
              </a>
            ) : null}
          </nav>
        </header>
        {children}
        <footer className="mt-14 border-t border-[#cfd6da]/12 pt-6 pb-4 text-xs leading-6 text-[#aeb7bd]">
          <p>
            Fina Calle is an independent local newsroom by AMMA Ventures LLC.{" "}
            <Link href="/news/about" className="text-[#d8b36d] transition hover:text-[#f4d99c]">
              Our editorial standards
            </Link>
            .
          </p>
        </footer>
      </div>
    </main>
  );
}

export default async function NewsFrontPage() {
  const feed = await getNewsFeed();
  const stories = feed?.stories ?? [];
  const [lead, ...rest] = stories;

  return (
    <NewsChrome>
      <section className="pt-10 text-center sm:pt-14">
        <p className="text-xs uppercase tracking-[0.42em] text-[#d8b36d]">
          Noticias de la calle
        </p>
        <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">
          Fina Calle
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#c8d0d4]">
          Local stories, verified before they reach you. Published daily.
        </p>
      </section>

      {!lead ? (
        <section className="mt-14 rounded-lg border border-[#cfd6da]/16 bg-[#07090b]/82 p-8 text-center">
          <h2 className="text-xl font-semibold text-[#eef2f4]">
            The newsroom is warming up.
          </h2>
          <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-[#aeb7bd]">
            Today&apos;s edition is on its way.
            {instagramUrl ? " Catch the latest on Instagram in the meantime." : ""}
          </p>
          {instagramUrl ? (
            <a
              href={instagramUrl}
              className="mt-6 inline-flex min-h-11 items-center justify-center rounded-full border border-[#d8b36d]/38 bg-[#d8b36d]/10 px-6 text-xs font-semibold uppercase tracking-[0.14em] text-[#f4d99c] transition hover:border-[#f4d99c]/70 hover:bg-[#d8b36d]/16"
            >
              Follow Fina Calle
            </a>
          ) : null}
        </section>
      ) : (
        <>
          <Link
            href={`/news/${lead.slug}`}
            className="group mt-12 block overflow-hidden rounded-lg border border-[#cfd6da]/16 bg-[#07090b]/82 transition hover:border-[#d8b36d]/40"
          >
            {lead.coverImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={lead.coverImageUrl}
                alt={lead.headline}
                className="aspect-[4/5] w-full object-cover sm:aspect-[16/10]"
              />
            ) : null}
            <div className="p-6 sm:p-7">
              <p className="text-[0.66rem] uppercase tracking-[0.24em] text-[#d8b36d]">
                {[lead.city, formatNewsDate(lead.publishedAt)].filter(Boolean).join(" · ")}
              </p>
              <h2 className="mt-3 text-2xl font-bold leading-snug text-[#f4f6f7] transition group-hover:text-white sm:text-3xl">
                {lead.headline}
              </h2>
              <p className="mt-3 text-sm leading-6 text-[#aeb7bd]">{lead.brief}</p>
            </div>
          </Link>

          {rest.length > 0 ? (
            <section className="mt-8 grid gap-5 sm:grid-cols-2">
              {rest.map((story) => (
                <Link
                  key={story.id}
                  href={`/news/${story.slug}`}
                  className="group overflow-hidden rounded-lg border border-[#cfd6da]/14 bg-[#07090b]/70 transition hover:border-[#d8b36d]/40"
                >
                  {story.coverImageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={story.coverImageUrl}
                      alt={story.headline}
                      className="aspect-[16/10] w-full object-cover"
                    />
                  ) : null}
                  <div className="p-5">
                    <p className="text-[0.62rem] uppercase tracking-[0.24em] text-[#d8b36d]">
                      {[story.city, formatNewsDate(story.publishedAt)].filter(Boolean).join(" · ")}
                    </p>
                    <h3 className="mt-2 text-lg font-semibold leading-snug text-[#eef2f4] transition group-hover:text-white">
                      {story.headline}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-[#aeb7bd] line-clamp-3">
                      {story.brief}
                    </p>
                  </div>
                </Link>
              ))}
            </section>
          ) : null}
        </>
      )}
    </NewsChrome>
  );
}
