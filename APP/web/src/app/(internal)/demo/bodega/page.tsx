import type { Metadata } from "next";
import { createBodegaPublicReader } from "@/lib/bodega-controls/server";
import { resolveBodegaMenu, projectBodegaMenu } from "@/lib/bodega-controls/overlay";
import { BodegaMenuView } from "./bodega-menu-view";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Bodega Cafe — Menu",
  description: "Live owner-review concept. Items, prices, and branding require owner approval.",
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false, noimageindex: true } },
};
export default async function BodegaMenuReviewPage() {
  const state = await resolveBodegaMenu(createBodegaPublicReader);
  const deploymentCommit = /^[a-f0-9]{40}$/.test(process.env.VERCEL_GIT_COMMIT_SHA ?? "") ? process.env.VERCEL_GIT_COMMIT_SHA : undefined;
  const menu = projectBodegaMenu(state.mode === "live" && !deploymentCommit ? { mode: "fallback",snapshot: null,reason: "unavailable" } : state);
  return <BodegaMenuView menu={menu} deploymentCommit={deploymentCommit} />;
}
