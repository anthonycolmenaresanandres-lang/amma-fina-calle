import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { VenueMenuLayout } from "@/venue-menu/VenueMenuLayout";
import { VenueMenuNav } from "@/venue-menu/VenueMenuNav";
import { OlympiaMenuSection } from "./OlympiaMenuSection";
import { olympiaMenu, olympiaMenuDate, olympiaMenuSource, olympiaSections } from "./menu-data";
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
          <h2 id="fresh-title">Deli.<br /><em>Juice.</em></h2>
        </div>
        <div className={styles.actions}>
          <a className={styles.primary} href="#deli">View menu <span aria-hidden="true">↗</span></a>
          <a className={styles.secondary} href="/demo/olympia-sandwich/index.html">Play Sandwich Counter <span aria-hidden="true">→</span></a>
        </div>
        <figure className={styles.art}>
          <div className={styles.artStage}><Photo id="06" alt="Two paper-wrapped sandwich halves on a plate, showing the filling." sizes="(max-width: 699px) calc(100vw - 40px), (max-width: 1100px) 52vw, 565px" eager /></div>
        </figure>
      </section>
      <div className={styles.community}><p>Proudly serving the CNU community</p></div>
      <div className={styles.menuIntro}>
        <Photo id="04" className={styles.menuPhoto} alt="A bowl of rice, meat and salad with sauce." sizes="(max-width: 699px) calc(100vw - 40px), 360px" />
        <div><p className={styles.eyebrow}>Breakfast · Lunch · Smoothies</p><h2>Selected menu.</h2></div>
        <p className={styles.menuSource}><a href={olympiaMenuSource.sourceUrl} target="_blank" rel="noopener noreferrer">Full menu on DoorDash <span aria-hidden="true">↗</span></a><span>DoorDash delivery prices · <time dateTime={olympiaMenuSource.observedDate}>{olympiaMenuDate}</time></span><span>In-store prices may differ.</span></p>
      </div>
      <nav className={styles.menuIndex} aria-label="Selected menu sections">{olympiaMenu.map(group => <a href={"#" + group.id} key={group.id}>{group.name}</a>)}</nav>
    </>}
    menu={olympiaMenu.map(group => <div className={styles.menuGroup} key={group.id}><OlympiaMenuSection id={group.id} title={group.name} note={group.note} items={group.items} /></div>)}
    game={<section id="juice" className={styles.juice} aria-labelledby="juice-title">
      <div className={styles.juicePhotos}>
        <Photo id="03" alt="An orange-colored drink being poured from a metal pitcher into a cup." sizes="(max-width: 699px) calc((100vw - 52px) / 2), 200px" />
        <Photo id="05" alt="A green drink being poured from a blender pitcher into a cup." sizes="(max-width: 699px) calc((100vw - 52px) / 2), 200px" />
      </div>
      <div className={styles.juiceCopy}><p className={styles.eyebrow}>At the juice bar</p><h2 id="juice-title">Fresh<br /><em>energy.</em></h2><p>Juice &amp; smoothies.</p><small>Full juice &amp; smoothie selection on DoorDash.</small></div>
      <div className={styles.gameEntry}><p className={styles.eyebrow}>A quick break</p><Link href="/olympia/play"><span>Juice Rush</span><span aria-hidden="true">↗</span></Link><p>Catch juice. Skip spills.</p><small>3 rounds · Just for fun · No rewards</small></div>
    </section>}
    visit={<section id="visit" className={styles.visit} aria-labelledby="visit-title">
      <div className={styles.visitPhotos}>
        <Photo id="02" alt="Olympia's deli counter, fruit display and illuminated Olympia Deli sign." sizes="(max-width: 699px) calc((100vw - 52px) * .62), 380px" />
        <Photo id="01" alt="A long refrigerated wall stocked with drinks inside the deli." sizes="(max-width: 699px) calc((100vw - 52px) * .38), 230px" />
      </div>
      <div className={styles.visitHeading}><Image src="/assets/olympia/logo.png" alt="" width={84} height={84} /><div><p className={styles.eyebrow}>Hidenwood Shopping Center</p><h2 id="visit-title">Come by.</h2></div></div>
      <div className={styles.visitDetails}><address>23 Hidenwood Shopping Center<br />Newport News, VA 23606</address><div className={styles.visitLinks}><a href="https://www.google.com/maps/search/?api=1&query=Olympia+Deli+%26+Juice+Bar+23+Hidenwood+Shopping+Center+Newport+News+VA+23606" target="_blank" rel="noopener noreferrer">Directions <span aria-hidden="true">↗</span></a><a href="tel:+17577825523">757-782-5523</a><a href="https://www.instagram.com/olympiadeliandjuice/" target="_blank" rel="noopener noreferrer">Instagram <span aria-hidden="true">↗</span></a></div></div>
    </section>}
    engagement={null}
    footer={<><span>Concept by Fina Calle · Pending Olympia approval</span><details><summary>Review notes</summary><p>This prospect concept is prepared by Fina Calle and is pending Olympia approval. This selected menu uses DoorDash delivery prices captured October 12, 2026. In-store prices may differ. The full menu, customizations and availability remain on DoorDash; confirm dietary details and hours with Olympia. Source spellings are retained. The six photographs were supplied for this concept. They are general food, drink and interior features; exact dish and flavor pairings are unconfirmed. Originals are preserved; display copies are cropped and compressed. Juice Rush is just for fun and awards no real benefits. The CNU community line is proposed presentation copy; customer history is not independently verified. No university affiliation or sponsorship is claimed.</p></details></>}
  /></div>;
}
