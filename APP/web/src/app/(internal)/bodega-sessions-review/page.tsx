import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import BodegaSessionsClient from "./BodegaSessionsClient";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Bodega Vibra | Bodega Cafe",
  description: "Five fast rounds. Catch every café find, avoid Bad Vibes, and play Bodega Vibra.",
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
          <Link className={styles.menuAction} href="/demo/bodega" prefetch={false}>← BODEGA MENU</Link>
        </nav>
        <BodegaSessionsClient />

      </div>
    </main>
  );
}
