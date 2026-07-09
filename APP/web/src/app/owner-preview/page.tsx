import OwnerDashboard, { type DashboardData } from "@/app/owner/[id]/OwnerDashboard";

// Temporary, login-free design preview of the premium owner dashboard.
// Renders the real OwnerDashboard with sample data in read-only mode so the
// refined shell can be reviewed before it ships to production.

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Owner dashboard preview | Fina Calle OS",
  robots: { index: false, follow: false },
};

const SAMPLE: DashboardData = {
  restaurantId: "colattao",
  businessName: "Colattao",
  siteUrl: null,
  email: "owner@colattao.com",
  logo: "/assets/colattao/colattao-logo-cream-1600.png",
  categories: [
    {
      id: "c1",
      name: "Menu",
      items: [
        { id: "i1", name: "Featured item one", description: null, price: 7, photo_url: "/assets/colattao/colattao-menu-hero-4x5-v1.webp", is_available: true },
        { id: "i2", name: "Featured item two", description: null, price: 5.5, photo_url: "/assets/colattao/colattao-menu-hero-4x5-v1.webp", is_available: true, sizes: [{ label: "Small", price: 5.5 }, { label: "Large", price: 6.5 }] },
        { id: "i3", name: "Featured item three", description: null, price: 4.5, photo_url: "/assets/colattao/colattao-menu-hero-4x5-v1.webp", is_available: false },
      ],
    },
    {
      id: "c2",
      name: "Additional items",
      items: [
        { id: "i4", name: "Croissant", description: null, price: 4, photo_url: null, is_available: true },
        { id: "i5", name: "Guava Pastry", description: null, price: 4, photo_url: null, is_available: true },
      ],
    },
  ],
  promos: [{ id: "p1", text: "2x1 lattes every Tuesday", is_active: true }],
  billing: {
    configured: true,
    stripeReady: true,
    customerId: "cus_preview",
    priceConfigured: true,
    billingEmail: "owner@colattao.com",
    planLabel: "Fina Calle OS Monthly",
    subscriptionStatus: "active",
    balanceDueCents: 14900,
    currency: "usd",
    openInvoiceCount: 1,
    latestInvoiceUrl: "https://pay.stripe.com/preview",
    latestInvoiceLabel: "FC 1001",
    message: null,
    updatedAt: new Date().toISOString(),
  },
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
      field_name: "sizes:Large",
      old_value: "6.50",
      new_value: "7.00",
      created_at: new Date(Date.now() - 40 * 60000).toISOString(),
    },
    {
      id: "a3",
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
    <main className="relative isolate min-h-dvh overflow-hidden bg-[#030405] px-4 py-8 text-[#f4f6f7] sm:px-6 lg:px-8">
      <div className="absolute inset-0 -z-30 bg-[linear-gradient(145deg,#020303_0%,#0b0f12_44%,#050607_100%)]" />
      <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_18%_8%,rgba(216,179,109,0.12),transparent_28%),radial-gradient(circle_at_84%_12%,rgba(127,209,162,0.08),transparent_24%)]" />
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:44px_44px] opacity-35" />
      <div className="relative mx-auto w-full max-w-6xl">
        <p className="mb-4 inline-flex rounded-md border border-[#d8b36d]/28 bg-[#d8b36d]/10 px-3 py-1.5 text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-[#f4d99c]">
          Private review surface
        </p>
        <OwnerDashboard data={SAMPLE} readOnly />
      </div>
    </main>
  );
}
