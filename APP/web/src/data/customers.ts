import "server-only";
import { createServerSupabase } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

// Private AMMA client ledger, sourced through admin-only security-definer RPCs.

const REQUEST_UPDATE_PATH = "/request-update";

export type CustomerSummary = {
  id: string;
  businessName: string;
  contactName: string;
  contactEmail: string;
  businessPhone: string;
  plan: string;
  status: string;
  billingStatus: string;
  amountCents: number | null;
  currency: string | null;
  billingInterval: string | null;
  billingIntervalCount: number | null;
  recurringEnabled: boolean;
  latestInvoiceStatus: string | null;
  lastPaymentAt: string | null;
  nextPaymentAt: string | null;
  siteUrl: string;
  requestUpdateUrl: string;
  ownerPortalUrl: string;
};

export type CustomerAccount = CustomerSummary & {
  notes: string;
  ownerAccessEmails: string[];
};

type RegistryRow = {
  id: string;
  business_name: string;
  contact_name?: string | null;
  contact_email?: string | null;
  contact_phone?: string | null;
  plan: string | null;
  status: string | null;
  billing_status: string | null;
  amount_cents?: number | string | null;
  currency?: string | null;
  billing_interval?: string | null;
  billing_interval_count?: number | null;
  recurring_enabled?: boolean | null;
  latest_invoice_status?: string | null;
  last_payment_at?: string | null;
  next_payment_at?: string | null;
  site_url: string | null;
};

type AccountRow = RegistryRow & {
  notes: string | null;
  owner_access_emails?: string[] | null;
};

function amountCents(value: number | string | null | undefined): number | null {
  if (value === null || value === undefined) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function mapSummary(row: RegistryRow): CustomerSummary {
  return {
    id: row.id,
    businessName: row.business_name,
    contactName: row.contact_name ?? "",
    contactEmail: row.contact_email ?? "",
    businessPhone: row.contact_phone ?? "",
    plan: row.plan ?? "",
    status: row.status ?? "",
    billingStatus: row.billing_status ?? "",
    amountCents: amountCents(row.amount_cents),
    currency: row.currency ?? null,
    billingInterval: row.billing_interval ?? null,
    billingIntervalCount: row.billing_interval_count ?? null,
    recurringEnabled: Boolean(row.recurring_enabled),
    latestInvoiceStatus: row.latest_invoice_status ?? null,
    lastPaymentAt: row.last_payment_at ?? null,
    nextPaymentAt: row.next_payment_at ?? null,
    siteUrl: row.site_url ?? "",
    requestUpdateUrl: REQUEST_UPDATE_PATH,
    ownerPortalUrl: `/owner/${row.id}`,
  };
}

function mapAccount(row: AccountRow): CustomerAccount {
  return {
    ...mapSummary(row),
    notes: row.notes ?? "",
    ownerAccessEmails: row.owner_access_emails ?? [],
  };
}

export async function getCustomers(): Promise<CustomerSummary[]> {
  if (!isSupabaseConfigured) return [];
  const supabase = await createServerSupabase();
  if (!supabase) return [];

  const { data, error } = await supabase.rpc("get_client_ledger");
  if (!error && data) return (data as RegistryRow[]).map(mapSummary);

  // Keeps the existing registry usable until the prepared migration is applied.
  const legacy = await supabase.rpc("get_customer_registry");
  if (legacy.error || !legacy.data) return [];
  return (legacy.data as RegistryRow[]).map(mapSummary);
}

export async function getCustomerById(id: string): Promise<CustomerAccount | null> {
  if (!isSupabaseConfigured) return null;
  const supabase = await createServerSupabase();
  if (!supabase) return null;

  const { data, error } = await supabase.rpc("get_client_account", { p_id: id });
  if (!error && data) {
    const row = (Array.isArray(data) ? data[0] : data) as AccountRow | undefined;
    return row ? mapAccount(row) : null;
  }

  const legacy = await supabase.rpc("get_customer", { p_id: id });
  if (legacy.error || !legacy.data) return null;
  const row = (Array.isArray(legacy.data) ? legacy.data[0] : legacy.data) as
    | AccountRow
    | undefined;
  return row ? mapAccount(row) : null;
}
