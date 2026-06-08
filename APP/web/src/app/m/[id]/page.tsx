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

        <div className="mt-8 space-y-8">
          {data.categories.length === 0 ? (
            <p className="text-center text-sm text-[#aeb7bd]">Menu coming soon.</p>
          ) : (
            data.categories.map((category) => (
              <section key={category.id}>
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
                          className="h-16 w-16 shrink-0 rounded-xl object-cover ring-1 ring-[#cfd6da]/12"
                        />
                      ) : null}
                      <div className="flex flex-1 items-start justify-between gap-4">
                        <div>
                          <p className="font-medium text-[#eef2f4]">{item.name}</p>
                          {item.description ? (
                            <p className="mt-0.5 text-sm text-[#aeb7bd]">{item.description}</p>
                          ) : null}
                        </div>
                        <span className="shrink-0 font-semibold text-[#f4f6f7]">
                          {formatPrice(item.price)}
                        </span>
                      </div>
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
              {data.hours.map((h) => (
                <li key={h.day_of_week} className="flex justify-between">
                  <span>{DAYS[h.day_of_week]}</span>
                  <span>{h.is_closed ? "Closed" : `${h.open_time ?? ""} – ${h.close_time ?? ""}`}</span>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>
    </main>
  );
}
