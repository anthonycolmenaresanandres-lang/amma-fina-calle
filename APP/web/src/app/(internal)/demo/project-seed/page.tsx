import type { Metadata } from "next";
import type { CSSProperties } from "react";
import Image from "next/image";
import { VenueMenuLayout } from "@/venue-menu/VenueMenuLayout";
import { VenueMenuNav, type VenueMenuNavSection } from "@/venue-menu/VenueMenuNav";
import { VenueMenuSection } from "@/venue-menu/VenueMenuSection";
import { FinaCalleSignature } from "../bodega/fina-calle-signature";
import { MENU_CHECKED, OFFICIAL_MENU_URL, OFFICIAL_ORDER_URL, seedMenuGroups } from "./menu-data";
import styles from "@/venue-menu/venue-menu.module.css";

export const metadata: Metadata = {
  title: "Project Seed Coffee · Menu Concept Preview",
  description: "A provisional menu and game concept for Project Seed Coffee in Virginia Beach.",
  robots: { index: false, follow: false, nocache: true },
};

const artBase = "/assets/project-seed/seed-rush";
const seedTheme = {
  "--venue-ink": "#2b2320", "--venue-muted": "#665c54", "--venue-line": "#d9cfc1",
  "--venue-surface": "#fbf6ed", "--venue-accent": "#a92732", "--venue-hover": "#7d1c28",
  "--venue-shadow": "#e6c7bf", "--venue-soft": "#f3e4df",
} as CSSProperties;
const seedSections: VenueMenuNavSection[] = [
  { id: "seed-picks", label: "Featured" },
  ...seedMenuGroups.map(({ id, name }) => ({ id, label: name })),
  { id: "hours", label: "Visit" },
];

function SeedBrand() {
  return <div className={styles.sealStage}>
    <svg className={styles.sealMark} viewBox="0 0 720 720" width="720" height="720" role="img" aria-label="Project Seed Coffee concept mark — Virginia Beach">
      <circle cx="360" cy="360" r="340" fill="#fbf6ed" />
      <circle cx="360" cy="360" r="322" fill="none" stroke="#a92732" strokeWidth="5" />
      <circle cx="360" cy="360" r="285" fill="none" stroke="#d9cfc1" strokeWidth="2" />
      <path d="M360 420 C321 380 320 315 360 283 C400 315 399 380 360 420Z" fill="#a92732" />
      <path d="M360 407 C361 350 394 309 430 302" fill="none" stroke="#fbf6ed" strokeWidth="8" strokeLinecap="round" />
      <text x="360" y="204" textAnchor="middle" fill="#2b2320" fontSize="52" fontWeight="800" letterSpacing="9" fontFamily="Arial, sans-serif">PROJECT</text>
      <text x="360" y="522" textAnchor="middle" fill="#2b2320" fontSize="104" fontWeight="900" letterSpacing="8" fontFamily="Arial, sans-serif">SEED</text>
      <text x="360" y="589" textAnchor="middle" fill="#a92732" fontSize="26" fontWeight="700" letterSpacing="10" fontFamily="Arial, sans-serif">COFFEE</text>
    </svg>
  </div>;
}

function SeedRushLink({ floating = false }: { floating?: boolean }) {
  return <a className={floating ? styles.floatingPlay : styles.teaserPlay} href="/play/project-seed" aria-label="Play Seed Rush, three rounds">
    <span className={styles.vibraMark} aria-hidden="true"><span /><span /><span /><span /><span /></span>
    <span className={styles.vibraCopy}><strong>PLAY SEED RUSH</strong><small>THREE FAST ROUNDS</small></span>
    <span className={styles.vibraArrow} aria-hidden="true">→</span>
  </a>;
}

function SeedFeatured() {
  return <section id="seed-picks" className={styles.fallSessions} aria-labelledby="seed-picks-title">
    <div className={styles.fallSleeve}>
      <Image src={`${artBase}/buko-pandan-latte-v1.webp`} alt="" width={1200} height={800} sizes="(max-width: 700px) 100vw, 1200px" />
      <div className={styles.fallTitle}><h2 id="seed-picks-title">Signature<br />Sips</h2></div>
    </div>
    <div className={styles.fallLineup}>
      <ul className={styles.fallTracks}>
        <li><Image src={`${artBase}/buko-pandan-latte-v1.webp`} alt="" width={112} height={112} sizes="112px" /><div><h3>Buko Pandan</h3><p>Coconut and pandan, served hot or iced.</p></div></li>
        <li><Image src={`${artBase}/borahae-latte-v1.webp`} alt="" width={112} height={112} sizes="112px" /><div><h3>Signature lattes</h3><p>Explore the official lineup, including Ube Velvet and Turon Latte.</p></div></li>
        <li><Image src={`${artBase}/dark-iced-coffee-v1.webp`} alt="" width={112} height={112} sizes="112px" /><div><h3>Cold brew</h3><p>Ask the café which daily flavors are available.</p></div></li>
      </ul>
      <figure className={styles.greenFeature}>
        <Image src={`${artBase}/iced-green-latte-v1.webp`} alt="Illustrative green iced drink artwork for the Project Seed concept" width={400} height={400} sizes="(max-width: 700px) 220px, 360px" />
      </figure>
    </div>
    <p className={styles.sectionNote}>Menu selections follow the <a href={OFFICIAL_MENU_URL} target="_blank" rel="noreferrer">official Project Seed menu</a>, checked {MENU_CHECKED}. Artwork is illustrative; current prices and availability need confirmation.</p>
  </section>;
}

export default function ProjectSeedMenuPage() {
  return <VenueMenuLayout
    brandName="Project Seed Coffee"
    brand={<SeedBrand />}
    nav={<VenueMenuNav sections={seedSections} floatingAction={<SeedRushLink floating />} />}
    featured={<SeedFeatured />}
    skipHref="#signature" skipLabel="Skip to menu" previewLabel="Concept preview · Pending approval" theme={seedTheme}
    menu={<>{seedMenuGroups.map((group) => <VenueMenuSection key={group.id} id={group.id} title={group.name} note={group.note} art={group.id === "signature" ? `${artBase}/buko-pandan-latte-v1.webp` : undefined} items={group.items.map((item) => ({ ...item, priceLabel: "Ask staff for price" }))} />)}</>}
    game={<section className={styles.sessionsTeaser} aria-labelledby="seed-rush-title">
      <Image src={`${artBase}/purple-rolled-pastry-v1.webp`} alt="" width={120} height={120} sizes="(max-width: 700px) 72px, 100px" />
      <div><h2 id="seed-rush-title">Seed Rush</h2><p>Three quick rounds. Catch the café artwork and avoid the Aswang. No sign-up or prize required.</p></div>
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
      <details id="review-notes"><summary>Menu details</summary><p>Concept preview, not an approved Project Seed publication. Menu wording adapted from the <a href={OFFICIAL_MENU_URL} target="_blank" rel="noreferrer">official menu</a>. Ask staff about prices, availability, and allergies. Artwork is illustrative.</p></details>
    </>}
  />;
}
