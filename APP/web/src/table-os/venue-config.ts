import {
  lasPalmasLynnhavenMenuSections,
  lasPalmasLynnhavenMenuSourcePreview,
} from "./menu/las-palmas-lynnhaven";
import {
  maracaiboMenuSections,
  maracaiboMenuSourcePreview,
  type MaracaiboMenuSection,
} from "./menu/maracaibo";
import type { TableMatchSkin, TeamOption } from "./game";

export type OrderingVenueConfig = Readonly<{
  providerName: string;
  publicOrderUrl: string;
  tableOrderPayStatus: "OWNER_SETUP_REQUIRED" | "READY";
  tableOrderPayUrls: Readonly<Record<string, string>>;
}>;

export type MenuEvidence = Readonly<{
  status: "PENDING_OWNER_CONFIRMATION";
  customerFacingUse: "blocked";
  prominentNotice: string;
  ownerConfirmationRequired: true;
  sources: readonly Readonly<{
    url: string;
    retrievedDate: string;
    role: string;
  }>[];
  evidenceGaps: readonly string[];
}>;

export type TableOsVenue = Readonly<{
  id: string;
  name: string;
  cityLine: string;
  reviewStatus: "OWNER_REVIEW_REQUIRED" | "APPROVED";
  tableRange: Readonly<{ min: number; max: number; draftCount: number }>;
  menu: readonly MaracaiboMenuSection[];
  menuEvidence: MenuEvidence;
  ordering: OrderingVenueConfig;
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
  ordering: {
    providerName: "Toast",
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

const lasPalmasLynnhaven: TableOsVenue = {
  id: "las-palmas-lynnhaven",
  name: "Las Palmas Lynnhaven",
  cityLine: "Virginia Beach · Mexican restaurant & cantina",
  reviewStatus: "OWNER_REVIEW_REQUIRED",
  tableRange: { min: 1, max: 80, draftCount: 20 },
  menu: lasPalmasLynnhavenMenuSections,
  menuEvidence: lasPalmasLynnhavenMenuSourcePreview,
  ordering: {
    providerName: "DoorDash",
    publicOrderUrl:
      "https://order.online/store/las-palmas-mexican-restaurant-%26-cantina-virginia-beach-285708/?hideModal=true&pickup=true",
    tableOrderPayStatus: "OWNER_SETUP_REQUIRED",
    tableOrderPayUrls: {},
  },
  // Company-owned fallback palette only. No client logo, photo, or copied brand asset.
  skin: {
    id: "fina-calle-cantina",
    name: "Fina Calle Cantina",
    background: "#07181a",
    pitch: "#0e5555",
    pitchLine: "#f4d9a2",
    accent: "#f3b61f",
    text: "#fff7df",
    home: "#ffcc29",
    away: "#e5484d",
  },
  teams: [
    { id: "mexico", label: "Mexico", shortLabel: "MEX", flagEmoji: "🇲🇽", primary: "#006847", secondary: "#ce1126" },
    { id: "usa", label: "United States", shortLabel: "USA", flagEmoji: "🇺🇸", primary: "#3c3b6e", secondary: "#b22234" },
    { id: "colombia", label: "Colombia", shortLabel: "COL", flagEmoji: "🇨🇴", primary: "#fcd116", secondary: "#003893" },
    { id: "venezuela", label: "Venezuela", shortLabel: "VEN", flagEmoji: "🇻🇪", primary: "#f4d03f", secondary: "#8b1e3f" },
    { id: "puerto-rico", label: "Puerto Rico", shortLabel: "PUR", flagEmoji: "🇵🇷", primary: "#0050f0", secondary: "#ed0000" },
    { id: "table-gold", label: "Table Gold", shortLabel: "GLD", primary: "#f3b61f", secondary: "#07181a" },
  ],
};

const VENUES: Readonly<Record<string, TableOsVenue>> = {
  [maracaibo.id]: maracaibo,
  [lasPalmasLynnhaven.id]: lasPalmasLynnhaven,
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
