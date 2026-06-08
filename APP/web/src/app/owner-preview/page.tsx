import OwnerDashboard, { type DashboardData } from "@/app/owner/[id]/OwnerDashboard";

// Temporary, login-free design preview of the premium owner dashboard.
// Renders the real <OwnerDashboard> with SAMPLE data in read-only mode so the
// refined shell can be reviewed on a preview deploy without a session (owner
// auth uses a single Site URL, so real login can't run on a preview domain).
// Remove this route before the premium dashboard ships to production.

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Owner dashboard — preview | Fina Calle OS",
  robots: { index: false, follow: false },
};

const SAMPLE: DashboardData = {
  restaurantId: "colattao",
  businessName: "Colattao",
  siteUrl: null,
  email: "owner@colattao.com",
  logo: null,
  categories: [
    {
      id: "c1",
      name: "Coffee",
      items: [
        { id: "i1", name: "Mocha", description: null, price: 7, photo_url: "x", is_available: true },
        { id: "i2", name: "Latte", description: null, price: 5.5, photo_url: null, is_available: true },
        { id: "i3", name: "Cortado", description: null, price: 4.5, photo_url: null, is_available: false },
      ],
    },
    {
      id: "c2",
      name: "Pastries",
      items: [
        { id: "i4", name: "Croissant", description: null, price: 4, photo_url: null, is_available: true },
        { id: "i5", name: "Guava Pastry", description: null, price: 4, photo_url: "x", is_available: true },
      ],
    },
  ],
  promos: [{ id: "p1", text: "2x1 lattes every Tuesday", is_active: true }],
  audit: [
    {
      id: "a1",
      actor_email: "owner@colattao.com",
      table_name: "menu_items",
      field_name: "price",
      old_value: "7",
      new_value: "$8.00",
      created_at: new Date(Date.now() - 2 * 60000).toISOString(),
    },
    {
      id: "a2",
      actor_email: "owner@colattao.com",
      table_name: "menu_items",
      field_name: "is_available",
      old_value: "true",
      new_value: "Hidden",
      created_at: new Date(Date.now() - 95 * 60000).toISOString(),
    },
  ],
};

export default function OwnerDashboardPreview() {
  return (
    <main className="relative isolate min-h-dvh overflow-hidden bg-[#030405] px-5 py-10 text-[#f4f6f7] sm:px-8">
      <div className="absolute inset-0 -z-30 bg-[radial-gradient(circle_at_50%_18%,rgba(205,214,219,0.14),transparent_28%),radial-gradient(circle_at_18%_80%,rgba(216,179,109,0.08),transparent_26%),linear-gradient(145deg,#020303_0%,#0d1012_46%,#050607_100%)]" />
      <div className="relative mx-auto w-full max-w-3xl">
        <p className="mb-4 rounded-full border border-[#d8b36d]/30 bg-[#d8b36d]/10 px-4 py-1.5 text-center text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-[#f4d99c]">
          Design preview · sample data · controls inert
        </p>
        <OwnerDashboard data={SAMPLE} readOnly />
      </div>
    </main>
  );
}
