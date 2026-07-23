"use client";

import { useEffect, useState } from "react";
import { TableMatchClient } from "./TableMatchClient";
import type { ToastDestination } from "./toast";
import { tableLabel, type TableOsVenue } from "./venue-config";
import styles from "./table-experience.module.css";

type View = "welcome" | "menu" | "match";

type Props = Readonly<{
  venue: TableOsVenue;
  tableId: string;
  toastDestination: ToastDestination;
}>;

export function TableExperience({ venue, tableId, toastDestination }: Props): React.JSX.Element {
  const [view, setView] = useState<View>("welcome");
  const currentTable = tableLabel(tableId);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [view]);

  return (
    <main className={styles.page}>
      <div className={styles.reviewBar}>Owner-review MVP · source menu requires confirmation · no orders are processed here</div>

      <header className={styles.header}>
        <button type="button" className={styles.wordmark} onClick={() => setView("welcome")}>
          <span>{venue.name}</span>
          <small>{venue.cityLine}</small>
        </button>
        <span className={styles.tableBadge}>{currentTable}</span>
      </header>

      {view === "welcome" ? (
        <section className={styles.welcome}>
          <div className={styles.heroCopy}>
            <span className={styles.eyebrow}>One scan. Your whole table.</span>
            <h1>Eat.<br />Play.<br /><em>Stay.</em></h1>
            <p>
              See the menu, continue to the restaurant&apos;s Toast ordering, or start a quick match with the people
              at your table.
            </p>
          </div>

          <div className={styles.actionRail} aria-label="Table actions">
            <button type="button" onClick={() => setView("menu")}>
              <span>01</span>
              <strong>See the actual menu</strong>
              <small>Public-source preview · owner confirmation pending</small>
            </button>
            <a href={toastDestination.url} target="_blank" rel="noreferrer">
              <span>02</span>
              <strong>{toastDestination.buttonLabel}</strong>
              <small>{toastDestination.statusLine}</small>
            </a>
            <button type="button" onClick={() => setView("match")}>
              <span>03</span>
              <strong>Play a table match</strong>
              <small>Up to four phones · no account required</small>
            </button>
          </div>

          <div className={styles.pitchPreview} aria-hidden="true">
            <div className={styles.centerCircle} />
            <div className={styles.ball}>●</div>
            <span>MARACAIBO</span>
          </div>
        </section>
      ) : null}

      {view === "menu" ? (
        <section className={styles.menu}>
          <div className={styles.sectionIntro}>
            <button type="button" onClick={() => setView("welcome")}>← Table home</button>
            <span>Public-source menu · retrieved 2026-07-23</span>
            <h1>What are<br />you feeling?</h1>
            <p>{venue.menuEvidence.prominentNotice}</p>
          </div>

          <nav className={styles.menuNav} aria-label="Menu sections">
            {venue.menu.map((section) => (
              <a href={`#menu-${section.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`} key={section.name}>
                {section.name}
              </a>
            ))}
          </nav>

          <div className={styles.menuSections}>
            {venue.menu.map((section, sectionIndex) => (
              <section
                className={styles.menuSection}
                id={`menu-${section.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
                key={section.name}
              >
                <header>
                  <span>{String(sectionIndex + 1).padStart(2, "0")}</span>
                  <h2>{section.name}</h2>
                </header>
                <ul>
                  {section.items.map((item) => (
                    <li key={`${section.name}-${item.name}`}>
                      <span>{item.name}</span>
                      <strong>{item.priceDisplay}</strong>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>

          <div className={styles.stickyOrder}>
            <a href={toastDestination.url} target="_blank" rel="noreferrer">
              {toastDestination.buttonLabel}
            </a>
            <button type="button" onClick={() => setView("match")}>Play while you wait</button>
          </div>
        </section>
      ) : null}

      {view === "match" ? (
        <section className={styles.match}>
          <div className={styles.matchHeader}>
            <button type="button" onClick={() => setView("welcome")}>← Table home</button>
            <span>{currentTable} · shared room</span>
          </div>
          <TableMatchClient venue={venue} tableId={tableId} />
        </section>
      ) : null}

      <footer className={styles.footer}>
        <span>Fina Calle Table OS · concept build</span>
        <span>Toast processes orders and payments. This page does not collect payment data.</span>
      </footer>
    </main>
  );
}
