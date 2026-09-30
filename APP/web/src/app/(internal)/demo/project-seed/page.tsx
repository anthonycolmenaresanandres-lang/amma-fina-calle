import type { Metadata } from "next";
import { Barlow_Condensed } from "next/font/google";
import { MENU_CHECKED, OFFICIAL_MENU_URL, OFFICIAL_ORDER_URL, seedMenuGroups } from "./menu-data";
import styles from "./page.module.css";

const display = Barlow_Condensed({ subsets: ["latin"], weight: ["600", "700", "800"], variable: "--seed-display" });

export const metadata: Metadata = {
  title: "Project Seed Coffee · Menu Concept Preview",
  description: "A provisional menu and game concept for Project Seed Coffee in Virginia Beach.",
  robots: { index: false, follow: false, nocache: true },
};

export default function ProjectSeedMenuPage() {
  return (
    <main className={`${styles.page} ${display.variable}`}>
      <a className={styles.skip} href="#signature">Skip to menu</a>
      <div className={styles.topline} aria-hidden="true" />
      <div className={styles.shell}>
        <header className={styles.header}>
          <div className={styles.headerTop}>
            <span className={styles.concept}>Fina Calle concept preview · Pending Project Seed approval</span>
            <a href="https://www.projectseedcoffee.com/" target="_blank" rel="noreferrer">Official website ↗</a>
          </div>
          <div className={styles.hero}>
            <div className={styles.heroText}>
              <p className={styles.overline}>Virginia Beach · Coffee & community</p>
              <h1>PROJECT<br /><span>SEED</span></h1>
              <p className={styles.coffeeLine}>COFFEE <span aria-hidden="true">✳</span> MADE TO DISCOVER</p>
              <p className={styles.lead}>Start with a signature. Stay curious about what&apos;s in the cup.</p>
              <div className={styles.heroActions}>
                <a className={styles.primaryButton} href="#signature">Explore the menu</a>
                <a className={styles.textButton} href="/play/project-seed">Play Seed Rush <span aria-hidden="true">↗</span></a>
              </div>
            </div>
            <div className={styles.heroGraphic} aria-hidden="true">
              <div className={styles.orbit}><span className={styles.seed} /><span className={styles.sprout} /></div>
              <p>UBE<br />PANDAN<br />TURON</p>
            </div>
          </div>
          <p className={styles.sourceStrip}>Preview from the <a href={OFFICIAL_MENU_URL} target="_blank" rel="noreferrer">official Project Seed menu</a>, checked {MENU_CHECKED}. Prices and current availability need confirmation. This is not the restaurant&apos;s ordering system.</p>
        </header>

        <nav className={styles.nav} aria-label="Menu sections">
          {seedMenuGroups.map((group) => <a href={`#${group.id}`} key={group.id}>{group.name}</a>)}
          <a href="#pre-order">Bottles & visit</a>
        </nav>

        <div className={styles.sections}>
          {seedMenuGroups.map((group, index) => (
            <section className={styles.group} id={group.id} key={group.id} aria-labelledby={`${group.id}-title`}>
              <header className={styles.groupHeader}>
                <span className={styles.groupIndex}>{String(index + 1).padStart(2, "0")}</span>
                <div><h2 id={`${group.id}-title`}>{group.name}</h2><p>{group.note}</p></div>
              </header>
              <ul className={styles.items}>
                {group.items.map((item) => (
                  <li id={item.id} key={item.id} className={styles.item}>
                    <div className={styles.itemMain}>
                      <h3>{item.name}</h3>
                      {item.description ? <p>{item.description}</p> : null}
                      {item.options ? <small>{item.options}</small> : null}
                    </div>
                    <span className={styles.price} title="Current price not listed on the official menu">Ask staff</span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <section className={styles.gameInvite} aria-labelledby="game-invite-title">
          <div className={styles.gameSeeds} aria-hidden="true"><span>●</span><span>✳</span><span>✳</span></div>
          <div><p className={styles.overline}>A little game for the wait</p><h2 id="game-invite-title">Catch a flavor.<br />Find your next drink.</h2><p>Three quick rounds. Tap drinks, skip spills, then jump straight back to a featured menu item. No sign-up or prize required.</p></div>
          <a className={styles.primaryButton} href="/play/project-seed">Play Seed Rush <span aria-hidden="true">↗</span></a>
        </section>

        <section className={styles.visit} id="pre-order" aria-labelledby="pre-order-title">
          <div><p className={styles.overline}>Bottles & pickup</p><h2 id="pre-order-title">Take some home.</h2><p>The restaurant&apos;s own pre-order page lists cold brew concentrate, assorted four-packs, half-gallons, and a 16 oz add-on. Check current choices and prices there.</p><a href={OFFICIAL_ORDER_URL} target="_blank" rel="noreferrer">Open official pre-order ↗</a></div>
          <div><p className={styles.overline}>Find the café</p><h2>Come by.</h2><address>4740 Baxter Rd., Suite 110<br />Virginia Beach, VA 23462</address><a href="https://www.google.com/maps/search/?api=1&query=4740+Baxter+Rd+Suite+110+Virginia+Beach+VA+23462" target="_blank" rel="noreferrer">Get directions ↗</a><a href="tel:+17572147781">Call (757) 214-7781</a></div>
        </section>

        <footer className={styles.footer}><p>Concept preview by Fina Calle · Not an approved Project Seed publication</p><p>Menu wording adapted from the <a href={OFFICIAL_MENU_URL} target="_blank" rel="noreferrer">official menu</a>. Ask staff about prices, availability, and allergies. Owner portal and guest intake are not part of this preview.</p></footer>
      </div>
    </main>
  );
}
