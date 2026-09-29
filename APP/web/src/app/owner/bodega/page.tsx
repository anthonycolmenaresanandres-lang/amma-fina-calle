import type { Metadata, Viewport } from "next";
import Image from "next/image";
import Link from "next/link";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Bodega Cafe — owner desk",
  description: "Bodega menu and owner tools.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/owner/bodega" },
};
export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#faf9f5" };

export default function BodegaOwnerHub() {
  return <main className={styles.page}>
    <div className={styles.shell}>
      <a className={styles.skip} href="#owner-tools">Skip to owner tools</a>
      <nav className={styles.nav} aria-label="Bodega owner navigation">
        <div className={styles.brand}>
          <Image src="/assets/bodega/review/bodega-round-seal-review.webp" width={72} height={72} alt="Bodega Cafe" />
          <span>Owner desk</span>
        </div>
        <div className={styles.navLinks}>
          <Link href="/contact">Help</Link>
          <Link href="/owner/bodega/billing">Owner sign in ↗</Link>
        </div>
      </nav>
      <header className={styles.hero}>
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>Bodega Cafe · Virginia Beach</p>
          <h1>Your café.<br />Within reach.</h1>
          <p>The menu and tools for your day.</p>
          <Link className={styles.menuAction} href="/demo/bodega">View live menu <span aria-hidden>↗</span></Link>
          <small>Opens without signing in.</small>
        </div>
        <Image className={styles.heroArt} src="/assets/bodega/menu/fall-sessions-hero.webp" width={720} height={480} alt="Bodega fall coffee selection with a vinyl record" priority />
      </header>
      <section id="owner-tools" tabIndex={-1} aria-labelledby="links-title" className={styles.section}>
        <h2 id="links-title">Owner tools</h2>
        <div className={styles.links}>
          <a href="/owner/bodega/qr" download="bodega-menu-qr.svg"><strong>Menu QR</strong><span>Download for your counter</span><b aria-hidden>↓</b></a>
          <Link href="/owner/bodega/billing"><strong>Your Basic plan</strong><span>Billing and automatic payments</span><b aria-hidden>→</b></Link>
          <Link href="/owner/bodega/insights"><strong>Square connection</strong><span>Menu and sales insights</span><b aria-hidden>→</b></Link>
          <Link href="/bodega-sessions-review"><strong>Bodega Vibra</strong><span>Open the current café game</span><b aria-hidden>↗</b></Link>
          <Link href="/owner/guide"><strong>Owner guide</strong><span>Sign-in help and everyday essentials</span><b aria-hidden>→</b></Link>
        </div>
      </section>
      <footer className={styles.footer}><span>Bodega Cafe · Powered by Fina Calle</span><Link href="/contact">Contact Fina Calle ↗</Link></footer>
    </div>
  </main>;
}
