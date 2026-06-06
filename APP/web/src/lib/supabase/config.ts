// Centralized Supabase env access. Reading happens lazily so that the app
// (landing page, /conquest, etc.) keeps working when Supabase is not configured.

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

export const MENU_IMAGE_BUCKET = "menu-images";
export const BRAND_ASSET_BUCKET = "brand-assets";
