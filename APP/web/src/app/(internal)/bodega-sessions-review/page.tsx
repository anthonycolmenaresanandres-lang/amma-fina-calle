import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import BodegaSessionsClient from "./BodegaSessionsClient";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Bodega Fall Rush — cafecito weather",
  description: "A 20-second fall café game starring Spanish Latte, Iced Green Latte and Cereal Bites. Owner-review concept.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
};

export default function BodegaSessionsReviewPage() {
  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <nav className={styles.utilityRow} aria-label="Bodega navigation">
          <Link className={styles.identity} href="/demo/bodega"><Image src="/assets/bodega/review/bodega-round-seal-review.webp" width={38} height={38} alt="Bodega Cafe" /></Link>
          <Link href="/demo/bodega">Menu</Link>
        </nav>
        <BodegaSessionsClient />

        <p className={styles.evidenceNote}>Preview · Play for fun</p>
      </div>
    </main>
  );
}
