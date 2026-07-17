import Link from "next/link";
import { notFound } from "next/navigation";
import { ShieldX, Wrench } from "lucide-react";
import { Eyebrow, cn } from "@/components/ui";
import { createServerSupabase } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getOwnerContext } from "@/lib/owner/auth";
import { getBrandAssets } from "@/lib/brand";
import {
  getBillingNotice,
  getOwnerBillingSummary,
} from "@/lib/billing/data";
import OwnerLogin from "./OwnerLogin";
import OwnerDashboard, {
  type AuditEntry,
  type DashboardData,
  type MenuCategory,
  type Promo,
} from "./OwnerDashboard";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
};

function Shell({
  children,
  center = false,
}: {
  children: React.ReactNode;
  center?: boolean;
}) {
  return (
    <main className="fc-bg relative isolate flex min-h-dvh min-w-0 flex-col overflow-x-clip px-4 py-8 text-[#f4f6f7] sm:px-8 sm:py-10">
      <div className="fc-grain" aria-hidden />
      <div className="fc-vignette" aria-hidden />
      <div
        className={cn(
          "relative z-[1] mx-auto flex min-h-[calc(100dvh-5rem)] min-w-0 w-full max-w-7xl flex-1 flex-col",
          center && "justify-center",
        )}
      >
        {children}
      </div>
    </main>
  );
}

function SetupNotice() {
  return (
    <div className="fc-panel mx-auto w-full max-w-md p-6 text-center">
      <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full border border-[#4f9dff]/35 bg-[#4f9dff]/10 text-[#bfdcff]">
        <Wrench size={18} strokeWidth={1.75} aria-hidden />
      </span>
      <div className="mt-4 flex justify-center">
        <Eyebrow>Owner portal</Eyebrow>
      </div>
      <h1 className="mt-4 text-2xl font-semibold text-[#f4f6f7]">Setup needed</h1>
      <p className="mt-3 text-sm leading-6 text-[#aeb7bd]">
        Supabase isn&apos;t connected yet. Add the Supabase environment variables (see{" "}
        <span className="text-[#eef2f4]">APP/web/SUPABASE_SETUP.md</span>) to enable owner
        sign-in and menu editing.
      </p>
    </div>
  );
}

async function getPublicBusinessName(id: string): Promise<string | null> {
  const supabase = await createServerSupabase();
  if (!supabase) return null;
  const { data } = await supabase.rpc("get_public_menu", { p_restaurant_id: id });
  const restaurant = (data as { restaurant?: { business_name?: string } } | null)?.restaurant;
  return restaurant?.business_name ?? null;
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  return { title: `Owner Portal — ${id} | Fina Calle OS` };
}

// Maps the non-sensitive `?auth=` hint from /auth/confirm into a friendly
// retry message shown on the sign-in form (instead of a silent bounce).
function authNotice(reason: string | null): string | null {
  if (!reason) return null;
  switch (reason) {
    case "expired":
      return "That sign-in link didn’t work — it may have expired or already been used. Enter your email below to get a fresh one.";
    case "unavailable":
      return "Sign-in is briefly unavailable. Please try again in a moment.";
    default:
      return "That sign-in link looked incomplete. Enter your email below to get a fresh one.";
  }
}

export default async function OwnerPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const sp = searchParams ? await searchParams : {};
  const notice = authNotice(typeof sp.auth === "string" ? sp.auth : null);
  const billingNotice = getBillingNotice(
    typeof sp.billing === "string" ? sp.billing : null,
  );

  if (!isSupabaseConfigured) {
    return (
      <Shell center>
        <SetupNotice />
      </Shell>
    );
  }

  const businessName = await getPublicBusinessName(id);
  if (businessName === null) notFound();

  const ctx = await getOwnerContext(id);

  if (ctx.state === "anonymous") {
    return (
      <Shell center>
        <OwnerLogin restaurantId={id} businessName={businessName} notice={notice} />
      </Shell>
    );
  }

  if (ctx.state === "unauthorized") {
    return (
      <Shell center>
        <div className="fc-panel mx-auto w-full max-w-md p-6 text-center">
          <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full border border-[#ff7a66]/40 bg-[#8f3e2e]/16 text-[#ffad9f]">
            <ShieldX size={18} strokeWidth={1.75} aria-hidden />
          </span>
          <h1 className="mt-4 text-2xl font-semibold text-[#f4f6f7]">Not authorized</h1>
          <p className="mt-3 text-sm leading-6 text-[#aeb7bd]">
            <span className="text-[#eef2f4]">{ctx.email}</span> isn&apos;t on the owner
            list for this restaurant.
          </p>
          <form action={`/owner/${id}/signout`} method="post" className="mt-6">
            <button
              type="submit"
              className="rounded-full border border-[#cfd6da]/28 px-5 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#eef2f4] transition hover:border-[#4f9dff]/70 hover:bg-[#4f9dff]/10"
            >
              Sign out
            </button>
          </form>
          <Link
            href="/"
            className="mt-5 inline-block text-[0.68rem] uppercase tracking-[0.24em] text-[#cfd6da]/60 transition hover:text-white"
          >
            Back to Fina Calle OS
          </Link>
        </div>
      </Shell>
    );
  }

  // Authorized: load owner-scoped data (RLS permits only this restaurant).
  const supabase = await createServerSupabase();
  if (ctx.state !== "authorized" || !supabase) {
    return (
      <Shell center>
        <SetupNotice />
      </Shell>
    );
  }

  const [restaurantRes, categoriesRes, itemsRes, promosRes, auditRes] = await Promise.all([
    supabase
      .from("restaurants")
      .select("id, business_name, site_url, plan, billing_status")
      .eq("id", id)
      .maybeSingle(),
    supabase.from("menu_categories").select("id, name, sort_order").eq("restaurant_id", id).order("sort_order"),
    supabase
      .from("menu_items")
      .select("id, category_id, name, description, price, photo_url, is_available, sizes, sort_order")
      .eq("restaurant_id", id)
      .order("sort_order"),
    supabase.from("promos").select("id, text, is_active").eq("restaurant_id", id).order("sort_order"),
    supabase
      .from("audit_log")
      .select("id, actor_email, table_name, field_name, old_value, new_value, created_at")
      .eq("restaurant_id", id)
      .order("created_at", { ascending: false })
      .limit(12),
  ]);

  type ItemRow = {
    id: string;
    category_id: string;
    name: string;
    description: string | null;
    price: number | string;
    photo_url: string | null;
    is_available: boolean;
    sizes: { label: string; price: number | string }[] | null;
  };

  const items = (itemsRes.data as ItemRow[] | null) ?? [];
  const restaurant = restaurantRes.data as {
    business_name?: string;
    site_url?: string | null;
    plan?: string | null;
    billing_status?: string | null;
  } | null;
  const billing = await getOwnerBillingSummary(
    id,
    restaurant?.plan ?? null,
    restaurant?.billing_status ?? null,
  );
  const categories: MenuCategory[] = ((categoriesRes.data as { id: string; name: string }[] | null) ?? []).map(
    (cat) => ({
      id: cat.id,
      name: cat.name,
      items: items
        .filter((item) => item.category_id === cat.id)
        .map(({ id: itemId, name, description, price, photo_url, is_available, sizes }) => ({
          id: itemId,
          name,
          description,
          price,
          photo_url,
          is_available,
          sizes: Array.isArray(sizes) ? sizes : [],
        })),
    }),
  );

  const data: DashboardData = {
    restaurantId: id,
    businessName: restaurant?.business_name ?? businessName,
    siteUrl: restaurant?.site_url ?? null,
    email: ctx.email,
    logo: getBrandAssets(id).logo ?? null,
    categories,
    promos: (promosRes.data as Promo[] | null) ?? [],
    audit: (auditRes.data as AuditEntry[] | null) ?? [],
    billing,
    billingNotice,
  };

  return (
    <Shell>
      <OwnerDashboard data={data} />
    </Shell>
  );
}
