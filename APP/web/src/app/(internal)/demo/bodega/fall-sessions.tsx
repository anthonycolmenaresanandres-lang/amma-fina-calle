import Image from "next/image";
import { seasonalDrinks, seasonalNote } from "./menu-draft";
import styles from "@/venue-menu/venue-menu.module.css";
import { menuControlAttributes, type PublicMenuControl } from "@/venue-menu/menu-controls";

export function FallSessions({ drinks = seasonalDrinks }: { drinks?: readonly { id: string; name: string; description: string; publicControl?: PublicMenuControl }[] }) {
  return <section id="fall-sessions" className={styles.fallSessions} aria-labelledby="fall-sessions-title">
    <div className={styles.fallSleeve}>
      <Image src="/assets/bodega/menu/fall-sessions-hero.webp" alt="" width={1200} height={800} sizes="(max-width: 700px) 100vw, 1200px" />
      <div className={styles.fallTitle}>

        <h2 id="fall-sessions-title">Fall<br />Sessions</h2>
      </div>
    </div>
    <div className={styles.fallLineup}>
      <ul className={styles.fallTracks}>
        {drinks.map((drink) => <li key={drink.id} {...menuControlAttributes(drink.publicControl)}>
          <Image src={`/assets/bodega/menu/${drink.id}.webp`} alt="" width={112} height={112} sizes="112px" />
          <div><h3>{drink.name}</h3>{drink.description && <p>{drink.description}</p>}{drink.publicControl?.available === false ? <p>Sold out</p> : null}</div>
        </li>)}
      </ul>
      <figure className={styles.greenFeature}>
        <Image src="/assets/bodega/menu/green-drink.webp" alt="Layered green drink with Bodega Cafe’s circular logo centered on the cup" width={400} height={400} sizes="(max-width: 700px) 220px, 360px" />
      </figure>
    </div>
    <p className={styles.sectionNote}>{seasonalNote}</p>
  </section>;
}
