import type { Metadata } from "next";
import type { CSSProperties } from "react";
import Image from "next/image";
import { VenueMenuLayout } from "@/venue-menu/VenueMenuLayout";
import { VenueMenuNav, type VenueMenuNavSection } from "@/venue-menu/VenueMenuNav";
import { VenueMenuSection } from "@/venue-menu/VenueMenuSection";
import { FinaCalleSignature } from "../bodega/fina-calle-signature";
import { MENU_CHECKED, OCTOBER_FLYER_URL, OCTOBER_MENU_DATE, OFFICIAL_MENU_URL, OFFICIAL_ORDER_URL, octoberMenuGroups, octoberMenuIsLive, seedMenuGroups } from "./menu-data";
import styles from "@/venue-menu/venue-menu.module.css";
import seedStyles from "./october.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Project Seed Coffee · Menu Concept Preview",
  description: "A provisional menu and game concept for Project Seed Coffee in Virginia Beach.",
  robots: { index: false, follow: false, nocache: true },
};

const artBase = "/assets/project-seed/seed-rush";
const octoberArt = "/assets/project-seed/october";
const seedTheme = {
  "--venue-ink": "#302426", "--venue-muted": "#675852", "--venue-line": "#dfc9b8",
  "--venue-surface": "#fffaf2", "--venue-accent": "#9f1c2b", "--venue-heading": "#9f1c2b", "--venue-hover": "#741421",
  "--venue-shadow": "#dcb599", "--venue-soft": "#f7e6d7",
} as CSSProperties;
const seedSections: VenueMenuNavSection[] = [
  { id: "october-lattes", label: "October" },
  ...seedMenuGroups.map(({ id, name }) => ({ id, label: name })),
  { id: "hours", label: "Visit" },
];

function SeedBrand() {
  return <div className={styles.sealStage}>
    <Image className={seedStyles.brandLogo} src="/assets/project-seed/brand/project-seed-logo-reference.png" alt="Project Seed Coffee circular logo" width={132} height={124} priority />
  </div>;
}

function SeedRushLink({ floating = false }: { floating?: boolean }) {
  return <a className={floating ? styles.floatingPlay : styles.teaserPlay} href="/play/project-seed" aria-label="Play Seed Rush, three rounds">
    <span className={styles.vibraMark} aria-hidden="true"><span /><span /><span /><span /><span /></span>
    <span className={styles.vibraCopy}><strong>PLAY SEED RUSH</strong><small>THREE FAST ROUNDS</small></span>
    <span className={styles.vibraArrow} aria-hidden="true">→</span>
  </a>;
}

function SeedFeatured({ launched }: { launched: boolean }) {
  return <section id="seed-picks" className={styles.fallSessions} aria-labelledby="seed-picks-title">
    <div className={`${styles.fallSleeve} ${seedStyles.octoberSleeve}`}>
      <Image src={`${octoberArt}/dwende-latte-v1.webp`} alt="" width={1200} height={800} sizes="(max-width: 700px) 100vw, 1200px" priority />
      <div className={styles.fallTitle}><h2 id="seed-picks-title">October<br />Menu</h2></div>
    </div>
    <div className={styles.fallLineup}>
      <ul className={styles.fallTracks}>
        <li><Image src={`${octoberArt}/dwende-latte-v1.webp`} alt="" width={112} height={112} sizes="112px" /><div><h3>Dwende Latte</h3><p>Toasted marshmallow, chocolate, honey, graham crackers, vanilla foam.</p></div></li>
        <li><Image src={`${octoberArt}/mumu-latte-v1.webp`} alt="" width={112} height={112} sizes="112px" /><div><h3>Mumu Latte</h3><p>White chocolate and pistachio.</p></div></li>
        <li><Image src={`${octoberArt}/pms-latte-v1.webp`} alt="" width={112} height={112} sizes="112px" /><div><h3>PMS Latte</h3><p>Pumpkin maple spice.</p></div></li>
      </ul>
      <figure className={styles.greenFeature}>
        <a className={seedStyles.posterLink} href={OCTOBER_FLYER_URL} target="_blank" rel="noreferrer"><Image src={OCTOBER_FLYER_URL} alt="Project Seed October menu flyer" width={437} height={541} sizes="(max-width: 700px) 220px, 360px" />View the original flyer ↗</a>
      </figure>
    </div>
    <p className={styles.sectionNote}><span className={seedStyles.launchNote}>{launched ? "October menu is here." : `Arriving ${OCTOBER_MENU_DATE}.`}</span> Seasonal wording follows the supplied flyer. Artwork is illustrative; ask staff about prices and availability.</p>
  </section>;
}

export default function ProjectSeedMenuPage() {
  const octoberLive = octoberMenuIsLive();
  return <VenueMenuLayout
    brandName="Project Seed Coffee"
    brand={<SeedBrand />}
    nav={<VenueMenuNav sections={seedSections} floatingAction={<SeedRushLink floating />} />}
    featured={<SeedFeatured launched={octoberLive} />}
    skipHref="#october-lattes" skipLabel="Skip to October menu" previewLabel="Concept preview · Pending approval" theme={seedTheme}
    menu={<>
      {octoberMenuGroups.map((group) => <VenueMenuSection key={group.id} id={group.id} title={group.name} note={group.note} art={group.id === "october-lattes" ? `${octoberArt}/dwende-latte-v1.webp` : `${octoberArt}/bbl-refresher-v1.webp`} items={group.items.map((item) => ({ ...item, priceLabel: "Ask staff for price" }))} />)}
      {seedMenuGroups.map((group) => <VenueMenuSection key={group.id} id={group.id} title={group.name} note={group.note} art={group.id === "signature" ? `${artBase}/buko-pandan-latte-v1.webp` : undefined} items={group.items.map((item) => ({ ...item, priceLabel: "Ask staff for price" }))} />)}
    </>}
    game={<section className={styles.sessionsTeaser} aria-labelledby="seed-rush-title">
      <Image src={`${octoberArt}/bbl-refresher-v1.webp`} alt="" width={120} height={120} sizes="(max-width: 700px) 72px, 100px" />
      <div><h2 id="seed-rush-title">Seed Rush · October edition</h2><p>Catch the seasonal drinks in three fast rounds, then find each one on this menu. Avoid the Aswang.</p></div>
      <SeedRushLink />
    </section>}
    visit={<section className={styles.hours} id="hours" aria-labelledby="visit-title">
      <div><h2 id="visit-title">Visit</h2><p className={styles.address}>4740 Baxter Rd., Suite 110<br />Virginia Beach, VA 23462</p>
        <div className={styles.visitLinks}><a href="https://www.google.com/maps/search/?api=1&query=4740+Baxter+Rd+Suite+110+Virginia+Beach+VA+23462" target="_blank" rel="noreferrer">Directions</a><a href="tel:+17572147781">Call (757) 214-7781</a></div>
      </div>
      <ul className={styles.hoursList}>
        <li><span>Menu</span><a href={OFFICIAL_MENU_URL} target="_blank" rel="noreferrer">Official site ↗</a></li>
        <li><span>Bottles</span><a href={OFFICIAL_ORDER_URL} target="_blank" rel="noreferrer">Pre-order ↗</a></li>
        <li><span>Hours</span><a href="https://www.projectseedcoffee.com/" target="_blank" rel="noreferrer">Check site ↗</a></li>
      </ul>
    </section>}
    engagement={<section className={styles.guestNotes} aria-labelledby="seed-review-title">
      <div className={styles.guestNoteIntro}><p className={styles.noteKicker}>Fina Calle concept preview</p><h2 id="seed-review-title">Made to discover.</h2><p>Project Seed approval is pending. This preview links to the café&apos;s own menu and ordering pages for current details.</p></div>
      <div className={styles.noteForm}><p>Explore the menu, then check the restaurant&apos;s site for prices, availability, allergies, and pickup options.</p><div className={styles.visitLinks}><a href={OFFICIAL_MENU_URL} target="_blank" rel="noreferrer">Official menu ↗</a><a href={OFFICIAL_ORDER_URL} target="_blank" rel="noreferrer">Official pre-order ↗</a></div></div>
    </section>}
    footer={<>
      <a className={styles.poweredBy} href="https://finacalleos.com" aria-label="Powered by Fina Calle — visit finacalleos.com"><span>Powered by</span><FinaCalleSignature /></a>
      <details id="review-notes"><summary>Menu details</summary><p>Concept preview, pending Project Seed approval. Regular menu wording follows the <a href={OFFICIAL_MENU_URL} target="_blank" rel="noreferrer">official menu</a>, checked {MENU_CHECKED}; October wording follows the supplied flyer. Ask staff about prices, availability, preparations, and allergies. Artwork is illustrative.</p></details>
    </>}
  />;
}
