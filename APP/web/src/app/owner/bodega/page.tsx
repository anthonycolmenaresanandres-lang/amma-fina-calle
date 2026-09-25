import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import styles from "./page.module.css";

const MUFFIN_TERMS = "One free muffin per person for this promotion. In-store redemption only. Expires after one use or at the end of the day earned (Virginia Beach time), whichever comes first.";
export const metadata: Metadata = {
  title: "Bodega Cafe — owner desk",
  description: "Bodega menu, game and staff guide.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/owner/bodega" },
};

export default function BodegaOwnerHub() {
  return <main className={styles.page}>
    <div className={styles.shell}>
      <a className={styles.skip} href="#owner-tools">Skip to owner tools</a>
      <nav className={styles.nav} aria-label="Bodega owner navigation">
        <Image src="/assets/bodega/review/bodega-round-seal-review.webp" width={72} height={72} alt="Bodega Cafe" />
        <Link href="/demo/bodega">Guest menu ↗</Link>
      </nav>
      <header className={styles.hero}>
        <p className={styles.eyebrow}>Bodega Cafe · Virginia Beach</p>
        <h1>The Bodega<br />owner desk.</h1>
        <p>Your menu, your game, and the guide for a good shift. No login needed for this page.</p>
      </header>
      <section id="owner-tools" tabIndex={-1} aria-labelledby="links-title" className={styles.section}>
        <h2 id="links-title">Keep these handy.</h2>
        <div className={styles.links}>
          <Link href="/demo/bodega"><strong>Open the menu</strong><span>The customer-facing menu ↗</span></Link>
          <Link href="/bodega-sessions-review"><strong>Play Fall Rush</strong><span>Open the current Bodega game ↗</span></Link>
          <a href="/owner/bodega/qr" download="bodega-menu-qr.svg"><strong>Download menu QR</strong><span>Scalable SVG for your printed insert ↓</span></a>
        </div>
      </section>
      <section className={styles.offer} aria-labelledby="offer-title">
        <p className={styles.eyebrow}>Practice is open · Prize activation pending</p>
        <h2 id="offer-title">One win.<br />One muffin.</h2>
        <p>{MUFFIN_TERMS}</p>
        <p className={styles.notice}>Real claims stay off until the reward database, allowance and authorized staff access are ready. A practice win is not a coupon.</p>
      </section>
      <section className={styles.section} aria-labelledby="staff-title">
        <h2 id="staff-title">At the counter, once rewards launch.</h2>
        <p>Staff redemption is not live yet. This is the planned workflow, not authorization to give away muffins today.</p>
        <ol className={styles.steps}>
          <li><strong>Check the guest&apos;s claim.</strong><p>Open the protected staff tool and enter their code. Screenshots and score screens alone are not proof of a valid reward.</p></li>
          <li><strong>Confirm one per person.</strong><p>The guest must be in-store and must not have received a muffin from this promotion. Browser limits cannot identify someone using another phone.</p></li>
          <li><strong>Redeem, then hand over one muffin.</strong><p>Only a successful redemption authorizes fulfillment. Any muffin qualifies. Do not give another for a used or expired claim.</p></li>
        </ol>
        <p className={styles.notice}>Protected staff redemption is coming after setup and verification.</p>
        <p className={styles.small}>The welcome desk is public. Staff redemption requires an authorized Bodega account. No private customer, billing or account information is shown here.</p>
      </section>
      <section className={styles.section} aria-labelledby="help-title">
        <h2 id="help-title">If something goes wrong.</h2>
        <p>If verification times out, check the code again before fulfilling it. Never treat an error as a successful redemption. Ask the manager to handle exceptions and record them separately.</p>
        <Link href="/contact">Contact Fina Calle →</Link>
      </section>
      <footer className={styles.footer}>Bodega Cafe · Powered by Fina Calle</footer>
    </div>
  </main>;
}
