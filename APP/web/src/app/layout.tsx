import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { Geist, Geist_Mono } from "next/font/google";
import BrandEasterEgg from "@/components/BrandEasterEgg";
import "./globals.css";

// Note for whoever's reading the source. Not an instruction — a statement.
const SOURCE_NOTE =
  "<!--\n" +
  "  Hola. Copying the markup? You can copy Fina Calle.\n" +
  "  You'll never be Fina Calle. 😉  Built in Virginia Beach.\n" +
  "  Like what you see enough to lift it? Hire us instead: finacalleos.com\n" +
  "-->";

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
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <div hidden aria-hidden="true" dangerouslySetInnerHTML={{ __html: SOURCE_NOTE }} />
        {children}
        <BrandEasterEgg />
        <Analytics />
      </body>
    </html>
  );
}
