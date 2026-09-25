import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { Barlow_Condensed } from "next/font/google";
import GruaClient from "./GruaClient";
import styles from "./page.module.css";

const display = Barlow_Condensed({ subsets: ["latin"], weight: "800", display: "swap", variable: "--font-grua-display" });

export const metadata: Metadata = {
  title: "Grúa — cable crane lab",
  description: "Fly a four-cable crane over a café floor. Internal R&D build; optional, on-device robot-training recording.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false, noimageindex: true },
  },
};

export const viewport: Viewport = { themeColor: "#07090b", colorScheme: "dark" };

export default function GruaLabPage() {
  return (
    <main className={`${styles.page} ${display.variable}`}>
      <a className={styles.skip} href="#grua-game">Skip to the game</a>
      <div className={styles.shell}>
        <nav className={styles.utility} aria-label="Lab navigation">
          <span className={styles.mark} translate="no">Fina Calle · R&amp;D</span>
          <Link href="/command-center">Command Center</Link>
        </nav>
        <header className={styles.intro}>
          <h1 translate="no">Grúa</h1>
          <p>Fly a four-cable crane over the café after close. Clear the floor before the morning rush.</p>
        </header>
        <GruaClient />
        <footer className={styles.source}>
          <p>
            Crane physics follow the open-source Stringman cable robot (Apache-2.0): its room geometry, speed and
            acceleration limits, pole swing and 16 N line safety limit.
          </p>
        </footer>
      </div>
    </main>
  );
}
