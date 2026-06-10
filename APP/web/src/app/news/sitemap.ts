import type { MetadataRoute } from "next";
import { getNewsFeed } from "@/lib/news/feed";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://finacalleos.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const feed = await getNewsFeed();
  const stories = (feed?.stories ?? []).map((story) => ({
    url: `${siteUrl}/news/${story.slug}`,
    lastModified: new Date(story.publishedAt),
  }));
  return [
    { url: `${siteUrl}/news`, lastModified: new Date() },
    { url: `${siteUrl}/news/about` },
    ...stories,
  ];
}
