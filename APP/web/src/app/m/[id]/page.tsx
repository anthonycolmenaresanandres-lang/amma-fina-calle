import { notFound } from "next/navigation";
import { Clock, ExternalLink, Sparkles } from "lucide-react";
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
      <main className="fc-bg-warm flex min-h-dvh items-center justify-center px-6 text-center text-[#aeb7bd]">
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
    <main className="fc-bg-warm relative isolate min-h-dvh overflow-hidden px-5 py-10 text-[#f4f6f7] sm:px-8">
      <div className="fc-grain" aria-hidden />
      <div className="fc-vignette" aria-hidden />
      <div className="relative z-[1] mx-auto w-full max-w-2xl">
        <header className="text-center">
          {brand.logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={brand.logo}
              alt={`${data.restaurant.business_name} logo`}
              className="mx-auto mb-4 h-20 w-auto select-none drop-shadow-[0_18px_40px_rgba(0,0,0,0.6)]"
            />
          ) : (
            <span className="inline-flex items-center gap-2.5 text-xs font-semibold uppercase tracking-[0.34em] text-[#d8b36d]">
              <span aria-hidden className="h-px w-6 bg-gradient-to-r from-[#d8b36d]/80 to-transparent" />
              Menu
              <span aria-hidden className="h-px w-6 bg-gradient-to-l from-[#d8b36d]/80 to-transparent" />
            </span>
          )}
          <h1 className="fc-balance mt-3 text-4xl font-semibold tracking-[-0.02em] text-[#f4f6f7]">
            {data.restaurant.business_name}
          </h1>
          {data.restaurant.site_url ? (
            <a
              href={data.restaurant.site_url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-full border border-[#d8b36d]/45 bg-[#d8b36d]/10 px-5 text-xs font-semibold uppercase tracking-[0.18em] text-[#f4d99c] transition hover:bg-[#d8b36d]/20"
            >
              <ExternalLink size={14} strokeWidth={1.75} aria-hidden />
              Visit website
            </a>
          ) : null}
        </header>

        {brand.menuHero ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={brand.menuHero}
            alt={`${data.restaurant.business_name} ambiance`}
            className="mt-6 h-48 w-full rounded-[1.5rem] border border-[#d8b36d]/16 object-cover shadow-[0_36px_80px_-52px_rgba(0,0,0,0.85)] ring-1 ring-white/[0.04] sm:h-60"
          />
        ) : null}

        {data.promos.length > 0 ? (
          <div className="mt-6 space-y-2">
            {data.promos.map((promo, index) => (
              <p
                key={index}
                className="flex items-center justify-center gap-2 rounded-xl border border-[#d8b36d]/30 bg-[#d8b36d]/10 px-4 py-2.5 text-center text-sm text-[#f4d99c]"
              >
                <Sparkles size={13} strokeWidth={2} aria-hidden className="shrink-0" />
                {promo.text}
              </p>
            ))}
          </div>
        ) : null}

        {data.categories.length > 1 ? (
          <nav
            aria-label="Menu sections"
            className="sticky top-0 z-10 -mx-5 mt-8 flex gap-2 overflow-x-auto border-b border-[#d8b36d]/14 bg-[#060403]/85 px-5 py-3 backdrop-blur [scrollbar-width:none] sm:-mx-8 sm:px-8"
          >
            {data.categories.map((category) => (
              <a
                key={category.id}
                href={`#cat-${slugify(category.name)}`}
                className="shrink-0 rounded-full border border-[#cfd6da]/20 px-3.5 py-1.5 text-xs font-medium text-[#c8d0d4] transition hover:border-[#d8b36d]/60 hover:bg-[#d8b36d]/10 hover:text-[#f4d99c]"
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
                <h2 className="flex items-center gap-3 pb-2 text-sm font-semibold uppercase tracking-[0.22em] text-[#d8b36d]">
                  {category.name}
                  <span aria-hidden className="h-px flex-1 bg-gradient-to-r from-[#d8b36d]/35 to-transparent" />
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
                          className="h-16 w-16 shrink-0 rounded-xl border border-[#d8b36d]/14 object-cover ring-1 ring-white/[0.03] sm:h-20 sm:w-20"
                        />
                      ) : null}
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-[#eef2f4]">{item.name}</p>
                        {item.description ? (
                          <p className="mt-0.5 text-sm leading-5 text-[#aeb7bd]">{item.description}</p>
                        ) : null}
                      </div>
                      <span className="shrink-0 font-semibold tabular-nums text-[#f4d99c]">
                        {formatPrice(item.price)}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            ))
          )}
        </div>

        {data.hours.length > 0 ? (
          <section className="fc-panel fc-panel-warm mt-10 p-5 sm:p-6">
            <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.22em] text-[#d8b36d]">
              <Clock size={14} strokeWidth={1.75} aria-hidden />
              Hours
            </h2>
            <ul className="mt-3 space-y-1 text-sm text-[#c8d0d4]">
              {data.hours.map((h) => {
                const isToday = h.day_of_week === new Date().getDay();
                return (
                  <li
                    key={h.day_of_week}
                    className={`flex justify-between rounded-lg px-2 py-1 ${isToday ? "bg-[#d8b36d]/10 font-semibold text-[#f4d99c]" : ""}`}
                  >
                    <span>{DAYS[h.day_of_week]}{isToday ? " · Today" : ""}</span>
                    <span className="tabular-nums">
                      {h.is_closed ? "Closed" : `${formatTime(h.open_time)} – ${formatTime(h.close_time)}`}
                    </span>
                  </li>
                );
              })}
            </ul>
          </section>
        ) : null}

        <footer className="mt-12 border-t border-[#d8b36d]/12 pt-5 text-center text-[0.62rem] uppercase tracking-[0.3em] text-[#cfd6da]/35">
          Menu by Fina Calle
        </footer>
      </div>
    </main>
  );
}
