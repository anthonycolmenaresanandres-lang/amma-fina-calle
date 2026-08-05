import type { ReactNode } from "react";
import {
  Check,
  ExternalLink,
  Eye,
  EyeOff,
  Gauge,
  History,
  Image as ImageIcon,
  LogOut,
  Star,
  Upload,
  UtensilsCrossed,
} from "lucide-react";
import {
  setItemAvailability,
  updateItemSizePrice,
  updateItemText,
  uploadItemImage,
} from "@/lib/owner/actions";
import {
  Button,
  ButtonLink,
  Eyebrow,
  Field,
  Panel,
  SectionHeading,
  cn,
} from "@/components/ui";
import type { BillingSummary } from "@/lib/billing/types";
import type { PaymentNotice, ZelleInstructions } from "@/lib/zelle/types";
import AskBar from "./AskBar";
import BillingCard from "./BillingCard";
import ZellePaymentCard from "./ZellePaymentCard";
import styles from "./owner-portal.module.css";

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
  audit: AuditEntry[];
  billing?: BillingSummary;
  billingNotice?: string | null;
  paymentNotices?: PaymentNotice[];
  zelleInstructions?: ZelleInstructions;
};

function uniquePrompts(prompts: string[]): string[] {
  return Array.from(new Set(prompts.filter(Boolean))).slice(0, 4);
}

function publicMenuHref(restaurantId: string): string {
  return restaurantId === "colattao" ? COLATTAO_MENU_URL : `/m/${restaurantId}`;
}

function getSuggestedPrompts(items: Array<MenuItem & { category: string }>): string[] {
  const available = items.find((item) => item.is_available);
  const unavailable = items.find((item) => !item.is_available);
  const priced = items.find((item) => Number.isFinite(Number(item.price)) && Number(item.price) > 0);

  return uniquePrompts([
    available ? `86 ${available.name}` : "",
    unavailable ? `bring back ${unavailable.name}` : "",
    priced ? `change ${priced.name} to $8` : "",
    "add a new menu item",
  ]);
}

function StatCard({
  label,
  value,
  detail,
  icon,
  tone = "neutral",
}: {
  label: string;
  value: string;
  detail: string;
  icon?: ReactNode;
  tone?: "neutral" | "gold" | "success" | "danger";
}) {
  const tones: Record<NonNullable<typeof tone>, string> = {
    neutral: "border-white/[0.08] bg-white/[0.025]",
    gold: "border-[#4f9dff]/22 bg-[#4f9dff]/8",
    success: "border-[#7fd1a2]/24 bg-[#7fd1a2]/8",
    danger: "border-[#ff7a66]/24 bg-[#8f3e2e]/12",
  };

  return (
    <div className={cn(styles.statCard, tones[tone])}>
      <p className="flex items-center gap-1.5 text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-[#7f8a91]">
        {icon}
        {label}
      </p>
      <p className={styles.statValue}>{value}</p>
      <p className={styles.statDetail}>{detail}</p>
    </div>
  );
}

function CommandOverview({
  restaurantId,
  siteUrl,
  totalItems,
  liveItems,
  missingPhotos,
  unavailableItems,
}: {
  restaurantId: string;
  siteUrl: string | null;
  totalItems: number;
  liveItems: number;
  missingPhotos: number;
  unavailableItems: number;
}) {
  return (
    <Panel>
      <SectionHeading
        tone="accent"
        icon={<Gauge size={13} strokeWidth={1.75} aria-hidden />}
        hint="live"
      >
        <span className={styles.frameNumber}>03</span>
        Live
      </SectionHeading>
      <div className={styles.statusGrid}>
        <StatCard
          label="Menu"
          value={`${liveItems}/${totalItems}`}
          detail="visible"
          icon={<UtensilsCrossed size={12} strokeWidth={1.75} aria-hidden />}
          tone="success"
        />
        <StatCard
          label="Photos"
          value={String(missingPhotos)}
          detail="missing"
          icon={<ImageIcon size={12} strokeWidth={1.75} aria-hidden />}
          tone={missingPhotos > 0 ? "gold" : "success"}
        />
        <StatCard
          label="86 list"
          value={String(unavailableItems)}
          detail="hidden"
          icon={<EyeOff size={12} strokeWidth={1.75} aria-hidden />}
          tone={unavailableItems > 0 ? "danger" : "neutral"}
        />
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <ButtonLink href={publicMenuHref(restaurantId)} variant="accent">
          <ExternalLink size={14} strokeWidth={1.75} aria-hidden />
          Live menu
        </ButtonLink>
        {siteUrl ? (
          <ButtonLink href={siteUrl} variant="ghost">
            <ExternalLink size={14} strokeWidth={1.75} aria-hidden />
            Public site
          </ButtonLink>
        ) : null}
      </div>
    </Panel>
  );
}

// --- Featured items (price + photo the customer sees on the live menu) -------

/** Real <form> when live, static <div> in preview/read-only. */
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
    <div className={cn(styles.itemCard, "border border-white/[0.07] p-3.5")}>
      <div className={styles.itemLayout}>
        {item.photo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.photo_url}
            alt={item.name}
            className="h-[4.5rem] w-[4.5rem] shrink-0 rounded-xl object-cover ring-1 ring-white/10"
          />
        ) : (
          <div className="flex h-[4.5rem] w-[4.5rem] shrink-0 items-center justify-center rounded-xl border border-dashed border-white/15 bg-white/[0.02] text-[0.55rem] uppercase tracking-[0.12em] text-[#7f8a91]">
            No photo
          </div>
        )}

        <div className={styles.itemContent}>
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-[#eef2f4]">{item.name}</p>
              <p className="text-[0.68rem] text-[#7f8a91]">{item.category}</p>
            </div>
            <Editable
              action={setItemAvailability.bind(null, restaurantId, item.id)}
              readOnly={readOnly}
            >
              <input type="hidden" name="value" value={item.is_available ? "false" : "true"} />
              <button
                type="submit"
                disabled={readOnly}
                className={cn(
                  "inline-flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-1 text-[0.56rem] font-semibold uppercase tracking-[0.12em] transition disabled:opacity-80",
                  item.is_available
                    ? "border-[#ff7a66]/35 bg-[#8f3e2e]/14 text-[#ffad9f] hover:bg-[#8f3e2e]/24"
                    : "border-[#7fd1a2]/40 bg-[#7fd1a2]/10 text-[#9fe5bd] hover:bg-[#7fd1a2]/16",
                )}
              >
                {item.is_available ? (
                  <>
                    <EyeOff size={11} strokeWidth={2} aria-hidden />
                    86
                  </>
                ) : (
                  <>
                    <Eye size={11} strokeWidth={2} aria-hidden />
                    Bring back
                  </>
                )}
              </button>
            </Editable>
          </div>

          {item.sizes && item.sizes.length > 0 ? (
            <div className="mt-2 space-y-1.5">
              {item.sizes.map((size) => (
                <Editable
                  key={size.label}
                  action={updateItemSizePrice.bind(null, restaurantId, item.id, size.label)}
                  readOnly={readOnly}
                  className={styles.priceRow}
                >
                  <span className={styles.sizeLabel}>
                    {size.label}
                  </span>
                  <span className="text-sm text-[#7f8a91]">$</span>
                  <Field
                    name="value"
                    type="number"
                    step="0.01"
                    min="0"
                    defaultValue={String(Number(size.price))}
                    aria-label={`${item.name} ${size.label} price`}
                    disabled={readOnly}
                    className="w-20"
                  />
                  <Button variant="subtle" type="submit" disabled={readOnly}>
                    <Check size={13} strokeWidth={2} aria-hidden />
                    Save
                  </Button>
                </Editable>
              ))}
            </div>
          ) : (
            <Editable
              action={updateItemText.bind(null, restaurantId, item.id, "price")}
              readOnly={readOnly}
              className={cn(styles.priceRow, "mt-2")}
            >
              <span className="text-sm text-[#7f8a91]">$</span>
              <Field
                name="value"
                type="number"
                step="0.01"
                min="0"
                defaultValue={String(Number(item.price))}
                aria-label={`${item.name} price`}
                disabled={readOnly}
                className="w-24"
              />
              <Button variant="subtle" type="submit" disabled={readOnly}>
                <Check size={13} strokeWidth={2} aria-hidden />
                Save
              </Button>
            </Editable>
          )}
        </div>
      </div>

      {readOnly ? (
        <div className="mt-3 flex items-center gap-2 border-t border-white/[0.05] pt-3">
          <Button variant="ghost" disabled>
            <Upload size={13} strokeWidth={1.75} aria-hidden />
            {item.photo_url ? "Replace photo" : "Add photo"}
          </Button>
          <span className="text-[0.66rem] text-[#7f8a91]">shows on your live menu</span>
        </div>
      ) : (
        <form
          action={uploadItemImage.bind(null, restaurantId, item.id)}
          className="mt-3 flex flex-wrap items-center gap-2 border-t border-white/[0.05] pt-3"
        >
          <input
            name="image"
            type="file"
            aria-label={`Upload photo for ${item.name}`}
            accept="image/jpeg,image/png,image/webp"
            className="block max-w-[12rem] text-xs text-[#c8d0d4] file:mr-2 file:rounded-full file:border-0 file:bg-[#4f9dff] file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-[#04121f]"
          />
          <Button variant="subtle" type="submit">
            <Upload size={13} strokeWidth={1.75} aria-hidden />
            Upload
          </Button>
          <span className="text-[0.66rem] text-[#7f8a91]">shows on your live menu</span>
        </form>
      )}
    </div>
  );
}

// --- Recent activity ---------------------------------------------------------

const FIELD_LABELS: Record<string, string> = {
  price: "price",
  name: "name",
  description: "description",
  is_available: "availability",
  open_time: "opening time",
  close_time: "closing time",
  is_closed: "open/closed",
};

const OWNER_SECTIONS = [
  { number: "01", label: "Request", href: "#owner-request" },
  { number: "02", label: "Menu", href: "#owner-menu" },
  { number: "03", label: "Live", href: "#owner-live" },
  { number: "04", label: "Billing", href: "#owner-billing" },
  { number: "05", label: "History", href: "#owner-history" },
] as const;

/** Human label for an audit field, including per-size prices ("sizes:Large" → "Large price"). */
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

// --- Dashboard ---------------------------------------------------------------

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
  // The owner's key items — available first, capped at 3 slots. Not the whole menu.
  const featured = [...allItems]
    .sort((a, b) => Number(b.is_available) - Number(a.is_available))
    .slice(0, 3);
  const liveItems = allItems.filter((item) => item.is_available).length;
  const unavailableItems = allItems.length - liveItems;
  const missingPhotos = allItems.filter((item) => !item.photo_url).length;
  const suggestedPrompts = getSuggestedPrompts(allItems);

  return (
    <div className={styles.dashboard}>
      <header className={styles.masthead}>
        <div className={styles.brandBlock}>
          <Eyebrow>Private owner portal</Eyebrow>
          <div className={styles.brandLockup}>
            {data.logo ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={data.logo}
                  alt=""
                  className={styles.brandLogo}
                />
                <h1 className="sr-only">{data.businessName}</h1>
              </>
            ) : (
              <h1 className={styles.brandName}>{data.businessName}</h1>
            )}
          </div>
        </div>
        <div className={styles.utilityActions}>
          <ButtonLink href={publicMenuHref(data.restaurantId)} variant="ghost">
            <ExternalLink size={14} strokeWidth={1.75} aria-hidden />
            Menu
          </ButtonLink>
          {readOnly ? (
            <Button variant="subtle" disabled>
              <LogOut size={14} strokeWidth={1.75} aria-hidden />
              Sign out
            </Button>
          ) : (
            <form action={`/owner/${data.restaurantId}/signout`} method="post">
              <Button variant="subtle" type="submit">
                <LogOut size={14} strokeWidth={1.75} aria-hidden />
                Sign out
              </Button>
            </form>
          )}
        </div>
      </header>

      <nav className={styles.sectionIndex} aria-label="Owner portal sections">
        <p className={styles.indexCaption}>Jump to</p>
        <ol className={styles.indexList}>
          {OWNER_SECTIONS.map((section) => (
            <li key={section.href}>
              <a className={styles.indexLink} href={section.href}>
                <span className={styles.indexNumber} aria-hidden="true">
                  {section.number}
                </span>
                <span>{section.label}</span>
              </a>
            </li>
          ))}
        </ol>
      </nav>

      <div className={styles.board}>
        <section
          id="owner-request"
          aria-label="Request"
          tabIndex={-1}
          className={cn(styles.requestFrame, styles.sectionAnchor)}
        >
          <AskBar
            restaurantId={data.restaurantId}
            items={allItems.map((item) => ({
              name: item.name,
              price: item.price,
              is_available: item.is_available,
            }))}
            demo={readOnly}
            suggestedPrompts={suggestedPrompts}
          />
        </section>

        <section
          id="owner-menu"
          aria-label="Menu"
          tabIndex={-1}
          className={cn(styles.menuFrame, styles.sectionAnchor)}
        >
          <Panel>
            <SectionHeading
              tone="accent"
              icon={<Star size={13} strokeWidth={1.75} aria-hidden />}
              hint={`${allItems.length} items`}
            >
              <span className={styles.frameNumber}>02</span>
              Quick edits
            </SectionHeading>
            <p className="mt-3 text-sm text-[#aeb7bd]">
              Price · photo · availability. Saved changes go live immediately.
            </p>
            {featured.length > 0 ? (
              <div className="mt-4 space-y-3">
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
              <details>
                <summary className={styles.menuSummary}>
                  All items ({allItems.length})
                </summary>
                <div className="mt-3 space-y-5">
                  {data.categories.map((category) => (
                    <div key={category.id}>
                      <p className="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-[#7f8a91]">
                        {category.name}
                      </p>
                      <div className="mt-2 space-y-3">
                        {category.items.map((item) => (
                          <FeaturedSlot
                            key={item.id}
                            restaurantId={data.restaurantId}
                            item={{ ...item, category: category.name }}
                            readOnly={readOnly}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </details>
            ) : null}
          </Panel>
        </section>

        <section
          id="owner-live"
          aria-label="Live status"
          tabIndex={-1}
          className={cn(styles.statusFrame, styles.sectionAnchor)}
        >
          <CommandOverview
            restaurantId={data.restaurantId}
            siteUrl={data.siteUrl}
            totalItems={allItems.length}
            liveItems={liveItems}
            missingPhotos={missingPhotos}
            unavailableItems={unavailableItems}
          />
        </section>

        <section
          id="owner-billing"
          tabIndex={-1}
          className={cn(styles.moneyFrame, styles.sectionAnchor)}
          aria-labelledby="owner-billing-heading"
        >
          <h2 id="owner-billing-heading" className={styles.frameLabel}>
            <span className={styles.frameNumber}>04</span>
            Billing
          </h2>
          {data.billing ? (
            <BillingCard
              restaurantId={data.restaurantId}
              billing={data.billing}
              notice={data.billingNotice}
              readOnly={readOnly}
            />
          ) : null}
          {data.zelleInstructions ? (
            <ZellePaymentCard
              restaurantId={data.restaurantId}
              instructions={data.zelleInstructions}
              notices={data.paymentNotices ?? []}
              readOnly={readOnly}
            />
          ) : null}
        </section>

        <section
          id="owner-history"
          aria-label="History"
          tabIndex={-1}
          className={cn(styles.activityFrame, styles.sectionAnchor)}
        >
          <Panel>
            <SectionHeading
              tone="accent"
              icon={<History size={13} strokeWidth={1.75} aria-hidden />}
            >
              <span className={styles.frameNumber}>05</span>
              History
            </SectionHeading>
            {data.audit.length === 0 ? (
              <p className="mt-4 text-sm text-[#aeb7bd]">Nothing yet.</p>
            ) : (
              <ul className="mt-4 space-y-2">
                {data.audit.map((entry) => (
                  <li
                    key={entry.id}
                    className={cn(
                      styles.rowCard,
                      "flex items-center justify-between gap-3 border border-white/[0.05] px-3.5 py-2.5 text-sm",
                    )}
                  >
                    <span className="text-[#c8d0d4]">
                      {fieldLabel(entry.field_name)} → {entry.new_value ?? "—"}
                    </span>
                    <span className="shrink-0 text-[0.7rem] text-[#7f8a91]">
                      {timeAgo(entry.created_at)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </section>
      </div>

      <p className={styles.footerMark}>Fina Calle OS · Private workspace</p>
    </div>
  );
}
