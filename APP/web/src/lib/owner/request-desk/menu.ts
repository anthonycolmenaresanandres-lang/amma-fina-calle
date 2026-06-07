import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { MenuSnapshot } from "./triage";

type ItemRow = {
  id: string;
  category_id: string;
  name: string;
  description: string | null;
  price: number | string;
  is_available: boolean;
};
type CategoryRow = { id: string; name: string };
type PromoRow = { id: string; text: string; is_active: boolean };
type HoursRow = {
  id: string;
  day_of_week: number;
  open_time: string | null;
  close_time: string | null;
  is_closed: boolean;
};

/**
 * Reads the owner's own menu via the supplied (cookie-backed, RLS-scoped)
 * Supabase client. RLS guarantees only this restaurant's rows are returned, so
 * the Request Desk can only ever resolve targets the owner is allowed to edit.
 */
export async function readOwnerMenu(
  supabase: SupabaseClient,
  restaurantId: string,
): Promise<MenuSnapshot> {
  const [restaurantRes, categoriesRes, itemsRes, promosRes, hoursRes] = await Promise.all([
    supabase.from("restaurants").select("id, business_name").eq("id", restaurantId).maybeSingle(),
    supabase.from("menu_categories").select("id, name").eq("restaurant_id", restaurantId).order("sort_order"),
    supabase
      .from("menu_items")
      .select("id, category_id, name, description, price, is_available")
      .eq("restaurant_id", restaurantId)
      .order("sort_order"),
    supabase.from("promos").select("id, text, is_active").eq("restaurant_id", restaurantId).order("sort_order"),
    supabase
      .from("hours")
      .select("id, day_of_week, open_time, close_time, is_closed")
      .eq("restaurant_id", restaurantId)
      .order("day_of_week"),
  ]);

  const items = (itemsRes.data as ItemRow[] | null) ?? [];
  const categories = (categoriesRes.data as CategoryRow[] | null) ?? [];
  const promos = (promosRes.data as PromoRow[] | null) ?? [];
  const hours = (hoursRes.data as HoursRow[] | null) ?? [];
  const businessName =
    (restaurantRes.data as { business_name?: string } | null)?.business_name ?? restaurantId;

  return {
    restaurantId,
    businessName,
    items: items.map((r) => ({
      id: r.id,
      categoryId: r.category_id,
      name: r.name,
      description: r.description,
      price: r.price,
      isAvailable: r.is_available,
    })),
    categories: categories.map((r) => ({ id: r.id, name: r.name })),
    promos: promos.map((r) => ({ id: r.id, text: r.text, isActive: r.is_active })),
    hours: hours.map((r) => ({
      id: r.id,
      dayOfWeek: r.day_of_week,
      openTime: r.open_time,
      closeTime: r.close_time,
      isClosed: r.is_closed,
    })),
  };
}
