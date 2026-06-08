import type { ReactNode } from "react";
import {
  setItemAvailability,
  updateItemText,
  updatePromoText,
  uploadItemImage,
} from "@/lib/owner/actions";
import {
  Button,
  ButtonLink,
  Card,
  Chip,
  Field,
  SectionHeading,
  StatusPill,
  buttonClass,
  cn,
} from "@/components/ui";

export type MenuItem = {
  id: string;
  name: string;
  description: string | null;
  price: number | string;
  photo_url: string | null;
  is_available: boolean;
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
};

/** Wraps interactive groups in a real <form> when live, a static <div> in preview. */
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

// --- AI Request Desk hero (Phase A placeholder; wired in the next step) -------

function AskHero() {
  return (
    <Card className="relative overflow-hidden border-[#d8b36d]/18">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_15%_-20%,rgba(216,179,109,0.16),transparent_42%)]" />
      <p className="text-[0.7rem] font-semibold uppercase tracking-[0.26em] text-[#d8b36d]">
        ✦ AI Request Desk
      </p>
      <h2 className="mt-2 text-2xl font-semibold text-[#f4f6f7]">Ask for any change</h2>
      <p className="mt-2 max-w-xl text-sm leading-6 text-[#aeb7bd]">
        Just describe it in your own words — “change the Mocha to $8”, “86 the Flan Latte”,
        “add a 2x1 promo on Tuesdays.” You’ll preview and confirm before anything goes live.
      </p>
      <div className="mt-4 flex items-center gap-2 rounded-2xl border border-white/12 bg-[#0e1316] px-3.5 py-2.5">
        <input
          disabled
          placeholder="What would you like to change today?"
          className="flex-1 bg-transparent text-sm text-[#f4f6f7] placeholder:text-[#7f8a91] outline-none"
          aria-label="Ask for a change (arriving soon)"
        />
        <span className={buttonClass("primary", "pointer-events-none opacity-60")}>Ask</span>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <Chip>change the Mocha to $8</Chip>
        <Chip>86 an item</Chip>
        <Chip>new promo</Chip>
      </div>
      <p className="mt-3 text-[0.7rem] uppercase tracking-[0.14em] text-[#7f8a91]">
        Arriving in the next update — for now, edit below
      </p>
    </Card>
  );
}

// --- Menu item ---------------------------------------------------------------

function MenuItemRow({
  restaurantId,
  item,
  readOnly,
}: {
  restaurantId: string;
  item: MenuItem;
  readOnly: boolean;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-[#0b0f12]/70 p-4 transition hover:border-white/[0.12]">
      <div className="grid gap-2.5 sm:grid-cols-[1fr_10rem]">
        <Editable
          action={updateItemText.bind(null, restaurantId, item.id, "name")}
          readOnly={readOnly}
          className="flex gap-2"
        >
          <Field name="value" defaultValue={item.name} aria-label="Item name" disabled={readOnly} />
          <Button variant="subtle" type="submit" disabled={readOnly}>
            Save
          </Button>
        </Editable>

        <Editable
          action={updateItemText.bind(null, restaurantId, item.id, "price")}
          readOnly={readOnly}
          className="flex gap-2"
        >
          <Field
            name="value"
            type="number"
            step="0.01"
            min="0"
            defaultValue={String(item.price)}
            aria-label="Price"
            disabled={readOnly}
          />
          <Button variant="subtle" type="submit" disabled={readOnly}>
            Save
          </Button>
        </Editable>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2.5">
        <Editable
          action={setItemAvailability.bind(null, restaurantId, item.id)}
          readOnly={readOnly}
        >
          <input type="hidden" name="value" value={item.is_available ? "false" : "true"} />
          <button
            type="submit"
            disabled={readOnly}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-[0.62rem] font-semibold uppercase tracking-[0.14em] transition disabled:opacity-70",
              item.is_available
                ? "border-[#7fd1a2]/40 bg-[#7fd1a2]/10 text-[#9fe5bd] hover:bg-[#7fd1a2]/16"
                : "border-[#ff7a66]/40 bg-[#8f3e2e]/16 text-[#ffad9f] hover:bg-[#8f3e2e]/24",
            )}
          >
            {item.is_available ? "Available — tap to hide" : "Hidden — tap to show"}
          </button>
        </Editable>

        {readOnly ? null : (
          <form
            action={uploadItemImage.bind(null, restaurantId, item.id)}
            className="flex flex-wrap items-center gap-2"
          >
            <input
              name="image"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="block max-w-[11rem] text-xs text-[#c8d0d4] file:mr-2 file:rounded-full file:border-0 file:bg-[#d8b36d] file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-[#080a0c]"
            />
            <Button variant="subtle" type="submit">
              Photo
            </Button>
          </form>
        )}

        {item.photo_url ? <StatusPill tone="success">Photo set</StatusPill> : null}
      </div>
    </div>
  );
}

// --- Recent activity ---------------------------------------------------------

const FIELD_LABELS: Record<string, string> = {
  price: "price",
  name: "name",
  description: "description",
  is_available: "availability",
  text: "promo",
  open_time: "opening time",
  close_time: "closing time",
  is_closed: "open/closed",
};

function describeChange(entry: AuditEntry): string {
  const field = FIELD_LABELS[entry.field_name] ?? entry.field_name;
  const to = entry.new_value ?? "—";
  return `${field} → ${to}`;
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diff / 60000);
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
  return (
    <div className="mx-auto w-full max-w-3xl space-y-5">
      {/* Header */}
      <header className="flex flex-wrap items-center justify-between gap-4 px-1">
        <div className="flex items-center gap-3">
          {data.logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={data.logo}
              alt={`${data.businessName} logo`}
              className="h-9 w-9 rounded-xl object-cover ring-1 ring-white/10"
            />
          ) : (
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#d8b36d]/14 text-sm font-semibold text-[#f4d99c] ring-1 ring-[#d8b36d]/25">
              {data.businessName.slice(0, 1).toUpperCase()}
            </div>
          )}
          <div>
            <p className="text-[0.62rem] uppercase tracking-[0.28em] text-[#d8b36d]">
              Owner dashboard
            </p>
            <h1 className="text-xl font-semibold leading-tight text-[#f4f6f7]">
              {data.businessName}
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ButtonLink href={`/m/${data.restaurantId}`} variant="ghost">
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
      </header>

      <p className="px-1 text-sm text-[#aeb7bd]">
        Signed in as <span className="text-[#eef2f4]">{data.email}</span>. Every change is saved to
        your live menu and recorded below.
      </p>

      <AskHero />

      {/* Menu */}
      <Card>
        <SectionHeading hint={`${data.categories.reduce((n, c) => n + c.items.length, 0)} items`}>
          Your menu
        </SectionHeading>
        {data.categories.length === 0 ? (
          <p className="mt-4 text-sm text-[#aeb7bd]">No menu items yet.</p>
        ) : (
          <div className="mt-4 space-y-6">
            {data.categories.map((category) => (
              <div key={category.id}>
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="text-base font-semibold text-[#eef2f4]">{category.name}</h3>
                  <span className="text-[0.7rem] text-[#7f8a91]">
                    {category.items.length} item{category.items.length === 1 ? "" : "s"}
                  </span>
                </div>
                <div className="mt-3 space-y-3">
                  {category.items.map((item) => (
                    <MenuItemRow
                      key={item.id}
                      restaurantId={data.restaurantId}
                      item={item}
                      readOnly={readOnly}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Promos */}
      {data.promos.length > 0 ? (
        <Card>
          <SectionHeading>Promotions</SectionHeading>
          <div className="mt-4 space-y-3">
            {data.promos.map((promo) => (
              <Editable
                key={promo.id}
                action={updatePromoText.bind(null, data.restaurantId, promo.id)}
                readOnly={readOnly}
                className="flex gap-2"
              >
                <Field
                  name="value"
                  defaultValue={promo.text}
                  aria-label="Promo text"
                  disabled={readOnly}
                />
                <Button variant="subtle" type="submit" disabled={readOnly}>
                  Save
                </Button>
              </Editable>
            ))}
          </div>
        </Card>
      ) : null}

      {/* Recent activity */}
      <Card>
        <SectionHeading>Recent activity</SectionHeading>
        {data.audit.length === 0 ? (
          <p className="mt-4 text-sm text-[#aeb7bd]">No changes recorded yet.</p>
        ) : (
          <ul className="mt-4 space-y-2">
            {data.audit.map((entry) => (
              <li
                key={entry.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-white/[0.05] bg-white/[0.02] px-3.5 py-2.5 text-sm"
              >
                <span className="text-[#c8d0d4]">{describeChange(entry)}</span>
                <span className="shrink-0 text-[0.7rem] text-[#7f8a91]">
                  {timeAgo(entry.created_at)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <p className="px-1 pb-2 text-center text-[0.62rem] uppercase tracking-[0.18em] text-[#7f8a91]/70">
        Fina Calle OS
      </p>
    </div>
  );
}
