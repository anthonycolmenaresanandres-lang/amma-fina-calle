import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { VenueMenuLayout } from "@/venue-menu/VenueMenuLayout";
import { VenueMenuNav } from "@/venue-menu/VenueMenuNav";
import { VenueMenuSection } from "@/venue-menu/VenueMenuSection";
import { olympiaMenu, olympiaSections } from "./menu-data";
import styles from "./olympia.module.css";

const theme = {
  "--venue-ink": "#14241b", "--venue-muted": "#536057", "--venue-line": "#cdd6cf",
  "--venue-surface": "#f9fbf8", "--venue-accent": "#215b38", "--venue-heading": "#14241b",
} as CSSProperties;

export default function OlympiaPage() {
  return <div className={styles.olympia}><VenueMenuLayout
    brandName="Olympia Deli & Juice Bar"
    theme={theme} previewLabel="Unpublished concept · Owner review"
    skipHref="#deli" skipLabel="Skip to menu"
    brand={<div className={styles.brand} translate="no"><Image src="/assets/olympia/logo.png" alt="Olympia Deli & Juice Bar" width={76} height={76} priority /><span>NEWPORT NEWS, VA</span></div>}
    nav={<VenueMenuNav sections={olympiaSections} floatingAction={null} />}
    featured={<>
      <section className={styles.feature} aria-labelledby="fresh-title">
        <div className={styles.featureCopy}><span className={styles.pennant} aria-hidden="true">Olympia</span><p className={styles.eyebrow}>Breakfast · Lunch · Smoothies</p><h2 id="fresh-title">Chopped<br /><em>Cheese.</em></h2><p className={styles.featureLead}>Proudly serving the CNU community</p><div className={styles.actions}><a className={styles.primary} href="#deli">Explore the menu <span aria-hidden="true">↗</span></a><Link className={styles.secondary} href="/olympia/play">Play Juice Rush <span aria-hidden="true">→</span></Link></div></div>
        <figure className={styles.art}><Image src="/assets/olympia/deli-juice-concept.svg" alt="Illustrated sandwich, citrus and juice glass. Concept art, not restaurant food photography." width={680} height={620} priority unoptimized /><figcaption>Concept illustration</figcaption></figure>
      </section>
      <div className={styles.menuIntro}><h2>The menu</h2><p>Provisional selection · Confirm with Olympia</p></div>
    </>}
    menu={olympiaMenu.map(group => <VenueMenuSection key={group.id} id={group.id} title={group.name} note="Item names pending owner confirmation." items={group.items} />)}
    game={<>
      <section id="juice" className={styles.juice} aria-labelledby="juice-title"><div className={styles.citrus} aria-hidden="true">✳</div><div><p className={styles.eyebrow}>At the juice bar</p><h2 id="juice-title">A little<br /><em>fresh energy.</em></h2><p>Fresh juice &amp; smoothies.</p><p className={styles.note}>Flavors and sizes coming after owner review.</p></div><Link className={styles.juicePlay} href="/olympia/play"><span className={styles.eyebrow}>A quick break</span><strong>Juice Rush</strong><span>Catch the juice. Skip the spills. <span aria-hidden="true">↗</span></span><small>3 rounds · Just for fun · No rewards</small></Link></section>
    </>}
    visit={<section id="visit" className={styles.visit} aria-labelledby="visit-title"><div><p className={styles.eyebrow}>Hidenwood Shopping Center</p><h2 id="visit-title">Find Olympia.</h2></div><div><address>23 Hidenwood Shopping Center<br />Newport News, VA 23606</address><div className={styles.visitLinks}><a href="https://www.google.com/maps/search/?api=1&query=Olympia+Deli+%26+Juice+Bar+23+Hidenwood+Shopping+Center+Newport+News+VA+23606" target="_blank" rel="noopener noreferrer">Directions <span aria-hidden="true">↗</span></a><a href="tel:+17577825523">757-782-5523</a><a href="https://www.instagram.com/olympiadeliandjuice/" target="_blank" rel="noopener noreferrer">Instagram <span aria-hidden="true">↗</span></a></div></div></section>}
    engagement={null}
    footer={<><Image className={styles.footerLogo} src="/assets/olympia/wordmark.png" alt="Olympia Deli & Juice Bar" width={300} height={112} /><span>Concept by Fina Calle · Unpublished prospect demo</span><details><summary>Review notes</summary><p>Identity is highly likely; the supplied Google share link has not confirmed it directly. Menu names are provisional third-party content. Prices, hours, ingredients, dietary details and availability require owner approval. Illustrations are concept artwork, not photos of Olympia food. The game reuses Café Rush with a visual skin and awards no real benefits. Confirm the business identity and rights to use the sourced logo before publication. The CNU community line is proposed presentation copy approved by Anthony; customer history is not independently verified. University name use requires owner and brand/legal review before publication. No affiliation or sponsorship is claimed.</p></details></>}
  /></div>;
}
