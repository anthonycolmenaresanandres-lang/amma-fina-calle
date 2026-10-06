"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Check, Star } from "lucide-react";
import Image from "next/image";
import { usePhone } from "./use-phone";
import { useTableVisit } from "./use-table-visit";
import { MaracaiboPenaltyClient } from "./MaracaiboPenaltyClient";
import { MaracaiboFootballClient } from "./MaracaiboFootballClient";
import type { OrderDestination } from "../toast";
import { tableLabel, type TableOsVenue } from "../venue-config";
import { DecorativeArtwork, FlagArtwork, LogoArtwork } from "./MaracaiboMarks";
import { Lettering } from "./MaracaiboLettering";
import { MaracaiboWordmark } from "./MaracaiboWordmark";
import styles from "./maracaibo.module.css";

type View = "welcome" | "menu" | "service" | "match" | "games" | "penalty" | "ordering";
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
  const device = usePhone();
  const [multiplayerRequested, setMultiplayerRequested] = useState(false);
  const membership = useTableVisit(tableId, device === "phone" && multiplayerRequested);
  const [view, setView] = useState<View>("welcome");
  const [request, setRequest] = useState<RequestId | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const titleRef = useRef<HTMLHeadingElement | null>(null);
  const focusAfterNavigation = useRef(false);
  const activeMatch = useRef(false);
  const reportMatchActive = useCallback((active: boolean) => { activeMatch.current = active; }, []);
  const currentTable = tableLabel(tableId);
  const sourceDate = venue.menuEvidence.sources[0]?.retrievedDate;
  const sourceLabel = sourceDate ? new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" }).format(new Date(sourceDate + "T12:00:00Z")) : "Date recorded with source";

  // Solo adds one same-URL history entry, retaining the router's own state.
  useEffect(() => {
    const restorePenaltyView = () => {
      const entry = window.history.state?.maracaiboPenalty;
      if (entry?.tableId !== tableId || (entry.view !== "penalty" && entry.view !== "menu")) return;
      activeMatch.current = false;
      focusAfterNavigation.current = true;
      setView(entry.view);
    };
    restorePenaltyView();
    window.addEventListener("popstate", restorePenaltyView);
    return () => window.removeEventListener("popstate", restorePenaltyView);
  }, [tableId]);

  function navigate(next: View): void {
    if (view === next) return;
    if ((view === "match" || view === "penalty") && activeMatch.current && !window.confirm(view === "penalty" ? "Leave this shootout? Your five-shot round will end." : "Leave this match? Your place will be available to someone else.")) return;
    activeMatch.current = false;
    focusAfterNavigation.current = true;
    if (next === "penalty") {
      window.history.replaceState({ ...window.history.state, maracaiboPenalty: { tableId, view: "menu" } }, "");
      window.history.pushState({ ...window.history.state, maracaiboPenalty: { tableId, view: "penalty" } }, "");
    } else if (view === "penalty" && next === "menu" && window.history.state?.maracaiboPenalty?.view === "penalty") {
      window.history.back();
      return;
    }
    if (next === "match") setMultiplayerRequested(true);
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
    navigate("welcome");
  }

  function showRequestPreview(): void {
    const selected = REQUESTS.find((item) => item.id === request);
    if (selected) setPreview(selected.label);
  }

  if (view === "match" && device === "phone") {
    return (
      <main className={styles.page + " " + styles.footballFullscreen} data-venue={venue.id} data-view="match">
        <h1 ref={titleRef} tabIndex={-1} className={styles.srOnly}>Table Football</h1>
        {membership.status === "active" && membership.visit ? (
          <MaracaiboFootballClient key={membership.visit.visitId} venue={venue} tableId={tableId} visitId={membership.visit.visitId}
            onNavigate={(next) => navigate(next)} onBack={() => navigate("menu")} onActiveChange={reportMatchActive} />
        ) : (
          <div className={styles.footballGame}>
            <div className={styles.footballHud}><button type="button" className={styles.footballBack} onClick={() => navigate("menu")}>Back to menu</button></div>
            <div className={styles.footballSetup}>
              <p role="status">{membership.status === "connecting" ? ("Connecting to " + currentTable + ".") : membership.status === "ended" ? "Your table visit has ended. Still at the table? Join again to play." : "Your table couldn't connect. You can still play Penalty Rush."}</p>
              {membership.status !== "connecting" ? <button type="button" className={styles.primaryButton} onClick={() => { activeMatch.current = false; void (membership.status === "ended" ? membership.rejoin() : membership.retry()); }}>{membership.status === "ended" ? "Join this table" : "Retry connection"}</button> : null}
            </div>
          </div>
        )}
      </main>
    );
  }

  if (view === "penalty") {
    return (
      <main className={styles.page + " " + styles.penaltyFullscreen} data-venue={venue.id} data-view="penalty">
        <h1 ref={titleRef} tabIndex={-1} className={styles.srOnly}>Penalty Rush</h1>
        <MaracaiboPenaltyClient onActiveChange={reportMatchActive} onBack={() => navigate("menu")} />
      </main>
    );
  }

  return (
    <main className={styles.page} data-venue={venue.id} data-view={view}>
      <div className={styles.flagStars} aria-hidden="true">{Array.from({ length: 8 }, (_, index) => <Star key={index} fill="currentColor" strokeWidth={0} />)}</div>
      <a className={styles.skipLink} href={view === "welcome" ? "#maracaibo-actions" : "#maracaibo-content"}>Skip to {view === "welcome" ? "table actions" : "page content"}</a>
      <div className={styles.previewBar}>
        <p><strong>Concept preview.</strong> Menu unapproved. Orders, service &amp; payments inactive.</p>
      </div>
      <header className={styles.header}>
        <button type="button" className={styles.wordmark} onClick={returnHome} aria-label="Maracaibo Bistro table home">
          <LogoArtwork className={styles.brandLogo} priority />
          <span className={styles.brandCopy}>
            <MaracaiboWordmark />
            <span className={styles.brandCuisine}>Venezuelan Food</span>
          </span>
        </button>
        <div className={styles.tableMeta}>
          <FlagArtwork className={styles.headerFlag} decorative />
          <span>{currentTable}</span>
        </div>
      </header>

      {view === "welcome" ? (
        <section className={styles.welcome} aria-labelledby="maracaibo-title">
          <h1 ref={titleRef} tabIndex={-1} id="maracaibo-title" className={styles.srOnly}>Maracaibo Bistro — Venezuelan Food</h1>
          <div className={styles.actionRail} id="maracaibo-actions" aria-label="Table actions">
            <button type="button" onClick={() => navigate("menu")}><strong><Lettering name="menu" label="Menu" priority /></strong><small>Explore the menu</small></button>
            <button type="button" onClick={() => navigate("ordering")}><strong><Lettering name="order-online" label="Order online" priority /></strong><small>Pickup &amp; delivery only</small></button>
            <button type="button" onClick={() => navigate("service")}><strong><Lettering name="service" label="Service" priority /></strong><small>Ask your server · Preview</small></button>
            <button type="button" onClick={() => navigate("games")}><strong className={styles.playLettering}><Lettering name="play" label="Play" priority /></strong><small>Multiplayer football · Solo penalties</small></button>
          </div>
        </section>
      ) : (
        <div className={styles.inner + " " + (["match", "games"].includes(view) ? styles.playInner : "")} id="maracaibo-content">
          <div className={styles.innerTop}><button type="button" onClick={() => navigate(view === "match" ? "games" : "welcome")}>{view === "match" ? "Games" : "Home"}</button></div>

          {view === "menu" ? (
            <section aria-labelledby="menu-title">
              <div className={styles.sectionHeading}><h1 ref={titleRef} tabIndex={-1} id="menu-title"><Lettering name="menu" label="Menu" /></h1><p>Owner approval pending. Confirm prices &amp; availability with your server.</p></div>
              <div className={styles.categoryBar}><nav aria-label="Menu categories">{venue.menu.map((section) => <a key={section.name} href={"#" + categoryId(section.name)}>{section.name}</a>)}</nav></div>
              <div className={styles.menuSections}>{venue.menu.map((section, index) => (
                <section className={styles.menuSection} id={categoryId(section.name)} key={section.name} data-flag-color={index % 3}>
                  <h2><Lettering name={section.name.toLowerCase().replace(/'/g, "").replace(/\s+/g, "-")} label={section.name} category /></h2>
                  <ul>{section.items.map((item) => <li key={item.name}><div><span>{item.name}</span>{item.description ? <p>{item.description}</p> : null}</div><strong>{item.priceDisplay}</strong></li>)}</ul>
                </section>
              ))}</div>
              <p className={styles.allergyNote}>Food allergy? Please tell your server before ordering.</p>
              <details className={styles.previewDetails}><summary>About this preview</summary><p>Public-source menu, retrieved {sourceLabel}. Items, prices, availability and modifiers need owner confirmation. This page does not send orders.</p></details>
              <div className={styles.menuHandoff}><span>Pickup / delivery only</span><a className={styles.textLink} href={orderDestination.url} target="_blank" rel="noreferrer">Order on Toast<span className={styles.srOnly}> (opens in a new tab)</span></a></div>
            </section>
          ) : null}

          {view === "service" ? (
            <section aria-labelledby="service-title">
              <div className={styles.sectionHeading + " " + styles.serviceHeading}><h1 ref={titleRef} tabIndex={-1} id="service-title"><Lettering name="service" label="Service" /></h1><p>Preview only. For help, ask your server.</p></div>
              <div className={styles.serviceOptions} role="group" aria-label="Choose an example service request">{REQUESTS.map(({ id, label }) => <button key={id} type="button" aria-pressed={request === id} onClick={() => { setRequest(id); setPreview(null); }}><span>{label}</span><span className={styles.selectionMark} aria-hidden="true">{request === id ? <Check size={16} /> : null}</span></button>)}</div>
              <div className={styles.requestAction}><button type="button" className={styles.primaryButton} disabled={!request} onClick={showRequestPreview}>Preview request</button></div>
              <div className={styles.requestStatus} role="status" aria-live="polite">{preview ? <><strong>{preview}</strong><p>Preview only. Nothing sent.</p></> : null}</div>
            </section>
          ) : null}

          {view === "ordering" ? (
            <section aria-labelledby="ordering-title">
              <div className={styles.sectionHeading}><h1 ref={titleRef} tabIndex={-1} id="ordering-title"><Lettering name="order-online" label="Order online" /></h1></div>
              <div className={styles.checkState}><h2>Table payment unavailable</h2><p>Ask your server to view or pay your bill.<br />No live check or payment status is connected.</p></div>
              <div className={styles.takeout}><h2>Ordering to go?</h2><p>Toast is for pickup / delivery only.<br />It does not open or settle your table’s check.</p><a className={styles.primaryButton} href={orderDestination.url} target="_blank" rel="noreferrer">Order on Toast<span className={styles.srOnly}> for pickup or delivery (opens in a new tab)</span></a></div>
            </section>
          ) : null}

          {["games", "match"].includes(view) ? (
            <section aria-labelledby="match-title">
              <div className={styles.matchHeading}><h1 ref={titleRef} tabIndex={-1} id="match-title" className={view === "games" ? styles.playHeading : styles.matchTitle}>{view === "games" ? <span className={styles.playLettering}><Lettering name="play" label="Play" /></span> : "Table match"}</h1>{view === "match" ? <DecorativeArtwork kind="football" className={styles.lobbyAccent} /> : null}</div>
              {view === "games" ? <><p className={styles.lobbyIntro}>Choose your game</p><div className={styles.gameChoices}>
                  <article className={styles.gameChoice} data-mode="multiplayer"><span className={styles.gameMode}>Multiplayer</span><h2>Table Football</h2><p>Play with friends at your table</p><small>{currentTable} · Up to 4 players</small><button type="button" className={styles.gameButton} onClick={() => navigate("match")}>Join table game</button></article>
                  <article className={styles.gameChoice} data-mode="solo"><span className={styles.gameMode}>Solo</span><h2>Penalty Rush</h2><p>Just you and the keeper</p><small>Start instantly · No scan needed</small><button type="button" className={styles.gameButton} onClick={() => navigate("penalty")}>Play solo</button></article>
                </div></>
                : device === "desktop" ? <div className={styles.phoneHandoff}><h2>Play on your phone</h2><p>Scan the printed QR at your table, then choose Play and Table Football.</p></div>
                : device === "checking" ? <p className={styles.lobbyIntro} role="status">Getting your game ready…</p>
                : membership.status === "connecting" ? <p className={styles.lobbyIntro} role="status">Connecting to {currentTable}…</p>
                : membership.status !== "active" || !membership.visit ? <div className={styles.visitNotice}><p>{membership.status === "ended" ? "Your table visit has ended. Still at the table? Join again to play." : "Your table couldn’t connect. You can still play Penalty Rush."}</p><button type="button" className={styles.primaryButton} onClick={() => { activeMatch.current = false; void (membership.status === "ended" ? membership.rejoin() : membership.retry()); }}>{membership.status === "ended" ? "Join this table" : "Retry connection"}</button></div>
                : <MaracaiboFootballClient key={membership.visit.visitId} venue={venue} tableId={tableId} visitId={membership.visit.visitId} onNavigate={(next) => navigate(next)} onActiveChange={reportMatchActive} />}
            </section>
          ) : null}

          {view !== "match" ? <nav className={styles.utilityBar} aria-label="Table navigation"><button type="button" aria-current={view === "menu" ? "page" : undefined} onClick={() => navigate("menu")}>Menu</button><button type="button" aria-current={view === "service" ? "page" : undefined} onClick={() => navigate("service")}>Service</button><button type="button" onClick={() => navigate("welcome")}>Home</button></nav> : null}
        </div>
      )}
      {device === "phone" && multiplayerRequested ? <div className={styles.visitFooter}>
        <span role="status">{membership.status === "active" ? `${currentTable} · Your visit` : membership.status === "ended" ? "You’ve left this table." : membership.status === "connecting" ? "Connecting your table…" : "Table connection unavailable"}</span>
        {membership.status === "active" ? <button type="button" className={styles.quietButton} onClick={() => { if (window.confirm("Leave this table on your phone? Other guests can keep playing.")) { activeMatch.current = false; setView("welcome"); void membership.leave(); } }}>Leave table</button> : null}
      </div> : null}
      <footer className={styles.footer} aria-label="Brought to you by Fina Calle">
        <span className={styles.footerCredit}>Brought to you by</span>
        <Image className={styles.footerLogo} src="/assets/fina-calle/emblem-colattao.webp" alt="Fina Calle" width={460} height={488} unoptimized />
        <small>Website experience &copy; 2026 Fina Calle. All rights reserved.</small>
      </footer>
    </main>
  );
}
