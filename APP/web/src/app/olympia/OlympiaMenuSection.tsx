import type { VenueMenuItem } from "@/venue-menu/VenueMenuSection";
import venueStyles from "@/venue-menu/venue-menu.module.css";
import { OlympiaLettering } from "./OlympiaLettering";
import styles from "./olympia.module.css";

export function OlympiaMenuSection({ id, title, items }: {
  id: string; title: string; items: VenueMenuItem[];
}) {
  return <section className={venueStyles.menuSection} id={id} aria-labelledby={id + "-title"} tabIndex={-1}>
    <details className={styles.categoryDetails} data-menu-category={id} open={id === "deli"}>
      <summary className={styles.categorySummary}>
        <h2 id={id + "-title"}><OlympiaLettering text={title} /></h2>
        <span className={styles.categoryCue}>
          <span>{items.length} items</span>
          <span className={styles.whenClosed}>Show menu</span>
          <span className={styles.whenOpen}>Hide menu</span>
        </span>
      </summary>
      <ul className={venueStyles.itemList}>
        {items.map(item => <li className={styles.menuItem} id={item.id} key={item.id}>
          <details className={styles.itemDetails}>
            <summary className={styles.itemSummary}>
              <h3 className={styles.summaryContent}>
                <span className={styles.summaryCopy}>
                  <span className={styles.itemName}>{item.name}</span>
                  <span className={styles.itemPrice}>{item.priceLabel?.split(" · ")[0]}</span>
                </span>
                <span className={styles.detailsCue}>
                  <span className={styles.whenClosed}>Details</span>
                  <span className={styles.whenOpen}>Hide details</span>
                </span>
              </h3>
            </summary>
            <div className={styles.itemBody}>
              <p>{item.description || "Details are not listed in this selection. Ask Olympia for details."}</p>
            </div>
          </details>
        </li>)}
      </ul>
      <a className={styles.backToIndex} href="#menu-index" aria-label={"Back to menu categories from " + title}>Back to categories</a>
    </details>
  </section>;
}
