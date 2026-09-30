import type { Metadata } from "next";
import type { CSSProperties } from "react";
import Image from "next/image";
import { VenueMenuLayout } from "@/venue-menu/VenueMenuLayout";
import { VenueMenuNav, type VenueMenuNavSection } from "@/venue-menu/VenueMenuNav";
import { VenueMenuSection } from "@/venue-menu/VenueMenuSection";
import { FinaCalleSignature } from "../bodega/fina-calle-signature";
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
    <div className={seedStyles.heritage}><Image src="/assets/project-seed/brand/philippines-flag.svg" alt="Philippine flag" width={36} height={18} /><span>Virginia Beach</span></div>
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
      <Image src={`${artBase}/buko-pandan-latte-v1.webp`} alt="Buko Pandan Latte" width={256} height={256} sizes="(max-width: 700px) 180px, 280px" priority />
      <div className={styles.fallTitle}><h2 id="seed-picks-title">Coffee.<br />The Seed way.</h2></div>
    </div>
    <div className={styles.fallLineup}>
      <ul className={styles.fallTracks}>
        <li><Image src={`${artBase}/buko-pandan-latte-v1.webp`} alt="" width={112} height={112} sizes="112px" /><div><h3>Buko Pandan</h3><p>Coconut, pandan, and espresso.</p></div></li>
        <li><Image src={`${artBase}/dark-iced-coffee-v1.webp`} alt="" width={112} height={112} sizes="112px" /><div><h3>Iced coffee</h3><p>Something cold for your coffee break.</p></div></li>
        <li><Image src={`${artBase}/sugar-custard-swirl-pastry-v1.webp`} alt="" width={112} height={112} sizes="112px" /><div><h3>Something sweet</h3><p>Ask about today’s pastries.</p></div></li>
      </ul>
      <figure className={styles.greenFeature}>
        <Image src={`${artBase}/borahae-latte-v1.webp`} alt="Borahae Latte" width={256} height={256} sizes="(max-width: 700px) 160px, 240px" />
      </figure>
    </div>
    <div className={seedStyles.seasonalNote}><span>{launched ? "Now pouring · October" : `October menu · ${OCTOBER_MENU_DATE}`}</span><p>Marshmallow, pistachio, spiced apple, and more.</p><a href="#october-lattes">Explore the seasonal menu <span aria-hidden="true">↗</span></a></div>
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
      {octoberMenuGroups.map((group) => <VenueMenuSection key={group.id} id={group.id} title={group.name} note={group.note} items={group.items.map((item) => ({ ...item, priceLabel: "Ask staff for price" }))} />)}
      {seedMenuGroups.map((group) => <VenueMenuSection key={group.id} id={group.id} title={group.name} note={group.note} art={group.id === "signature" ? `${artBase}/buko-pandan-latte-v1.webp` : undefined} items={group.items.map((item) => ({ ...item, priceLabel: "Ask staff for price" }))} />)}
    </>}
    game={<section className={styles.sessionsTeaser} aria-labelledby="seed-rush-title">
      <Image src={`${artBase}/borahae-latte-v1.webp`} alt="" width={120} height={120} sizes="(max-width: 700px) 72px, 100px" />
      <div><h2 id="seed-rush-title">Seed Rush</h2><p>Coffee, pastries, and three fast rounds. Catch your favorites. Avoid the Aswang.</p></div>
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
