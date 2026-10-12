import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { VenueMenuLayout } from "@/venue-menu/VenueMenuLayout";
import { VenueMenuNav } from "@/venue-menu/VenueMenuNav";
import { VenueMenuSection } from "@/venue-menu/VenueMenuSection";
import { olympiaMenu, olympiaSections } from "./menu-data";
import styles from "./olympia.module.css";

const theme = {
  "--venue-ink": "#f4f1e8", "--venue-muted": "#b9c8d2", "--venue-line": "#536d82",
  "--venue-surface": "#10283f", "--venue-accent": "#ffd171", "--venue-heading": "#f36c21",
} as CSSProperties;

export default function OlympiaPage() {
  return <div className={styles.olympia}><VenueMenuLayout
    brandName="Olympia Deli & Juice Bar"
    theme={theme} previewLabel="Prospect concept · Owner review"
    skipHref="#deli" skipLabel="Skip to menu"
    brand={<div className={styles.brand} translate="no"><Image src="/assets/olympia/wordmark.png" alt="Olympia Deli & Juice Bar" width={1024} height={384} sizes="(max-width: 699px) 190px, 270px" priority /></div>}
    nav={<VenueMenuNav sections={olympiaSections} floatingAction={null} />}
    featured={<>
      <section className={styles.feature} aria-labelledby="fresh-title">
        <div className={styles.featureCopy}>
          <p className={styles.eyebrow}>Newport News, Virginia</p>
          <h2 id="fresh-title">Chopped<br /><em>cheese.</em></h2>
        </div>
        <figure className={styles.art}>
          <div className={styles.artStage}><Image src="/assets/olympia/deli-wrapper-study.svg" alt="Concept drawing of a deli roll on sandwich paper. Not an actual Olympia food photo or approved ingredients." width={760} height={580} sizes="(max-width: 699px) 100vw, 650px" priority unoptimized /></div>
          <figcaption>Original concept illustration · Food photos pending</figcaption>
        </figure>
        <div className={styles.actions}>
          <a className={styles.primary} href="#deli">Explore the menu <span aria-hidden="true">↗</span></a>
          <Link className={styles.secondary} href="/olympia/play">Play Juice Rush <span aria-hidden="true">→</span></Link>
        </div>
      </section>
      <div className={styles.community}><p>Proudly serving the CNU community</p></div>
      <div className={styles.menuIntro}><div><p className={styles.eyebrow}>Breakfast · Lunch · Smoothies</p><h2>The menu.</h2></div><p>Provisional selection<br />Confirm with Olympia</p></div>
    </>}
    menu={olympiaMenu.map(group => <div className={styles.menuGroup} key={group.id}><VenueMenuSection id={group.id} title={group.name} note="Names pending owner confirmation." items={group.items} /></div>)}
    game={<section id="juice" className={styles.juice} aria-labelledby="juice-title">
      <div className={styles.juiceArt} aria-hidden="true"><Image src="/assets/olympia/juice-study.svg" alt="" width={260} height={300} sizes="(max-width: 699px) 130px, 220px" unoptimized /></div>
      <div className={styles.juiceCopy}><p className={styles.eyebrow}>At the juice bar</p><h2 id="juice-title">Fresh<br /><em>energy.</em></h2><p>Juice &amp; smoothies.</p><small>Flavors &amp; sizes pending owner review.</small></div>
      <div className={styles.gameEntry}><p className={styles.eyebrow}>A quick break</p><Link href="/olympia/play"><span>Juice Rush</span><span aria-hidden="true">↗</span></Link><p>Catch juice. Skip spills.</p><small>3 rounds · Just for fun · No rewards</small></div>
    </section>}
    visit={<section id="visit" className={styles.visit} aria-labelledby="visit-title">
      <div className={styles.visitHeading}><Image src="/assets/olympia/logo.png" alt="" width={84} height={84} /><div><p className={styles.eyebrow}>Hidenwood Shopping Center</p><h2 id="visit-title">Come by.</h2></div></div>
      <div className={styles.visitDetails}><address>23 Hidenwood Shopping Center<br />Newport News, VA 23606</address><div className={styles.visitLinks}><a href="https://www.google.com/maps/search/?api=1&query=Olympia+Deli+%26+Juice+Bar+23+Hidenwood+Shopping+Center+Newport+News+VA+23606" target="_blank" rel="noopener noreferrer">Directions <span aria-hidden="true">↗</span></a><a href="tel:+17577825523">757-782-5523</a><a href="https://www.instagram.com/olympiadeliandjuice/" target="_blank" rel="noopener noreferrer">Instagram <span aria-hidden="true">↗</span></a></div></div>
    </section>}
    engagement={null}
    footer={<><span>Concept by Fina Calle · Pending Olympia approval</span><details><summary>Review notes</summary><p>This prospect concept is prepared by Fina Calle and is pending Olympia approval. Menu names are provisional; confirm prices, hours, ingredients, dietary details and availability with the restaurant. The original illustrations are concept artwork, not photos of Olympia food or approved recipes. Reviewer photos are not integrated. Juice Rush is just for fun and awards no real benefits. The CNU community line is proposed presentation copy; customer history is not independently verified. No university affiliation or sponsorship is claimed.</p></details></>}
  /></div>;
}
