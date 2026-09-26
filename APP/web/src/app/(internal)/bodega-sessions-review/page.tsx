import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import BodegaSessionsClient from "./BodegaSessionsClient";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Bodega Fall Rush | Bodega Cafe",
  description: "Five rounds, ten seconds each. Catch every café find and avoid Bad Vibes in Bodega Fall Rush.",
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
        <a className={styles.skipLink} href="#fall-game">Skip to game</a>
        <nav className={styles.utilityRow} aria-label="Bodega navigation">
          <Link className={styles.identity} href="/demo/bodega"><Image src="/assets/bodega/review/bodega-round-seal-review.webp" width={38} height={38} alt="Bodega Cafe" /></Link>
          <Link href="/demo/bodega" prefetch={false}>← Back to menu</Link>
        </nav>
        <BodegaSessionsClient />

      </div>
    </main>
  );
}
