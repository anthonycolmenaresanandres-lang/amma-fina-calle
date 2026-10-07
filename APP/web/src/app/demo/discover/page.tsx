import type { Metadata } from "next";
import DiscoverDemo from "./DiscoverDemo";

export const metadata: Metadata = {
  title: "Fina Calle Discover | Local prototype",
  description: "An original Fina Calle local discovery and passport prototype. All merchants, offers and redemptions are fictional demos.",
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
  alternates: { canonical: "/demo/discover" },
  openGraph: { title: "Fina Calle Discover · Demo", description: "Fictional offers. Local prototype only.", url: "/demo/discover", images: [] },
  twitter: { card: "summary", title: "Fina Calle Discover · Demo", description: "Fictional offers. Local prototype only.", images: [] },
};

export default function Page() { return <DiscoverDemo />; }
