"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, ArrowUpRight, Check } from "lucide-react";
import { MaracaiboFootballClient } from "./MaracaiboFootballClient";
import type { OrderDestination } from "../toast";
import { tableLabel, type TableOsVenue } from "../venue-config";
import { DecorativeArtwork, FlagArtwork, LogoArtwork } from "./MaracaiboMarks";
import styles from "./maracaibo.module.css";

type View = "welcome" | "menu" | "service" | "match" | "ordering";
type Props = { venue: TableOsVenue; tableId: string; orderDestination: OrderDestination };
const REQUESTS = [
  { id: "server", label: "Server" },
  { id: "water", label: "Water" },
  { id: "cutlery", label: "Napkins & cutlery" },
  { id: "check", label: "The check" },
] as const;
type RequestId = typeof REQUESTS[number]["id"];
const categoryId = (name: string) => "maracaibo-menu-" + name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

export function MaracaiboExperience({ venue, tableId, orderDestination }: Props): React.JSX.Element {
  const [view, setView] = useState<View>("welcome");
  const [request, setRequest] = useState<RequestId | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const titleRef = useRef<HTMLHeadingElement | null>(null);
  const focusAfterNavigation = useRef(false);
  const currentTable = tableLabel(tableId);
  const sourceDate = venue.menuEvidence.sources[0]?.retrievedDate;
  const sourceLabel = sourceDate ? new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" }).format(new Date(sourceDate + "T12:00:00Z")) : "Date recorded with source";

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
    if (selected) setPreview(selected.label);
  }

  return (
    <main className={styles.page} data-venue={venue.id} data-view={view}>
      <a className={styles.skipLink} href={view === "welcome" ? "#maracaibo-actions" : "#maracaibo-content"}>Skip to {view === "welcome" ? "table actions" : "page content"}</a>
      <div className={styles.previewBar}>
        <strong>Concept preview</strong><span>Menu unapproved; orders, staff requests &amp; table payments inactive.</span>
      </div>
      <header className={styles.header}>
        <button type="button" className={styles.wordmark} onClick={returnHome} aria-label="Maracaibo Bistro table home">
          <LogoArtwork className={styles.brandLogo} priority />
          <span className={styles.brandText}>Maracaibo Bistro</span>
        </button>
        <div className={styles.tableMeta}>
          {view === "welcome" ? <FlagArtwork className={styles.headerFlag} /> : null}
          <span>{currentTable}</span>
        </div>
      </header>

      {view === "welcome" ? (
        <section className={styles.welcome} aria-labelledby="maracaibo-title">
          <div className={styles.heroComposition}>
            <h1 ref={titleRef} tabIndex={-1} id="maracaibo-title" className={styles.heroTitle} aria-label="Eat. Play. Stay.">
              <span className={styles.heroEat}>Eat.</span>
              <span className={styles.heroPlay}>Play.</span>
              <span className={styles.stayLine}><em>Stay<span>.</span></em><DecorativeArtwork kind="drink" className={styles.welcomeAccent} /></span>
            </h1>
          </div>
          <div className={styles.actionRail} id="maracaibo-actions" aria-label="Table actions">
            <button type="button" onClick={() => navigate("menu")}><span className={styles.actionNumber} aria-hidden="true">01</span><span><strong>Menu</strong><small>Owner approval pending</small></span><ArrowRight aria-hidden="true" /></button>
            <button type="button" onClick={() => navigate("service")}><span className={styles.actionNumber} aria-hidden="true">02</span><span><strong>Service</strong><small>Preview only</small></span><ArrowRight aria-hidden="true" /></button>
            <button type="button" onClick={() => navigate("ordering")}><span className={styles.actionNumber} aria-hidden="true">03</span><span><strong>Order online</strong><small>Pickup / delivery only</small></span><ArrowRight aria-hidden="true" /></button>
            <button type="button" onClick={() => navigate("match")}><span className={styles.actionNumber} aria-hidden="true">04</span><span><strong>Play</strong><small>Table football · 90 seconds</small></span><ArrowRight aria-hidden="true" /></button>
          </div>
        </section>
      ) : (
        <div className={styles.inner + " " + (view === "match" ? styles.playInner : "")} id="maracaibo-content">
          <div className={styles.innerTop}><button type="button" onClick={returnHome}><ArrowLeft size={16} aria-hidden="true" /> Table home</button></div>

          {view === "menu" ? (
            <section aria-labelledby="menu-title">
              <div className={styles.sectionHeading}><h1 ref={titleRef} tabIndex={-1} id="menu-title">Menu</h1><p>Owner approval pending. Confirm prices &amp; availability with your server.</p></div>
              <div className={styles.categoryBar}><nav aria-label="Menu categories">{venue.menu.map((section) => <a key={section.name} href={"#" + categoryId(section.name)}>{section.name}</a>)}</nav></div>
              <div className={styles.menuSections}>{venue.menu.map((section) => (
                <section className={styles.menuSection} id={categoryId(section.name)} key={section.name}>
                  <h2>{section.name}</h2>
                  <ul>{section.items.map((item) => <li key={item.name}><div><span>{item.name}</span>{item.description ? <p>{item.description}</p> : null}</div><strong>{item.priceDisplay}</strong></li>)}</ul>
                </section>
              ))}</div>
              <p className={styles.allergyNote}>Food allergy? Please tell your server before ordering.</p>
              <details className={styles.previewDetails}><summary>About this preview</summary><p>Public-source menu, retrieved {sourceLabel}. Items, prices, availability and modifiers need owner confirmation. This page does not send orders.</p></details>
              <div className={styles.menuHandoff}><span>Pickup / delivery only</span><a className={styles.textLink} href={orderDestination.url} target="_blank" rel="noreferrer">Order on Toast <ArrowUpRight size={17} aria-hidden="true" /><span className={styles.srOnly}> (opens in a new tab)</span></a></div>
            </section>
          ) : null}

          {view === "service" ? (
            <section aria-labelledby="service-title">
              <div className={styles.sectionHeading + " " + styles.serviceHeading}><h1 ref={titleRef} tabIndex={-1} id="service-title">Service</h1><p>Preview only. For help, ask your server.</p><DecorativeArtwork kind="bell" className={styles.serviceAccent} /></div>
              <div className={styles.serviceOptions} role="group" aria-label="Choose an example service request">{REQUESTS.map(({ id, label }) => <button key={id} type="button" aria-pressed={request === id} onClick={() => { setRequest(id); setPreview(null); }}><span>{label}</span><span className={styles.selectionMark} aria-hidden="true">{request === id ? <Check size={16} /> : null}</span></button>)}</div>
              <div className={styles.requestAction}><button type="button" className={styles.primaryButton} disabled={!request} onClick={showRequestPreview}>Preview request</button></div>
              <div className={styles.requestStatus} role="status" aria-live="polite">{preview ? <><strong>{preview}</strong><p>Preview only. Nothing sent.</p></> : null}</div>
            </section>
          ) : null}

          {view === "ordering" ? (
            <section aria-labelledby="ordering-title">
              <div className={styles.sectionHeading}><h1 ref={titleRef} tabIndex={-1} id="ordering-title">Your check</h1></div>
              <div className={styles.checkState}><h2>Table payment unavailable</h2><p>Ask your server to view or pay your bill.<br />No live check or payment status is connected.</p></div>
              <div className={styles.takeout}><h2>Ordering to go?</h2><p>Toast is for pickup / delivery only.<br />It does not open or settle your table’s check.</p><a className={styles.primaryButton} href={orderDestination.url} target="_blank" rel="noreferrer">Order on Toast <ArrowUpRight size={17} aria-hidden="true" /><span className={styles.srOnly}> for pickup or delivery (opens in a new tab)</span></a></div>
            </section>
          ) : null}

          {view === "match" ? (
            <section aria-labelledby="match-title"><div className={styles.matchHeading}><h1 ref={titleRef} tabIndex={-1} id="match-title" className={styles.matchTitle}>Table match</h1><DecorativeArtwork kind="football" className={styles.lobbyAccent} /></div><MaracaiboFootballClient venue={venue} tableId={tableId} onNavigate={(next) => navigate(next)} /></section>
          ) : null}

          {view !== "match" ? <nav className={styles.utilityBar} aria-label="Table navigation"><button type="button" aria-current={view === "menu" ? "page" : undefined} onClick={() => navigate("menu")}>Menu</button><button type="button" aria-current={view === "service" ? "page" : undefined} onClick={() => navigate("service")}>Service</button><button type="button" onClick={() => navigate("welcome")}>Home</button></nav> : null}
        </div>
      )}
      <footer className={styles.footer}><span>FinaCalle</span>{view === "welcome" || view === "service" || view === "match" ? <small className={styles.artworkCredit}>Object illustrations · AI generated</small> : null}</footer>
    </main>
  );
}
