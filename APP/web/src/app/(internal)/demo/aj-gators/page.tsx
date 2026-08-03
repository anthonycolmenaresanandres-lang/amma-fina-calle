import type { Metadata } from "next";
import Image from "next/image";
import { Baloo_2, Luckiest_Guy } from "next/font/google";
import GameHub from "./GameHub";
import GuestNoteForm from "./GuestNoteForm";
import { cocktailFeatures, seasonalSpecials, weeklySpecials, weeklySpecialsStatus } from "./menu-data";
import styles from "./portal.module.css";

// Brand type matched to the official logo: "Gator's" is bouncy chunky cartoon
// display lettering, so headings + buttons use Luckiest Guy (single 400 weight)
// and running text uses Baloo 2, the readable rounded cousin of the same voice.
const gatorDisplay = Luckiest_Guy({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  variable: "--font-gator-display",
});

const gatorBody = Baloo_2({
  subsets: ["latin"],
  weight: "variable",
  display: "swap",
  variable: "--font-gator-body",
});

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
    <main className={`${gatorDisplay.variable} ${gatorBody.variable} ${styles.portal}`}>
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
              Menu
            </a>
            <a className={styles.heroAction} href="#specials">
              Promotions
            </a>
            <a className={styles.heroAction} href="#games">
              Games
            </a>
          </nav>
        </div>
      </header>

      <section id="specials" className={`${styles.anchorTarget} ${styles.specialsSection}`} aria-labelledby="specials-title">
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <p className={styles.eyebrow}>This week on Holland Road</p>
            <h2 id="specials-title" className={styles.sectionTitle}>Promotions</h2>
          </div>

          <div className={styles.promoBoard}>
            {weeklySpecials.map((special) => (
              <article key={special.day} className={styles.promoRow}>
                <p className={styles.promoDay}>{special.day}</p>
                <div className={styles.promoHeadline}>
                  <h3 className={styles.promoTitle}>{special.title}</h3>
                  <strong className={styles.promoDeal}>{special.deal}</strong>
                </div>
                <p className={styles.promoDetail}>{special.detail}</p>
              </article>
            ))}
          </div>
          <p className={styles.promoStatus}>{weeklySpecialsStatus}</p>

          <div className={styles.featureGrid}>
            <div>
              <p className={styles.eyebrow}>Seasonal</p>
              {seasonalSpecials.map((special) => (
                <article key={special.title} className={styles.promoRow}>
                  <div className={styles.promoHeadline}>
                    <h3 className={styles.promoTitle}>{special.title}</h3>
                    <strong className={styles.promoDeal}>{special.price}</strong>
                  </div>
                  <p className={styles.promoDetail}>{special.detail}</p>
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

      <section id="games" className={`${styles.anchorTarget} ${styles.gamesSection}`} aria-labelledby="games-title">
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <p className={styles.eyebrow}>Pick one</p>
            <h2 id="games-title" className={styles.sectionTitle}>Games</h2>
          </div>
          <GameHub />
        </div>
      </section>

      <section id="comments" className={`${styles.anchorTarget} ${styles.commentsSection}`} aria-labelledby="comments-title">
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <p className={styles.eyebrow}>Tell us</p>
            <h2 id="comments-title" className={styles.sectionTitle}>Leave a comment</h2>
          </div>
          <GuestNoteForm />
        </div>
      </section>

      <footer className={styles.footer}>
        <span>Owner review · Unlisted · Promotions pending confirmation</span>
        <span>No orders · No payments · No POS · No prizes</span>
      </footer>
    </main>
  );
}
