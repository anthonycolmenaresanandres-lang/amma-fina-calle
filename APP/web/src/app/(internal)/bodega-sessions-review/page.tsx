import type { Metadata } from "next";
import Link from "next/link";
import BodegaSessionsClient from "./BodegaSessionsClient";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Bodega Sessions rhythm game - owner review",
  description: "Unlinked owner-review rhythm-game prototype. Event content and brand usage require owner approval.",
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
      <div className={styles.reviewBar}>Prototype / owner review / event link withheld</div>

      <div className={styles.shell}>
        <header className={styles.hero}>
          <div className={styles.utilityRow}>
            <Link href="/demo/bodega">Back to menu review</Link>
            <span>Side A / three rounds</span>
          </div>
          <span className={styles.kicker}>Bodega Sessions</span>
          <h1>Catch the beat.</h1>
          <p>
            Listen to the cafecito pattern. Repeat it before the signal moves on. Twelve beats, three quick rounds.
          </p>
        </header>

        <BodegaSessionsClient />

        <aside className={styles.evidenceNote}>
          <strong>Review boundary</strong>
          <p>
            The prototype uses original generated tones and abstract graphics only. No event, artist, song, offer, or
            owner approval is claimed. The final music or event action stays disabled until Bodega confirms the exact
            title and destination.
          </p>
        </aside>
      </div>
    </main>
  );
}
