import type { Metadata } from "next";
import TableDuelClient from "./TableDuelClient";

// Table Duel — everyone at one table, each on their own phone, firing at each
// other's hidden fleets. Step 1 of the bar game: same-table play. Table-vs-table
// reuses this same room server later.
//
// Free play only: no money, no wagers, no prizes, no POS, no account.

export const metadata: Metadata = {
  title: "Table Duel | Fina Calle",
  description:
    "A quick hidden-fleet duel for everyone at the table — each guest plays from their own phone. Free play, no prizes.",
  robots: { index: false, follow: false, nocache: true },
};

type PageProps = { searchParams?: Promise<{ skin?: string; room?: string }> };

export default async function TableDuelPage({ searchParams }: PageProps): Promise<React.JSX.Element> {
  const { skin, room } = searchParams ? await searchParams : {};
  return <TableDuelClient skinId={skin} initialCode={room} />;
}
