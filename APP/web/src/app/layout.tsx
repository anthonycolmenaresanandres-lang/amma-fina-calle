import type { Metadata } from "next";
import TrafficAnalytics from "@/lib/traffic/TrafficAnalytics";
import { enabledTrialSites } from "@/lib/traffic/trial-events";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://finacalleos.com"),
  title: "Fina Calle OS | Digital Systems for Local Business",
  description:
    "Premium digital storefronts, QR menu experiences, branded engagement, and owner tools for ambitious local businesses.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Fina Calle OS | Digital Systems for Local Business",
    description:
      "Premium digital storefronts, branded customer experiences, and owner tools built as one connected system.",
    type: "website",
    url: "/",
    siteName: "Fina Calle OS",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "Fina Calle OS — Digital systems for local business.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Fina Calle OS | Digital Systems for Local Business",
    description:
      "Premium digital storefronts, branded customer experiences, and owner tools built as one connected system.",
    images: ["/og.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const trialSites = enabledTrialSites();
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        {process.env.VERCEL_ENV === "production" && trialSites.length > 0 && (
          <meta name="fc-trial-tracking" content="enabled" data-sites={trialSites.join(",")} />
        )}
        {process.env.VERCEL_ENV === "production" && process.env.TRAFFIC_INGESTION_SOURCE === "first-party" && (
          <meta name="fc-traffic-collector" content="first-party-v1" />
        )}
        <link
          rel="alternate"
          type="text/plain"
          href="/llms.txt"
          title="Fina Calle AI usage policy"
        />
      </head>
      <body className="min-h-full flex flex-col">
        {children}
        <TrafficAnalytics />
        {process.env.VERCEL_ENV === "production" && (process.env.TRAFFIC_INGESTION_SOURCE === "first-party" || trialSites.length > 0) && (
          <Script src="/traffic-collector.js" strategy="afterInteractive" data-enabled="true" data-trials-enabled={trialSites.length > 0 ? "true" : "false"} data-trial-sites={trialSites.join(",")} data-scope={process.env.TRAFFIC_INGESTION_SOURCE === "first-party" ? "all" : "trials"} />
        )}
      </body>
    </html>
  );
}
