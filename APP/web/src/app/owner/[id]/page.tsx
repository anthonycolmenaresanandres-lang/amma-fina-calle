import Link from "next/link";
import { notFound } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getOwnerContext } from "@/lib/owner/auth";
import { getBrandAssets } from "@/lib/brand";
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

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="relative isolate min-h-dvh overflow-hidden bg-[#030405] px-5 py-10 text-[#f4f6f7] sm:px-8">
      <div className="absolute inset-0 -z-30 bg-[radial-gradient(circle_at_50%_18%,rgba(205,214,219,0.14),transparent_28%),radial-gradient(circle_at_18%_80%,rgba(216,179,109,0.08),transparent_26%),linear-gradient(145deg,#020303_0%,#0d1012_46%,#050607_100%)]" />
      <div className="relative mx-auto flex min-h-[60dvh] w-full max-w-4xl flex-col justify-center">
        {children}
      </div>
    </main>
  );
}

function SetupNotice() {
  return (
    <div className="mx-auto w-full max-w-md rounded-2xl border border-[#cfd6da]/16 bg-[#07090b]/82 p-6 text-center">
      <p className="text-xs uppercase tracking-[0.42em] text-[#d8b36d]">Owner portal</p>
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

  if (!isSupabaseConfigured) {
    return (
      <Shell>
        <SetupNotice />
      </Shell>
    );
  }

  const businessName = await getPublicBusinessName(id);
  if (businessName === null) notFound();

  const ctx = await getOwnerContext(id);

  if (ctx.state === "anonymous") {
    return (
      <Shell>
        <OwnerLogin restaurantId={id} businessName={businessName} notice={notice} />
      </Shell>
    );
  }

  if (ctx.state === "unauthorized") {
    return (
      <Shell>
        <div className="mx-auto w-full max-w-md rounded-2xl border border-[#ff7a66]/24 bg-[#07090b]/82 p-6 text-center">
          <h1 className="text-2xl font-semibold text-[#f4f6f7]">Not authorized</h1>
          <p className="mt-3 text-sm leading-6 text-[#aeb7bd]">
            {ctx.email} isn&apos;t on the owner list for this restaurant.
          </p>
          <form action={`/owner/${id}/signout`} method="post" className="mt-5">
            <button
              type="submit"
              className="rounded-full border border-[#cfd6da]/28 px-5 py-2 text-sm font-semibold text-[#eef2f4] transition hover:border-[#d8b36d]/70"
            >
              Sign out
            </button>
          </form>
          <Link href="/" className="mt-4 inline-block text-xs uppercase tracking-[0.2em] text-[#cfd6da]/60">
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
      <Shell>
        <SetupNotice />
      </Shell>
    );
  }

  const [restaurantRes, categoriesRes, itemsRes, promosRes, auditRes] = await Promise.all([
    supabase.from("restaurants").select("id, business_name, site_url").eq("id", id).maybeSingle(),
    supabase.from("menu_categories").select("id, name, sort_order").eq("restaurant_id", id).order("sort_order"),
    supabase
      .from("menu_items")
      .select("id, category_id, name, description, price, photo_url, is_available, sort_order")
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
  };

  const items = (itemsRes.data as ItemRow[] | null) ?? [];
  const categories: MenuCategory[] = ((categoriesRes.data as { id: string; name: string }[] | null) ?? []).map(
    (cat) => ({
      id: cat.id,
      name: cat.name,
      items: items
        .filter((item) => item.category_id === cat.id)
        .map(({ id: itemId, name, description, price, photo_url, is_available }) => ({
          id: itemId,
          name,
          description,
          price,
          photo_url,
          is_available,
        })),
    }),
  );

  const data: DashboardData = {
    restaurantId: id,
    businessName:
      (restaurantRes.data as { business_name?: string } | null)?.business_name ?? businessName,
    siteUrl: (restaurantRes.data as { site_url?: string } | null)?.site_url ?? null,
    email: ctx.email,
    logo: getBrandAssets(id).logo ?? null,
    categories,
    promos: (promosRes.data as Promo[] | null) ?? [],
    audit: (auditRes.data as AuditEntry[] | null) ?? [],
  };

  return (
    <Shell>
      <OwnerDashboard data={data} />
    </Shell>
  );
}
