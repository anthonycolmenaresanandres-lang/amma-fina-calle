import "server-only";
import { createServerSupabase } from "@/lib/supabase/server";

// The editable surface, mirrored from the apply_owner_change SQL allowlist.
// Keeping it here lets the UI fail fast; the database is still the final guard.
export const EDITABLE_FIELDS: Record<string, readonly string[]> = {
  menu_items: ["name", "description", "price", "is_available", "photo_url"],
  menu_categories: ["name"],
  promos: ["text", "is_active"],
  hours: ["open_time", "close_time", "is_closed"],
};

export type OwnerChange = {
  restaurantId: string;
  table: keyof typeof EDITABLE_FIELDS;
  rowId: string;
  field: string;
  newValue: string;
};

/**
 * The single owner write rail. Every owner-initiated content change flows
 * through here -> the apply_owner_change SQL function, which updates the row
 * and appends to audit_log in one transaction. The UI never writes to a table
 * directly.
 */
export async function applyOwnerChange(change: OwnerChange): Promise<void> {
  const allowed = EDITABLE_FIELDS[change.table];
  if (!allowed || !allowed.includes(change.field)) {
    throw new Error(`Field "${change.field}" on "${change.table}" is not editable.`);
  }

  const supabase = await createServerSupabase();
  if (!supabase) throw new Error("Supabase is not configured.");

  const { error } = await supabase.rpc("apply_owner_change", {
    p_restaurant_id: change.restaurantId,
    p_table: change.table,
    p_row_id: change.rowId,
    p_field: change.field,
    p_new_value: change.newValue,
  });

  if (error) throw new Error(error.message);
}
