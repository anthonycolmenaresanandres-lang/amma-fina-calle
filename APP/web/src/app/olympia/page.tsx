import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { VenueMenuLayout } from "@/venue-menu/VenueMenuLayout";
import { VenueMenuNav } from "@/venue-menu/VenueMenuNav";
import { OlympiaMenuSection } from "./OlympiaMenuSection";
import { OlympiaMenuNavigation } from "./OlympiaMenuNavigation";
import { olympiaMenu, olympiaSections } from "./menu-data";
import styles from "./olympia.module.css";
import photos from "./photo-data.json";

const theme = {
  "--venue-ink": "#f4f1e8", "--venue-muted": "#b9c8d2", "--venue-line": "#536d82",
  "--venue-surface": "#10283f", "--venue-accent": "#ffd171", "--venue-heading": "#f36c21",
} as CSSProperties;

function Photo({ id, alt, sizes, className, eager = false }: { id: keyof typeof photos; alt: string; sizes: string; className?: string; eager?: boolean }) {
  const photo = photos[id];
  return <picture className={className}>
    <source type="image/webp" srcSet={photo.srcSet} sizes={sizes} />
    <Image src={photo.src} alt={alt} width={photo.width} height={photo.height} unoptimized loading={eager ? "eager" : "lazy"} fetchPriority={eager ? "high" : undefined} />
  </picture>;
}

export default function OlympiaPage() {
  return <OlympiaMenuNavigation><VenueMenuLayout
    brandName="Olympia Deli & Juice Bar"
    theme={theme} previewLabel="Prospect concept · Owner review"
    skipHref="#deli" skipLabel="Skip to menu"
    brand={<div className={styles.brand} translate="no"><Image src="/assets/olympia/wordmark.png" alt="Olympia Deli & Juice Bar" width={1024} height={384} sizes="(max-width: 699px) 190px, 270px" priority /></div>}
    nav={<VenueMenuNav sections={olympiaSections} floatingAction={null} />}
    featured={<section id="menu-index" className={styles.menuIntro} aria-labelledby="menu-title">
      <div className={styles.menuHeading}><div><p className={styles.eyebrow}>Newport News, Virginia</p><h2 id="menu-title">Selected menu.</h2></div><a className={styles.playLink} href="/demo/olympia-sandwich/index.html">Play Sandwich Counter</a></div>
      <nav className={styles.visualIndex} aria-label="Explore menu by photo">
        <a href="#deli"><Photo id="06" alt="" sizes="(max-width: 699px) calc((100vw - 64px) / 3), 370px" eager /><span className={styles.categoryLabel}>Signature{" "}<br />sandwiches</span></a>
        <a href="#rice"><Photo id="04" alt="" sizes="(max-width: 699px) calc((100vw - 64px) / 3), 370px" eager /><span className={styles.categoryLabel}>Featured{" "}<br />items</span></a>
        <a href="#drinks"><Photo id="01" alt="" sizes="(max-width: 699px) calc((100vw - 64px) / 3), 370px" eager /><span className={styles.categoryLabel}>Drinks</span></a>
      </nav>
      <nav className={styles.menuIndex} aria-label="More menu sections"><a href="#special">Special sandwiches</a><a href="#popular">Most ordered</a></nav>
    </section>}
    menu={olympiaMenu.map(group => <div className={styles.menuGroup} key={group.id}><OlympiaMenuSection id={group.id} title={group.name} items={group.items} /></div>)}
    game={<section id="juice" className={styles.juice} aria-labelledby="juice-title">
      <div className={styles.juicePhotos}>
        <Photo id="03" alt="An orange-colored drink being poured from a metal pitcher into a cup." sizes="(max-width: 699px) calc((100vw - 52px) / 2), 200px" />
        <Photo id="05" alt="A green drink being poured from a blender pitcher into a cup." sizes="(max-width: 699px) calc((100vw - 52px) / 2), 200px" />
      </div>
      <div className={styles.juiceCopy}><p className={styles.eyebrow}>At the juice bar</p><h2 id="juice-title">Fresh<br /><em>energy.</em></h2><p>Juice &amp; smoothies.</p></div>
      <div className={styles.gameEntry}><p className={styles.eyebrow}>A quick break</p><Link href="/olympia/play"><span>Juice Rush</span></Link><p>Catch juice. Skip spills.</p><small>3 rounds · Just for fun · No rewards</small></div>
    </section>}
    visit={<><div className={styles.community}><p>Proudly serving the CNU community</p></div><section id="visit" className={styles.visit} aria-labelledby="visit-title">
      <div className={styles.visitPhotos}>
        <Photo id="02" alt="Olympia's deli counter, fruit display and illuminated Olympia Deli sign." sizes="(max-width: 699px) calc(100vw - 40px), 558px" />
      </div>
      <div className={styles.visitHeading}><Image src="/assets/olympia/logo.png" alt="" width={84} height={84} /><div><p className={styles.eyebrow}>Hidenwood Shopping Center</p><h2 id="visit-title">Come by.</h2></div></div>
      <div className={styles.visitDetails}><address>23 Hidenwood Shopping Center<br />Newport News, VA 23606</address><div className={styles.visitLinks}><a href="https://www.google.com/maps/search/?api=1&query=Olympia+Deli+%26+Juice+Bar+23+Hidenwood+Shopping+Center+Newport+News+VA+23606" target="_blank" rel="noopener noreferrer">Directions</a><a href="tel:+17577825523">757-782-5523</a><a href="https://www.instagram.com/olympiadeliandjuice/" target="_blank" rel="noopener noreferrer">Instagram</a></div></div>
    </section></>}
    engagement={null}
    footer={<><span>Concept by Fina Calle · Pending Olympia approval</span><details><summary>Review notes</summary><p>This prospect concept is prepared by Fina Calle and is pending Olympia approval. The menu selection, prices, customizations, availability, dietary details and hours need Olympia confirmation. Source spellings are retained. The six photographs were supplied for this concept. They are general food, drink and interior features; category photographs are navigation cues, not photos of individual menu items. Exact dish and flavor pairings are unconfirmed. Originals are preserved; display copies are cropped and compressed. Juice Rush and Sandwich Counter are just for fun and award no real benefits. The CNU community line is proposed presentation copy; customer history is not independently verified. No university affiliation or sponsorship is claimed.</p></details></>}
  /></OlympiaMenuNavigation>;
}
