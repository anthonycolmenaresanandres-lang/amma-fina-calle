import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { localPilotPreviewAllowed } from "@/lib/owner/local-pilot-preview";
import PilotWorkspace from "./PilotWorkspace";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Las Palmas · Local pilot workspace", robots: { index: false, follow: false, nocache: true } };

export default async function LocalPilotPage() {
  const requestHeaders = await headers();
  if (!localPilotPreviewAllowed(process.env.LOCAL_PILOT_PREVIEW, process.env.VERCEL, requestHeaders.get("host"))) notFound();
  return <PilotWorkspace />;
}
