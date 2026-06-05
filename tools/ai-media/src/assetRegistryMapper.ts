import type { AssetClass, AssetStatus, RegistryAsset } from "./types.js";

export type RawInventoryRow = {
  filename: string;
  path: string;
  classHint?: string;
  statusHint?: string;
  notes?: string;
};

const DEFAULT_FORBIDDEN_USE = "Do not use for generated logos, QR codes, CTA text, Digital Menu text, or menu copy.";

export function mapInventoryRow(row: RawInventoryRow): RegistryAsset {
  return {
    filename: row.filename,
    path: row.path,
    assetClass: normalizeClass(row.classHint),
    status: normalizeStatus(row.statusHint),
    intendedUse: "Campaign planning input pending human review.",
    forbiddenUse: DEFAULT_FORBIDDEN_USE,
    replacementRule: "Replace with an approved registry asset if source, ownership, or visual QA fails.",
    notes: row.notes,
  };
}

function normalizeClass(value?: string): AssetClass {
  const text = (value ?? "").toLowerCase();
  if (text.includes("logo")) return "brand-logo";
  if (text.includes("qr")) return "qr-overlay";
  if (text.includes("menu")) return "digital-menu-proof";
  if (text.includes("owner")) return "owner-reference";
  if (text.includes("cafe") || text.includes("environment")) return "cafe-environment";
  if (text.includes("sticker") || text.includes("product")) return "product-sticker";
  if (text.includes("background")) return "campaign-background";
  if (text.includes("cta")) return "cta-overlay";
  if (text.includes("footer")) return "footer-overlay";
  return "source-reference";
}

function normalizeStatus(value?: string): AssetStatus {
  const text = (value ?? "").toLowerCase();
  if (text.includes("candidate")) return "candidate-approved";
  if (text.includes("owner")) return "pending-owner-approval";
  if (text.includes("normal")) return "needs-normalization";
  if (text.includes("reject")) return "rejected";
  if (text.includes("missing")) return "missing";
  if (text.includes("approved")) return "approved";
  return "pending";
}
