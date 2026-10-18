import { guestMenuPath, guestMenuRedirectUrl } from "../../guest-menu";

/** Source code evidence, not proof that the deployed site uses this checkout. */
export function ownerQueueSourceAssessment(restaurantId: string, env: Record<string,string|undefined> = process.env) {
  const guestPath = guestMenuPath(restaurantId);
  if (restaurantId === "bodega" && env.BODEGA_MENU_CONTROLS_ENABLED === "true") return { guestPath, kind: "control_overlay" as const, certificationRequired: true, reason: "Bodega's overlay supports availability and display order only. A fresh rendered-menu certificate and explicit tenant-owner enrollment are still required." };
  if (guestMenuRedirectUrl(restaurantId)) return { guestPath, kind: "external" as const, certificationRequired: true, reason: "The approved menu redirects to a separate site." };
  if (["bodega", "scrambled", "project-seed"].includes(restaurantId)) return { guestPath, kind: "static" as const, certificationRequired: true, reason: "The guest route renders repository menu data; database edits do not publish it." };
  if (restaurantId === "las-palmas-lynnhaven") return { guestPath, kind: "conditional" as const, certificationRequired: true, reason: "The owner menu is database-backed only after the separate connection flag and tenant pilot are verified." };
  return { guestPath, kind: "database_route" as const, certificationRequired: true, reason: "The generic route reads Supabase; the actual tenant destination and public readback still need certification." };
}
