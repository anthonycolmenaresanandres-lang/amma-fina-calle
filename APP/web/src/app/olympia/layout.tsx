import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { localReviewAllowed } from "./review-gate";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Olympia Deli & Juice Bar | Local concept review",
  description: "Unpublished Olympia menu and game concept. Pending owner approval.",
  robots: { index: false, follow: false, nocache: true },
  alternates: { canonical: null },
  openGraph: { title: "Olympia | Unpublished concept", description: "Local review only", images: [], url: null },
  twitter: { title: "Olympia | Unpublished concept", images: [] },
};
export const viewport: Viewport = { themeColor: "#f36c21" };

export default async function OlympiaLayout({ children }: { children: React.ReactNode }) {
  const requestHeaders = await headers();
  if (!localReviewAllowed(process.env.OLYMPIA_LOCAL_DEMO, requestHeaders.get("host"), requestHeaders.get("x-forwarded-host"))) notFound();
  return children;
}
