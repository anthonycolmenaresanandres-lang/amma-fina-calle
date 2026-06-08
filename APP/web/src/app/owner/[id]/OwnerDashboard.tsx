import type { ReactNode } from "react";
import { setItemAvailability, updateItemText, uploadItemImage } from "@/lib/owner/actions";
import {
  Button,
  ButtonLink,
  Card,
  Chip,
  Field,
  SectionHeading,
  StatusPill,
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

function money(value: number | string): string {
  const n = Number(value);
  return Number.isFinite(n) ? `$${n.toFixed(2)}` : String(value);
}

// --- AI Request Desk hero (the reactive engine; wired next) ------------------

function AskHero() {
  return (
    <Card className="relative overflow-hidden border-[#d8b36d]/18">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_12%_-20%,rgba(216,179,109,0.16),transparent_44%)]" />
      <p className="text-[0.7rem] font-semibold uppercase tracking-[0.26em] text-[#d8b36d]">
        ✦ AI Request Desk
      </p>
      <h2 className="mt-2 text-2xl font-semibold text-[#f4f6f7]">Ask for any change</h2>
      <p className="mt-2 max-w-xl text-sm leading-6 text-[#aeb7bd]">
        Just say it — “86 the Flan Latte”, “change the Mocha to $8”, “add a Cold Brew at $5”.
        You preview and confirm before anything goes live.
      </p>
      <div className="mt-4 flex items-center gap-2 rounded-full border border-white/14 bg-[#0e1316] py-2 pl-4 pr-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] transition focus-within:border-[#d8b36d]/55 focus-within:ring-2 focus-within:ring-[#d8b36d]/20">
        <span aria-hidden className="text-sm text-[#d8b36d]/80">✦</span>
        <input
          placeholder="What would you like to change today?"
          className="min-w-0 flex-1 bg-transparent text-sm text-[#f4f6f7] placeholder:text-[#7f8a91] outline-none"
          aria-label="Ask for a change"
        />
        <span
          aria-hidden
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#d8b36d] text-base font-semibold text-[#080a0c] shadow-[0_8px_20px_-8px_rgba(216,179,109,0.75)]"
        >
          →
        </span>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <Chip>86 the Flan Latte</Chip>
        <Chip>change Mocha to $8</Chip>
        <Chip>new promo</Chip>
      </div>
    </Card>
  );
}

// --- Coming up (the proactive Seasonal Autopilot) ----------------------------

function ComingUp() {
  return (
    <Card className="relative overflow-hidden border-[#7fd1a2]/20">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_88%_-30%,rgba(127,209,162,0.14),transparent_46%)]" />
      <div className="flex items-start justify-between gap-3">
        <p className="text-[0.7rem] font-semibold uppercase tracking-[0.26em] text-[#9fe5bd]">
          ✦ Coming up · Summer
        </p>
        <StatusPill tone="gold">From Fina Calle</StatusPill>
      </div>
      <h2 className="mt-2 text-xl font-semibold text-[#f4f6f7]">Summer is here</h2>
      <p className="mt-2 max-w-xl text-sm leading-6 text-[#aeb7bd]">
        Want me to feature your iced lineup, add a <span className="text-[#eef2f4]">Cold Brew 2×1
        (weekdays)</span>, and refresh your cover photo? Approve once — I’ll handle the timing and
        switch it back at the end of the season.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button variant="primary">Approve all</Button>
        <Button variant="ghost">Edit</Button>
        <Button variant="subtle">Not now</Button>
      </div>
      <p className="mt-3 text-[0.68rem] uppercase tracking-[0.14em] text-[#7f8a91]">
        Ready to publish · auto-reverts at season end
      </p>
    </Card>
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
    <div className="rounded-2xl border border-white/[0.07] bg-[#0b0f12]/70 p-3.5">
      <div className="flex gap-3.5">
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

        <div className="min-w-0 flex-1">
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
                  "shrink-0 rounded-full border px-2.5 py-1 text-[0.56rem] font-semibold uppercase tracking-[0.12em] transition disabled:opacity-80",
                  item.is_available
                    ? "border-[#ff7a66]/35 bg-[#8f3e2e]/14 text-[#ffad9f] hover:bg-[#8f3e2e]/24"
                    : "border-[#7fd1a2]/40 bg-[#7fd1a2]/10 text-[#9fe5bd] hover:bg-[#7fd1a2]/16",
                )}
              >
                {item.is_available ? "86" : "Bring back"}
              </button>
            </Editable>
          </div>

          <Editable
            action={updateItemText.bind(null, restaurantId, item.id, "price")}
            readOnly={readOnly}
            className="mt-2 flex items-center gap-2"
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
              Save
            </Button>
          </Editable>
        </div>
      </div>

      {readOnly ? (
        <div className="mt-3 flex items-center gap-2 border-t border-white/[0.05] pt-3">
          <Button variant="ghost" disabled>
            ⬆ {item.photo_url ? "Replace photo" : "Add photo"}
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
            accept="image/jpeg,image/png,image/webp"
            className="block max-w-[12rem] text-xs text-[#c8d0d4] file:mr-2 file:rounded-full file:border-0 file:bg-[#d8b36d] file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-[#080a0c]"
          />
          <Button variant="subtle" type="submit">
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
  text: "promo",
  open_time: "opening time",
  close_time: "closing time",
  is_closed: "open/closed",
};

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

  return (
    <div className="mx-auto w-full max-w-2xl space-y-5">
      {/* Header */}
      <header className="flex flex-wrap items-center justify-between gap-4 px-1">
        <div className="flex flex-col gap-1.5">
          <span className="text-[0.56rem] uppercase tracking-[0.34em] text-[#d8b36d]/75">
            Owner dashboard
          </span>
          {data.logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={data.logo}
              alt={data.businessName}
              className="h-11 w-auto select-none sm:h-12"
            />
          ) : (
            <h1 className="text-xl font-semibold leading-tight text-[#f4f6f7]">
              {data.businessName}
            </h1>
          )}
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

      <AskHero />
      <ComingUp />

      {/* Featured items — price + photo the customer sees */}
      <Card>
        <SectionHeading hint={`${allItems.length} on menu`}>Featured items</SectionHeading>
        <p className="mt-2 text-sm leading-6 text-[#aeb7bd]">
          Your key items — change the price or upload a photo and it updates your live menu right
          away. For anything else, just ask above.
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
          <details className="group mt-3">
            <summary className="cursor-pointer list-none text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-[#cfd6da]/70 transition hover:text-white">
              See full menu ({allItems.length}) →
            </summary>
            <div className="mt-3 space-y-4">
              {data.categories.map((cat) => (
                <div key={cat.id}>
                  <p className="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-[#7f8a91]">
                    {cat.name}
                  </p>
                  <ul className="mt-1.5 space-y-1">
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

      {/* Campaigns */}
      <Card>
        <SectionHeading hint={`${data.promos.length} active`}>Campaigns</SectionHeading>
        <p className="mt-2 text-sm leading-6 text-[#aeb7bd]">
          Promotions and seasonal pushes. Start one by asking above, or approve a “Coming up”
          proposal.
        </p>
        <div className="mt-4 space-y-2">
          {data.promos.map((promo) => (
            <div
              key={promo.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-white/[0.06] bg-[#0b0f12]/70 px-3.5 py-2.5"
            >
              <p className="min-w-0 truncate text-sm text-[#eef2f4]">{promo.text}</p>
              <StatusPill tone={promo.is_active ? "success" : "neutral"}>
                {promo.is_active ? "Live" : "Off"}
              </StatusPill>
            </div>
          ))}
          <Button variant="ghost" className="mt-1 w-full sm:w-auto" disabled={readOnly}>
            + New campaign
          </Button>
        </div>
      </Card>

      {/* Attach (bigger changes → review) */}
      <Card className="border-dashed border-white/12 bg-white/[0.015]">
        <p className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-[#d8b36d]">
          Bigger change?
        </p>
        <p className="mt-2 text-sm leading-6 text-[#aeb7bd]">
          A whole new menu, a new design, or a photo? Attach it and the Fina Calle team takes it
          from there.
        </p>
        <Button variant="ghost" className="mt-4" disabled={readOnly}>
          ⬆ Attach a file
        </Button>
      </Card>

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
                <span className="text-[#c8d0d4]">
                  {FIELD_LABELS[entry.field_name] ?? entry.field_name} → {entry.new_value ?? "—"}
                </span>
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
