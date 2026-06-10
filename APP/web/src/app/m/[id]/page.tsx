import { notFound } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getBrandAssets } from "@/lib/brand";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ id: string }> };

type PublicMenu = {
  restaurant: { id: string; business_name: string; site_url: string | null };
  categories: {
    id: string;
    name: string;
    items: { id: string; name: string; description: string | null; price: number | string; photo_url: string | null }[];
  }[];
  hours: { day_of_week: number; open_time: string | null; close_time: string | null; is_closed: boolean }[];
  promos: { text: string }[];
};

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function formatPrice(price: number | string) {
  const num = typeof price === "string" ? Number(price) : price;
  return Number.isFinite(num) ? `$${num.toFixed(2)}` : "";
}

// "09:00:00" / "9:00" -> "9:00 AM" (presentation only; leaves anything unexpected as-is).
function formatTime(t: string | null): string {
  if (!t) return "";
  const m = /^(\d{1,2}):(\d{2})/.exec(t.trim());
  if (!m) return t;
  let h = Number(m[1]);
  const min = m[2];
  const period = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${h}:${min} ${period}`;
}

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  return { title: `Menu — ${id} | Fina Calle` };
}

export default async function PublicMenuPage({ params }: PageProps) {
  const { id } = await params;

  if (!isSupabaseConfigured) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-[#030405] px-6 text-center text-[#aeb7bd]">
        <p className="max-w-sm text-sm leading-6">This menu isn&apos;t connected yet.</p>
      </main>
    );
  }

  const supabase = await createServerSupabase();
  const { data } = (await supabase!.rpc("get_public_menu", { p_restaurant_id: id })) as {
    data: PublicMenu | null;
  };

  if (!data?.restaurant) notFound();

  const brand = getBrandAssets(id);

  return (
    <main className="relative isolate min-h-dvh overflow-hidden bg-[#030405] px-5 py-10 text-[#f4f6f7] sm:px-8">
      <div className="absolute inset-0 -z-30 bg-[radial-gradient(circle_at_50%_14%,rgba(205,214,219,0.12),transparent_30%),linear-gradient(145deg,#020303_0%,#0d1012_46%,#050607_100%)]" />
      <div className="mx-auto w-full max-w-2xl">
        <header className="text-center">
          {brand.logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={brand.logo}
              alt={`${data.restaurant.business_name} logo`}
              className="mx-auto mb-4 h-20 w-auto select-none drop-shadow-[0_18px_40px_rgba(0,0,0,0.6)]"
            />
          ) : (
            <p className="text-xs uppercase tracking-[0.42em] text-[#d8b36d]">Menu</p>
          )}
          <h1 className="mt-3 text-4xl font-semibold text-[#f4f6f7]">{data.restaurant.business_name}</h1>
          {data.restaurant.site_url ? (
            <a
              href={data.restaurant.site_url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-full border border-[#d8b36d]/45 bg-[#d8b36d]/10 px-5 text-xs font-semibold uppercase tracking-[0.18em] text-[#f4d99c] transition hover:bg-[#d8b36d]/20"
            >
              Visit website ↗
            </a>
          ) : null}
        </header>

        {brand.menuHero ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={brand.menuHero}
            alt={`${data.restaurant.business_name} ambiance`}
            className="mt-6 h-48 w-full rounded-[1.5rem] border border-[#cfd6da]/14 object-cover shadow-[0_30px_70px_-50px_rgba(0,0,0,0.8)] sm:h-60"
          />
        ) : null}

        {data.promos.length > 0 ? (
          <div className="mt-6 space-y-2">
            {data.promos.map((promo, index) => (
              <p
                key={index}
                className="rounded-xl border border-[#d8b36d]/30 bg-[#d8b36d]/10 px-4 py-2 text-center text-sm text-[#f4d99c]"
              >
                {promo.text}
              </p>
            ))}
          </div>
        ) : null}

        {data.categories.length > 1 ? (
          <nav
            aria-label="Menu sections"
            className="sticky top-0 z-10 -mx-5 mt-8 flex gap-2 overflow-x-auto border-b border-[#cfd6da]/12 bg-[#030405]/85 px-5 py-3 backdrop-blur [scrollbar-width:none] sm:-mx-8 sm:px-8"
          >
            {data.categories.map((category) => (
              <a
                key={category.id}
                href={`#cat-${slugify(category.name)}`}
                className="shrink-0 rounded-full border border-[#cfd6da]/20 px-3 py-1 text-xs font-medium text-[#c8d0d4] transition hover:border-[#d8b36d]/50 hover:text-[#f4d99c]"
              >
                {category.name}
              </a>
            ))}
          </nav>
        ) : null}

        <div className="mt-8 space-y-10">
          {data.categories.length === 0 ? (
            <p className="text-center text-sm text-[#aeb7bd]">Menu coming soon.</p>
          ) : (
            data.categories.map((category) => (
              <section key={category.id} id={`cat-${slugify(category.name)}`} className="scroll-mt-20">
                <h2 className="border-b border-[#cfd6da]/14 pb-2 text-sm font-semibold uppercase tracking-[0.22em] text-[#d8b36d]">
                  {category.name}
                </h2>
                <ul className="mt-4 space-y-4">
                  {category.items.map((item) => (
                    <li key={item.id} className="flex items-start gap-4">
                      {item.photo_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.photo_url}
                          alt={item.name}
                          loading="lazy"
                          className="h-16 w-16 shrink-0 rounded-xl border border-[#cfd6da]/14 object-cover sm:h-20 sm:w-20"
                        />
                      ) : null}
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-[#eef2f4]">{item.name}</p>
                        {item.description ? (
                          <p className="mt-0.5 text-sm leading-5 text-[#aeb7bd]">{item.description}</p>
                        ) : null}
                      </div>
                      <span className="shrink-0 font-semibold text-[#f4f6f7]">{formatPrice(item.price)}</span>
                    </li>
                  ))}
                </ul>
              </section>
            ))
          )}
        </div>

        {data.hours.length > 0 ? (
          <section className="mt-10">
            <h2 className="text-sm font-semibold uppercase tracking-[0.22em] text-[#d8b36d]">Hours</h2>
            <ul className="mt-3 space-y-1 text-sm text-[#c8d0d4]">
              {data.hours.map((h) => {
                const isToday = h.day_of_week === new Date().getDay();
                return (
                  <li
                    key={h.day_of_week}
                    className={`flex justify-between rounded-lg px-2 py-1 ${isToday ? "bg-[#d8b36d]/10 font-semibold text-[#f4d99c]" : ""}`}
                  >
                    <span>{DAYS[h.day_of_week]}{isToday ? " · Today" : ""}</span>
                    <span>{h.is_closed ? "Closed" : `${formatTime(h.open_time)} – ${formatTime(h.close_time)}`}</span>
                  </li>
                );
              })}
            </ul>
          </section>
        ) : null}

        <footer className="mt-12 border-t border-[#cfd6da]/12 pt-5 text-center text-[0.62rem] uppercase tracking-[0.3em] text-[#cfd6da]/35">
          Menu by Fina Calle
        </footer>
      </div>
    </main>
  );
}
