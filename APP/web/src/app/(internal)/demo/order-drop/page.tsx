import type { Metadata } from "next";
import { Fraunces, Hanken_Grotesk, DM_Mono } from "next/font/google";
import OrderDropDemo from "./OrderDropDemo";
import styles from "./order-drop.module.css";

// Order Drop prospect demo — the lightest slice of the PR #220 Instagram DM
// ordering plan: one featured promo item (Colattao Churro Latte) that hands the
// customer straight to Uber Eats, where payment + delivery already exist.
// Static preview only: no Supabase, no Stripe, no Meta, no order backend, and
// no Client OS routes (/m, /owner, /customers). Unlinked + noindex. All art is
// original CSS/SVG; no third-party logos are reproduced. The illustrative
// "Uber Eats" handoff screen is a representation only — the real CTA opens
// ubereats.com. See PRODUCT_MODULES/INSTAGRAM_DM_ORDERING_PLAN.md.

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-fraunces",
});
const hanken = Hanken_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-hanken",
});
const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
  variable: "--font-dmmono",
});

export const metadata: Metadata = {
  title: "Order Drop · Colattao concept | Fina Calle OS",
  description:
    "Private prospect concept: one featured item promoted on Instagram, handed straight to Uber Eats for a seamless order. Demonstration only.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false, noimageindex: true },
  },
};

export default function OrderDropDemoPage(): React.JSX.Element {
  return (
    <main className={`${fraunces.variable} ${hanken.variable} ${dmMono.variable} ${styles.page}`}>
      <OrderDropDemo />
    </main>
  );
}
