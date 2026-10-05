"use client";
import Link from "next/link";
import { useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { ArrowRight, ArrowUpRight, Compass, List, Map, Minus, Plus, RotateCcw, Search, X } from "lucide-react";
import CampusWorld, { project } from "./CampusWorld";
import { destinationCount, places, type PlaceId } from "./campus";
import type { HubLink } from "./links";
import styles from "./command-center.module.css";

function Destination({ link }: { link: HubLink }) {
  const external = !link.href.startsWith("/");
  const content = <>
    <span className={styles.destinationCopy}><strong>{link.label}</strong>{link.note && <small>{link.note}</small>}</span>
    <span className={styles.destinationKind}>{link.kind === "tool" ? "APP" : link.kind.toUpperCase()}</span>
    {external ? <ArrowUpRight size={16} aria-hidden="true" /> : <ArrowRight size={16} aria-hidden="true" />}
    {external && <span className={styles.srOnly}> (opens in a new tab)</span>}
  </>;
  return <li>{external
    ? <a className={styles.destination} href={link.href} target="_blank" rel="noopener noreferrer">{content}</a>
    : <Link className={styles.destination} href={link.href} prefetch={false}>{content}</Link>}
  </li>;
}

export default function CommandCenterClient() {
  const [selectedId, setSelectedId] = useState<PlaceId>("sales");
  const [view, setView] = useState<"world" | "list">("world");
  const [query, setQuery] = useState("");
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const drag = useRef<{ x: number; y: number; panX: number; panY: number } | null>(null);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const searchRef = useRef<HTMLInputElement>(null);
  const selected = places.find(place => place.id === selectedId)!;
  const term = query.trim().toLowerCase();
  const results = places.map(place => ({
    ...place, matches: place.links.filter(link => [place.name, link.label, link.note ?? ""].some(value => value.toLowerCase().includes(term))),
  })).filter(place => place.matches.length);
  const resultCount = results.reduce((sum, place) => sum + place.matches.length, 0);

  function selectPlace(id: PlaceId) { setSelectedId(id); setQuery(""); }
  function navigatePlace(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const steps: Record<string, number> = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1, Home: -index, End: places.length - 1 - index };
    if (!(event.key in steps)) return;
    event.preventDefault();
    const next = (index + steps[event.key] + places.length) % places.length;
    buttons.current[next]?.focus();
    selectPlace(places[next].id);
  }
  function startPan(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType !== "mouse" || event.button !== 0 || (event.target as Element).closest("button, a, [data-building]")) return;
    drag.current = { x: event.clientX, y: event.clientY, panX: pan.x, panY: pan.y };
    event.currentTarget.setPointerCapture(event.pointerId);
  }
  function movePan(event: PointerEvent<HTMLDivElement>) {
    if (!drag.current) return;
    setPan({
      x: Math.max(-220, Math.min(220, drag.current.panX + event.clientX - drag.current.x)),
      y: Math.max(-160, Math.min(160, drag.current.panY + event.clientY - drag.current.y)),
    });
  }
  const resetView = () => { setZoom(1); setPan({ x: 0, y: 0 }); };

  return <main className={styles.page}>
    <a href="#campus-inspector" className={styles.skip}>Skip to destinations</a>
    <header className={styles.header}>
      <Link href="/" className={styles.brand}><span>FINA CALLE<span className={styles.brandDot}>.</span></span><small>BY AMMA VENTURES</small></Link>
      <span className={styles.headerDivider} aria-hidden="true" /><span className={styles.headerTitle}>Command Center</span>
      <div className={styles.search}>
        <Search size={17} aria-hidden="true" />
        <input ref={searchRef} aria-label="Search all destinations" type="search" name="destination-search" autoComplete="off" placeholder="Find a tool, document, or place…" value={query}
          onChange={event => setQuery(event.target.value)} onKeyDown={event => { if (event.key === "Escape") setQuery(""); }} />
        {query && <button type="button" aria-label="Clear search" onClick={() => { setQuery(""); searchRef.current?.focus(); }}><X size={16} aria-hidden="true" /></button>}
      </div>
      <Link href="/command-center/code" prefetch={false} className={styles.atlasLink}>Code atlas <ArrowUpRight size={15} aria-hidden="true" /></Link>
    </header>
    <div className={styles.workspace}>
      <section className={styles.worldSection} aria-labelledby="campus-heading">
        <div className={styles.sceneHeading}>
          <div><p className={styles.eyebrow}>THE AMMA CAMPUS</p><h1 id="campus-heading">A place for everything.</h1><p>Choose a building. Get to work.</p></div>
          <div className={styles.viewSwitch} role="group" aria-label="Directory view">
            <button type="button" aria-pressed={view === "world"} onClick={() => setView("world")}><Map size={16} aria-hidden="true" /> World</button>
            <button type="button" aria-pressed={view === "list"} onClick={() => setView("list")}><List size={16} aria-hidden="true" /> List</button>
          </div>
        </div>
        <div className={styles.hud} aria-label="Directory facts">
          <div><strong>{places.length}</strong><span>Departments</span></div><div><strong>{destinationCount}</strong><span>Indexed destinations</span></div>
          <div className={styles.hudStatus}><span className={styles.statusDot} aria-hidden="true" /><span>Manual directory<small>Live metrics unavailable</small></span></div>
        </div>
        {view === "world" ? <>
          <div className={styles.viewport} onPointerDown={startPan} onPointerMove={movePan} onPointerUp={() => { drag.current = null; }} onPointerCancel={() => { drag.current = null; }} onLostPointerCapture={() => { drag.current = null; }}>
            <div className={styles.camera} style={{ transform: "translate(" + pan.x + "px, " + pan.y + "px) scale(" + zoom + ")" }}>
              <CampusWorld places={places} selected={selectedId} onSelect={selectPlace} />
              <div className={styles.landmarks} role="group" aria-label="Campus departments; use arrow keys to move between buildings">
                {places.map((place, index) => {
                  const [x,y] = project(place.x + place.width / 2, place.y + place.depth / 2, place.height + 24);
                  return <button key={place.id} type="button" ref={node => { buttons.current[index] = node; }}
                    className={styles.landmark + (term && !results.some(result => result.id === place.id) ? " " + styles.dimmed : "")}
                    style={{ left: ((x + (place.id === "infrastructure" ? 50 : 0)) / 11) + "%", top: ((y + (place.id === "infrastructure" ? 60 : 0)) / 8.2) + "%" }}
                    aria-pressed={selectedId === place.id} aria-controls="campus-inspector" aria-label={"Open " + place.name + ", " + place.links.length + " destinations"}
                    onClick={() => selectPlace(place.id)} onKeyDown={event => navigatePlace(event, index)}>
                    <span className={styles.landmarkDot} aria-hidden="true" />{place.shortName}<span className={styles.landmarkCount}>{place.links.length}</span>
                  </button>;
                })}
              </div>
            </div>
          </div>
          <div className={styles.sceneFooter}><a href="#campus-inspector">Open {selected.shortName} <span aria-hidden="true">→</span></a>
            <span><Compass size={17} aria-hidden="true" /> Explore by building <small>Tab or arrow keys · drag empty space</small></span>
            <div className={styles.cameraControls} role="group" aria-label="World camera">
              <button type="button" aria-label="Zoom out" disabled={zoom <= .8} onClick={() => setZoom(value => Math.max(.8, Math.round((value - .1) * 10) / 10))}><Minus size={17} aria-hidden="true" /></button>
              <output aria-label="Zoom level">{Math.round(zoom * 100)}%</output>
              <button type="button" aria-label="Zoom in" disabled={zoom >= 1.5} onClick={() => setZoom(value => Math.min(1.5, Math.round((value + .1) * 10) / 10))}><Plus size={17} aria-hidden="true" /></button>
              <button type="button" aria-label="Reset world camera" onClick={resetView}><RotateCcw size={16} aria-hidden="true" /></button>
            </div>
          </div>
        </> : <div className={styles.directory}>
          {(term ? results : places.map(place => ({ ...place, matches: place.links }))).map(place => <section key={place.id} aria-labelledby={"directory-" + place.id}>
            <header><h2 id={"directory-" + place.id}>{place.name}</h2><span>{place.matches.length} destinations</span></header>
            <p>{place.description}</p><ul>{place.matches.map(link => <Destination key={link.href + link.label} link={link} />)}</ul>
          </section>)}
          {term && !resultCount && <p className={styles.empty}>No destinations match “{query}”. Try a tool name or department.</p>}
        </div>}
        <nav className={styles.departmentNav} aria-label="Choose department">
          {places.map(place => <button key={place.id} type="button" aria-pressed={selectedId === place.id} onClick={() => selectPlace(place.id)}>{place.shortName}</button>)}
        </nav>
      </section>
      <aside className={styles.inspector} id="campus-inspector" aria-labelledby="inspector-heading" tabIndex={-1}>
        <div className={styles.inspectorTitle}>
          <p className={styles.eyebrow}>{term ? "SEARCH THE CAMPUS" : "DEPARTMENT INSPECTOR"}</p>
          <div className={styles.inspectorGlyph} aria-hidden="true"><span /><span /><span /></div>
          <h2 id="inspector-heading">{term ? "Search results" : selected.name}</h2>
          <p>{term ? "Destinations matching “" + query.trim() + "”." : selected.description}</p>
          <span className={styles.manualTag}>STATIC DIRECTORY · MANUALLY MAINTAINED</span>
        </div>
        <div className={styles.inspectorBody}>
          <p className={styles.resultSummary} role="status" aria-live="polite">{term ? resultCount + " matching destinations" : selected.links.length + " destinations · " + selected.purpose}</p>
          {term ? results.map(place => <section className={styles.resultGroup} key={place.id}><h3>{place.name}</h3><ul>{place.matches.map(link => <Destination key={link.href+link.label} link={link} />)}</ul></section>)
            : <ul>{selected.links.map(link => <Destination key={link.href+link.label} link={link} />)}</ul>}
          {term && !resultCount && <div className={styles.empty}><strong>No destinations found.</strong><p>Try “content”, “client”, or “code”.</p><button type="button" onClick={() => { setQuery(""); searchRef.current?.focus(); }}>Clear search</button></div>}
          <details className={styles.dataNotes}><summary>What this world shows</summary>
            <p>Buildings organize existing tools and documents. Counts come from this directory, maintained manually.</p>
            <dl><div><dt>Revenue & pipeline</dt><dd>Unavailable here</dd></div><div><dt>Activity & service health</dt><dd>Unavailable here</dd></div><div><dt>Client records</dt><dd>Open the authenticated ledger</dd></div></dl>
            <p>Lead Arcade includes fictional starter data and manual events. It is not a company performance feed. This campus has no live business connection.</p>
          </details>
        </div>
        <footer className={styles.inspectorFooter}>Tools retain their existing sign-in requirements.<br />Documents and external sites open in a new tab.</footer>
      </aside>
    </div>
    <footer className={styles.footer}><span>FINA CALLE OS <span aria-hidden="true">/</span> COMMAND CENTER</span><span>Your tools, one neighborhood.</span></footer>
  </main>;
}
