import type { Metadata } from "next";
import CourtyardSweep from "../MariachiRush";
import { jacksonville } from "../data";

export const metadata: Metadata = {
  title: "Courtyard Sweep | El Mariachi concept",
  description: "Steer a growing opening through an original Mexican courtyard. A 55-second swallow-and-grow game concept by Fina Calle.",
  alternates: { canonical: "/el-mariachi/play" },
  robots: { index: false, follow: false },
};

export default function ElMariachiPlayPage() {
  return <CourtyardSweep locationSlug={jacksonville.slug} locationName={jacksonville.name} orderUrl={jacksonville.orderUrl} />;
}
