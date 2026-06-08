import { notFound } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getBrandAssets } from "@/lib/brand";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ id: string }> };

type PublicItem = {
  id: string;
  name: string;
  description: string | null;
  price: number | string;
  photo_url: string | null;
  sizes?: { label: string; price: number | string }[] | null;
};

type PublicMenu = {
  restaurant: { id: string; business_name: string; site_url: string | null };
  categories: { id: string; name: string; items: PublicItem[] }[];
  hours: { day_of_week: number; open_time: string | null; close_time: string | null; is_closed: boolean }[];
  promos: { text: string }[];
};

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function formatPrice(price: number | string) {
  const num = typeof price === "string" ? Number(price) : price;
  return Number.isFinite(num) && num > 0 ? `$${num.toFixed(2)}` : "Ask";
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  return { title: `Menu — ${id} | Fina Calle` };
}

export default async function PublicMenuPage({ params }: PageProps) {
  const { id } = await params;

  if (!isSupabaseConfigured) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-[#0a0604] px-6 text-center text-[#c9b79f]">
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
  const name = data.restaurant.business_name;
  const itemCount = data.categories.reduce((n, c) => n + c.items.length, 0);

  return (
    <main className="relative mx-auto min-h-dvh w-full max-w-[480px] bg-[#0c0705] text-[#f3e9da]">
      {/* Hero */}
      <section className="relative isolate overflow-hidden">
        <div className="absolute inset-0 -z-10">
          {brand.menuHero ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={brand.menuHero} alt="" className="h-full w-full object-cover object-[center_45%]" />
          ) : (
            <div className="h-full w-full bg-[radial-gradient(circle_at_50%_20%,#2a160c,#0c0705)]" />
          )}
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(12,7,5,0.45)_0%,rgba(12,7,5,0.65)_55%,rgba(12,7,5,0.98)_100%)]" />
        </div>
        <div className="flex flex-col items-center px-6 pb-10 pt-14 text-center">
          {brand.logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={brand.logo}
              alt={name}
              className="h-20 w-auto select-none drop-shadow-[0_18px_40px_rgba(0,0,0,0.7)]"
            />
          ) : (
            <p className="text-[0.7rem] uppercase tracking-[0.4em] text-[#d8b36d]">Menu</p>
          )}
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-[#fff7ea]">{name}</h1>
          {itemCount > 0 ? (
            <p className="mt-2 text-[0.7rem] uppercase tracking-[0.32em] text-[#d8b36d]/80">Menu</p>
          ) : null}
        </div>
      </section>

      <div className="relative px-4 pb-2">
        {/* Promos */}
        {data.promos.length > 0 ? (
          <div className="-mt-2 space-y-2">
            {data.promos.map((promo, i) => (
              <p
                key={i}
                className="rounded-2xl border border-[#d8b36d]/35 bg-[#d8b36d]/10 px-4 py-2.5 text-center text-sm font-medium text-[#f4d99c]"
              >
                {promo.text}
              </p>
            ))}
          </div>
        ) : null}

        {/* Category nav */}
        {data.categories.length > 1 ? (
          <nav
            aria-label="Menu categories"
            className="mt-5 flex gap-2 overflow-x-auto pb-1"
            style={{ scrollbarWidth: "none" }}
          >
            {data.categories.map((c) => (
              <a
                key={c.id}
                href={`#cat-${c.id}`}
                className="shrink-0 rounded-full border border-[#d8b36d]/45 bg-[#1c100a]/70 px-4 py-1.5 text-[0.68rem] uppercase tracking-[0.18em] text-[#f4d99c] transition hover:bg-[#2a160c]"
              >
                {c.name}
              </a>
            ))}
          </nav>
        ) : null}

        {/* Categories */}
        <div className="mt-6 space-y-8">
          {data.categories.length === 0 ? (
            <p className="text-center text-sm text-[#c9b79f]">Menu coming soon.</p>
          ) : (
            data.categories.map((category) => (
              <section key={category.id} id={`cat-${category.id}`} className="scroll-mt-6">
                <div className="flex items-center gap-3">
                  <h2 className="text-sm font-semibold uppercase tracking-[0.24em] text-[#d8b36d]">
                    {category.name}
                  </h2>
                  <span className="h-px flex-1 bg-[linear-gradient(90deg,rgba(216,179,109,0.4),transparent)]" />
                </div>

                <ul className="mt-4 space-y-3">
                  {category.items.map((item) => (
                    <li
                      key={item.id}
                      className="flex items-start gap-3.5 rounded-2xl border border-white/[0.06] bg-[#150d08]/60 p-3"
                    >
                      {item.photo_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.photo_url}
                          alt={item.name}
                          className="h-16 w-16 shrink-0 rounded-xl object-cover ring-1 ring-[#d8b36d]/15"
                        />
                      ) : null}
                      <div className="flex min-w-0 flex-1 items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-medium leading-tight text-[#fff7ea]">{item.name}</p>
                          {item.description ? (
                            <p className="mt-1 text-[0.8rem] leading-snug text-[#c9b79f]/90">
                              {item.description}
                            </p>
                          ) : null}
                          {Array.isArray(item.sizes) && item.sizes.length > 0 ? (
                            <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-[0.8rem]">
                              {item.sizes.map((s, i) => (
                                <span key={i} className="text-[#c9b79f]">
                                  {s.label}{" "}
                                  <span className="font-mono font-bold text-[#e9c982]">
                                    {formatPrice(s.price)}
                                  </span>
                                </span>
                              ))}
                            </div>
                          ) : null}
                        </div>
                        {!(Array.isArray(item.sizes) && item.sizes.length > 0) ? (
                          <span className="shrink-0 font-mono text-sm font-bold tracking-tight text-[#e9c982]">
                            {formatPrice(item.price)}
                          </span>
                        ) : null}
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            ))
          )}
        </div>

        {/* Hours */}
        {data.hours.length > 0 ? (
          <section className="mt-10">
            <div className="flex items-center gap-3">
              <h2 className="text-sm font-semibold uppercase tracking-[0.24em] text-[#d8b36d]">Hours</h2>
              <span className="h-px flex-1 bg-[linear-gradient(90deg,rgba(216,179,109,0.4),transparent)]" />
            </div>
            <ul className="mt-3 space-y-1.5 text-sm text-[#d8cbb6]">
              {data.hours.map((h) => (
                <li key={h.day_of_week} className="flex justify-between">
                  <span>{DAYS[h.day_of_week]}</span>
                  <span className="text-[#c9b79f]">
                    {h.is_closed ? "Closed" : `${h.open_time ?? ""} – ${h.close_time ?? ""}`}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {/* Footer */}
        <footer className="mt-12 flex flex-col items-center gap-1 pb-12 text-center">
          <span className="h-px w-16 bg-[linear-gradient(90deg,transparent,rgba(216,179,109,0.5),transparent)]" />
          <a
            href={`/owner/${id}`}
            className="mt-5 inline-flex items-center gap-1.5 rounded-full border border-[#d8b36d]/35 bg-[#1c100a]/60 px-4 py-1.5 text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-[#f4d99c] transition hover:border-[#d8b36d]/70 hover:text-[#fff7ea]"
          >
            ⌂ Owner portal
          </a>
          <p className="mt-6 text-[0.56rem] uppercase tracking-[0.3em] text-[#9c8a72]">
            Powered by
          </p>
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-[#d8b36d]/80">
            Fina Calle OS
          </p>
        </footer>
      </div>
    </main>
  );
}
