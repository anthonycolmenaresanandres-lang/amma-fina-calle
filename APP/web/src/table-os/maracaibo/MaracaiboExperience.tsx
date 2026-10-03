"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowDown, ArrowLeft, ArrowUpRight, Bell, Check, GlassWater, ReceiptText, Utensils } from "lucide-react";
import { TableMatchClient } from "../TableMatchClient";
import type { OrderDestination } from "../toast";
import { tableLabel, type TableOsVenue } from "../venue-config";
import { FlagArtwork, TeamMark } from "./MaracaiboMarks";
import styles from "./maracaibo.module.css";

type View = "welcome" | "menu" | "service" | "match" | "ordering";
type Props = { venue: TableOsVenue; tableId: string; orderDestination: OrderDestination };
const REQUESTS = [
  { id: "server", label: "Call our server", detail: "A question for the team.", icon: Bell },
  { id: "water", label: "Water, please", detail: "An example request for your table.", icon: GlassWater },
  { id: "cutlery", label: "Napkins or cutlery", detail: "A little help at the table.", icon: Utensils },
  { id: "check", label: "Bring the check", detail: "Preview asking for the bill.", icon: ReceiptText },
] as const;
type RequestId = typeof REQUESTS[number]["id"];
const categoryId = (name: string) => `maracaibo-menu-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;

export function MaracaiboExperience({ venue, tableId, orderDestination }: Props): React.JSX.Element {
  const [view, setView] = useState<View>("welcome");
  const [request, setRequest] = useState<RequestId | null>(null);
  const [preview, setPreview] = useState<{ label: string; time: string } | null>(null);
  const titleRef = useRef<HTMLHeadingElement | null>(null);
  const focusAfterNavigation = useRef(false);
  const currentTable = tableLabel(tableId);
  const sourceDate = venue.menuEvidence.sources[0]?.retrievedDate;
  const sourceLabel = sourceDate ? new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" }).format(new Date(`${sourceDate}T12:00:00Z`)) : "Date recorded with source";

  function navigate(next: View): void {
    if (view === next) return;
    focusAfterNavigation.current = true;
    setView(next);
  }

  useEffect(() => {
    if (focusAfterNavigation.current) {
      window.scrollTo({ top: 0, behavior: "instant" });
      titleRef.current?.focus({ preventScroll: true });
      focusAfterNavigation.current = false;
    }
  }, [view]);

  function returnHome(): void {
    if (view !== "match" || window.confirm("Leave this match view? Your place and score may not be restored when you return.")) navigate("welcome");
  }

  function showRequestPreview(): void {
    const selected = REQUESTS.find((item) => item.id === request);
    if (!selected) return;
    setPreview({ label: selected.label, time: new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" }).format(new Date()) });
  }

  return (
    <main className={styles.page} data-venue={venue.id} data-view={view}>
      <a className={styles.skipLink} href={view === "welcome" ? "#maracaibo-actions" : "#maracaibo-content"}>Skip to {view === "welcome" ? "table actions" : "page content"}</a>
      <div className={styles.previewBar}>
        <strong>Concept preview.</strong> Menu needs owner approval. No orders or staff requests are sent. Table payment is inactive.
      </div>
      <header className={styles.header}>
        <button type="button" className={styles.wordmark} onClick={returnHome} aria-label="Maracaibo Bistro table home">
          <span>Maracaibo <i>Bistro</i></span>
          <small>Virginia Beach · Venezuelan kitchen</small>
        </button>
        <span className={styles.tableBadge}>{currentTable}</span>
      </header>

      {view === "welcome" ? (
        <section className={styles.welcome} aria-labelledby="maracaibo-title">
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>A little Maracaibo. At your table.</p>
            <h1 ref={titleRef} tabIndex={-1} id="maracaibo-title">Eat.<br />Play.<br /><em>Stay.</em></h1>
            <div className={styles.heroBottom}><div><p className={styles.heroLine}>Good food. Your people.<br />A little friendly competition.</p><p className={styles.heroUtility}>Explore the menu, preview a request, or try a table match.</p></div><FlagArtwork className={styles.heroFlag} prominent /></div>
          </div>
          <div className={styles.actionRail} id="maracaibo-actions" aria-label="Table actions">
            <button type="button" onClick={() => navigate("menu")}><span className={styles.actionNumber}>01</span><strong>Explore the menu</strong><small>Public-source menu · owner approval pending</small><ArrowUpRight aria-hidden="true" /></button>
            <button type="button" onClick={() => navigate("service")}><span className={styles.actionNumber}>02</span><strong>Need a hand?</strong><small>Preview table-service requests</small><ArrowUpRight aria-hidden="true" /></button>
            <button type="button" onClick={() => navigate("ordering")}><span className={styles.actionNumber}>03</span><strong>Current Toast ordering</strong><small>Pickup / delivery only · no table payment</small><ArrowUpRight aria-hidden="true" /></button>
            <button type="button" onClick={() => navigate("match")}><span className={styles.actionNumber}>04</span><strong>Play a table match</strong><small>Football prototype · try a role</small><TeamMark team="away" /></button>
          </div>
        </section>
      ) : (
        <div className={`${styles.inner} ${view === "match" ? styles.playInner : styles.paper}`} id="maracaibo-content">
          <div className={styles.innerTop}><button type="button" onClick={returnHome}><ArrowLeft size={17} aria-hidden="true" /> Table home</button><span>{currentTable} · {view === "match" ? "Play preview" : "Owner-review concept"}</span></div>

          {view === "menu" ? (
            <section aria-labelledby="menu-title">
              <div className={`${styles.sectionHeading} ${styles.withArtwork}`}><FlagArtwork className={styles.headingFlag} decorative /><p className={styles.eyebrow}>Pa’ Maracaibo, and more</p><h1 ref={titleRef} tabIndex={-1} id="menu-title">What sounds good?</h1><p>Take a look around the menu.</p></div>
              <div className={styles.sourceNotice}><strong>Menu preview · owner confirmation required</strong><p>Public-source items and prices, retrieved {sourceLabel}. Availability, modifiers and prices need confirmation before ordering.</p></div>
              <div className={styles.categoryBar}><span>Browse categories <ArrowDown size={15} aria-hidden="true" /></span><nav aria-label="Menu categories">{venue.menu.map((section) => <a key={section.name} href={`#${categoryId(section.name)}`}>{section.name}</a>)}</nav></div>
              <div className={styles.menuSections}>{venue.menu.map((section) => (
                <section className={styles.menuSection} id={categoryId(section.name)} key={section.name}>
                  <h2>{section.name}</h2>
                  <ul>{section.items.map((item) => <li key={item.name}><div><span>{item.name}</span>{item.description ? <p>{item.description}</p> : null}</div><strong>{item.priceDisplay}</strong></li>)}</ul>
                </section>
              ))}</div>
              <p className={styles.allergyNote}>Food allergy? Please speak with your server before ordering.</p>
              <div className={styles.menuHandoff}><div><strong>Looking for pickup or delivery?</strong><p>The restaurant’s current online ordering opens in Toast.</p></div><a className={styles.secondaryButton} href={orderDestination.url} target="_blank" rel="noreferrer">Open Toast ordering <ArrowUpRight size={18} aria-hidden="true" /><span className={styles.srOnly}> for pickup or delivery (opens in a new tab)</span></a></div>
            </section>
          ) : null}

          {view === "service" ? (
            <section aria-labelledby="service-title">
              <div className={`${styles.sectionHeading} ${styles.withArtwork}`}><FlagArtwork className={styles.headingFlag} decorative /><p className={styles.eyebrow}>A little help at the table</p><h1 ref={titleRef} tabIndex={-1} id="service-title">Need a hand?</h1><p>{currentTable} · Try a request preview.</p></div>
              <div className={styles.sourceNotice}><strong>These are example requests.</strong><p>The owner must confirm the options and staff workflow. Nothing here is sent to the restaurant.</p></div>
              <div className={styles.serviceOptions} role="group" aria-label="Choose an example service request">{REQUESTS.map(({ id, label, detail, icon: Icon }) => <button key={id} type="button" aria-pressed={request === id} onClick={() => { setRequest(id); setPreview(null); }}><Icon aria-hidden="true" size={27} /><span><strong>{label}</strong><small>{detail}</small></span><span className={styles.selectionMark} aria-hidden="true">{request === id ? <Check size={18} /> : "+"}</span></button>)}</div>
              <div className={styles.requestAction}><button type="button" className={styles.primaryButton} disabled={!request} onClick={showRequestPreview}>Preview this request</button><p>Stays on this phone. No staff notification.</p></div>
              <div className={styles.requestStatus} role="status" aria-live="polite">{preview ? <><span className={styles.eyebrow}>Preview only. Nothing was sent.</span><h2>{preview.label}</h2><p>{currentTable} · Viewed on this phone at {preview.time}</p><p>For help now, please ask a team member in person.</p></> : <p>Select an example above to see how a request could look.</p>}</div>
            </section>
          ) : null}

          {view === "ordering" ? (
            <section className={styles.orderingSection} aria-labelledby="ordering-title">
              <div className={styles.sectionHeading}><p className={styles.eyebrow}>Maracaibo Bistro · Virginia Beach</p><h1 ref={titleRef} tabIndex={-1} id="ordering-title">Ordering & your check</h1><p>{currentTable}</p></div>
              <div className={styles.checkState}><ReceiptText size={34} aria-hidden="true" /><h2>Table payment isn’t connected in this preview.</h2><p>To view or pay your table’s bill, please ask your server. This page has no live check or payment status.</p><span className={styles.stateTag}>Owner setup required</span></div>
              <div className={styles.takeout}><span className={styles.eyebrow}>The existing online ordering link</span><h2>Pickup or delivery?</h2><p>Continue to the restaurant’s current Toast ordering page. This link does not open or settle your dine-in table’s check.</p><a className={styles.primaryButton} href={orderDestination.url} target="_blank" rel="noreferrer">Open Toast pickup / delivery <ArrowUpRight size={18} aria-hidden="true" /><span className={styles.srOnly}> (opens in a new tab)</span></a></div>
            </section>
          ) : null}

          {view === "match" ? (
            <section aria-labelledby="match-title"><h1 ref={titleRef} tabIndex={-1} id="match-title" className={styles.matchTitle}>Maracaibo Table Match</h1><TableMatchClient venue={venue} tableId={tableId} onNavigate={(next) => navigate(next)} /></section>
          ) : null}

          {view !== "match" ? <nav className={styles.utilityBar} aria-label="Table navigation"><button type="button" aria-current={view === "menu" ? "page" : undefined} onClick={() => navigate("menu")}>Menu</button><button type="button" aria-current={view === "service" ? "page" : undefined} onClick={() => navigate("service")}>Service preview</button><button type="button" onClick={() => navigate("welcome")}>Table home</button></nav> : null}
        </div>
      )}
      <footer className={styles.footer}><span>Maracaibo Bistro · {currentTable}<small>Prospect preview · owner confirmation required</small><small>Flag artwork: AI-generated decorative concept</small></span><span className={styles.maker}><span aria-hidden="true">✳</span> Made with FinaCalle</span></footer>
    </main>
  );
}
