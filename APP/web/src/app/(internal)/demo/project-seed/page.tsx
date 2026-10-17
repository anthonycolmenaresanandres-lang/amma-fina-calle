import type { Metadata } from "next";
import type { CSSProperties } from "react";
import Image from "next/image";
import { VenueMenuLayout } from "@/venue-menu/VenueMenuLayout";
import { VenueMenuNav, type VenueMenuNavSection } from "@/venue-menu/VenueMenuNav";
import { SeedMenuSection } from "./SeedMenuSection";
import { SeedMenuNavigation } from "./SeedMenuNavigation";
import { SeedLettering } from "./SeedLettering";
import { MENU_CHECKED, OCTOBER_MENU_DATE, OFFICIAL_MENU_URL, OFFICIAL_ORDER_URL, octoberMenuGroups, octoberMenuIsLive, seedMenuGroups } from "./menu-data";
import styles from "@/venue-menu/venue-menu.module.css";
import seedStyles from "./october.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Project Seed Coffee · Menu Concept Preview",
  description: "A provisional menu and game concept for Project Seed Coffee in Virginia Beach.",
  robots: { index: false, follow: false, nocache: true },
};

const artBase = "/assets/project-seed/seed-rush";
const seedTheme = {
  "--venue-ink": "#681d3d", "--venue-muted": "#72544d", "--venue-line": "#dcc9b9",
  "--venue-surface": "#fff7e8", "--venue-accent": "#a71930", "--venue-heading": "#681d3d", "--venue-hover": "#4f142d",
  "--venue-shadow": "#e8d6c4", "--venue-soft": "#073b78",
} as CSSProperties;
const seedSections: VenueMenuNavSection[] = [
  { id: "october-lattes", label: "October" },
  ...seedMenuGroups.map(({ id, name }) => ({ id, label: name })),
  { id: "hours", label: "Visit" },
];

function SeedBrand() {
  return <div className={`${styles.sealStage} ${seedStyles.brandStage}`}>
    <Image className={`${seedStyles.beanAccent} ${seedStyles.beanLeft}`} src="/assets/project-seed/brand/coffee-bean-illustration.svg" alt="" width={48} height={64} />
    <Image className={`${seedStyles.beanAccent} ${seedStyles.beanRight}`} src="/assets/project-seed/brand/coffee-bean-illustration.svg" alt="" width={48} height={64} />
    <Image className={seedStyles.brandLogo} src="/assets/project-seed/brand/project-seed-logo-clean-v2.webp" alt="Project Seed Coffee circular logo" width={512} height={512} sizes="(max-width: 359px) 176px, (max-width: 700px) 200px, 240px" priority />
    <div className={seedStyles.heritage}><Image src="/assets/project-seed/brand/philippines-flag.svg" alt="Philippine flag" width={36} height={18} /><span>Virginia Beach</span></div>
  </div>;
}

function SeedRushLink({ floating = false }: { floating?: boolean }) {
  return <a className={`${floating ? styles.floatingPlay : styles.teaserPlay} ${seedStyles.seedPlay}`} href="/play/project-seed" aria-label="Play Seed Rush, three rounds" id={floating ? "seed-floating-play" : undefined}>
    <span className={seedStyles.playMark} aria-hidden="true"><Image src={`${artBase}/buko-pandan-latte-illustrated-v2.webp`} alt="" width={36} height={36} sizes="36px" /></span>
    <span className={styles.vibraCopy}><strong>PLAY SEED RUSH</strong><small>THREE FAST ROUNDS</small></span>
    <span className={styles.vibraArrow} aria-hidden="true">→</span>
  </a>;
}

function SeedFeatured({ launched }: { launched: boolean }) {
  return <section id="seed-picks" className={seedStyles.featured} aria-labelledby="seed-picks-title">
    <h2 id="seed-picks-title"><SeedLettering text="Coffee. The Seed way." /></h2>
    <Image className={seedStyles.heroProduct} src={`${artBase}/buko-pandan-latte-illustrated-v2.webp`} alt="Buko Pandan Latte" width={256} height={256} sizes="(max-width: 700px) 128px, 210px" priority />
    <div className={seedStyles.seasonalNote}><span>{launched ? "Now pouring · October" : `October menu · ${OCTOBER_MENU_DATE}`}</span><a href="#october-lattes">Seasonal menu</a></div>
  </section>;
}

export default function ProjectSeedMenuPage() {
  const octoberLive = octoberMenuIsLive();
  return <SeedMenuNavigation><VenueMenuLayout
    brandName="Project Seed Coffee"
    brand={<SeedBrand />}
    nav={<div id="seed-menu-index" className={seedStyles.navigation}><VenueMenuNav sections={seedSections} floatingAction={<SeedRushLink floating />} /></div>}
    featured={<SeedFeatured launched={octoberLive} />}
    skipHref="#october-lattes" skipLabel="Skip to October menu" previewLabel="Concept preview · Pending approval" theme={seedTheme}
    menu={<div className={seedStyles.menuSections}>
      {octoberMenuGroups.map((group) => <SeedMenuSection key={group.id} group={group} />)}
      {seedMenuGroups.map((group) => <SeedMenuSection key={group.id} group={group} />)}
    </div>}
    game={<section className={`${styles.sessionsTeaser} ${seedStyles.gameTeaser}`} aria-labelledby="seed-rush-title">
      <Image src={`${artBase}/sugar-custard-swirl-pastry-illustrated-v2.webp`} alt="" width={120} height={120} sizes="(max-width: 700px) 72px, 100px" />
      <div><h2 id="seed-rush-title"><SeedLettering text="Seed Rush" /></h2><p>Coffee, pastries, and three fast rounds. Catch your favorites. Avoid the Aswang.</p></div>
      <SeedRushLink />
    </section>}
    visit={<section className={styles.hours} id="hours" aria-labelledby="visit-title">
      <div><h2 id="visit-title"><SeedLettering text="Visit" /></h2><p className={styles.address}>4740 Baxter Rd., Suite 110<br />Virginia Beach, VA 23462</p>
        <div className={styles.visitLinks}><a href="https://www.google.com/maps/search/?api=1&query=4740+Baxter+Rd+Suite+110+Virginia+Beach+VA+23462" target="_blank" rel="noreferrer">Directions</a><a href="tel:+17572147781">Call (757) 214-7781</a></div>
      </div>
      <ul className={styles.hoursList}>
        <li><span>Menu</span><a href={OFFICIAL_MENU_URL} target="_blank" rel="noreferrer">Official site ↗</a></li>
        <li><span>Bottles</span><a href={OFFICIAL_ORDER_URL} target="_blank" rel="noreferrer">Pre-order ↗</a></li>
        <li><span>Hours</span><a href="https://www.projectseedcoffee.com/" target="_blank" rel="noreferrer">Check site ↗</a></li>
      </ul>
    </section>}
    engagement={<section className={styles.guestNotes} aria-labelledby="seed-review-title">
      <div className={styles.guestNoteIntro}><p className={styles.noteKicker}>Fina Calle concept preview</p><h2 id="seed-review-title"><SeedLettering text="Concept preview" /></h2><p>Project Seed approval is pending. This preview links to the café&apos;s own menu and ordering pages for current details.</p></div>
      <div className={styles.noteForm}><p>Explore the menu, then check the restaurant&apos;s site for prices, availability, allergies, and pickup options.</p><div className={styles.visitLinks}><a href={OFFICIAL_MENU_URL} target="_blank" rel="noreferrer">Official menu ↗</a><a href={OFFICIAL_ORDER_URL} target="_blank" rel="noreferrer">Official pre-order ↗</a></div></div>
    </section>}
    footer={<>
      <a className={seedStyles.footerCredit} href="https://finacalleos.com" aria-label="Powered by Fina Calle - visit finacalleos.com">
        <Image src="/assets/fina-calle/emblem-colattao.webp" alt="" width={460} height={488} sizes="58px" />
        <span className={seedStyles.footerCreditCopy}><small>Powered by</small><strong>Fina Calle</strong></span>
      </a>
      <p className={seedStyles.footerRights}>Site design &amp; software &copy; {new Date().getUTCFullYear()} Fina Calle. All rights reserved.</p>
      <details id="review-notes"><summary>Menu details</summary><p>Concept preview, pending Project Seed approval. Regular menu wording follows the <a href={OFFICIAL_MENU_URL} target="_blank" rel="noreferrer">official menu</a>, checked {MENU_CHECKED}; October wording follows the supplied flyer. Ask staff about prices, availability, preparations, and allergies. Artwork is illustrative.</p></details>
    </>}
  /></SeedMenuNavigation>;
}
