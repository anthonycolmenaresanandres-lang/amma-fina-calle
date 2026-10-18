import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { localPilotPreviewAllowed } from "@/lib/owner/local-pilot-preview";
import { bodegaFixtureMenu, BODEGA_FIXTURE_COMMIT } from "@/lib/bodega-controls/fixtures";
import { BodegaMenuView } from "../../demo/bodega/bodega-menu-view";
export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Bodega controls · Local fixture", robots: { index: false, follow: false, nocache: true } };
export default async function BodegaControlsFixture({ searchParams }: { searchParams: Promise<{ mode?: string }> }) {
  if (!localPilotPreviewAllowed(process.env.LOCAL_PILOT_PREVIEW,process.env.VERCEL,(await headers()).get("host"))) notFound();
  const { mode = "baseline" } = await searchParams;
  if (!["baseline","live","fallback"].includes(mode)) notFound();
  return <BodegaMenuView localFixture deploymentCommit={BODEGA_FIXTURE_COMMIT} menu={bodegaFixtureMenu(mode as "baseline" | "live" | "fallback")} />;
}
