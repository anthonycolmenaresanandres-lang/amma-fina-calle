import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { localPilotPreviewAllowed } from "@/lib/owner/local-pilot-preview";
import AccountPreviewWorkspace from "./AccountPreviewWorkspace";
export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Account setup · Local preview", robots: { index: false, follow: false, nocache: true } };
export default async function AccountPreviewPage() {
  if (!localPilotPreviewAllowed(process.env.LOCAL_PILOT_PREVIEW, process.env.VERCEL, (await headers()).get("host"))) notFound();
  return <AccountPreviewWorkspace />;
}
