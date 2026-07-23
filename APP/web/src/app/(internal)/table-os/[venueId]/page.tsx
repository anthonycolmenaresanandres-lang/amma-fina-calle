import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { QrSetupClient } from "@/table-os/QrSetupClient";
import { getVenue } from "@/table-os/venue-config";

export const metadata: Metadata = {
  title: "Table OS QR setup · owner review",
  robots: { index: false, follow: false, nocache: true },
};

type Props = {
  params: Promise<{ venueId: string }>;
};

export default async function TableOsSetupPage({ params }: Props): Promise<React.JSX.Element> {
  const { venueId } = await params;
  const venue = getVenue(venueId);

  if (!venue) {
    notFound();
  }

  return <QrSetupClient venue={venue} />;
}
