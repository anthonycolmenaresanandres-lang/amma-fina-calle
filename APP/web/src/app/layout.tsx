import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Editorial display face for headlines — high-contrast serif, used in italic.
// Pairs with Geist (body/UI) for the "underground luxury media" voice.
const instrumentSerif = Instrument_Serif({
  variable: "--font-display",
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Fina Calle OS — beautiful, always-current menus for restaurants",
  description:
    "A clean QR menu your customers scan, on a page that's always up to date. We handle the tech; you focus on the food. Restaurant & café digital menus in Virginia Beach — bilingual EN/ES.",
  openGraph: {
    title: "Fina Calle OS — beautiful, always-current menus for restaurants",
    description:
      "A clean QR menu customers scan, always current, updated whenever you ask. Live at Colattao in Virginia Beach. Basic $150 / Pro $200, no setup fee.",
    type: "website",
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
      className={`${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
