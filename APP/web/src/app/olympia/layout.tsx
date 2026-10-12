import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "Olympia Deli & Juice Bar | Prospect concept",
  description: "A Fina Calle menu and game concept for Olympia. Pending restaurant approval.",
  robots: { index: false, follow: false, nocache: true },
  alternates: { canonical: "https://finacalleos.com/olympia" },
  openGraph: { title: "Olympia | Prospect concept", description: "Prepared by Fina Calle for owner review.", images: [], url: "https://finacalleos.com/olympia" },
  twitter: { title: "Olympia | Prospect concept", images: [] },
};
export const viewport: Viewport = { themeColor: "#10283f" };

export default function OlympiaLayout({ children }: { children: React.ReactNode }) {
  return children;
}
