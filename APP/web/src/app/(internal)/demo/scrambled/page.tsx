import type { Metadata } from "next";
import Image from "next/image";
import { Barlow_Condensed } from "next/font/google";
import { menuPriceLabel, scrambledBusiness, scrambledMenuGroups } from "./menu-data";
import { ScrambledMenuNav } from "./scrambled-menu-nav";
import styles from "./page.module.css";

const display = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-scrambled-display",
});

export const metadata: Metadata = {
  title: "Scrambled · Menu Preview",
  description: "Breakfast, brunch and Mediterranean favorites at Scrambled in Virginia Beach.",
  alternates: { canonical: "/scrambled/menu" },
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false, noimageindex: true },
  },
};

export default function ScrambledMenuPage() {
  return (
    <main className={`${styles.page} ${display.variable}`}>
      <a className={styles.skipLink} href="#breakfast">Skip to the menu</a>
      <div className={styles.patternRail} aria-hidden>
        {Array.from({ length: 12 }, (_, index) => <span key={index} />)}
      </div>
      <div className={styles.shell}>
        <header className={styles.hero}>
          <div className={styles.heroCopy}>
            <p className={styles.previewLabel}>Fina Calle menu preview</p>
            <div className={styles.wordmark} aria-label="Scrambled Diner and Bar" translate="no">
              <span className={styles.wordmarkSun} aria-hidden />
              <span className={styles.wordmarkMain}>Scrambled</span>
              <span className={styles.wordmarkSub}>Diner &amp; bar · Virginia Beach</span>
            </div>
            <h1>Breakfast All Day. Mediterranean Favorites.</h1>
            <p className={styles.heroLead}>A neighborhood diner by the Oceanfront, with a broad breakfast menu and the Mediterranean dishes regulars come back for.</p>
            <div className={styles.heroActions}>
              <a className={styles.primaryAction} href="#breakfast">View the Menu</a>
              <a className={styles.secondaryAction} href={scrambledBusiness.phoneHref}>Call {scrambledBusiness.phoneDisplay}</a>
            </div>
            <p className={styles.sourceNote}>Provisional menu transcribed from supplied photographs. Prices and availability require restaurant confirmation.</p>
          </div>
          <figure className={styles.heroPhoto}>
            <Image
              src="/assets/scrambled/scrambled-sandwich.png"
              alt="A toasted sandwich with a crisp filling and slaw on a white plate"
              width={357}
              height={232}
              priority
              sizes="(max-width: 759px) calc(100vw - 44px), 440px"
            />
            <figcaption>Breakfast, lunch and Mediterranean comfort food on Atlantic Avenue.</figcaption>
          </figure>
        </header>

        <ScrambledMenuNav />

        <div className={styles.menu}>
          {scrambledMenuGroups.map((group) => (
            <section className={styles.menuGroup} id={group.id} key={group.id} aria-labelledby={`${group.id}-title`}>
              <header className={styles.groupHeader}>
                <p>{group.eyebrow}</p>
                <h2 id={`${group.id}-title`}>{group.title}</h2>
                <span>{group.intro}</span>
              </header>

              <div className={styles.sectionGrid}>
                {group.sections.map((section) => (
                  <section className={styles.menuSection} id={section.id} key={section.id} aria-labelledby={`${section.id}-title`}>
                    <header className={styles.sectionHeader}>
                      <h3 id={`${section.id}-title`}>{section.title}</h3>
                      {section.note ? <p>{section.note}</p> : null}
                    </header>
                    <ul className={styles.itemList}>
                      {section.items.map((menuItem) => (
                        <li className={styles.menuItem} key={`${section.id}-${menuItem.name}`}>
                          <div className={styles.itemHeading}>
                            <h4>{menuItem.name}</h4>
                            <span className={menuItem.price ? styles.price : styles.unconfirmedPrice}>
                              {menuPriceLabel(menuItem.price)}
                            </span>
                          </div>
                          {menuItem.description ? <p>{menuItem.description}</p> : null}
                          {menuItem.variants ? <small>{menuItem.variants}</small> : null}
                        </li>
                      ))}
                    </ul>
                  </section>
                ))}
              </div>
            </section>
          ))}
        </div>

        <section className={styles.visit} id="visit" aria-labelledby="visit-title">
          <div>
            <p className={styles.visitKicker}>Oceanfront · Resort area</p>
            <h2 id="visit-title">Come Hungry.</h2>
            <p>{scrambledBusiness.address}</p>
            <p>{scrambledBusiness.hoursLabel}</p>
          </div>
          <div className={styles.visitActions}>
            <a href={scrambledBusiness.directionsUrl} target="_blank" rel="noreferrer">Get Directions <span aria-hidden>↗</span></a>
            <a href={scrambledBusiness.phoneHref}>Call the Restaurant <span aria-hidden>→</span></a>
          </div>
        </section>

        <footer className={styles.footer}>
          <a href="https://finacalleos.com" aria-label="Visit Fina Calle">
            <span>Menu by</span>
            <strong translate="no">Fina Calle</strong>
          </a>
          <details>
            <summary>About This Menu Preview</summary>
            <p>This first version was transcribed from Scrambled’s supplied laminated menus and checked on {scrambledBusiness.sourceChecked}. “Ask staff” means a price could not be read confidently from the source photograph; it does not mean the item is free or unavailable. Please tell your server about allergies or dietary needs.</p>
          </details>
        </footer>
      </div>
    </main>
  );
}
