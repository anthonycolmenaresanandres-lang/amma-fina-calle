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
      <div className={styles.reviewBar}>Fall game concept / owner review</div>

      <div className={styles.shell}>
        <nav className={styles.utilityRow} aria-label="Bodega navigation">
          <Link className={styles.identity} href="/demo/bodega"><Image src="/assets/bodega/review/bodega-round-seal-review.webp" width={38} height={38} alt="Bodega Cafe" /> BODEGA</Link>
          <Link href="/demo/bodega">← Menu</Link>
        </nav>
        <header className={styles.hero}>
          <div><span className={styles.kicker}>The neighborhood’s coziest challenge</span><h1>Fall <em>Rush.</em></h1></div>
          <p>Spanish Latte. Iced Green Latte. Cereal Bites. Your fall shift starts here.</p>
        </header>

        <BodegaSessionsClient />

        <aside className={styles.evidenceNote}>
          <p>
            Owner-review game concept. Featured names are game selections; current availability requires Bodega’s confirmation.
            Scores are just for fun and do not unlock a discount or reward.
          </p>
        </aside>
      </div>
    </main>
  );
}
