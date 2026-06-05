import type { RegistryAsset, ShotPacket } from "./types.js";

export type BuildShotPacketInput = {
  shotId: string;
  campaign: string;
  aspectRatio: ShotPacket["aspectRatio"];
  durationSec?: number;
  sourceAssets: RegistryAsset[];
  overlays: RegistryAsset[];
  providerTarget: ShotPacket["providerTarget"];
};

export function buildShotPacket(input: BuildShotPacketInput): ShotPacket {
  assertNoForbiddenGeneratedOverlay(input.sourceAssets);

  return {
    shotId: input.shotId,
    campaign: input.campaign,
    aspectRatio: input.aspectRatio,
    durationSec: input.durationSec,
    sourceAssets: input.sourceAssets,
    overlays: input.overlays,
    providerTarget: input.providerTarget,
    dryRunOnly: true,
    approvalStatus: "draft",
  };
}

function assertNoForbiddenGeneratedOverlay(assets: RegistryAsset[]): void {
  const forbidden = assets.filter((asset) => asset.status === "rejected" || asset.status === "missing");
  if (forbidden.length > 0) {
    throw new Error(`Shot packet contains unavailable assets: ${forbidden.map((asset) => asset.filename).join(", ")}`);
  }
}
