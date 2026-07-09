/**
 * Fina Calle Newsroom public feed — the contract between the newsroom engine
 * and the public /news pages on finacalleos.com.
 *
 * The newsroom engine (separate repo) publishes Instagram carousels daily and,
 * after each publish, uploads a `public-feed.json` to Vercel Blob. These pages
 * are a READ-ONLY consumer of that file: nothing under /news can touch the
 * newsroom pipeline, its publish gates, or any customer data.
 *
 * Configure with NEWS_FEED_URL (the stable Blob URL of public-feed.json).
 * When unset or unreachable, pages render a graceful "warming up" state.
 */

export interface NewsFeedStory {
  id: string;
  slug: string;
  headline: string;
  /** 1–3 sentence summary shown on cards and as the story lede. */
  brief: string;
  /** Optional longer body, one string per paragraph. */
  body?: string[];
  city?: string;
  /** ISO timestamp of the Instagram publish. */
  publishedAt: string;
  coverImageUrl?: string;
  instagramPermalink?: string;
  slideImageUrls?: string[];
}

export interface NewsFeed {
  brand: string;
  updatedAt: string;
  stories: NewsFeedStory[];
}

const REVALIDATE_SECONDS = 300;

function isStory(value: unknown): value is NewsFeedStory {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.id === "string" &&
    typeof v.slug === "string" &&
    typeof v.headline === "string" &&
    typeof v.brief === "string" &&
    typeof v.publishedAt === "string"
  );
}

/**
 * Fetch and validate the public feed. Returns null when the feed is not
 * configured or not reachable — callers render an empty state, never crash.
 */
export async function getNewsFeed(): Promise<NewsFeed | null> {
  const url = process.env.NEWS_FEED_URL;
  if (!url) return null;
  try {
    const res = await fetch(url, { next: { revalidate: REVALIDATE_SECONDS } });
    if (!res.ok) return null;
    const data = (await res.json()) as Partial<NewsFeed>;
    if (!Array.isArray(data.stories)) return null;
    const stories = data.stories
      .filter(isStory)
      .sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1));
    return {
      brand: typeof data.brand === "string" ? data.brand : "Fina Calle",
      updatedAt: typeof data.updatedAt === "string" ? data.updatedAt : "",
      stories,
    };
  } catch {
    return null;
  }
}

export async function getNewsStory(slug: string): Promise<NewsFeedStory | null> {
  const feed = await getNewsFeed();
  if (!feed) return null;
  return feed.stories.find((s) => s.slug === slug) ?? null;
}

export function formatNewsDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "America/New_York",
  });
}
