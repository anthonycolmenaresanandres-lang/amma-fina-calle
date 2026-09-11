"use server";

import { revalidatePath } from "next/cache";
import { getOwnerContext } from "./auth";
import { createServerSupabase } from "@/lib/supabase/server";
import { applyOwnerChange, applyOwnerSizePrice } from "./rail";
import { LAS_PALMAS_RESTAURANT_ID, normalizedMenuValue, validateMenuEdit, type MenuEdit } from "./menu-control";

export type MenuEditResult = { ok: true; value: string } | { ok: false; message: string };

/** Every confirmation re-authorizes and re-reads the tenant-scoped item. */
export async function saveOwnerMenuEdit(input: MenuEdit): Promise<MenuEditResult> {
  let change: MenuEdit;
  try { change = validateMenuEdit(input); }
  catch (error) { return { ok: false, message: error instanceof Error ? error.message : "Check your menu change." }; }

  try {
    const ctx = await getOwnerContext(change.restaurantId);
    if (ctx.state !== "authorized") return { ok: false, message: "Sign in with an authorized owner account, then retry." };
    const supabase = await createServerSupabase();
    if (!supabase) return { ok: false, message: "Editing is not connected. Contact AMMA to finish setup." };
    const { data: item, error } = await supabase.from("menu_items")
      .select("id,name,description,price,is_available,sizes")
      .eq("restaurant_id", change.restaurantId).eq("id", change.itemId).maybeSingle();
    if (error || !item) return { ok: false, message: "This item could not be loaded. Refresh the menu and retry." };
    const sizes = Array.isArray(item.sizes) ? item.sizes as { label: string; price: number | string }[] : [];
    const matches = sizes.filter(size => size.label === change.sizeLabel);
    if (change.field === "size_price" && matches.length !== 1) return { ok: false, message: "This size changed. Refresh the menu and choose it again." };
    const current = change.field === "size_price" ? matches[0].price : item[change.field];
    if (normalizedMenuValue(change.field, current) !== change.expectedValue) {
      return { ok: false, message: "This item changed since you opened it. Refresh before editing so you do not overwrite that change." };
    }
    if (change.field === "size_price") {
      await applyOwnerSizePrice({ restaurantId: change.restaurantId, rowId: change.itemId, sizeLabel: change.sizeLabel!, newValue: change.value });
    } else {
      await applyOwnerChange({ restaurantId: change.restaurantId, table: "menu_items", rowId: change.itemId, field: change.field, newValue: change.value });
    }
    revalidatePath(`/owner/${change.restaurantId}`);
    revalidatePath(`/m/${change.restaurantId}`);
    if (change.restaurantId === LAS_PALMAS_RESTAURANT_ID) revalidatePath("/demo/las-palmas");
    return { ok: true, value: change.value };
  } catch {
    // Never return database internals, identity details or infrastructure errors.
    return { ok: false, message: "The change could not be confirmed. Refresh to check the current value before retrying." };
  }
}
