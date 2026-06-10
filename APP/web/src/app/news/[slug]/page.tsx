import Link from "next/link";
import { notFound } from "next/navigation";
import { formatNewsDate, getNewsStory } from "@/lib/news/feed";

export const revalidate = 300;

type PageProps = { params: Promise<{ slug: string }> };

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://finacalleos.com";

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const story = await getNewsStory(slug);
  if (!story) return { title: "Story not found | Fina Calle" };
  return {
    title: `${story.headline} | Fina Calle`,
    description: story.brief,
    openGraph: {
      title: story.headline,
      description: story.brief,
      type: "article",
      publishedTime: story.publishedAt,
      url: `${siteUrl}/news/${story.slug}`,
      images: story.coverImageUrl ? [{ url: story.coverImageUrl }] : undefined,
    },
  };
}

export default async function NewsStoryPage({ params }: PageProps) {
  const { slug } = await params;
  const story = await getNewsStory(slug);
  if (!story) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: story.headline,
    description: story.brief,
    datePublished: story.publishedAt,
    image: story.coverImageUrl ? [story.coverImageUrl] : undefined,
    mainEntityOfPage: `${siteUrl}/news/${story.slug}`,
    author: { "@type": "Organization", name: "Fina Calle" },
    publisher: {
      "@type": "Organization",
      name: "Fina Calle",
      url: `${siteUrl}/news`,
    },
  };

  return (
    <main className="relative isolate min-h-dvh overflow-hidden bg-[#030405] px-5 py-6 text-[#f4f6f7] sm:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="absolute inset-0 -z-30 bg-[radial-gradient(circle_at_52%_14%,rgba(205,214,219,0.12),transparent_30%),linear-gradient(145deg,#020303_0%,#0d1012_46%,#050607_100%)]" />
      <div className="absolute inset-x-0 bottom-0 -z-10 h-44 bg-gradient-to-t from-black to-transparent" />

      <article className="mx-auto w-full max-w-2xl">
        <header className="flex items-center justify-between gap-4 text-[0.68rem] uppercase tracking-[0.28em] text-[#cfd6da]/62">
          <Link href="/news" className="transition hover:text-white">
            ← Fina Calle
          </Link>
          <Link href="/news/about" className="transition hover:text-white">
            About
          </Link>
        </header>

        <div className="pt-10">
          <p className="text-[0.66rem] uppercase tracking-[0.24em] text-[#d8b36d]">
            {[story.city, formatNewsDate(story.publishedAt)].filter(Boolean).join(" · ")}
          </p>
          <h1 className="mt-4 text-3xl font-black leading-tight tracking-tight sm:text-4xl">
            {story.headline}
          </h1>
          <p className="mt-5 text-lg leading-8 text-[#c8d0d4]">{story.brief}</p>
        </div>

        {story.coverImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={story.coverImageUrl}
            alt={story.headline}
            className="mt-8 w-full rounded-lg border border-[#cfd6da]/14"
          />
        ) : null}

        {story.body?.length ? (
          <div className="mt-8 space-y-5 text-base leading-8 text-[#d6dde0]">
            {story.body.map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>
        ) : null}

        {story.instagramPermalink ? (
          <a
            href={story.instagramPermalink}
            className="mt-10 inline-flex min-h-11 items-center justify-center rounded-full border border-[#d8b36d]/38 bg-[#d8b36d]/10 px-6 text-xs font-semibold uppercase tracking-[0.14em] text-[#f4d99c] transition hover:border-[#f4d99c]/70 hover:bg-[#d8b36d]/16"
          >
            Join the conversation on Instagram
          </a>
        ) : null}

        <footer className="mt-14 border-t border-[#cfd6da]/12 pt-6 pb-4 text-xs leading-6 text-[#aeb7bd]">
          <p>
            Verified by the Fina Calle newsroom before publishing.{" "}
            <Link href="/news/about" className="text-[#d8b36d] transition hover:text-[#f4d99c]">
              Our editorial standards
            </Link>
            .
          </p>
        </footer>
      </article>
    </main>
  );
}
