import type { Metadata } from "next";
import Link from "next/link";
import { draftMenuSections, publishedBusinessDetails } from "./menu-draft";
import { BodegaSignalLogo } from "./bodega-signal-logo";
import { FallSessions } from "./fall-sessions";
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
          <span>Bronx-style storefront study / owner review</span>
          <a href="#review-notes">Evidence notes</a>
        </div>

        <header className={styles.hero}>
          <BodegaSignalLogo />
        </header>

        <FallSessions />

        <aside className={styles.reviewNotice} id="review-notes">
          <strong>Visual system ready / content not approved</strong>
          <p>
            Fall Sessions names and descriptions come from the supplied Bodega board. Other menu sections remain
            public-source candidates for owner review. Prices and current availability still require confirmation.
          </p>
        </aside>

        <nav className={styles.sectionNav} aria-label="Draft menu sections">
          <a href="#fall-sessions">Fall Sessions</a>
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

        <section className={styles.sessionsTeaser}>
          <div>
            <span className={styles.sessionsKicker}>Bodega Fall Rush / owner review</span>
            <h2>Cafecito weather. Game on.</h2>
          </div>
          <div className={styles.sessionsCopy}>
            <p>
              Tap your favorites. Reach 100 points in 20 seconds.
            </p>
            <Link href="/bodega-sessions-review">Play Fall Rush</Link>
          </div>
        </section>

        <footer className={styles.footer}>
          <span className={styles.footerLabel}>Concept by Fina Calle / owner approval required</span>
          <p>
            Logo references supplied by Anthony appear only in this owner-review concept. Seasonal descriptions are transcribed from the supplied board; artwork is illustrative. No prices,
            event claims, or protected owner details are published. Both Bodega review routes remain unlinked and noindex
            until the owners approve their content and asset use.
          </p>
          <a href={publishedBusinessDetails.instagramUrl} target="_blank" rel="noreferrer">
            Review the official Instagram profile
          </a>
        </footer>
      </div>
    </main>
  );
}
