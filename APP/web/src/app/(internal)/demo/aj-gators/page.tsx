import type { Metadata } from "next";
import GameHub from "./GameHub";
import MenuExplorer from "./MenuExplorer";
import { cocktailFeatures, menuEvidenceNote, seasonalSpecials, weeklySpecials } from "./menu-data";
import styles from "./portal.module.css";

export const metadata: Metadata = {
  title: "A.J. Gator's Holland Road · Guest portal concept | Fina Calle",
  description: "Unlisted owner-review concept for a Holland Road menu, specials and table-game portal.",
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

const tickerItems = [
  "Holland Road",
  "Full menu",
  "Wednesday trivia · 7–9 PM",
  "Points-only picks",
  "Reflex challenge",
  "Weekly specials",
];

export default function AjGatorsDemoPage(): React.JSX.Element {
  const ticker = [...tickerItems, ...tickerItems];

  return (
    <main className={styles.portal}>
      <a className={styles.skipLink} href="#menu">Skip to menu</a>
      <p className="bg-[#ffc83d] px-4 py-2 text-center text-[0.66rem] font-black uppercase tracking-[0.2em] text-[#102117]">
        Pending client approval · Unlisted Holland Road owner-review demo
      </p>

      <div className={styles.scoreRibbon} aria-hidden="true">
        <div className={styles.tickerTrack}>
          {ticker.map((item, index) => <span key={`${item}-${index}`} className={styles.tickerItem}>{item}</span>)}
        </div>
      </div>

      <header className={styles.hero}>
        <div>
          <p className={styles.eyebrow}>One table · one portal · no app download</p>
          <h1 className={styles.display}>A.J.<br />Gator&apos;s</h1>
          <p className={styles.locationLockup}>Holland Road</p>
          <p className="mx-auto mt-6 max-w-xl text-sm leading-7 text-[#bac8bc]">
            Scan once to see the location menu, check current specials and put the whole table into the game.
          </p>
        </div>
      </header>

      <nav className={styles.portalNav} aria-label="Guest portal">
        <a className={styles.navLink} href="#menu">Menu</a>
        <a className={styles.navLink} href="#games">Play</a>
        <a className={styles.navLink} href="#specials">Specials</a>
        <a className={styles.navLink} href="#portal-status">Portal status</a>
      </nav>

      <section id="menu" className={`${styles.section} ${styles.anchorTarget}`} aria-labelledby="menu-title">
        <div className={styles.sectionHeader}>
          <p className={styles.eyebrow}>Holland Road menu</p>
          <h2 id="menu-title" className={styles.sectionTitle}>Find the craving fast.</h2>
          <p className={styles.lede}>
            Search the photographed menu instead of passing a folded booklet around the table. Prices and availability are shown for owner review and still require location confirmation.
          </p>
        </div>
        <MenuExplorer />
        <p className={styles.responsibleNote}>{menuEvidenceNote}</p>
      </section>

      <section id="games" className={`${styles.anchorTarget} bg-[#081710] py-2`} aria-labelledby="games-title">
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <p className={styles.eyebrow}>Three playable table games</p>
            <h2 id="games-title" className={styles.sectionTitle}>The next round starts here.</h2>
            <p className={styles.lede}>
              Trivia, fictional game-day picks and a reaction challenge run entirely on this device. No account, wager, purchase or prize is involved.
            </p>
          </div>
          <GameHub />
        </div>
      </section>

      <section id="specials" className={`${styles.section} ${styles.anchorTarget}`} aria-labelledby="specials-title">
        <div className={styles.sectionHeader}>
          <p className={styles.eyebrow}>Photo-observed promotions</p>
          <h2 id="specials-title" className={styles.sectionTitle}>What&apos;s happening this week.</h2>
          <p className={styles.lede}>Current online specials are shown below; photographed seasonal cards remain time-sensitive. The portal can change them without replacing the QR, and every offer remains pending Holland Road approval.</p>
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

        <div className="mt-16 grid gap-10 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            <p className={styles.eyebrow}>Seasonal board</p>
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
            <p className={styles.eyebrow}>21+ cocktail board</p>
            <div className="mt-4 divide-y divide-white/10">
              {cocktailFeatures.map((drink) => <p key={drink} className="py-4 text-sm font-black uppercase tracking-[0.08em]">{drink}</p>)}
            </div>
            <p className={styles.responsibleNote}>Cocktail availability, ingredients and pricing require owner confirmation. Alcohol is never connected to game points or rewards.</p>
          </div>
        </div>
      </section>

      <section id="portal-status" className={`${styles.anchorTarget} bg-[#f4e6c9] text-[#142118]`} aria-labelledby="status-title">
        <div className={styles.section}>
          <p className="text-[0.68rem] font-black uppercase tracking-[0.22em] text-[#a52d29]">Portal status</p>
          <h2 id="status-title" className="mt-2 max-w-4xl font-[Impact,Haettenschweiler,'Arial_Narrow_Bold',sans-serif] text-[clamp(2.8rem,8vw,6rem)] uppercase leading-[0.9] tracking-[-0.02em]">
            Menu and games work. Orders and payments do not.
          </h2>
          <p className="mt-6 max-w-2xl text-sm leading-7 text-[#465248]">
            This is an unlisted proof of concept. It does not send orders, accept payments, connect to a POS, notify staff, award prizes or publish patron data. Those workflows require separate owner approval and integration scope.
          </p>
        </div>
      </section>

      <footer className={styles.footer}>
        Unlinked · noindex · typography-only brand concept · menu and promotions pending client approval
      </footer>
    </main>
  );
}
