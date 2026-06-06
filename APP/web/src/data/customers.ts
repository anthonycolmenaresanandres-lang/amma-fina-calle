import "server-only";
import { createServerSupabase } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

// Customer registry, now sourced from Supabase (public.restaurants) via
// security-definer read functions. Stripe/billing-link fields are deferred;
// requestUpdateUrl is generated from the route rather than stored.

const REQUEST_UPDATE_PATH = "/request-update";

export type CustomerSummary = {
  id: string;
  businessName: string;
  plan: string;
  status: string;
  billingStatus: string;
  siteUrl: string;
  requestUpdateUrl: string;
};

export type CustomerAccount = CustomerSummary & {
  contactName: string;
  contactEmail: string;
  businessPhone: string;
  notes: string;
};

type RegistryRow = {
  id: string;
  business_name: string;
  plan: string | null;
  status: string | null;
  billing_status: string | null;
  site_url: string | null;
};

type AccountRow = RegistryRow & {
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  notes: string | null;
};

function mapSummary(row: RegistryRow): CustomerSummary {
  return {
    id: row.id,
    businessName: row.business_name,
    plan: row.plan ?? "",
    status: row.status ?? "",
    billingStatus: row.billing_status ?? "",
    siteUrl: row.site_url ?? "",
    requestUpdateUrl: REQUEST_UPDATE_PATH,
  };
}

function mapAccount(row: AccountRow): CustomerAccount {
  return {
    ...mapSummary(row),
    contactName: row.contact_name ?? "",
    contactEmail: row.contact_email ?? "",
    businessPhone: row.contact_phone ?? "",
    notes: row.notes ?? "",
  };
}

export async function getCustomers(): Promise<CustomerSummary[]> {
  if (!isSupabaseConfigured) return [];
  const supabase = await createServerSupabase();
  if (!supabase) return [];

  const { data, error } = await supabase.rpc("get_customer_registry");
  if (error || !data) return [];
  return (data as RegistryRow[]).map(mapSummary);
}

export async function getCustomerById(id: string): Promise<CustomerAccount | null> {
  if (!isSupabaseConfigured) return null;
  const supabase = await createServerSupabase();
  if (!supabase) return null;

  const { data, error } = await supabase.rpc("get_customer", { p_id: id });
  if (error || !data) return null;

  const row = (Array.isArray(data) ? data[0] : data) as AccountRow | undefined;
  return row ? mapAccount(row) : null;
}
