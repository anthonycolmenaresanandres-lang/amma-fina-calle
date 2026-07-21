import type { MetadataRoute } from "next";

const trainingCrawlers = ["GPTBot", "ClaudeBot", "CCBot", "Bytespider"];

const aiSearchCrawlers = [
  "OAI-SearchBot",
  "ChatGPT-User",
  "OAI-AdsBot",
  "Claude-SearchBot",
  "Claude-User",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: trainingCrawlers,
        disallow: "/",
      },
      {
        userAgent: aiSearchCrawlers,
        allow: "/",
      },
      {
        userAgent: "*",
        allow: "/",
      },
    ],
    host: "https://finacalleos.com",
    sitemap: "https://finacalleos.com/news/sitemap.xml",
  };
}
