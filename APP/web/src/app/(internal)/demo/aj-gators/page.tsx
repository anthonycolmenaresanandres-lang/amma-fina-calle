import type { Metadata } from "next";
import Image from "next/image";
import GameHub from "./GameHub";
import { cocktailFeatures, seasonalSpecials, weeklySpecials } from "./menu-data";
import styles from "./portal.module.css";

const liveMenuUrl = "https://www.gatorssportsbar.com/currentmenu?menu=a-j-gators-menu";

export const metadata: Metadata = {
  title: "A.J. Gator's Holland Road | Guest portal concept",
  description: "Unlisted Holland Road landing concept with the official live menu, promotions and three playable table games.",
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

export default function AjGatorsDemoPage(): React.JSX.Element {
  return (
    <main className={styles.portal}>
      <a className={styles.skipLink} href="#actions">Skip to actions</a>

      <header className={styles.hero}>
        <div className={styles.heroTopline}>
          <span>Holland Road</span>
          <span>Pending client approval</span>
        </div>
        <div className={styles.heroCenter}>
          <div className={styles.logoStage}>
            <Image
              className={styles.brandLogo}
              src="/assets/aj-gators/aj-gators-logo-official.png"
              width={500}
              height={500}
              priority
              alt="A.J. Gator's Sports Bar & Grill"
            />
          </div>
          <nav id="actions" className={styles.heroActions} aria-label="Guest portal">
            <a className={styles.heroAction} href={liveMenuUrl} target="_blank" rel="noreferrer">
              <span>Menu</span><span aria-hidden="true">↗</span>
            </a>
            <a className={styles.heroAction} href="#games">
              <span>Games</span><span aria-hidden="true">↓</span>
            </a>
            <a className={styles.heroAction} href="#specials">
              <span>Promotions</span><span aria-hidden="true">↓</span>
            </a>
          </nav>
        </div>
      </header>

      <section id="games" className={`${styles.anchorTarget} ${styles.gamesSection}`} aria-labelledby="games-title">
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <p className={styles.eyebrow}>Pick one</p>
            <h2 id="games-title" className={styles.sectionTitle}>Games</h2>
          </div>
          <GameHub />
        </div>
      </section>

      <section id="specials" className={`${styles.anchorTarget} ${styles.specialsSection}`} aria-labelledby="specials-title">
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <p className={styles.eyebrow}>Holland Road</p>
            <h2 id="specials-title" className={styles.sectionTitle}>Promotions</h2>
          </div>

          <div className={styles.specialsGrid}>
            {weeklySpecials.map((special) => (
              <article key={special.day} className={styles.specialRow}>
                <p className={styles.specialDay}>{special.day}</p>
                <h3 className={styles.specialTitle}>{special.title}</h3>
                <p className={styles.specialDetail}>{special.detail}</p>
                <p className={styles.specialStatus}>{special.status}</p>
              </article>
            ))}
          </div>

          <div className={styles.featureGrid}>
            <div>
              <p className={styles.eyebrow}>Seasonal</p>
              {seasonalSpecials.map((special) => (
                <article key={special.title} className={styles.specialRow}>
                  <div className="flex items-baseline justify-between gap-4">
                    <h3 className={styles.specialTitle}>{special.title}</h3>
                    <strong className={styles.menuPrice}>{special.price}</strong>
                  </div>
                  <p className={styles.specialDetail}>{special.detail}</p>
                </article>
              ))}
            </div>

            <div>
              <p className={styles.eyebrow}>21+</p>
              <div className={styles.cocktailList}>
                {cocktailFeatures.map((drink) => <p key={drink}>{drink}</p>)}
              </div>
              <p className={styles.responsibleNote}>Owner confirmation required. No alcohol rewards.</p>
            </div>
          </div>
        </div>
      </section>

      <footer className={styles.footer}>
        <span>Owner review · Unlisted · Promotions pending confirmation</span>
        <span>No orders · No payments · No POS · No prizes</span>
      </footer>
    </main>
  );
}
