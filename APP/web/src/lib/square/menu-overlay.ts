import "server-only";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

type SquareVariation = {
  item_variation_data?: {
    name?: string;
    price_money?: { amount?: number | string; currency?: string };
  };
};

type SquareItemPayload = {
  item_data?: {
    name?: string;
    variations?: SquareVariation[];
  };
};

type OverlayItem = {
  deleted: boolean;
  prices: Map<string, number>;
};

export type SquareMenuOverlay = {
  connected: boolean;
  items: Map<string, OverlayItem>;
};

function normalized(value: string) {
  return value.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, " ").trim();
}

function cents(value: number | string | undefined): number | null {
  const amount = typeof value === "string" ? Number(value) : value;
  return typeof amount === "number" && Number.isSafeInteger(amount) && amount >= 0 ? amount : null;
}

export async function getSquareMenuOverlay(restaurantId: string): Promise<SquareMenuOverlay> {
  try {
    const admin = getSupabaseAdmin();
    const { data: connection } = await admin.from("square_connections")
      .select("last_synced_at")
      .eq("restaurant_id", restaurantId)
      .maybeSingle();
    if (!connection?.last_synced_at) return { connected: false, items: new Map() };

    const { data, error } = await admin.from("square_catalog_objects")
      .select("deleted,payload")
      .eq("restaurant_id", restaurantId)
      .eq("object_type", "ITEM");
    if (error) return { connected: true, items: new Map() };

    const candidates = new Map<string, OverlayItem | null>();
    for (const row of data ?? []) {
      const payload = (row.payload ?? {}) as SquareItemPayload;
      const name = payload.item_data?.name?.trim();
      if (!name) continue;
      const key = normalized(name);
      if (!key) continue;
      if (candidates.has(key)) {
        candidates.set(key, null);
        continue;
      }
      const prices = new Map<string, number>();
      for (const variation of payload.item_data?.variations ?? []) {
        const money = variation.item_variation_data?.price_money;
        if (money?.currency && money.currency !== "USD") continue;
        const amount = cents(money?.amount);
        if (amount === null) continue;
        prices.set(normalized(variation.item_variation_data?.name ?? ""), amount);
      }
      candidates.set(key, { deleted: row.deleted === true, prices });
    }

    const items = new Map<string, OverlayItem>();
    for (const [key, item] of candidates) if (item) items.set(key, item);
    return { connected: true, items };
  } catch {
    return { connected: false, items: new Map() };
  }
}

export function squareItemVisible(overlay: SquareMenuOverlay, itemName: string) {
  const item = overlay.items.get(normalized(itemName));
  return item ? !item.deleted : true;
}

export function squarePrice(
  overlay: SquareMenuOverlay,
  itemName: string,
  variationLabel: string,
  fallback: number | null,
) {
  const item = overlay.items.get(normalized(itemName));
  if (!item || item.deleted) return fallback;
  const label = normalized(variationLabel);
  const exact = item.prices.get(label);
  if (exact !== undefined) return exact;
  if (!label && item.prices.size === 1) return [...item.prices.values()][0];
  return fallback;
}
