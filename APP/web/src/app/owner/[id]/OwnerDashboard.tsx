import type { ReactNode } from "react";
import {
  updateItemSizePrice,
  updateItemText,
  uploadItemImage,
} from "@/lib/owner/actions";
import {
  openOwnerBillingPortal,
  payOwnerBalance,
  startOwnerSubscriptionCheckout,
} from "@/lib/owner/billing-actions";
import type { OwnerBillingSnapshot } from "@/lib/owner/billing";
import {
  Button,
  ButtonLink,
  Card,
  Field,
  SectionHeading,
  StatusPill,
} from "@/components/ui";
import AskBar from "./AskBar";

const COLATTAO_MENU_URL = "https://colattao-cafe-rush.vercel.app/menu";

export type ItemSize = { label: string; price: number | string };

export type MenuItem = {
  id: string;
  name: string;
  description: string | null;
  price: number | string;
  photo_url: string | null;
  is_available: boolean;
  sizes?: ItemSize[] | null;
};

export type MenuCategory = {
  id: string;
  name: string;
  items: MenuItem[];
};

export type Promo = { id: string; text: string; is_active: boolean };

export type AuditEntry = {
  id: string;
  actor_email: string | null;
  table_name: string;
  field_name: string;
  old_value: string | null;
  new_value: string | null;
  created_at: string;
};

export type DashboardData = {
  restaurantId: string;
  businessName: string;
  siteUrl: string | null;
  email: string;
  logo?: string | null;
  categories: MenuCategory[];
  promos: Promo[];
  audit: AuditEntry[];
  billing: OwnerBillingSnapshot;
};

function money(value: number | string): string {
  const n = Number(value);
  return Number.isFinite(n) ? `$${n.toFixed(2)}` : String(value);
}

function cents(value: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(value / 100);
}

function publicMenuHref(restaurantId: string): string {
  return restaurantId === "colattao" ? COLATTAO_MENU_URL : `/m/${restaurantId}`;
}

function updatedAt(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso));
}

function DashboardMetric({
  label,
  value,
  detail,
  tone = "neutral",
}: {
  label: string;
  value: string;
  detail: string;
  tone?: "neutral" | "gold" | "green" | "red";
}) {
  const tones = {
    neutral: "border-white/[0.08] bg-white/[0.025]",
    gold: "border-[#d8b36d]/22 bg-[#d8b36d]/8",
    green: "border-[#7fd1a2]/22 bg-[#7fd1a2]/8",
    red: "border-[#ff7a66]/24 bg-[#8f3e2e]/12",
  };

  return (
    <div className={`rounded-lg border px-4 py-3 ${tones[tone]}`}>
      <p className="text-[0.64rem] font-semibold uppercase tracking-[0.18em] text-[#7f8a91]">
        {label}
      </p>
      <p className="mt-2 text-xl font-semibold text-[#f4f6f7]">{value}</p>
      <p className="mt-1 text-xs leading-5 text-[#aeb7bd]">{detail}</p>
    </div>
  );
}

function ComingUp() {
  return (
    <Card className="relative overflow-hidden border-[#7fd1a2]/20">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#7fd1a2]/65 to-transparent" />
      <div className="flex items-start justify-between gap-3">
        <SectionHeading hint="Ready for review">Seasonal recommendation</SectionHeading>
        <StatusPill tone="success">Prepared</StatusPill>
      </div>
      <h2 className="mt-3 text-2xl font-semibold tracking-tight text-[#f4f6f7]">
        Summer menu push
      </h2>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-[#aeb7bd]">
        Feature the iced lineup, schedule a weekday cold drink promotion, and refresh the cover
        photo for the season. You approve the change before anything updates.
      </p>
      <div className="mt-5 flex flex-wrap gap-2">
        <Button variant="primary">Approve</Button>
        <Button variant="ghost">Edit plan</Button>
        <Button variant="subtle">Later</Button>
      </div>
      <p className="mt-4 text-[0.66rem] uppercase tracking-[0.16em] text-[#7f8a91]">
        Planned campaign with scheduled reversal
      </p>
    </Card>
  );
}

function BillingPanel({
  billing,
  restaurantId,
  readOnly,
}: {
  billing: OwnerBillingSnapshot;
  restaurantId: string;
  readOnly: boolean;
}) {
  const hasBalance = billing.balanceDueCents > 0;
  const canPay = billing.stripeReady && Boolean(billing.latestInvoiceUrl);
  const canManage = billing.stripeReady && Boolean(billing.customerId);
  const canSubscribe =
    billing.stripeReady &&
    billing.priceConfigured &&
    Boolean(billing.customerId ?? billing.billingEmail);
  const autopayOn = ["active", "trialing"].includes(billing.subscriptionStatus.toLowerCase());

  return (
    <Card className="border-[#d8b36d]/18">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <SectionHeading hint={billing.openInvoiceCount ? `${billing.openInvoiceCount} open` : "No open invoices"}>
          Billing
        </SectionHeading>
        <StatusPill tone={!billing.stripeReady ? "neutral" : hasBalance ? "danger" : "success"}>
          {!billing.stripeReady ? "Setup needed" : hasBalance ? "Balance due" : "Current"}
        </StatusPill>
      </div>

      <div className="mt-5 rounded-lg border border-white/[0.08] bg-[#0b0f12]/78 p-4">
        <p className="text-[0.64rem] font-semibold uppercase tracking-[0.18em] text-[#7f8a91]">
          Amount due
        </p>
        <p className="mt-2 text-4xl font-semibold tracking-tight text-[#f4f6f7]">
          {cents(billing.balanceDueCents, billing.currency)}
        </p>
        <p className="mt-3 text-xs leading-5 text-[#aeb7bd]">
          {billing.latestInvoiceLabel
            ? `Latest invoice ${billing.latestInvoiceLabel}.`
            : "No open invoice is linked right now."}
        </p>
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-white/[0.06] bg-white/[0.025] p-3.5">
          <p className="text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-[#7f8a91]">
            Plan
          </p>
          <p className="mt-2 text-sm font-semibold text-[#eef2f4]">{billing.planLabel}</p>
          <p className="mt-1 text-xs capitalize text-[#aeb7bd]">{billing.subscriptionStatus}</p>
        </div>
        <div className="rounded-lg border border-white/[0.06] bg-white/[0.025] p-3.5">
          <p className="text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-[#7f8a91]">
            Auto pay
          </p>
          <p className={autopayOn ? "mt-2 text-sm font-semibold text-[#9fe5bd]" : "mt-2 text-sm font-semibold text-[#f4d99c]"}>
            {autopayOn ? "On" : "Ready after setup"}
          </p>
          <p className="mt-1 text-xs text-[#7f8a91]">Updated {updatedAt(billing.updatedAt)}</p>
        </div>
      </div>

      {billing.message ? (
        <p className="mt-3 rounded-lg border border-[#d8b36d]/20 bg-[#d8b36d]/8 px-4 py-3 text-xs leading-5 text-[#f4d99c]">
          {billing.message}
        </p>
      ) : null}

      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        <form action={payOwnerBalance.bind(null, restaurantId)}>
          <Button variant={hasBalance ? "primary" : "subtle"} type="submit" disabled={readOnly || !canPay} className="w-full">
            Pay balance
          </Button>
        </form>
        <form action={openOwnerBillingPortal.bind(null, restaurantId)}>
          <Button variant="ghost" type="submit" disabled={readOnly || !canManage} className="w-full">
            Auto pay
          </Button>
        </form>
        <form action={startOwnerSubscriptionCheckout.bind(null, restaurantId)}>
          <Button variant="success" type="submit" disabled={readOnly || !canSubscribe} className="w-full">
            Monthly plan
          </Button>
        </form>
      </div>
    </Card>
  );
}

function Editable({
  action,
  readOnly,
  className,
  children,
}: {
  action: (formData: FormData) => void | Promise<void>;
  readOnly: boolean;
  className?: string;
  children: ReactNode;
}) {
  if (readOnly) return <div className={className}>{children}</div>;
  return (
    <form action={action} className={className}>
      {children}
    </form>
  );
}

function FeaturedSlot({
  restaurantId,
  item,
  readOnly,
}: {
  restaurantId: string;
  item: MenuItem & { category: string };
  readOnly: boolean;
}) {
  return (
    <div className="group overflow-hidden rounded-lg border border-white/[0.08] bg-[#0b0f12]/76">
      {item.photo_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={item.photo_url}
          alt={item.name}
          className="h-36 w-full object-cover saturate-[0.92] transition duration-300 group-hover:saturate-100 sm:h-40"
        />
      ) : (
        <div className="flex h-36 w-full items-center justify-center border-b border-dashed border-white/12 bg-white/[0.025] text-[0.62rem] uppercase tracking-[0.14em] text-[#7f8a91] sm:h-40">
          Photo needed
        </div>
      )}

      <div className="p-4">
        <div className="mb-2 flex items-center justify-between gap-3">
          <p className="text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-[#7f8a91]">
            Customer item
          </p>
          <StatusPill tone={item.is_available ? "success" : "neutral"}>
            {item.is_available ? "Visible" : "Hidden"}
          </StatusPill>
        </div>

        <Editable
          action={updateItemText.bind(null, restaurantId, item.id, "name")}
          readOnly={readOnly}
          className="grid gap-2"
        >
          <Field
            name="value"
            defaultValue={item.name}
            aria-label={`${item.name} item name`}
            disabled={readOnly}
          />
          <Button variant="subtle" type="submit" disabled={readOnly}>
            Save name
          </Button>
        </Editable>

        {item.sizes && item.sizes.length > 0 ? (
          <div className="mt-3 space-y-2">
            {item.sizes.map((size) => (
              <Editable
                key={size.label}
                action={updateItemSizePrice.bind(null, restaurantId, item.id, size.label)}
                readOnly={readOnly}
                className="grid grid-cols-[minmax(4.5rem,0.8fr)_1fr_auto] items-center gap-2"
              >
                <span className="truncate text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-[#9aa3a9]">
                  {size.label}
                </span>
                <Field
                  name="value"
                  type="number"
                  step="0.01"
                  min="0"
                  defaultValue={String(Number(size.price))}
                  aria-label={`${item.name} ${size.label} price`}
                  disabled={readOnly}
                />
                <Button variant="subtle" type="submit" disabled={readOnly}>
                  Save
                </Button>
              </Editable>
            ))}
          </div>
        ) : (
          <Editable
            action={updateItemText.bind(null, restaurantId, item.id, "price")}
            readOnly={readOnly}
            className="mt-3 grid grid-cols-[1fr_auto] items-center gap-2"
          >
            <Field
              name="value"
              type="number"
              step="0.01"
              min="0"
              defaultValue={String(Number(item.price))}
              aria-label={`${item.name} price`}
              disabled={readOnly}
            />
            <Button variant="subtle" type="submit" disabled={readOnly}>
              Save price
            </Button>
          </Editable>
        )}

        {readOnly ? (
          <div className="mt-4 border-t border-white/[0.06] pt-4">
            <Button variant="ghost" disabled className="w-full">
              {item.photo_url ? "Replace photo" : "Add photo"}
            </Button>
          </div>
        ) : (
          <form
            action={uploadItemImage.bind(null, restaurantId, item.id)}
            className="mt-4 grid gap-2 border-t border-white/[0.06] pt-4"
          >
            <input
              name="image"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="block w-full rounded-md border border-white/10 bg-white/[0.025] px-3 py-2 text-xs text-[#c8d0d4] file:mr-3 file:rounded-md file:border-0 file:bg-[#d8b36d] file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-[#080a0c]"
            />
            <Button variant="subtle" type="submit" className="w-full">
              Upload photo
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}

const FIELD_LABELS: Record<string, string> = {
  price: "price",
  name: "name",
  description: "description",
  is_available: "availability",
  text: "promo",
  open_time: "opening time",
  close_time: "closing time",
  is_closed: "open status",
};

function fieldLabel(name: string): string {
  if (name.startsWith("sizes:")) return `${name.slice("sizes:".length)} price`;
  return FIELD_LABELS[name] ?? name;
}

function timeAgo(iso: string): string {
  const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return new Date(iso).toLocaleDateString();
}

export default function OwnerDashboard({
  data,
  readOnly = false,
}: {
  data: DashboardData;
  readOnly?: boolean;
}) {
  const allItems = data.categories.flatMap((c) =>
    c.items.map((it) => ({ ...it, category: c.name })),
  );
  const featured = [...allItems]
    .sort((a, b) => Number(b.is_available) - Number(a.is_available))
    .slice(0, 3);
  const visibleCount = allItems.filter((item) => item.is_available).length;
  const activePromos = data.promos.filter((promo) => promo.is_active).length;
  const hasBalance = data.billing.balanceDueCents > 0;
  const autopayOn = ["active", "trialing"].includes(data.billing.subscriptionStatus.toLowerCase());

  return (
    <div className="mx-auto w-full max-w-6xl space-y-5">
      <header className="overflow-hidden rounded-lg border border-white/[0.08] bg-[#07090b]/80 shadow-[0_34px_90px_-70px_rgba(0,0,0,0.95)]">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.06] px-5 py-5 sm:px-6">
          <div className="min-w-0">
            <p className="text-[0.6rem] font-semibold uppercase tracking-[0.28em] text-[#d8b36d]">
              Owner portal
            </p>
            <div className="mt-3 flex items-center gap-4">
              {data.logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={data.logo}
                  alt={data.businessName}
                  className="h-12 w-auto select-none sm:h-14"
                />
              ) : (
                <h1 className="text-2xl font-semibold tracking-tight text-[#f4f6f7]">
                  {data.businessName}
                </h1>
              )}
              <div className="hidden h-9 w-px bg-white/[0.08] sm:block" />
              <p className="hidden max-w-sm text-sm leading-6 text-[#aeb7bd] sm:block">
                Menu edits, billing, requests, and campaign approvals in one private workspace.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ButtonLink href={publicMenuHref(data.restaurantId)} variant="ghost">
              View menu
            </ButtonLink>
            {readOnly ? (
              <Button variant="subtle" disabled>
                Sign out
              </Button>
            ) : (
              <form action={`/owner/${data.restaurantId}/signout`} method="post">
                <Button variant="subtle" type="submit">
                  Sign out
                </Button>
              </form>
            )}
          </div>
        </div>

        <div className="grid gap-3 p-5 sm:grid-cols-2 sm:p-6 lg:grid-cols-4">
          <DashboardMetric
            label="Balance"
            value={cents(data.billing.balanceDueCents, data.billing.currency)}
            detail={hasBalance ? "Payment is ready" : "Account is current"}
            tone={hasBalance ? "red" : "green"}
          />
          <DashboardMetric
            label="Auto pay"
            value={autopayOn ? "On" : "Setup"}
            detail={data.billing.subscriptionStatus}
            tone={autopayOn ? "green" : "gold"}
          />
          <DashboardMetric
            label="Live items"
            value={`${visibleCount}/${allItems.length}`}
            detail="Visible on the guest menu"
          />
          <DashboardMetric
            label="Campaigns"
            value={String(activePromos)}
            detail="Active promotions"
          />
        </div>
      </header>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(22rem,0.85fr)]">
        <AskBar
          restaurantId={data.restaurantId}
          items={allItems.map((it) => ({
            name: it.name,
            price: it.price,
            is_available: it.is_available,
          }))}
          demo={readOnly}
        />
        <BillingPanel billing={data.billing} restaurantId={data.restaurantId} readOnly={readOnly} />
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,0.78fr)]">
        <ComingUp />

        <Card>
          <SectionHeading hint={`${data.promos.length} total`}>Campaigns</SectionHeading>
          <p className="mt-3 text-sm leading-6 text-[#aeb7bd]">
            Promotions and seasonal pushes stay visible here so the owner always knows what is live.
          </p>
          <div className="mt-4 space-y-2">
            {data.promos.map((promo) => (
              <div
                key={promo.id}
                className="flex items-center justify-between gap-3 rounded-md border border-white/[0.06] bg-[#0b0f12]/72 px-3.5 py-2.5"
              >
                <p className="min-w-0 truncate text-sm text-[#eef2f4]">{promo.text}</p>
                <StatusPill tone={promo.is_active ? "success" : "neutral"}>
                  {promo.is_active ? "Live" : "Off"}
                </StatusPill>
              </div>
            ))}
            <Button variant="ghost" className="mt-2 w-full" disabled={readOnly}>
              New campaign
            </Button>
          </div>
        </Card>
      </div>

      <Card>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <SectionHeading hint={`${allItems.length} on menu`}>Featured items</SectionHeading>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#aeb7bd]">
              Rename, price, and photo edits appear on the guest menu after confirmation.
            </p>
          </div>
          <StatusPill tone="gold">Top customer items</StatusPill>
        </div>

        {featured.length > 0 ? (
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {featured.map((item) => (
              <FeaturedSlot
                key={item.id}
                restaurantId={data.restaurantId}
                item={item}
                readOnly={readOnly}
              />
            ))}
          </div>
        ) : (
          <p className="mt-4 text-sm text-[#aeb7bd]">No menu items yet.</p>
        )}

        {allItems.length > featured.length ? (
          <details className="group mt-5 rounded-lg border border-white/[0.06] bg-white/[0.02] p-4">
            <summary className="cursor-pointer list-none text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-[#cfd6da]/70 transition hover:text-white">
              See full menu ({allItems.length})
            </summary>
            <div className="mt-4 grid gap-5 md:grid-cols-2">
              {data.categories.map((cat) => (
                <div key={cat.id}>
                  <p className="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-[#7f8a91]">
                    {cat.name}
                  </p>
                  <ul className="mt-2 space-y-1">
                    {cat.items.map((it) => (
                      <li
                        key={it.id}
                        className="flex items-center justify-between gap-3 text-sm text-[#c8d0d4]"
                      >
                        <span className={it.is_available ? "" : "text-[#7f8a91] line-through"}>
                          {it.name}
                        </span>
                        <span className="text-[#7f8a91]">{money(it.price)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </details>
        ) : null}
      </Card>

      <div className="grid gap-5 lg:grid-cols-[minmax(20rem,0.78fr)_minmax(0,1fr)]">
        <Card className="border-dashed border-white/12 bg-white/[0.018]">
          <SectionHeading>Support queue</SectionHeading>
          <p className="mt-3 text-sm leading-6 text-[#aeb7bd]">
            New menu pages, larger photo sets, billing questions, and design requests go to the
            Fina Calle team for review.
          </p>
          <Button variant="ghost" className="mt-5 w-full" disabled={readOnly}>
            Attach a file
          </Button>
        </Card>

        <Card>
          <SectionHeading>Recent activity</SectionHeading>
          {data.audit.length === 0 ? (
            <p className="mt-4 text-sm text-[#aeb7bd]">No changes recorded yet.</p>
          ) : (
            <ul className="mt-4 divide-y divide-white/[0.06] overflow-hidden rounded-lg border border-white/[0.06]">
              {data.audit.map((entry) => (
                <li
                  key={entry.id}
                  className="flex items-center justify-between gap-3 bg-white/[0.018] px-3.5 py-3 text-sm"
                >
                  <span className="min-w-0 truncate text-[#c8d0d4]">
                    {fieldLabel(entry.field_name)}: {entry.new_value ?? "None"}
                  </span>
                  <span className="shrink-0 text-[0.7rem] text-[#7f8a91]">
                    {timeAgo(entry.created_at)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <p className="px-1 pb-2 text-center text-[0.62rem] uppercase tracking-[0.18em] text-[#7f8a91]/70">
        Fina Calle OS
      </p>
    </div>
  );
}
