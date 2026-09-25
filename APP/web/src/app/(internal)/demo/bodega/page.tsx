import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { BodegaMenuNav } from "./bodega-menu-nav";
import { draftMenuSections, publishedBusinessDetails } from "./menu-draft";
import { BodegaSignalLogo } from "./bodega-signal-logo";
import { FallSessions } from "./fall-sessions";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Bodega Cafe · Menu",
  description: "Live owner-review concept. Items, prices, and branding require owner approval.",
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

const sectionPresentation: Record<string, { title: string; art: string }> = {
  "signature-cafecito": { title: "Cafecito", art: "cafecito" },
  "morning-bites": { title: "Bites", art: "bites" },
  "bakery-case": { title: "Bakery", art: "bakery" },
};
const shortDays: Record<string, string> = { "Monday - Friday": "Mon–Fri", Saturday: "Sat", Sunday: "Sun" };

export default function BodegaMenuReviewPage() {
  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <header className={styles.hero}>
          <span className={styles.preview}>Preview</span>
          <h1 className={styles.srOnly}>Bodega Cafe menu</h1>
          <BodegaSignalLogo />
        </header>

        <BodegaMenuNav />
        <FallSessions />

        <div className={styles.menuGrid}>
          {draftMenuSections.map((section) => {
            const presentation = sectionPresentation[section.id];
            return (
              <section className={styles.menuSection} id={section.id} key={section.id} aria-labelledby={`${section.id}-title`}>
                <header className={styles.sectionHeader}>
                  <h2 id={`${section.id}-title`}>{presentation.title}</h2>
                  <Image src={`/assets/bodega/menu/premium/${presentation.art}.webp`} alt="" width={640} height={640} sizes="(max-width: 700px) 150px, 240px" />
                </header>
                <ul className={styles.itemList}>
                  {section.items.map((item) => <li className={styles.item} key={item.name}>{item.name}</li>)}
                </ul>
              </section>
            );
          })}
        </div>

        <section className={styles.sessionsTeaser} aria-labelledby="fall-rush-title">
          <Image src="/assets/bodega/fall/cereal-bites.webp" alt="" width={120} height={120} sizes="(max-width: 700px) 72px, 100px" />
          <div><h2 id="fall-rush-title">Fall Rush</h2><p>20 seconds. Tap to catch.</p></div>
          <Link href="/bodega-sessions-review">Play</Link>
        </section>

        <section className={styles.hours} id="hours" aria-labelledby="visit-title">
          <div>
            <h2 id="visit-title">Visit</h2>
            <p className={styles.address}>{publishedBusinessDetails.address}</p>
            <div className={styles.visitLinks}>
              <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(publishedBusinessDetails.address)}`} target="_blank" rel="noreferrer">Directions</a>
              <a href={publishedBusinessDetails.instagramUrl} target="_blank" rel="noreferrer">Instagram</a>
            </div>
          </div>
          <ul className={styles.hoursList}>
            {publishedBusinessDetails.hours.map((entry) => (
              <li key={entry.days}><span>{shortDays[entry.days] ?? entry.days}</span><span>{entry.time}</span></li>
            ))}
          </ul>
        </section>

        <footer className={styles.footer}>
          <a className={styles.poweredBy} href="https://finacalleos.com" aria-label="Powered by Fina Calle — visit finacalleos.com">
            <span>Powered by</span>
            <Image src="/assets/fina-calle/emblem-colattao.webp" alt="Fina Calle OS" width={456} height={488} sizes="144px" loading="lazy" />
          </a>
          <details id="review-notes">
            <summary>Menu details</summary>
            <p>Preview menu. Fall drink names come from Bodega’s board. Other items, prices, hours and availability await confirmation. Artwork is illustrative.</p>
          </details>
        </footer>
      </div>
    </main>
  );
}
