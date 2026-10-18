import { formatMenuPrice } from "./menu-draft";
import { VenueMenuSection } from "@/venue-menu/VenueMenuSection";
import { menuControlAttributes } from "@/venue-menu/menu-controls";
import type { BodegaMenuProjection } from "@/lib/bodega-controls/overlay";
import styles from "@/venue-menu/venue-menu.module.css";

/** Same menu markup and immutable content; only validated item state/order varies. */
export function BodegaMenuItems({ menu }: { menu: BodegaMenuProjection }) {
  return <>
    <section className={styles.menuSection} id="bodega-classics" aria-labelledby="bodega-classics-title">
      <header className={`${styles.sectionHeader} ${styles.textHeader}`}><h2 id="bodega-classics-title">Bodega Classics</h2></header>
      <ul className={styles.itemList}>
        {menu.espresso.map(item => <li className={styles.item} key={item.name} {...menuControlAttributes(item.publicControl)}>
          <div className={styles.priceRow}><h3 className={styles.itemName}>{item.name}</h3>
            <dl className={styles.espressoPrices}>{item.prices?.map(price => <div key={price.label}><dt className={price.label ? undefined : styles.srOnly}>{price.label || "Price"}</dt><dd>{formatMenuPrice(price.cents)}</dd></div>)}</dl>
          </div>{item.publicControl?.available === false ? <p className={styles.itemPrice}>Sold out</p> : null}
        </li>)}
      </ul>
      <table className={styles.priceTable}>
        <caption className={styles.srOnly}>Bodega Classics prices by cup size, in US dollars</caption>
        <thead><tr><th scope="col">Drink</th><th scope="col">12 oz</th><th scope="col">16 oz</th></tr></thead>
        <tbody>{menu.classics.map(item => <tr key={item.name} {...menuControlAttributes(item.publicControl)}>
          <th scope="row">{item.name}{item.publicControl?.available === false ? <> <span>Sold out</span></> : null}</th>
          {item.prices?.map(price => <td key={price.label} className={price.cents === null ? styles.unknownPrice : undefined}>{formatMenuPrice(price.cents)}</td>)}
        </tr>)}</tbody>
      </table>
      <ul className={styles.extras} aria-label="Classic drink extras">{menu.extras.map(extra => <li key={extra.name} {...menuControlAttributes(extra.publicControl)}><span>{extra.name}{extra.publicControl?.available === false ? " · Sold out" : ""}</span><span>+{formatMenuPrice(extra.cents)}</span></li>)}</ul>
      <p className={styles.sectionNote}>Ask us about sizes without a listed price.</p>
    </section>
    {menu.sections.map(section => <VenueMenuSection key={section.id} id={section.id} title={section.title} note={section.note} art={section.art ? `/assets/bodega/menu/premium/${section.art}.webp` : undefined} items={section.items} />)}
  </>;
}
