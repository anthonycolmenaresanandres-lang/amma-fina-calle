"use client";

import { useState } from "react";
import MenuQuickEdit from "@/app/owner/[id]/MenuQuickEdit";
import type { MenuCategory } from "@/app/owner/[id]/OwnerDashboard";
import { LAS_PALMAS_RESTAURANT_ID, type MenuEdit } from "@/lib/owner/menu-control";
import { publicMenuSections } from "@/lib/owner/public-menu-adapter";
import { lasPalmasLynnhavenMenuSections } from "@/table-os/menu/las-palmas-lynnhaven";
import AccountInfo from "@/app/owner/[id]/AccountInfo";
import BillingCard from "@/app/owner/[id]/BillingCard";
import type { BillingSummary } from "@/lib/billing/types";

const pendingBilling: BillingSummary = {
  plan: "Pilot terms pending", status: "not_started", recurringEnabled: false,
  amountCents: null, currency: null, billingInterval: null, billingIntervalCount: null,
  latestInvoiceStatus: null, lastPaymentAt: null, currentPeriodEnd: null,
  nextPaymentAt: null, scheduledFirstChargeOn: null, actionsEnabled: false,
};

const initial: MenuCategory[] = [{ id: "pilot-category", name: "Pilot sample · prices unconfirmed", items: lasPalmasLynnhavenMenuSections[0].items.slice(0, 3).map((item, index) => ({
  id: `00000000-0000-4000-8000-${String(index + 1).padStart(12, "0")}`, name: item.name, description: item.description ?? null, price: item.priceCents / 100, is_available: true, photo_url: null, sizes: [],
})) }];

export default function PilotWorkspace() {
  const [categories, setCategories] = useState(initial);
  function demoChange(change: MenuEdit) {
    setCategories(current => current.map(category => ({ ...category, items: category.items.map(item => item.id !== change.itemId ? item : {
      ...item, [change.field]: change.field === "is_available" ? change.value === "true" : change.value,
    }) })));
  }
  const guest = publicMenuSections({ restaurant: { id: LAS_PALMAS_RESTAURANT_ID }, categories }, LAS_PALMAS_RESTAURANT_ID);
  return <main className="min-h-dvh bg-[#0d171d] px-5 py-9 text-[#eef2f4] sm:px-8">
    <a href="#pilot-editor" className="sr-only focus:not-sr-only">Skip to menu editor</a>
    <div className="mx-auto max-w-6xl">
      <header className="mb-8 border-b border-[#526774] pb-7">
        <p className="text-xs font-semibold uppercase tracking-[.18em] text-[#f0d79c]">Local pilot workspace · not an active account</p>
        <h1 className="mt-3 text-3xl font-semibold">Las Palmas: change the menu, keep the QR.</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-[#c0c9ce]">Try a price change or mark an item sold out. The guest preview uses the same menu adapter. Samples are unconfirmed public-source data; reload to reset. Nothing is saved or sent.</p>
        <nav aria-label="Pilot preview sections" className="mt-5 flex flex-wrap gap-3 text-sm">
          <a href="#pilot-editor" className="inline-flex min-h-11 items-center px-2 text-[#f0d79c] underline underline-offset-4 focus-visible:outline-2">Menu controls</a>
          <a href="#pilot-account" className="inline-flex min-h-11 items-center px-2 text-[#f0d79c] underline underline-offset-4 focus-visible:outline-2">Account &amp; billing</a>
        </nav>
      </header>
      <div className="grid gap-12 lg:grid-cols-[1.1fr_1fr]">
        <section id="pilot-editor" className="min-w-0 scroll-mt-5" aria-labelledby="pilot-owner-title">
          <h2 id="pilot-owner-title" className="mb-4 text-xl font-semibold">Owner controls</h2>
          <MenuQuickEdit restaurantId={LAS_PALMAS_RESTAURANT_ID} categories={categories} previewOnly onDemoChange={demoChange} />
        </section>
        <section className="min-w-0" aria-labelledby="pilot-guest-title" aria-live="polite">
          <p className="text-xs uppercase tracking-[.12em] text-[#c0c9ce]">Guest-side preview · local sample</p>
          <h2 id="pilot-guest-title" className="mt-2 text-xl font-semibold">The same QR. The updated menu.</h2>
          <p className="mt-2 break-all text-xs leading-5 text-[#c0c9ce]">Stable planned destination: finacalleos.com/demo/las-palmas</p>
          <ul className="mt-6 divide-y divide-[#526774]">{guest.flatMap(category => category.items).map(item => <li key={item.name} className="py-4"><div className="flex items-baseline justify-between gap-4"><span className="min-w-0 break-words font-semibold">{item.name}</span><span className="shrink-0 tabular-nums text-[#f0d79c]">{item.priceDisplay}</span></div>{item.description ? <p className="mt-2 break-words text-sm leading-6 text-[#c0c9ce]">{item.description}</p> : null}</li>)}</ul>
          {guest.length === 0 ? <p className="mt-5">No available sample items.</p> : null}
          <p className="mt-6 border-l-2 border-[#d5b56e] pl-3 text-xs leading-6 text-[#f0d79c]">Activation still requires confirmed location/menu, authorized owner access, a verified database write/readback, and approval to release. This demo does not certify those gates.</p>
        </section>
      </div>
      <section id="pilot-account" tabIndex={-1} aria-labelledby="pilot-account-title" className="mt-12 scroll-mt-5 border-t border-[#526774] pt-8">
        <h2 id="pilot-account-title" className="mb-6 text-2xl font-semibold">Account &amp; billing</h2>
        <div className="grid min-w-0 gap-8 lg:grid-cols-[1.1fr_1fr]">
          <div className="min-w-0"><AccountInfo businessName="Las Palmas · location pending" email={null} profile={null} preview /></div>
          <BillingCard restaurantId={LAS_PALMAS_RESTAURANT_ID} billing={pendingBilling} readOnly />
        </div>
      </section>
    </div>
  </main>;
}
