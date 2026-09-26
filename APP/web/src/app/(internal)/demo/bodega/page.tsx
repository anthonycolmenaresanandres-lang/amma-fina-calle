import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { BodegaMenuNav } from "./bodega-menu-nav";
import { classicDrinks, classicExtras, espressoDrinks, formatMenuPrice, draftMenuSections, publishedBusinessDetails } from "./menu-draft";
import { BodegaSignalLogo } from "./bodega-signal-logo";
import { FinaCalleSignature } from "./fina-calle-signature";
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

const shortDays: Record<string, string> = { "Monday - Friday": "Mon–Fri", Saturday: "Sat", Sunday: "Sun" };

export default function BodegaMenuReviewPage() {
  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <a className={styles.skipLink} href="#bodega-classics">Skip to menu prices</a>
        <header className={styles.hero}>
          <span className={styles.preview}>Preview</span>
          <h1 className={styles.srOnly}>Bodega Cafe menu</h1>
          <BodegaSignalLogo />
        </header>

        <BodegaMenuNav />
        <FallSessions />

        <div className={styles.menuGrid}>
          <section className={styles.menuSection} id="bodega-classics" aria-labelledby="bodega-classics-title">
            <header className={`${styles.sectionHeader} ${styles.textHeader}`}>
              <h2 id="bodega-classics-title">Bodega Classics</h2>
            </header>
            <ul className={styles.itemList}>
              {espressoDrinks.map((item) => <li className={styles.item} key={item.name}>
                <div className={styles.priceRow}>
                  <h3 className={styles.itemName}>{item.name}</h3>
                  <dl className={styles.espressoPrices}>{item.prices?.map((price) => <div key={price.label}>
                    <dt className={price.label ? undefined : styles.srOnly}>{price.label || "Price"}</dt>
                    <dd>{formatMenuPrice(price.cents)}</dd>
                  </div>)}</dl>
                </div>
              </li>)}
            </ul>
            <table className={styles.priceTable}>
              <caption className={styles.srOnly}>Bodega Classics prices by cup size, in US dollars</caption>
              <thead><tr><th scope="col">Drink</th><th scope="col">12 oz</th><th scope="col">16 oz</th></tr></thead>
              <tbody>{classicDrinks.map((item) => <tr key={item.name}>
                <th scope="row">{item.name}</th>
                {item.prices?.map((price) => <td key={price.label} className={price.cents === null ? styles.unknownPrice : undefined}>{formatMenuPrice(price.cents)}</td>)}
              </tr>)}</tbody>
            </table>
            <ul className={styles.extras} aria-label="Classic drink extras">
              {classicExtras.map((extra) => <li key={extra.name}><span>{extra.name}</span><span>+{formatMenuPrice(extra.cents)}</span></li>)}
            </ul>
            <p className={styles.sectionNote}>Ask us about sizes without a listed price.</p>
          </section>
          {draftMenuSections.map((section) => {
            return (
              <section className={styles.menuSection} id={section.id} key={section.id} aria-labelledby={`${section.id}-title`}>
                <header className={`${styles.sectionHeader} ${!section.art ? styles.textHeader : ""}`}>
                  <h2 id={`${section.id}-title`}>{section.title}</h2>
                  {section.art && <Image src={`/assets/bodega/menu/premium/${section.art}.webp`} alt="" width={640} height={640} sizes="(max-width: 700px) 150px, 240px" />}
                </header>
                <p className={styles.sectionNote}>{section.note}</p>
                <ul className={styles.itemList}>
                  {section.items.map((item) => <li className={styles.item} key={item.name}>
                    <h3 className={styles.itemName}>{item.name}</h3>
                    {item.description && <p className={styles.itemDescription}>{item.description}</p>}
                  </li>)}
                </ul>
              </section>
            );
          })}
        </div>

        <section className={styles.sessionsTeaser} aria-labelledby="fall-rush-title">
          <Image src="/assets/bodega/fall/cereal-bites.webp" alt="" width={120} height={120} sizes="(max-width: 700px) 72px, 100px" />
          <div><h2 id="fall-rush-title">Fall Rush</h2><p>Five 10-second rounds. Collect every café find.</p></div>
          <Link href="/bodega-sessions-review">Play Bodega Rush</Link>
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
            <FinaCalleSignature />
          </a>
          <details id="review-notes">
            <summary>Menu details</summary>
            <p>Preview menu transcribed from Bodega’s photographed boards and bakery labels. Listed prices come from the Classics board; ask the café for unlisted prices and current availability. The signature lineup is partial. Hours await confirmation. Artwork is illustrative.</p>
          </details>
        </footer>
      </div>
    </main>
  );
}
