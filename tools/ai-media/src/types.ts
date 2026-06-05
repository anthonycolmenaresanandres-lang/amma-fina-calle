export type AssetStatus =
  | "approved"
  | "candidate-approved"
  | "pending-owner-approval"
  | "needs-normalization"
  | "pending"
  | "rejected"
  | "missing"
  | "deprecated";

export type AssetClass =
  | "brand-logo"
  | "qr-overlay"
  | "digital-menu-proof"
  | "owner-reference"
  | "cafe-environment"
  | "product-sticker"
  | "campaign-background"
  | "cta-overlay"
  | "footer-overlay"
  | "source-reference";

export type RegistryAsset = {
  filename: string;
  path: string;
  assetClass: AssetClass;
  status: AssetStatus;
  intendedUse: string;
  forbiddenUse: string;
  replacementRule: string;
  notes?: string;
};

export type OutputEstimate = {
  outputCount: number;
  lowUsd: number;
  highUsd: number;
  requiresApproval: true;
  notes: string[];
};

export type ShotPacket = {
  shotId: string;
  campaign: string;
  aspectRatio: "9:16" | "4:5" | "1:1" | "16:9";
  durationSec?: number;
  sourceAssets: RegistryAsset[];
  overlays: RegistryAsset[];
  providerTarget: "openai-images" | "seedance" | "vidu" | "manual-assembly";
  dryRunOnly: true;
  approvalStatus: "draft" | "ready-for-review" | "approved-for-execution";
};
