import type { Metadata } from "next";
import { draftMenuSections, publishedBusinessDetails } from "./menu-draft";
import { RouteBecomesRhythm } from "./route-becomes-rhythm";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Bodega menu direction - live owner review",
  description: "Live owner-review concept. Items, prices, and branding require owner approval.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
};

export default function BodegaMenuReviewPage() {
  return (
    <main className={styles.page}>
      <div className={styles.reviewBar}>Live concept / owner review / prices withheld</div>

      <div className={styles.shell}>
        <div className={styles.utilityRow}>
          <span>Menu direction 01</span>
          <a href="#review-notes">Evidence notes</a>
        </div>

        <header className={styles.hero}>
          <span className={styles.storyLabel}>Route becomes rhythm</span>
          <h1 className={styles.wordmark}>Bodega</h1>

          <div className={styles.routeField}>
            <RouteBecomesRhythm />
          </div>

          <div className={styles.heroCopy}>
            <p className={styles.officialLead}>{publishedBusinessDetails.lead}.</p>
            <div>
              <span className={styles.storyLabel}>Proposed story line - owner approval required</span>
              <p className={styles.proposedStory}>New York energy. Virginia Beach home.</p>
            </div>
          </div>
        </header>

        <aside className={styles.reviewNotice} id="review-notes">
          <strong>Structure ready / content not approved</strong>
          <p>
            Item names below are public-source candidates for layout review only. Bodega must provide the current
            source menu before any item, category, price, recipe, modifier, or availability is treated as accurate.
          </p>
        </aside>

        <nav className={styles.sectionNav} aria-label="Draft menu sections">
          {draftMenuSections.map((section) => (
            <a href={`#${section.id}`} key={section.id}>
              {section.title}
            </a>
          ))}
          <a href="#hours">Hours</a>
        </nav>

        <div className={styles.menuGrid}>
          {draftMenuSections.map((section) => (
            <section className={styles.menuSection} id={section.id} key={section.id}>
              <header className={styles.sectionHeader}>
                <span className={styles.sectionSide}>{section.side}</span>
                <h2>{section.title}</h2>
                <p>{section.note}</p>
              </header>

              <ul className={styles.itemList}>
                {section.items.map((item) => (
                  <li className={styles.item} key={item.name}>
                    <span>
                      <span className={styles.itemName}>{item.name}</span>
                      <span className={styles.sourceLabel}>{item.sourceLabel}</span>
                    </span>
                    <span className={styles.priceLabel}>Price pending</span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <section className={styles.hours} id="hours">
          <div>
            <span className={styles.storyLabel}>Published information - reconfirm before launch</span>
            <h2>Hours</h2>
            <p className={styles.address}>{publishedBusinessDetails.address}</p>
          </div>
          <ul className={styles.hoursList}>
            {publishedBusinessDetails.hours.map((entry) => (
              <li key={entry.days}>
                <span>{entry.days}</span>
                <time>{entry.time}</time>
              </li>
            ))}
          </ul>
        </section>

        <footer className={styles.footer}>
          <span className={styles.footerLabel}>Concept by Fina Calle / owner approval required</span>
          <p>
            No scraped logo, photography, music, recipes, prices, or protected owner details are used in this draft.
            This live review link remains unlinked and noindex until the owners approve its content.
          </p>
          <a href={publishedBusinessDetails.instagramUrl} target="_blank" rel="noreferrer">
            Review the official Instagram profile
          </a>
        </footer>
      </div>
    </main>
  );
}
