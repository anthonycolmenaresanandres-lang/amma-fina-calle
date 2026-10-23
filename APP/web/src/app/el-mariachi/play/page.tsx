import type { Metadata } from "next";
import MariachiRush from "../MariachiRush";
import { getLocation } from "../data";

export const metadata: Metadata = {
  title: "Mariachi Rush | El Mariachi concept",
  description: "Find your rhythm in an original 30-second, one-thumb game. An El Mariachi prospect concept by Fina Calle.",
  alternates: { canonical: "/el-mariachi/play" },
  robots: { index: false, follow: false },
};

export default async function ElMariachiPlayPage({ searchParams }: { searchParams: Promise<{ location?: string | string[] }> }) {
  const query = await searchParams;
  const location = getLocation(typeof query.location === "string" ? query.location : undefined);
  return <MariachiRush locationSlug={location.slug} locationName={location.name} orderUrl={location.orderUrl} />;
}
