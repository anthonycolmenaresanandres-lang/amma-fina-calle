"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { ArrowLeft, ArrowRight, Bookmark, Check, Compass, Coffee, Flower2, Footprints, Heart, List, Map, MapPin, RotateCcw, Search, ShoppingBag, Sparkles, Ticket, Waves } from "lucide-react";
import { advanceClaim, categories, DEMO_EXPIRY, INITIAL_STATE, normalizeCity, parseState, places, stages, STORAGE_KEY, type DemoState, type Place } from "./data";
import s from "./discover.module.css";

let snapshot = INITIAL_STATE;
let storageNotice = "";
const listeners = new Set<() => void>();
function subscribe(listener: () => void) {
  if (listeners.size === 0) {
    try { snapshot = parseState(localStorage.getItem(STORAGE_KEY)); }
    catch { storageNotice = "Browser storage is unavailable. Your demo progress lasts for this session."; }
  }
  listeners.add(listener);
  listener();
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) { snapshot = parseState(event.newValue); listeners.forEach(fn => fn()); }
  };
  window.addEventListener("storage", onStorage);
  return () => { listeners.delete(listener); window.removeEventListener("storage", onStorage); };
}
function update(next: DemoState) {
  snapshot = next;
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); }
  catch { storageNotice = "Browser storage is unavailable. Your demo progress lasts for this session."; }
  listeners.forEach(fn => fn());
}
const getSnapshot = () => snapshot;
const getServerSnapshot = () => INITIAL_STATE;
const iconFor = { coffee: Coffee, bag: ShoppingBag, kite: Heart, wave: Waves, flower: Flower2 };
const tabNames = ["Discover", "Saved places", "Passport"] as const;
type Tab = (typeof tabNames)[number];

function Artwork({ place, large = false }: { place: Place; large?: boolean }) {
  const Icon = iconFor[place.symbol];
  return <div className={`${s.artwork} ${s[place.tone]} ${large ? s.largeArt : ""}`} aria-hidden="true">
    <span className={s.artCaption}>{place.neighborhood}</span><span className={s.orbit} /><Icon className={s.artIcon} strokeWidth={1.25} />
    <span className={s.artWord}>{place.symbol === "coffee" ? "take it slow" : place.symbol === "bag" ? "find your thing" : place.symbol === "kite" ? "make together" : place.symbol === "wave" ? "wander a little" : "a little pause"}</span>
  </div>;
}

export default function DiscoverDemo() {
  const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [tab, setTab] = useState<Tab>("Discover");
  const [city, setCity] = useState("Virginia Beach, VA");
  const [cityInput, setCityInput] = useState("Virginia Beach, VA");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("All places");
  const [neighborhood, setNeighborhood] = useState("All neighborhoods");
  const [view, setView] = useState<"list" | "map">("list");
  const [mapId, setMapId] = useState(places[0].id);
  const [selected, setSelected] = useState<Place | null>(null);
  const [notice, setNotice] = useState("");
  const [proofChecked, setProofChecked] = useState(false);
  const [resetConfirm, setResetConfirm] = useState(false);
  const detailHeading = useRef<HTMLHeadingElement>(null);
  const lastOfferButton = useRef<HTMLButtonElement | null>(null);
  const ready = city === "Virginia Beach, VA";
  const verified = places.filter(p => state.claims[p.id] === "redeemed");
  const trailStops = places.filter(p => p.trail);
  const trailCount = verified.filter(p => p.trail).length;
  const filtered = places.filter(p => (tab !== "Saved places" || state.saved.includes(p.id)) && (category === "All places" || category === p.category) && (neighborhood === "All neighborhoods" || neighborhood === p.neighborhood) && `${p.name} ${p.category} ${p.neighborhood} ${p.offer}`.toLowerCase().includes(query.toLowerCase().trim()));
  const mapPlace = filtered.find(p => p.id === mapId) ?? filtered[0];

  useEffect(() => {
    const onBack = () => { setSelected(null); setProofChecked(false); lastOfferButton.current?.focus(); };
    window.addEventListener("popstate", onBack);
    return () => window.removeEventListener("popstate", onBack);
  }, []);
  useEffect(() => {
    if (selected) detailHeading.current?.focus();
    else {
      const id = lastOfferButton.current?.dataset.offerId;
      if (id) document.querySelector<HTMLButtonElement>(`button[data-offer-id="${id}"]`)?.focus();
    }
  }, [selected]);

  function toggleSave(place: Place) {
    const saved = state.saved.includes(place.id);
    update({ ...state, saved: saved ? state.saved.filter(id => id !== place.id) : [...state.saved, place.id] });
    setNotice(saved ? `${place.name} removed from saved places.` : `${place.name} saved in this browser.`);
  }
  function openOffer(place: Place, button: HTMLButtonElement) {
    lastOfferButton.current = button;
    window.history.pushState({ discoverDemo: true }, "", `#offer-${place.id}`);
    setSelected(place); setProofChecked(false); setNotice(""); window.scrollTo({ top: 0, behavior: "instant" });
  }
  function closeOffer() {
    setSelected(null); setProofChecked(false);
    if (window.history.state?.discoverDemo) window.history.back();
    else window.history.replaceState(null, "", window.location.pathname);
  }
  function chooseCity(value: string) {
    const next = normalizeCity(value);
    if (!next) { setNotice("Enter a city to explore or save for later."); return; }
    setCity(next); setCityInput(next); setQuery(""); setCategory("All places"); setNeighborhood("All neighborhoods"); setTab("Discover");
    setNotice(next === "Virginia Beach, VA" ? "Virginia Beach demo selected." : `${next} has not launched. You can save it as a destination.`);
  }
  function saveCity() {
    const saved = state.destinations.includes(city);
    update({ ...state, destinations: saved ? state.destinations.filter(c => c !== city) : [...state.destinations, city].slice(-20) });
    setNotice(saved ? "Destination removed." : `${city} saved for later. This does not reserve an offer.`);
  }
  function clearFilters() { setCategory("All places"); setQuery(""); setNeighborhood("All neighborhoods"); }
  function reset() {
    update(INITIAL_STATE); setResetConfirm(false); setSelected(null); setCity("Virginia Beach, VA"); setCityInput("Virginia Beach, VA"); setTab("Discover"); clearFilters(); setView("list");
    window.history.replaceState(null, "", window.location.pathname); setNotice("Demo reset. Saved places, destinations, claims and stamps cleared.");
  }

  const offerCard = (place: Place) => <article className={s.place} key={place.id}>
    <div className={s.artWrap}><Artwork place={place} /><button className={s.saveButton} onClick={() => toggleSave(place)} aria-label={`${state.saved.includes(place.id) ? "Unsave" : "Save"} ${place.name}`} aria-pressed={state.saved.includes(place.id)}><Bookmark aria-hidden="true" size={19} fill={state.saved.includes(place.id) ? "currentColor" : "none"} /></button></div>
    <div className={s.placeMeta}><span>{place.category}</span><span>Fictional merchant</span></div>
    <h3>{place.name}</h3><p className={s.placeDescription}>{place.description}</p>
    <p className={s.location}><MapPin size={14} aria-hidden="true" />{place.neighborhood} · Virginia Beach</p>
    <button className={s.offerLink} data-offer-id={place.id} onClick={e => openOffer(place, e.currentTarget)}><span><small>Sample offer</small>{place.offer}</span><ArrowRight size={20} aria-hidden="true" /></button>
  </article>;

  return <main className={s.page}>
    <a className={s.skip} href="#demo-content">Skip to content</a>
    <div className={s.demoBanner}><span className={s.demoDot} />LOCAL PROTOTYPE <span>Fictional merchants & offers. No real rewards or verification.</span></div>
    <header className={s.header}>
      <button className={s.brand} onClick={() => { if (selected) closeOffer(); setTab("Discover"); }} aria-label="Fina Calle Discover home"><strong>Fina Calle</strong><small>DISCOVER</small></button>
      <nav className={s.nav} aria-label="Demo navigation">{tabNames.map(name => <button key={name} aria-current={!selected && tab === name ? "page" : undefined} onClick={() => { if (selected) closeOffer(); setTab(name); clearFilters(); }}>{name === "Discover" ? <Compass aria-hidden="true" size={17} /> : name === "Saved places" ? <Bookmark aria-hidden="true" size={17} /> : <Ticket aria-hidden="true" size={17} />}{name}{name === "Saved places" && state.saved.length > 0 && <span className={s.count}>{state.saved.length}</span>}</button>)}</nav>
      <span className={s.adult}>Adult demo · no account needed</span>
    </header>
    <div className={s.shell} id="demo-content">
      <p className={s.notice} role="status" aria-live="polite">{notice || storageNotice}</p>
      {selected ? <section className={s.detail}>
        <button className={s.back} onClick={closeOffer}><ArrowLeft aria-hidden="true" size={18} />Back to {tab.toLowerCase()}</button>
        <div className={s.detailGrid}><div><Artwork place={selected} large /><p className={s.micro}>Original category illustration · fictional merchant</p></div>
          <div className={s.detailCopy}><p className={s.eyebrow}>{selected.category} / {selected.neighborhood}</p><h1 ref={detailHeading} tabIndex={-1}>{selected.name}</h1><p className={s.lede}>{selected.description}</p>
            <div className={s.sampleLabel}>PROPOSED SAMPLE OFFER · NOT REDEEMABLE</div><h2>{selected.offer}</h2>
            <dl className={s.terms}><div><dt>What it costs</dt><dd>{selected.cost}</dd></div><div><dt>What you do</dt><dd>{selected.requirement}</dd></div><div><dt>Location</dt><dd>{selected.area}. Fictional merchant placement; no participating store or verified address.</dd></div><div><dt>Eligible times</dt><dd>{selected.hours}. These are examples, not live opening hours.</dd></div><div><dt>Limit & expiry</dt><dd>{selected.quota} proposed vouchers in this sample campaign; one per adult, no repeat claim. Expires {DEMO_EXPIRY}. A future campaign would need its own dates and repeat-use cooldown.</dd></div></dl>
            <button className={s.secondary} onClick={() => toggleSave(selected)}><Bookmark aria-hidden="true" size={17} />{state.saved.includes(selected.id) ? "Remove saved place" : "Save this place"}</button>
          </div></div>
        <section className={s.claimFlow} aria-labelledby="flow-heading"><div><p className={s.eyebrow}>Try the experience</p><h2 id="flow-heading">A clear path from claim to stamp.</h2><p>Every step below is simulated in this browser. No voucher, visit, screenshot or merchant approval is real.</p></div>
          <div className={s.flowPanel}><ol className={s.steps}>{stages.map((stage, i) => <li key={stage} className={state.claims[selected.id] && stages.indexOf(state.claims[selected.id]!) >= i ? s.done : ""}><span>{state.claims[selected.id] && stages.indexOf(state.claims[selected.id]!) >= i ? <Check aria-hidden="true" size={15} /> : i + 1}</span>{["Claim", "Visit", "Proof", "Redeem"][i]}</li>)}</ol>
            {!state.claims[selected.id] && <><h3>Read the terms, then try a claim.</h3><p>Campaign budget example: {selected.quota} vouchers. Claiming reserves nothing. All inventory is fictional.</p></>}
            {state.claims[selected.id] === "claimed" && <><h3>Demo voucher FC-{selected.id.toUpperCase()}</h3><p>Present it at the sample location in a future live flow. Here, mark a visit to see the next step.</p></>}
            {state.claims[selected.id] === "visited" && <><h3>{selected.social ? "Try the disclosed-sharing step." : "Try the visit-proof step."}</h3><p>{selected.social ? 'Example disclosure: “I received a sample reward from Sunday Thread for sharing this visit.” It must be conspicuous in the post itself. Share an honest opinion; no positive review is required.' : "A future participating merchant would validate a visit. Here, an example proof placeholder replaces any real upload."}</p><label className={s.checkLabel}><input type="checkbox" name="sample-proof" checked={proofChecked} onChange={e => setProofChecked(e.target.checked)} />{selected.social ? "Use sample disclosed story proof (no file uploaded)" : "Use sample visit proof (no file uploaded)"}</label></>}
            {state.claims[selected.id] === "proof" && <><h3>Sample proof ready for demo approval.</h3><p>No one has reviewed proof. Simulate redemption to add one stamp and 50 noncash exploration points.</p></>}
            {state.claims[selected.id] === "redeemed" ? <><div className={s.redeemed}><Check aria-hidden="true" />Demo stamp collected</div><p>50 noncash points added once. This is a simulated verified visit, not a real discount or merchant approval.</p><button className={s.primary} onClick={() => { closeOffer(); setTab("Passport"); }}>See my passport<ArrowRight aria-hidden="true" size={18} /></button></> : <button className={s.primary} disabled={state.claims[selected.id] === "visited" && !proofChecked} onClick={() => { update(advanceClaim(state, selected.id)); setNotice("Demo step saved in this browser."); }}>{!state.claims[selected.id] ? "Simulate claim" : state.claims[selected.id] === "claimed" ? "Simulate visit" : state.claims[selected.id] === "visited" ? "Use sample proof" : "Simulate redemption"}<ArrowRight aria-hidden="true" size={18} /></button>}
            <p className={s.micro}>No Google or Yelp reviews. No connected social accounts, payments, identity checks or real uploads.</p>
          </div></section>
      </section> : tab === "Passport" ? <section className={s.passportPage}>
        <p className={s.eyebrow}>Your local passport</p><h1>Good days leave a stamp.</h1><p className={s.lede}>Explore a city. Collect the moments. Keep your next destination in sight.</p>
        <div className={s.passportLayout}><div className={s.passportBook}><div className={s.passportTop}><Ticket aria-hidden="true" /><span>FINA CALLE / LOCAL PASSPORT</span></div><h2>Virginia Beach</h2><p>Simulated verified visits only</p><div className={s.stampGrid}>{places.map(p => <div key={p.id} className={`${s.stamp} ${state.claims[p.id] === "redeemed" ? s.stamped : ""}`}><span>{state.claims[p.id] === "redeemed" ? <Check aria-hidden="true" /> : <MapPin aria-hidden="true" />}</span><strong>{p.name}</strong><small>{state.claims[p.id] === "redeemed" ? "DEMO VISIT" : "TO DISCOVER"}</small></div>)}</div><div className={s.bookBottom}><strong>{verified.length * 50}<small>noncash points</small></strong><span>{verified.length} / {places.length} stamps</span></div></div>
          <div className={s.passportSide}><p className={s.eyebrow}>One neighborhood, three little discoveries</p><h2>The ViBe wander</h2><p>Try a coffee, a local shop and a quiet pause. Each completed demo redemption adds one trail stop.</p><progress max={3} value={trailCount} aria-label={`${trailCount} of 3 ViBe trail stops completed`} /><p className={s.micro}>{trailCount} of 3 stops · no purchase pressure or cash value</p><ul className={s.trailList}>{trailStops.map(p => <li key={p.id}>{state.claims[p.id] === "redeemed" ? <Check aria-hidden="true" size={19} /> : <Footprints aria-hidden="true" size={19} />}<span>{p.name}<small>{p.category}</small></span><button data-offer-id={p.id} onClick={e => openOffer(p, e.currentTarget)} aria-label={`View ${p.name} offer`}><ArrowRight aria-hidden="true" size={20} /></button></li>)}</ul>
            <div className={s.badge}><Sparkles aria-hidden="true" /><div><strong>{verified.length >= 3 ? "Virginia Beach Explorer · unlocked" : "Virginia Beach Explorer"}</strong><p>{verified.length >= 3 ? "Demo badge collected. Keep exploring at your own pace." : "Collect 3 different demo stamps to unlock this city badge."}</p></div></div>
            <p className={s.micro}>Points cannot be bought, sold, withdrawn or exchanged for money. Only individually approved, capped merchant offers could become real rewards.</p>
          </div></div>
        <section className={s.destinations}><h2>Your next chapter</h2><p>Saved destinations stay in this browser. Saving a city does not mean it has launched.</p>{state.destinations.length === 0 ? <button className={s.secondary} onClick={() => setTab("Discover")}>Save a destination<ArrowRight aria-hidden="true" size={17} /></button> : <ul>{state.destinations.map(c => <li key={c}><MapPin aria-hidden="true" size={17} /><span>{c}<small>{c === "Virginia Beach, VA" ? "Demo available" : "Not launched"}</small></span><button onClick={() => chooseCity(c)}>Explore</button><button aria-label={`Remove ${c} destination`} onClick={() => { update({ ...state, destinations: state.destinations.filter(d => d !== c) }); setNotice("Destination removed."); }}>Remove</button></li>)}</ul>}</section>
      </section> : <>
        <section className={s.hero}><div><p className={s.eyebrow}>Your city. Your curiosity.</p><h1>{tab === "Saved places" ? <>A few places.<br /><em>A good plan.</em></> : <>Make a day<br /><em>of it.</em></>}</h1><p className={s.lede}>{tab === "Saved places" ? "Keep the places you want to explore next, at home or away." : "Good coffee. Small shops. Something for the whole family. Find your next local moment with Fina Calle."}</p></div><button className={s.passportTeaser} onClick={() => setTab("Passport")}><div className={s.teaserTop}><Ticket aria-hidden="true" size={22} /><span>YOUR LOCAL PASSPORT</span><ArrowRight aria-hidden="true" size={19} /></div><strong>Go somewhere.<br />Collect a story.</strong><div className={s.teaserStamps}>{[Coffee, ShoppingBag, Waves].map((Icon, i) => <span key={i}><Icon size={29} strokeWidth={1.3} /></span>)}</div><small>{verified.length} demo stamps · {verified.length * 50} noncash points</small></button></section>
        <section className={s.cityBar} aria-label="Choose a city"><form onSubmit={e => { e.preventDefault(); chooseCity(cityInput); }}><label htmlFor="city-search">Where are you exploring?</label><div className={s.cityInput}><MapPin size={20} aria-hidden="true" /><input id="city-search" name="city" value={cityInput} onChange={e => setCityInput(e.target.value)} maxLength={80} placeholder="Search a city, e.g. Richmond, VA" autoComplete="off" /><button type="submit" aria-label="Explore selected city"><ArrowRight aria-hidden="true" size={21} /></button></div></form><div className={s.cityActions}><span>{ready ? "Virginia Beach · demo city" : "Not launched"}</span><button onClick={saveCity} aria-pressed={state.destinations.includes(city)}><Bookmark aria-hidden="true" size={17} fill={state.destinations.includes(city) ? "currentColor" : "none"} />{state.destinations.includes(city) ? "Destination saved" : "Save destination"}</button></div></section>
        {!ready ? <section className={s.empty}><Compass aria-hidden="true" size={38} /><h2>{city} is on the horizon.</h2><p>This city has not launched. There are no participating businesses or offers to show. Save it for later, or try the Virginia Beach demo.</p><button className={s.primary} onClick={() => chooseCity("Virginia Beach, VA")}>Explore Virginia Beach demo<ArrowRight aria-hidden="true" size={18} /></button></section> : <section className={s.discovery} aria-labelledby="discover-title">
          <div className={s.sectionHead}><div><p className={s.eyebrow}>Virginia Beach / sample collection</p><h2 id="discover-title">{tab === "Saved places" ? "Your saved places" : "Find your kind of local."}</h2></div><div className={s.viewToggle} aria-label="Discovery view"><button onClick={() => setView("list")} aria-pressed={view === "list"}><List aria-hidden="true" size={17} />List</button><button onClick={() => setView("map")} aria-pressed={view === "map"}><Map aria-hidden="true" size={17} />Map</button></div></div>
          <div className={s.categories} aria-label="Filter by category">{categories.map(c => <button key={c} onClick={() => setCategory(c)} aria-pressed={category === c}>{c}</button>)}</div>
          <div className={s.filters}><label className={s.search}><Search size={18} aria-hidden="true" /><span className={s.srOnly}>Search sample places</span><input name="place-search" autoComplete="off" value={query} onChange={e => setQuery(e.target.value)} placeholder="Find a place or experience…" /></label><label><span className={s.srOnly}>Neighborhood</span><select name="neighborhood" value={neighborhood} onChange={e => setNeighborhood(e.target.value)}><option>All neighborhoods</option><option>ViBe District</option><option>Oceanfront</option></select></label><span className={s.results} aria-live="polite">{filtered.length} sample {filtered.length === 1 ? "place" : "places"}</span></div>
          <p className={s.collectionNote}>All five businesses are invented. Offers, prices, hours and availability are examples. No merchant has approved these rewards.</p>
          {filtered.length === 0 ? <div className={s.empty}><Bookmark aria-hidden="true" size={34} /><h3>{tab === "Saved places" && state.saved.length === 0 ? "Your next good day starts with a save." : "No sample places match these filters."}</h3><p>{tab === "Saved places" && state.saved.length === 0 ? "Use the bookmark on any place to keep it here." : "Try another category, neighborhood or search."}</p><button className={s.secondary} onClick={() => { clearFilters(); if (tab === "Saved places" && state.saved.length === 0) setTab("Discover"); }}>{tab === "Saved places" && state.saved.length === 0 ? "Discover places" : "Clear filters"}<ArrowRight aria-hidden="true" size={17} /></button></div> : view === "list" ? <div className={s.placeGrid}>{filtered.map(offerCard)}</div> : <div className={s.mapLayout}><div className={s.mapPanel}><iframe key={mapPlace.id} title={`Virginia Beach geographic map: sample anchor for ${mapPlace.name}`} src={`https://www.openstreetmap.org/export/embed.html?bbox=-76.003%2C36.825%2C-75.959%2C36.875&layer=mapnik&marker=${mapPlace.lat}%2C${mapPlace.lon}`} loading="lazy" referrerPolicy="no-referrer" /><div className={s.mapCaption}><strong><MapPin aria-hidden="true" size={17} />{mapPlace.name}</strong><span>{mapPlace.area}</span><small>Pin is a fictional merchant’s neighborhood anchor, not a verified business address. Select a place to move the pin.</small><a href={`https://www.openstreetmap.org/?mlat=${mapPlace.lat}&mlon=${mapPlace.lon}#map=15/${mapPlace.lat}/${mapPlace.lon}`} target="_blank" rel="noreferrer">Open geographic map ↗</a><small>© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap contributors</a>. Internet needed; if the embed is unavailable, use the list or map link.</small></div></div><div className={s.mapList}>{filtered.map(p => <article key={p.id} className={mapPlace.id === p.id ? s.mapSelected : ""}><button className={s.mapPick} onClick={() => setMapId(p.id)} aria-pressed={mapPlace.id === p.id}><MapPin aria-hidden="true" size={22} /><span><strong>{p.name}</strong><small>{p.category} · {p.neighborhood}</small></span></button><div className={s.mapActions}><button data-offer-id={p.id} onClick={e => openOffer(p, e.currentTarget)}>Sample offer<ArrowRight aria-hidden="true" size={16} /></button><button onClick={() => toggleSave(p)} aria-label={`${state.saved.includes(p.id) ? "Unsave" : "Save"} ${p.name}`} aria-pressed={state.saved.includes(p.id)}><Bookmark aria-hidden="true" size={17} fill={state.saved.includes(p.id) ? "currentColor" : "none"} /></button></div></article>)}</div></div>}
        </section>}
      </>}
      <footer className={s.footer}><div><strong>Fina Calle Discover</strong><p>A local discovery concept by Fina Calle / AMMA Ventures.</p><p>Adult-managed family experiences. No child data, real signup or personal proof collected.</p></div><div><button className={s.reset} onClick={() => setResetConfirm(true)}><RotateCcw aria-hidden="true" size={16} />Reset demo</button><p>Progress lives only in this browser.</p></div></footer>
      {resetConfirm && <div className={s.resetPanel} role="alert"><strong>Clear your demo progress?</strong><p>This removes this demo’s saved places, destinations, claims and passport stamps from this browser.</p><button className={s.primary} onClick={reset}>Clear demo progress</button><button className={s.secondary} onClick={() => setResetConfirm(false)}>Keep progress</button></div>}
    </div>
  </main>;
}
