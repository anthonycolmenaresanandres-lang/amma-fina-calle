import {
  maracaiboMenuSections,
  maracaiboMenuSourcePreview,
  type MaracaiboMenuSection,
} from "./menu/maracaibo";
import type { TableMatchSkin, TeamOption } from "./game";

export type ToastVenueConfig = Readonly<{
  publicOrderUrl: string;
  tableOrderPayStatus: "OWNER_SETUP_REQUIRED" | "READY";
  tableOrderPayUrls: Readonly<Record<string, string>>;
}>;

export type TableOsVenue = Readonly<{
  id: string;
  name: string;
  cityLine: string;
  reviewStatus: "OWNER_REVIEW_REQUIRED" | "APPROVED";
  tableRange: Readonly<{ min: number; max: number; draftCount: number }>;
  menu: readonly MaracaiboMenuSection[];
  menuEvidence: typeof maracaiboMenuSourcePreview;
  toast: ToastVenueConfig;
  skin: TableMatchSkin;
  teams: readonly TeamOption[];
}>;

const maracaibo: TableOsVenue = {
  id: "maracaibo",
  name: "Maracaibo Bistro",
  cityLine: "Virginia Beach · Venezuelan kitchen",
  reviewStatus: "OWNER_REVIEW_REQUIRED",
  tableRange: { min: 1, max: 40, draftCount: 12 },
  menu: maracaiboMenuSections,
  menuEvidence: maracaiboMenuSourcePreview,
  toast: {
    publicOrderUrl: "https://www.toasttab.com/local/order/maracaibo-bistro",
    tableOrderPayStatus: "OWNER_SETUP_REQUIRED",
    tableOrderPayUrls: {},
  },
  skin: {
    id: "maracaibo-lagoon",
    name: "Maracaibo Lagoon",
    background: "#07181a",
    pitch: "#0e5555",
    pitchLine: "#f4d9a2",
    accent: "#f3b61f",
    text: "#fff7df",
    home: "#ffcc29",
    away: "#e5484d",
  },
  teams: [
    { id: "venezuela", label: "Venezuela", shortLabel: "VEN", flagEmoji: "🇻🇪", primary: "#f4d03f", secondary: "#8b1e3f" },
    { id: "dominican-republic", label: "Dominican Republic", shortLabel: "DOM", flagEmoji: "🇩🇴", primary: "#0038a8", secondary: "#ce1126" },
    { id: "puerto-rico", label: "Puerto Rico", shortLabel: "PUR", flagEmoji: "🇵🇷", primary: "#0050f0", secondary: "#ed0000" },
    { id: "colombia", label: "Colombia", shortLabel: "COL", flagEmoji: "🇨🇴", primary: "#fcd116", secondary: "#003893" },
    { id: "usa", label: "United States", shortLabel: "USA", flagEmoji: "🇺🇸", primary: "#3c3b6e", secondary: "#b22234" },
    { id: "table-gold", label: "Table Gold", shortLabel: "GLD", primary: "#f3b61f", secondary: "#07181a" },
  ],
};

const VENUES: Readonly<Record<string, TableOsVenue>> = {
  [maracaibo.id]: maracaibo,
};

export function getVenue(venueId: string): TableOsVenue | null {
  return VENUES[venueId.toLowerCase()] ?? null;
}

export function isValidTableId(value: string): boolean {
  return /^[a-z0-9][a-z0-9-]{0,19}$/i.test(value);
}

export function tableLabel(tableId: string): string {
  if (/^\d+$/.test(tableId)) {
    return `Table ${Number.parseInt(tableId, 10)}`;
  }

  return tableId
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
