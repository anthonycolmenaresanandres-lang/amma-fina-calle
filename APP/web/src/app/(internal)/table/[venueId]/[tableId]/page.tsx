import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TableExperience } from "@/table-os/TableExperience";
import { resolveOrderDestination } from "@/table-os/toast";
import { getVenue, isValidTableId } from "@/table-os/venue-config";

type Props = {
  params: Promise<{ venueId: string; tableId: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { venueId, tableId } = await params;
  const venue = getVenue(venueId);

  return {
    title: venue ? `${venue.name} · Table ${tableId} concept` : "Table experience",
    description: "Private owner-review concept for a QR menu, table-service preview, ordering handoff, and shared game.",
    robots: {
      index: false,
      follow: false,
      nocache: true,
      googleBot: { index: false, follow: false, noimageindex: true },
    },
  };
}

export default async function TablePage({ params }: Props): Promise<React.JSX.Element> {
  const { venueId, tableId } = await params;
  const venue = getVenue(venueId);

  if (!venue || !isValidTableId(tableId)) {
    notFound();
  }

  return (
    <TableExperience
      venue={venue}
      tableId={tableId.toLowerCase()}
      orderDestination={resolveOrderDestination(venue, tableId.toLowerCase())}
    />
  );
}
