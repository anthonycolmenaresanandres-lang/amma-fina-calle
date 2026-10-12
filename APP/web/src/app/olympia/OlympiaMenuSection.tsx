import type { VenueMenuItem } from "@/venue-menu/VenueMenuSection";
import venueStyles from "@/venue-menu/venue-menu.module.css";
import { olympiaMenuSource } from "./menu-data";
import styles from "./olympia.module.css";

export function OlympiaMenuSection({ id, title, note, items }: {
  id: string; title: string; note: string; items: VenueMenuItem[];
}) {
  return <section className={venueStyles.menuSection} id={id} aria-labelledby={id + "-title"}>
    <header>
      <h2 id={id + "-title"}>{title}</h2>
      <a className={styles.backToIndex} href="#menu-index" aria-label={"Back to menu categories from " + title}>↑</a>
    </header>
    <p>{note}</p>
    <ul className={venueStyles.itemList}>
      {items.map(item => <li className={styles.menuItem} id={item.id} key={item.id}>
        <details className={styles.itemDetails}>
          <summary className={styles.itemSummary}>
            <h3 className={styles.summaryContent}>
              <span className={styles.summaryCopy}>
                <span className={styles.itemName}>{item.name}</span>
                <span className={styles.itemPrice}>{item.priceLabel}</span>
              </span>
              <span className={styles.detailsCue}>
                <span>Details</span>
                <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false"><path d="m6 9 6 6 6-6" fill="none" stroke="currentColor" strokeWidth="2" /></svg>
              </span>
            </h3>
          </summary>
          <div className={styles.itemBody}>
            {item.description ? <p>{item.description}</p> : <p>Details are not listed in this selection. <a href={olympiaMenuSource.sourceUrl} target="_blank" rel="noopener noreferrer">Check the full menu on DoorDash.</a></p>}
          </div>
        </details>
      </li>)}
    </ul>
  </section>;
}
