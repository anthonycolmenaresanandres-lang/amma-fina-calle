import {
  setItemAvailability,
  updateItemText,
  updatePromoText,
  uploadItemImage,
} from "@/lib/owner/actions";

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

const cardClass =
  "rounded-2xl border border-[#cfd6da]/16 bg-[#07090b]/82 p-5 shadow-[0_30px_80px_-58px_rgba(255,255,255,0.5)] backdrop-blur sm:p-6";
const fieldClass =
  "w-full rounded-lg border border-[#cfd6da]/18 bg-[#11161a] px-3 py-2 text-sm text-[#f4f6f7] placeholder:text-[#7f8a91] outline-none transition focus:border-[#d8b36d]/70 focus:ring-2 focus:ring-[#d8b36d]/18";
const saveBtn =
  "shrink-0 rounded-full border border-[#cfd6da]/28 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#eef2f4] transition hover:border-[#d8b36d]/70 hover:bg-[#d8b36d]/10";

function MenuItemRow({ restaurantId, item }: { restaurantId: string; item: MenuItem }) {
  return (
    <div className="rounded-xl border border-[#cfd6da]/12 bg-[#0b0f12] p-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <form action={updateItemText.bind(null, restaurantId, item.id, "name")} className="flex gap-2">
          <input name="value" defaultValue={item.name} className={fieldClass} aria-label="Item name" />
          <button type="submit" className={saveBtn}>Save</button>
        </form>

        <form action={updateItemText.bind(null, restaurantId, item.id, "price")} className="flex gap-2">
          <input
            name="value"
            type="number"
            step="0.01"
            min="0"
            defaultValue={String(item.price)}
            className={fieldClass}
            aria-label="Price"
          />
          <button type="submit" className={saveBtn}>Save</button>
        </form>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <form action={setItemAvailability.bind(null, restaurantId, item.id)}>
          <input type="hidden" name="value" value={item.is_available ? "false" : "true"} />
          <button
            type="submit"
            className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] transition ${
              item.is_available
                ? "border border-[#7fd1a2]/40 bg-[#7fd1a2]/10 text-[#9fe5bd] hover:bg-[#7fd1a2]/16"
                : "border border-[#ff7a66]/40 bg-[#8f3e2e]/16 text-[#ffad9f] hover:bg-[#8f3e2e]/24"
            }`}
          >
            {item.is_available ? "Available — tap to hide" : "Hidden — tap to show"}
          </button>
        </form>

        <form
          action={uploadItemImage.bind(null, restaurantId, item.id)}
          className="flex flex-wrap items-center gap-2"
        >
          <input
            name="image"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="block max-w-[12rem] text-xs text-[#c8d0d4] file:mr-2 file:rounded-full file:border-0 file:bg-[#d8b36d] file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-[#080a0c]"
          />
          <button type="submit" className={saveBtn}>Upload photo</button>
        </form>

        {item.photo_url ? (
          <span className="text-[0.68rem] uppercase tracking-[0.14em] text-[#7fd1a2]">Photo set</span>
        ) : null}
      </div>
    </div>
  );
}

export default function OwnerDashboard({ data }: { data: DashboardData }) {
  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      <header className={cardClass}>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            {data.logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={data.logo}
                alt={`${data.businessName} logo`}
                className="mb-3 h-9 w-auto select-none opacity-90"
              />
            ) : null}
            <p className="text-xs uppercase tracking-[0.42em] text-[#d8b36d]">Owner dashboard</p>
            <h1 className="mt-3 text-3xl font-semibold text-[#f4f6f7]">{data.businessName}</h1>
            <p className="mt-2 text-sm text-[#aeb7bd]">Signed in as {data.email}</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <a href={`/m/${data.restaurantId}`} className={saveBtn}>View public menu</a>
            <form action={`/owner/${data.restaurantId}/signout`} method="post">
              <button
                type="submit"
                className="rounded-full border border-[#cfd6da]/22 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#cfd6da] transition hover:text-white"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
        <p className="mt-4 rounded-xl border border-[#cfd6da]/14 bg-[#151b20]/72 px-3 py-3 text-xs leading-5 text-[#aeb7bd]">
          You can edit item names, prices, availability, photos, and promos. Every change
          is saved to your live menu and recorded in your change history below.
        </p>
      </header>

      <section className={cardClass}>
        <h2 className="text-sm font-semibold uppercase tracking-[0.22em] text-[#d8b36d]">Menu</h2>
        {data.categories.length === 0 ? (
          <p className="mt-4 text-sm text-[#aeb7bd]">No menu items yet.</p>
        ) : (
          <div className="mt-4 space-y-6">
            {data.categories.map((category) => (
              <div key={category.id}>
                <h3 className="text-lg font-semibold text-[#eef2f4]">{category.name}</h3>
                <div className="mt-3 space-y-3">
                  {category.items.map((item) => (
                    <MenuItemRow key={item.id} restaurantId={data.restaurantId} item={item} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {data.promos.length > 0 ? (
        <section className={cardClass}>
          <h2 className="text-sm font-semibold uppercase tracking-[0.22em] text-[#d8b36d]">Promos</h2>
          <div className="mt-4 space-y-3">
            {data.promos.map((promo) => (
              <form
                key={promo.id}
                action={updatePromoText.bind(null, data.restaurantId, promo.id)}
                className="flex gap-2"
              >
                <input name="value" defaultValue={promo.text} className={fieldClass} aria-label="Promo text" />
                <button type="submit" className={saveBtn}>Save</button>
              </form>
            ))}
          </div>
        </section>
      ) : null}

      <section className={cardClass}>
        <h2 className="text-sm font-semibold uppercase tracking-[0.22em] text-[#d8b36d]">
          Change history
        </h2>
        {data.audit.length === 0 ? (
          <p className="mt-4 text-sm text-[#aeb7bd]">No changes recorded yet.</p>
        ) : (
          <ul className="mt-4 space-y-2 text-xs text-[#c8d0d4]">
            {data.audit.map((entry) => (
              <li key={entry.id} className="rounded-lg bg-[#11161a] px-3 py-2">
                <span className="text-[#eef2f4]">{entry.table_name}.{entry.field_name}</span>{" "}
                changed{entry.old_value != null ? ` from “${entry.old_value}”` : ""} to{" "}
                “{entry.new_value}” by {entry.actor_email ?? "owner"} ·{" "}
                {new Date(entry.created_at).toLocaleString()}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
