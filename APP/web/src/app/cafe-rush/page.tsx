// Café Rush — internal prospect demo entry point. Unlinked from the public
// site (no nav link, no sitemap entry) and `noindex,nofollow,nocache` so the
// prospect demo can only be reached by direct URL / QR handoff.
//
// Guardrail-clean: no Client OS route (`/m`, `/owner`, `/customers`), no
// Supabase, Stripe, POS, secret, customer data, or QR-destination change. This
// is a NEW additive route (`/cafe-rush`), not a rename or a QR migration.

import type { Metadata } from "next";
import CafeRushClient from "./CafeRushClient";

export const metadata: Metadata = {
  title: "Café Rush · Fina Calle OS",
  description:
    "Café Rush — the reusable catch mini-game skinned for Colattao, Las Palmas, and A.J. Gator's. Prospect demo, pending client approval.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false },
  },
};

type PageProps = { searchParams?: Promise<{ skin?: string }> };

export default async function CafeRushPage({ searchParams }: PageProps): Promise<React.JSX.Element> {
  // Optional deep link (?skin=colattao|laspalmas|ajgators). Unknown ids fall
  // back to the default skin (matches the penalty-shootout entry point).
  const { skin } = searchParams ? await searchParams : {};
  return <CafeRushClient initialSkinId={skin} />;
}
