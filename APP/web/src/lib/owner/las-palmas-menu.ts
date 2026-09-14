import "server-only";
import { createServerSupabase } from "@/lib/supabase/server";
import { lasPalmasLynnhavenMenuSections, lasPalmasLynnhavenMenuSourcePreview } from "@/table-os/menu/las-palmas-lynnhaven";
import { LAS_PALMAS_RESTAURANT_ID } from "./menu-control";
import { publicMenuSections } from "./public-menu-adapter";

/** OFF until location, imported prices and owner access pass the pilot gate. */
export async function getLasPalmasGuestMenu() {
  if (process.env.LAS_PALMAS_OWNER_MENU_ENABLED !== "true") {
    return { sections: lasPalmasLynnhavenMenuSections, notice: lasPalmasLynnhavenMenuSourcePreview.prominentNotice, state: "preview" as const };
  }
  try {
    const supabase = await createServerSupabase();
    if (!supabase) throw new Error("Menu connection unavailable");
    const { data, error } = await supabase.rpc("get_public_menu", { p_restaurant_id: LAS_PALMAS_RESTAURANT_ID });
    if (error) throw error;
    return { sections: publicMenuSections(data, LAS_PALMAS_RESTAURANT_ID), notice: "Menu details are managed through the location’s owner portal. Ask staff about ingredients and availability.", state: "connected" as const };
  } catch {
    return { sections: [], notice: "The current menu is temporarily unavailable. Please ask staff for today’s prices and availability.", state: "unavailable" as const };
  }
}
