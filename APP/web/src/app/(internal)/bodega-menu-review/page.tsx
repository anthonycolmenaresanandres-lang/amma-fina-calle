import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { draftMenuSections, publishedBusinessDetails } from "./menu-draft";
import { MovingBodegaSeal } from "./moving-bodega-seal";
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
          <div className={styles.brandLockup}>
            <div className={styles.wordmarkFrame}>
              <Image
                alt="Bodega Cafe Virginia Beach wordmark"
                className={styles.wordmarkImage}
                height={780}
                priority
                src="/assets/bodega/review/bodega-wordmark-review.webp"
                width={1590}
              />
            </div>
          </div>

          <div className={styles.streetStrip} aria-label="Bronx-inspired visual direction">
            <span>BX STYLE STUDY</span>
            <span>CAFECITO</span>
            <span>VIRGINIA BEACH</span>
          </div>

          <MovingBodegaSeal />

          <div className={styles.heroCopy}>
            <div>
              <span className={styles.storyLabel}>The storefront signal</span>
              <p className={styles.officialLead}>{publishedBusinessDetails.lead}.</p>
            </div>
            <div>
              <span className={styles.storyLabel}>Proposed story line - owner approval required</span>
              <p className={styles.proposedStory}>New York energy. Virginia Beach home.</p>
            </div>
          </div>
        </header>

        <section className={styles.chalkInterlude} aria-labelledby="seasonal-board-title">
          <div className={styles.chalkIntro}>
            <span className={styles.chalkKicker}>Seasonal board language</span>
            <h2 id="seasonal-board-title">What&apos;s blooming at Bodega?</h2>
          </div>
          <div className={styles.chalkWords} aria-hidden="true">
            <span>CAFECITO</span>
            <span>SEASONAL</span>
            <span>FRESH PRESS</span>
          </div>
          <p>
            A flexible chalkboard moment for owner-confirmed specials. Names, recipes, prices, and availability stay
            out until Bodega supplies the current board.
          </p>
        </section>

        <aside className={styles.reviewNotice} id="review-notes">
          <strong>Visual system ready / content not approved</strong>
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

        <section className={styles.sessionsTeaser}>
          <div>
            <span className={styles.sessionsKicker}>Bodega Sessions / owner review</span>
            <h2>Catch the beat.</h2>
          </div>
          <div className={styles.sessionsCopy}>
            <p>
              Three fast rounds turn the cup-and-wave identity into a rhythm challenge. The final event link remains
              locked until Bodega confirms what is playing.
            </p>
            <Link href="/bodega-sessions-review">Preview the rhythm game</Link>
          </div>
        </section>

        <footer className={styles.footer}>
          <span className={styles.footerLabel}>Concept by Fina Calle / owner approval required</span>
          <p>
            Logo references supplied by Anthony appear only in this owner-review concept. No music, recipes, prices,
            event claims, or protected owner details are used. Both Bodega review routes remain unlinked and noindex
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
