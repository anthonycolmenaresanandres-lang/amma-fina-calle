import Image from "next/image";
import { seasonalDrinks } from "./menu-draft";
import styles from "./page.module.css";

export function FallSessions() {
  return <section id="fall-sessions" className={styles.fallSessions} aria-labelledby="fall-sessions-title">
    <div className={styles.fallSleeve}>
      <Image src="/assets/bodega/menu/fall-sessions-hero.webp" alt="" width={1200} height={800} sizes="(max-width: 700px) 100vw, 1200px" />
      <div className={styles.fallTitle}>
        <span>Seasonal selections</span>
        <h2 id="fall-sessions-title">Fall<br />Sessions.</h2>
      </div>
    </div>
    <div className={styles.fallLineup}>
      <ul className={styles.fallTracks}>
        {seasonalDrinks.map((drink) => <li key={drink.id}>
          <Image src={`/assets/bodega/menu/${drink.id}.webp`} alt="" width={112} height={112} sizes="112px" />
          <div><h3>{drink.name}</h3>{drink.description && <p>{drink.description}</p>}</div>
        </li>)}
      </ul>
      <figure className={styles.greenFeature}>
        <Image src="/assets/bodega/menu/green-drink.webp" alt="Layered green drink with Bodega Cafe’s circular logo centered on the cup" width={400} height={400} sizes="(max-width: 700px) 220px, 360px" />
      </figure>
    </div>
    <p className={styles.fallSource}>From Bodega’s fall board · Illustrations · Prices and availability to confirm.</p>
  </section>;
}
