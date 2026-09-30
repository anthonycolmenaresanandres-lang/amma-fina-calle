import Image from "next/image";
import styles from "./venue-menu.module.css";

export type VenueMenuItem = { id?: string; name: string; description?: string; options?: string; priceLabel?: string };

export function VenueMenuSection({ id, title, note, art, items }: { id: string; title: string; note: string; art?: string; items: VenueMenuItem[] }) {
  return <section className={styles.menuSection} id={id} aria-labelledby={`${id}-title`}>
    <header className={`${styles.sectionHeader} ${!art ? styles.textHeader : ""}`}>
      <h2 id={`${id}-title`}>{title}</h2>
      {art && <Image src={art} alt="" width={640} height={640} sizes="(max-width: 700px) 150px, 240px" />}
    </header>
    <p className={styles.sectionNote}>{note}</p>
    <ul className={styles.itemList}>
      {items.map((item) => <li className={styles.item} id={item.id} key={item.id ?? item.name}>
        <h3 className={styles.itemName}>{item.name}</h3>
        {item.description && <p className={styles.itemDescription}>{item.description}</p>}
        {item.options && <p className={styles.itemDescription}>{item.options}</p>}
        {item.priceLabel && <p className={styles.itemPrice}>{item.priceLabel}</p>}
      </li>)}
    </ul>
  </section>;
}
