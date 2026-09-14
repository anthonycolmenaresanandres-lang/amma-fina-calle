import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ShieldX, Wrench } from "lucide-react";
import { cn } from "@/components/ui";
import { createServerSupabase } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getOwnerContext } from "@/lib/owner/auth";
import { isSafeRestaurantId, ownerAppPath } from "@/lib/owner/app-manifest";
import { getBrandAssets } from "@/lib/brand";
import { LAS_PALMAS_RESTAURANT_ID } from "@/lib/owner/menu-control";
import { ownerAccountProfile } from "@/lib/owner/account-profile";
import {
  getBillingNotice,
  getOwnerBillingSummary,
} from "@/lib/billing/data";
import {
  getOwnerPaymentNotices,
  getZelleInstructions,
} from "@/lib/zelle/data";
import OwnerLogin from "./OwnerLogin";
import RequiredPasswordReset from "./RequiredPasswordReset";
import OwnerDashboard, {
  type AuditEntry,
  type DashboardData,
  type MenuCategory,
} from "./OwnerDashboard";
import styles from "./owner-portal.module.css";

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
    <main className={styles.portal}>
      <a href="#owner-main" className={styles.skipLink}>
        Skip to tools
      </a>
      <div className="fc-grain" aria-hidden />
      <div className="fc-vignette" aria-hidden />
      <div
        id="owner-main"
        tabIndex={-1}
        className={cn(
          styles.shellContent,
          "mx-auto flex min-h-[calc(100dvh-5rem)] max-w-7xl flex-1 flex-col",
          center && "justify-center",
        )}
      >
        {children}
      </div>
    </main>
  );
}

const PREPARING_OWNER_PORTALS: Record<string, { name: string; logo: string }> = {
  "las-palmas-lynnhaven": { name: "Las Palmas · Lynnhaven", logo: "/assets/laspalmas/brand/las-palmas-original-sign-v1.png" },
  "aj-gators": { name: "A.J. Gator’s", logo: "/assets/aj-gators/aj-gators-logo-official.png" },
};

function SetupNotice({ restaurantId }: { restaurantId?: string }) {
  const preparing = restaurantId ? PREPARING_OWNER_PORTALS[restaurantId] : undefined;
  return (
    <div className={cn("fc-panel mx-auto w-full", styles.authFrame)}>
      {preparing ? <div className={styles.authBrand}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={preparing.logo} alt={preparing.name} width={160} height={56} className={styles.authLogo} />
        <span>Fina Calle<br />Owner portal</span>
      </div> : null}
      <span className={styles.authIcon}>
        <Wrench size={18} strokeWidth={1.75} aria-hidden />
      </span>
      <p className={styles.kicker}>{preparing ? "Portal setup pending" : "Owner access unavailable"}</p>
      <h1>{preparing ? "Your own space. Coming together." : "We’ll help you get connected."}</h1>
      <p className={styles.authIntro}>{preparing
        ? `We’re preparing the owner portal for ${preparing.name}. Your account, menu tools and payments are not activated yet.`
        : "Owner access is unavailable right now. Contact Fina Calle for help with your account."}</p>
      <p className={styles.authIntro}>Your owner guide explains what to expect. Fina Calle will confirm your access and payment setup before you begin.</p>
      <div className={styles.authHelp}><Link href="/owner/guide">Read the owner guide</Link><Link href="/contact">Contact Fina Calle</Link></div>
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

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  if (!isSafeRestaurantId(id)) {
    return { title: "Owner Portal | Fina Calle OS" };
  }
  const appPath = ownerAppPath(id);
  return {
    title: `Owner Portal — ${id} | Fina Calle OS`,
    description:
      "Secure restaurant-owner access for menu updates, requests, and billing status.",
    robots: { index: false, follow: false },
    manifest: `${appPath}/manifest.webmanifest`,
    icons: {
      icon: [
        {
          url: `${appPath}/app-icon/192`,
          sizes: "192x192",
          type: "image/png",
        },
      ],
      apple: [
        {
          url: `${appPath}/app-icon/192`,
          sizes: "192x192",
          type: "image/png",
        },
      ],
    },
  };
}

export function generateViewport(): Viewport {
  return {
    colorScheme: "dark",
    themeColor: "#171b19",
  };
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
        <SetupNotice restaurantId={id} />
      </Shell>
    );
  }

  const businessName = await getPublicBusinessName(id);
  if (businessName === null) {
    if (Object.hasOwn(PREPARING_OWNER_PORTALS, id)) {
      return <Shell center><SetupNotice restaurantId={id} /></Shell>;
    }
    notFound();
  }

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
        <div className={cn("fc-panel mx-auto w-full text-center", styles.authFrame)}>
          <span className={styles.authIcon}>
            <ShieldX size={18} strokeWidth={1.75} aria-hidden />
          </span>
          <h1>This account needs access.</h1>
          <p className={styles.authIntro}>
            <span className="text-[#eef2f4]">{ctx.email}</span> isn&apos;t on the owner
            list for this restaurant.
          </p>
          <form action={`/owner/${id}/signout`} method="post" className="mt-6">
            <button
              type="submit"
              className={styles.secondaryAction}
            >
              Sign out
            </button>
          </form>
          <div className={styles.authHelp}><Link href="/owner/guide#sign-in-help">Sign-in help</Link><Link href="/contact">Contact Fina Calle</Link></div>
        </div>
      </Shell>
    );
  }

  if (ctx.state === "password_reset_required") {
    return (
      <Shell center>
        <RequiredPasswordReset
          restaurantId={id}
          businessName={businessName}
          email={ctx.email}
        />
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

  const [restaurantRes, categoriesRes, itemsRes, auditRes, accountRes] = await Promise.all([
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
    supabase
      .from("audit_log")
      .select("id, actor_email, table_name, field_name, old_value, new_value, created_at")
      .eq("restaurant_id", id)
      .neq("table_name", "promos")
      .order("created_at", { ascending: false })
      .limit(12),
    supabase.from("restaurants")
      .select("billing_name, contact_name, contact_email, contact_phone, billing_address_line1, billing_address_city, billing_address_state, billing_address_postal_code, billing_address_country")
      .eq("id", id)
      .maybeSingle(),
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
  const [paymentNotices, zelleInstructions] = await Promise.all([
    getOwnerPaymentNotices(id),
    Promise.resolve(getZelleInstructions()),
  ]);
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
    account: accountRes.error ? null : ownerAccountProfile(accountRes.data),
    logo: getBrandAssets(id).logo ?? null,
    categories,
    audit: (auditRes.data as AuditEntry[] | null) ?? [],
    billing,
    billingNotice,
    paymentNotices,
    zelleInstructions,
    menuConnectionNotice: id === LAS_PALMAS_RESTAURANT_ID && process.env.LAS_PALMAS_OWNER_MENU_ENABLED !== "true"
      ? "Guest-menu connection is not activated yet. Saved edits update your menu data, but the guest demo still shows its sample menu. Finish pilot activation before inviting guests."
      : null,
  };

  return (
    <Shell>
      <OwnerDashboard data={data} />
    </Shell>
  );
}
