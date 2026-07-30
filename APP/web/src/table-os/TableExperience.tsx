"use client";

import { useEffect, useState } from "react";
import { TableMatchClient } from "./TableMatchClient";
import type { OrderDestination } from "./toast";
import { tableLabel, type TableOsVenue } from "./venue-config";
import styles from "./table-experience.module.css";

type View = "welcome" | "menu" | "service" | "match";

type Props = Readonly<{
  venue: TableOsVenue;
  tableId: string;
  orderDestination: OrderDestination;
}>;

const SERVICE_REQUESTS = [
  {
    label: "Call our server",
    detail: "A simple hand raise without waiting for eye contact.",
  },
  {
    label: "Chips & salsa",
    detail: "Request a refill from the table.",
  },
  {
    label: "Tableside guacamole",
    detail: "Flag the signature cart experience.",
  },
  {
    label: "Ready for the check",
    detail: "Let the assigned server know the table is ready.",
  },
] as const;

export function TableExperience({ venue, tableId, orderDestination }: Props): React.JSX.Element {
  const [view, setView] = useState<View>("welcome");
  const [lastRequest, setLastRequest] = useState<string | null>(null);
  const currentTable = tableLabel(tableId);
  const retrievedDate = venue.menuEvidence.sources[0]?.retrievedDate ?? "source date recorded";

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [view]);

  return (
    <main className={styles.page} data-venue={venue.id}>
      <a className={styles.skipLink} href="#table-actions">Skip to table actions</a>
      <div className={styles.reviewBar}>
        Prospect preview · owner confirmation required · no requests or orders are sent
      </div>

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
              See the menu, preview table-service requests, continue to the restaurant&apos;s current ordering, or
              start a quick match with the people at your table.
            </p>
          </div>

          <div className={styles.actionRail} id="table-actions" aria-label="Table actions">
            <button type="button" onClick={() => setView("menu")}>
              <span>01</span>
              <strong>See the current menu</strong>
              <small>Public-source preview · owner confirmation pending</small>
            </button>
            <button type="button" onClick={() => setView("service")}>
              <span>02</span>
              <strong>Ask for table service</strong>
              <small>Preview refills, server calls, tableside guacamole, and the check</small>
            </button>
            <a href={orderDestination.url} target="_blank" rel="noreferrer">
              <span>03</span>
              <strong>{orderDestination.buttonLabel}</strong>
              <small>{orderDestination.statusLine}</small>
            </a>
            <button type="button" onClick={() => setView("match")}>
              <span>04</span>
              <strong>Play a table match</strong>
              <small>Up to four phones · no account required</small>
            </button>
          </div>

          <div className={styles.pitchPreview} aria-hidden="true">
            <div className={styles.centerCircle} />
            <div className={styles.ball}>●</div>
            <span>{venue.name}</span>
          </div>
        </section>
      ) : null}

      {view === "menu" ? (
        <section className={styles.menu}>
          <div className={styles.sectionIntro}>
            <button type="button" onClick={() => setView("welcome")}>← Table home</button>
            <span>Public-source menu · retrieved {retrievedDate}</span>
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
            <a href={orderDestination.url} target="_blank" rel="noreferrer">
              {orderDestination.buttonLabel}
            </a>
            <button type="button" onClick={() => setView("service")}>Ask for service</button>
            <button type="button" onClick={() => setView("match")}>Play while you wait</button>
          </div>
        </section>
      ) : null}

      {view === "service" ? (
        <section className={styles.service}>
          <div className={styles.sectionIntro}>
            <button type="button" onClick={() => setView("welcome")}>← Table home</button>
            <span>{currentTable} · service request preview</span>
            <h1>Need a<br />hand?</h1>
            <p>
              DEMO MODE — TAPS STAY ON THIS PHONE. NOTHING IS SENT TO RESTAURANT STAFF UNTIL THE OWNER APPROVES
              ROUTING AND ESCALATION RULES.
            </p>
          </div>

          <div className={styles.serviceGrid} aria-label="Service request preview options">
            {SERVICE_REQUESTS.map((request) => (
              <button
                type="button"
                className={styles.serviceOption}
                aria-pressed={lastRequest === request.label}
                key={request.label}
                onClick={() => setLastRequest(request.label)}
              >
                <strong>{request.label}</strong>
                <span>{request.detail}</span>
              </button>
            ))}
          </div>

          <div className={styles.serviceStatus} aria-live="polite">
            {lastRequest ? (
              <>
                <span>Demo captured for {currentTable}</span>
                <strong>{lastRequest}</strong>
                <p>
                  No message was sent. Production can route this to the assigned server, a staff tablet, SMS, a
                  kitchen printer, or the POS after the restaurant confirms its workflow.
                </p>
              </>
            ) : (
              <>
                <span>Try the prospect flow</span>
                <strong>Select one request above.</strong>
                <p>The live pilot will add acknowledgment, timing, repeat-request protection, and escalation.</p>
              </>
            )}
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
        <span>Fina Calle Table OS · prospect build</span>
        <span>
          {venue.ordering.providerName} processes current online orders. Fina Calle does not collect payment data.
        </span>
      </footer>
    </main>
  );
}
