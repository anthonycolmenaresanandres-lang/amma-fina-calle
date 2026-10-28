import Image from 'next/image';
import type {CSSProperties} from 'react';
import {VenueMenuLayout} from '@/venue-menu/VenueMenuLayout';
import {Lettering} from './Lettering';
import {MenuNavigation} from './MenuNavigation';
import {royalMenu} from './menu-data';
import styles from './royal.module.css';
const theme={'--venue-ink':'#f5f7fc','--venue-muted':'#b8c3d6','--venue-line':'#53647f','--venue-surface':'#091b3f','--venue-accent':'#d1d8e5','--venue-heading':'#f5f7fc'} as CSSProperties;
export default function RoyalChocolatePage(){return <div className={styles.page}><MenuNavigation><VenueMenuLayout
 brandName="The Royal Chocolate" theme={theme} previewLabel="Fina Calle concept · Owner review"
 skipHref="#fondue" skipLabel="Skip to menu"
 brand={<div className={styles.brand} translate="no"><Image className={styles.brandLogo} src="/assets/royal-chocolate/logo-clean-v1.webp" alt="The Royal Chocolate" width={1024} height={512} sizes="(max-width: 700px) 90vw, 420px" priority/><span>Town Center · Virginia Beach</span></div>}
 nav={<a className={styles.floatingPlay} href="/royal-chocolate/play"><span>Play</span><span>Chocolate Counter<small>Collect. Grow. Rule the counter.</small></span></a>}
 featured={<section className={styles.intro} aria-labelledby="sweet-title"><h2 id="sweet-title"><Lettering text="Sweet spot"/></h2><Image className={styles.heroArt} src="/assets/royal-chocolate/counter.svg" alt="Original illustration of a chocolate fondue bowl, dipped strawberry and chocolate apple on a counter." width={1000} height={460} priority unoptimized/><p className={styles.artNote}>Illustrated concept</p><nav className={styles.visualIndex} aria-label="Explore the menu">{royalMenu.map(group=><a href={`#${group.id}`} key={group.id}><Image src={`/assets/royal-chocolate/${group.illustration}.svg`} alt="" width={200} height={170} unoptimized/><span>{group.name}</span></a>)}</nav></section>}
 menu={royalMenu.map((group,i)=><details className={styles.category} id={group.id} key={group.id} open={i===0}><summary><h2>{group.name}</h2><span className={styles.show}>Show menu</span><span className={styles.hide}>Hide menu</span></summary>{group.items.map(item=><details className={styles.item} key={item.name}><summary><h3>{item.name}</h3><span className={styles.show}>Details</span><span className={styles.hide}>Hide details</span></summary><p>{item.detail}</p></details>)}</details>)}
 game={<section className={styles.gameInvite}><p>A little chocolate break</p><h2>Make room for play.</h2><a href="/royal-chocolate/play">Play Chocolate Counter</a><p className={styles.fine}>3 counters · Just for fun · No rewards</p></section>}
 visit={<section className={styles.visit} aria-labelledby="visit-title"><h2 id="visit-title">Find the sweet spot.</h2><address>164 Central Park Avenue<br/>Virginia Beach, VA 23462</address><a href="tel:+17575576925">757-557-6925</a><a href="https://www.theroyalchocolate.com/" target="_blank" rel="noopener noreferrer">Visit the shop’s website</a></section>}
 engagement={null}
 footer={<><span>Unsent concept by Fina Calle · Pending business approval</span><details><summary>Content &amp; illustration notes</summary><p>Selected public menu references. Prices are omitted; availability, ingredients and allergens need shop confirmation. Illustrations are original concept artwork, not actual product photographs or the shop’s logo. Logo treatment and colors remain subject to shop approval. This local game offers no real rewards, ordering or payment.</p></details></>}
 /></MenuNavigation></div>;}
