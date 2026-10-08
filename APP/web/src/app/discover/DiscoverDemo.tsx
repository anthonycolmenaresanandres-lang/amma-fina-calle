"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { ArrowLeft, ArrowRight, Bookmark, CalendarDays, Camera, Check, Clock, Compass, Coffee, Eye, Gift, Flower2, Footprints, Heart, List, Map, MapPin, RotateCcw, Search, ShoppingBag, Sparkles, Stamp, Ticket, Wallet, Waves } from "lucide-react";
import { advanceClaim, categories, DEMO_EXPIRY, disclosureFor, INITIAL_STATE, normalizeCity, parseState, placeIdFromHash, places, stages, STORAGE_KEY, type DemoState, type Place } from "./data";
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
const offerLocationEvent = "fina-discover-offer-location";
function subscribeOfferLocation(listener: () => void) {
  window.addEventListener("popstate", listener);
  window.addEventListener("hashchange", listener);
  window.addEventListener(offerLocationEvent, listener);
  return () => {
    window.removeEventListener("popstate", listener);
    window.removeEventListener("hashchange", listener);
    window.removeEventListener(offerLocationEvent, listener);
  };
}
const getOfferId = () => placeIdFromHash(window.location.hash);
const getServerOfferId = () => null;
const notifyOfferLocation = () => window.dispatchEvent(new Event(offerLocationEvent));
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
  const offerId = useSyncExternalStore(subscribeOfferLocation, getOfferId, getServerOfferId);
  const selected = places.find(place => place.id === offerId) ?? null;
  const [notice, setNotice] = useState("");
  const [proofChecked, setProofChecked] = useState(false);
  const [termsAcceptedFor, setTermsAcceptedFor] = useState<string | null>(null);
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
    const onBack = () => { setProofChecked(false); setTermsAcceptedFor(null); };
    window.addEventListener("popstate", onBack);
    window.addEventListener("hashchange", onBack);
    return () => { window.removeEventListener("popstate", onBack); window.removeEventListener("hashchange", onBack); };
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
    notifyOfferLocation(); setProofChecked(false); setTermsAcceptedFor(null); setNotice(""); window.scrollTo({ top: 0, behavior: "instant" });
  }
  function closeOffer() {
    setProofChecked(false); setTermsAcceptedFor(null);
    if (window.history.state?.discoverDemo) window.history.back();
    else { window.history.replaceState(null, "", window.location.pathname); notifyOfferLocation(); }
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
    update(INITIAL_STATE); setProofChecked(false); setTermsAcceptedFor(null); setResetConfirm(false); setCity("Virginia Beach, VA"); setCityInput("Virginia Beach, VA"); setTab("Discover"); clearFilters(); setView("list");
    window.history.replaceState(null, "", window.location.pathname); notifyOfferLocation(); setNotice("Demo reset. Saved places, destinations, claims and stamps cleared.");
  }

  const offerCard = (place: Place) => <article className={s.place} key={place.id}>
    <div className={s.artWrap}><Artwork place={place} /><button className={s.saveButton} onClick={() => toggleSave(place)} aria-label={`${state.saved.includes(place.id) ? "Unsave" : "Save"} ${place.name}`} aria-pressed={state.saved.includes(place.id)}><Bookmark aria-hidden="true" size={19} fill={state.saved.includes(place.id) ? "currentColor" : "none"} /></button></div>
    <div className={s.placeMeta}><span>{place.category}</span><span>Fictional merchant</span></div>
    <h3>{place.name}</h3>
    <p className={s.location}><MapPin size={14} aria-hidden="true" />{place.neighborhood}</p>
    <button className={s.offerLink} data-offer-id={place.id} onClick={e => openOffer(place, e.currentTarget)}><span><small>Sample perk</small>{place.offer}</span><ArrowRight size={20} aria-hidden="true" /></button>
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
          <div className={s.detailCopy}><p className={s.eyebrow}>{selected.category} / {selected.neighborhood}</p><h1 ref={detailHeading} tabIndex={-1}>{selected.name}</h1>
            <div className={s.sampleLabel}>FICTIONAL SAMPLE PERK · NOT REDEEMABLE</div><h2>{selected.offer}</h2>
            <dl className={s.terms}><div><dt><Wallet size={14} aria-hidden="true" />Cost</dt><dd>{selected.cost}</dd></div><div><dt><Camera size={14} aria-hidden="true" />Social post</dt><dd>{selected.requirement} No positive review required.</dd></div><div><dt><Clock size={14} aria-hidden="true" />Post by</dt><dd>{selected.postDeadline}</dd></div><div><dt><Eye size={14} aria-hidden="true" />Disclosure</dt><dd>Clearly in the post: “{disclosureFor(selected)}”</dd></div><div><dt><MapPin size={14} aria-hidden="true" />Where</dt><dd>{selected.area}. Fictional pin; no participating store or verified address.</dd></div><div><dt><CalendarDays size={14} aria-hidden="true" />Visit hours</dt><dd>{selected.hours}. Example hours, not live.</dd></div><div><dt><Ticket size={14} aria-hidden="true" />Cap / expiry</dt><dd>{selected.quota} sample vouchers · one per adult · no repeat. Expires {DEMO_EXPIRY}.</dd></div></dl>
            <button className={s.secondary} onClick={() => toggleSave(selected)}><Bookmark aria-hidden="true" size={17} />{state.saved.includes(selected.id) ? "Remove saved place" : "Save this place"}</button>
          </div></div>
        <section className={s.claimFlow} aria-labelledby="flow-heading"><div><p className={s.eyebrow}>Demo passport</p><h2 id="flow-heading">Your next stamp.</h2><p>Browser demo only. No real voucher, visit or approval.</p></div>
          <div className={s.flowPanel}><ol className={s.steps}>{stages.map((stage, i) => <li key={stage} className={state.claims[selected.id] && stages.indexOf(state.claims[selected.id]!) >= i ? s.done : ""}><span>{state.claims[selected.id] && stages.indexOf(state.claims[selected.id]!) >= i ? <Check aria-hidden="true" size={15} /> : i + 1}</span>{["Claim", "Visit", "Proof", "Redeem"][i]}</li>)}</ol>
            {!state.claims[selected.id] && <><h3>Review. Then claim.</h3><p>{selected.quota} fictional vouchers · one per adult. Reserves nothing.</p><label className={s.checkLabel}><input type="checkbox" name="sample-terms" checked={termsAcceptedFor === selected.id} onChange={e => setTermsAcceptedFor(e.target.checked ? selected.id : null)} />Accept sample perk, post, deadline & disclosure.</label></>}
            {state.claims[selected.id] === "claimed" && <><h3>Demo voucher FC-{selected.id.toUpperCase()}</h3><p>Simulate a visit to continue.</p></>}
            {state.claims[selected.id] === "visited" && <><h3>Your honest post.</h3><p>Post: {selected.requirement} By: {selected.postDeadline}</p><p>Disclose: “{disclosureFor(selected)}” Positive, mixed or critical—your choice.</p><label className={s.checkLabel}><input type="checkbox" name="sample-proof" checked={proofChecked} onChange={e => setProofChecked(e.target.checked)} />Use sample disclosed post (no upload)</label></>}
            {state.claims[selected.id] === "proof" && <><h3>Demo proof ready.</h3><p>No review took place. Add a stamp + 50 noncash points.</p></>}
            {state.claims[selected.id] === "redeemed" ? <><div className={s.redeemed}><Check aria-hidden="true" />Demo stamp collected</div><p>+50 noncash points · once per demo experience. No real reward.</p><button className={s.primary} onClick={e => { if (e.detail > 1) return; closeOffer(); setTab("Passport"); }}>See my passport<ArrowRight aria-hidden="true" size={18} /></button></> : <button className={s.primary} disabled={(!state.claims[selected.id] && termsAcceptedFor !== selected.id) || (state.claims[selected.id] === "visited" && !proofChecked)} onKeyDown={e => { if (e.repeat && (e.key === "Enter" || e.key === " ")) e.preventDefault(); }} onClick={e => { if (e.detail > 1) return; const current = getSnapshot(); const next = advanceClaim(current, selected.id, state.claims[selected.id], termsAcceptedFor === selected.id, proofChecked); if (next !== current) { update(next); setNotice("Demo step saved in this browser."); } }}>{!state.claims[selected.id] ? "Simulate claim" : state.claims[selected.id] === "claimed" ? "Simulate visit" : state.claims[selected.id] === "visited" ? "Use sample proof" : "Simulate redemption"}<ArrowRight aria-hidden="true" size={18} /></button>}
            <p className={s.micro}>No Google/Yelp reviews, connected accounts, payments or uploads.</p>
          </div></section>
      </section> : tab === "Passport" ? <section className={s.passportPage}>
        <p className={s.eyebrow}>Your local passport</p><h1>Good days leave a stamp.</h1><p className={s.lede}>Your visits. Your stories. Your next stop.</p>
        <div className={s.passportLayout}><div className={s.passportBook}><div className={s.passportTop}><Ticket aria-hidden="true" /><span>FINA CALLE / LOCAL PASSPORT</span></div><h2>Virginia Beach</h2><p>Demo experiences · no positive review required</p><div className={s.stampGrid}>{places.map(p => <div key={p.id} className={`${s.stamp} ${state.claims[p.id] === "redeemed" ? s.stamped : ""}`}><span>{state.claims[p.id] === "redeemed" ? <Check aria-hidden="true" /> : <MapPin aria-hidden="true" />}</span><strong>{p.name}</strong><small>{state.claims[p.id] === "redeemed" ? "DEMO VISIT" : "TO DISCOVER"}</small></div>)}</div><div className={s.bookBottom}><strong>{verified.length * 50}<small>noncash points</small></strong><span>{verified.length} / {places.length} stamps</span></div></div>
          <div className={s.passportSide}><p className={s.eyebrow}>One neighborhood, three little discoveries</p><h2>The ViBe wander</h2><p>3 local stops. Complete each demo to fill the trail.</p><progress max={3} value={trailCount} aria-label={`${trailCount} of 3 ViBe trail stops completed`} /><p className={s.micro}>{trailCount} of 3 stops · no purchase pressure or cash value</p><ul className={s.trailList}>{trailStops.map(p => <li key={p.id}>{state.claims[p.id] === "redeemed" ? <Check aria-hidden="true" size={19} /> : <Footprints aria-hidden="true" size={19} />}<span>{p.name}<small>{p.category}</small></span><button data-offer-id={p.id} onClick={e => openOffer(p, e.currentTarget)} aria-label={`View ${p.name} offer`}><ArrowRight aria-hidden="true" size={20} /></button></li>)}</ul>
            <div className={s.badge}><Sparkles aria-hidden="true" /><div><strong>{verified.length >= 3 ? "Virginia Beach Explorer · unlocked" : "Virginia Beach Explorer"}</strong><p>{verified.length >= 3 ? "Demo badge collected. Keep exploring at your own pace." : "Collect 3 different demo stamps to unlock this city badge."}</p></div></div>
            <p className={s.micro}>Noncash points. No buying, selling or cash-out. Real rewards would need merchant approval.</p>
          </div></div>
        <section className={s.destinations}><h2>Your next chapter</h2><p>Saved destinations stay in this browser. Saving a city does not mean it has launched.</p>{state.destinations.length === 0 ? <button className={s.secondary} onClick={() => setTab("Discover")}>Save a destination<ArrowRight aria-hidden="true" size={17} /></button> : <ul>{state.destinations.map(c => <li key={c}><MapPin aria-hidden="true" size={17} /><span>{c}<small>{c === "Virginia Beach, VA" ? "Demo available" : "Not launched"}</small></span><button onClick={() => chooseCity(c)}>Explore</button><button aria-label={`Remove ${c} destination`} onClick={() => { update({ ...state, destinations: state.destinations.filter(d => d !== c) }); setNotice("Destination removed."); }}>Remove</button></li>)}</ul>}</section>
      </section> : <>
        <section className={s.hero}><div><p className={s.eyebrow}>Your city. Your curiosity.</p><h1>{tab === "Saved places" ? <>A few places.<br /><em>A good plan.</em></> : <>Make a day<br /><em>of it.</em></>}</h1><p className={s.lede}>{tab === "Saved places" ? "Keep the places you want to explore next, at home or away." : "Local perks. Honest posts. More stories to stamp."}</p></div><button className={s.passportTeaser} onClick={() => setTab("Passport")}><div className={s.teaserTop}><Ticket aria-hidden="true" size={22} /><span>YOUR LOCAL PASSPORT</span><ArrowRight aria-hidden="true" size={19} /></div><strong>Go somewhere.<br />Collect a story.</strong><div className={s.teaserStamps}>{[Coffee, ShoppingBag, Waves].map((Icon, i) => <span key={i}><Icon size={29} strokeWidth={1.3} /></span>)}</div><small>{verified.length} demo stamps · {verified.length * 50} noncash points</small></button></section>
        {tab === "Discover" && <section className={s.exchange} aria-label="Creators and businesses"><div className={s.exchangeIntro}><p className={s.eyebrow}>Local collaborations</p><h2>Perks for posts.</h2><div className={s.audiencePaths}><div><p className={s.eyebrow}>For creators</p><h3>Perks + local brands.</h3><a className={s.pathLink} href="#discover-title">Explore sample perks<ArrowRight aria-hidden="true" size={17} /></a></div><div><p className={s.eyebrow}>For businesses</p><h3>Disclosed social content.</h3><details className={s.businessPath}><summary>See sample campaign</summary><p>Offer perks for honest posts. No guaranteed reach. No enrollment or booking in this demo.</p><button className={s.pathLink} data-offer-id="thread" onClick={e => openOffer(places[1], e.currentTarget)}>View sample terms<ArrowRight aria-hidden="true" size={17} /></button></details></div></div></div><ol className={s.exchangeRoute} aria-label="Perk, honest disclosed post, completed demo experience"><li><span className={s.perkSeal}><Gift aria-hidden="true" strokeWidth={1.5} /></span><strong>Perk</strong><small>Freebie / discount</small></li><li><span className={s.postSeal}><Camera aria-hidden="true" strokeWidth={1.5} /></span><strong>Post</strong><small>Honest + disclosed</small></li><li><span className={s.stampSeal}><Stamp aria-hidden="true" strokeWidth={1.5} /><b>DEMO</b></span><strong>Stamp</strong><small>Completed experience</small></li></ol></section>}
        <section className={s.cityBar} aria-label="Choose a city"><form onSubmit={e => { e.preventDefault(); chooseCity(cityInput); }}><label htmlFor="city-search">Where are you exploring?</label><div className={s.cityInput}><MapPin size={20} aria-hidden="true" /><input id="city-search" name="city" value={cityInput} onChange={e => setCityInput(e.target.value)} maxLength={80} placeholder="Search a city, e.g. Richmond, VA" autoComplete="off" /><button type="submit" aria-label="Explore selected city"><ArrowRight aria-hidden="true" size={21} /></button></div></form><div className={s.cityActions}><span>{ready ? "Virginia Beach · demo city" : "Not launched"}</span><button onClick={saveCity} aria-pressed={state.destinations.includes(city)}><Bookmark aria-hidden="true" size={17} fill={state.destinations.includes(city) ? "currentColor" : "none"} />{state.destinations.includes(city) ? "Destination saved" : "Save destination"}</button></div></section>
        {!ready ? <section className={s.empty}><Compass aria-hidden="true" size={38} /><h2 id="discover-title" tabIndex={-1}>{city} is on the horizon.</h2><p>Not launched. No businesses or perks yet. Save this city or explore the Virginia Beach demo.</p><button className={s.primary} onClick={() => chooseCity("Virginia Beach, VA")}>Explore Virginia Beach demo<ArrowRight aria-hidden="true" size={18} /></button></section> : <section className={s.discovery} aria-labelledby="discover-title">
          <div className={s.sectionHead}><div><p className={s.eyebrow}>Virginia Beach / sample collection</p><h2 id="discover-title" tabIndex={-1}>{tab === "Saved places" ? "Your saved places" : "Find your kind of local."}</h2></div><div className={s.viewToggle} aria-label="Discovery view"><button onClick={() => setView("list")} aria-pressed={view === "list"}><List aria-hidden="true" size={17} />List</button><button onClick={() => setView("map")} aria-pressed={view === "map"}><Map aria-hidden="true" size={17} />Map</button></div></div>
          <div className={s.categories} aria-label="Filter by category">{categories.map(c => <button key={c} onClick={() => setCategory(c)} aria-pressed={category === c}>{c}</button>)}</div>
          <div className={s.filters}><label className={s.search}><Search size={18} aria-hidden="true" /><span className={s.srOnly}>Search sample places</span><input name="place-search" autoComplete="off" value={query} onChange={e => setQuery(e.target.value)} placeholder="Find a place or experience…" /></label><label><span className={s.srOnly}>Neighborhood</span><select name="neighborhood" value={neighborhood} onChange={e => setNeighborhood(e.target.value)}><option>All neighborhoods</option><option>ViBe District</option><option>Oceanfront</option></select></label><span className={s.results} aria-live="polite">{filtered.length} sample {filtered.length === 1 ? "place" : "places"}</span></div>
          <p className={s.collectionNote}>Fictional places & perks. No participating businesses or real rewards.</p>
          {filtered.length === 0 ? <div className={s.empty}><Bookmark aria-hidden="true" size={34} /><h3>{tab === "Saved places" && state.saved.length === 0 ? "Your next good day starts with a save." : "No sample places match these filters."}</h3><p>{tab === "Saved places" && state.saved.length === 0 ? "Use the bookmark on any place to keep it here." : "Try another category, neighborhood or search."}</p><button className={s.secondary} onClick={() => { clearFilters(); if (tab === "Saved places" && state.saved.length === 0) setTab("Discover"); }}>{tab === "Saved places" && state.saved.length === 0 ? "Discover places" : "Clear filters"}<ArrowRight aria-hidden="true" size={17} /></button></div> : view === "list" ? <div className={s.placeGrid}>{filtered.map(offerCard)}</div> : <div className={s.mapLayout}><div className={s.mapPanel}><iframe key={mapPlace.id} title={`Virginia Beach geographic map: sample anchor for ${mapPlace.name}`} src={`https://www.openstreetmap.org/export/embed.html?bbox=-76.003%2C36.825%2C-75.959%2C36.875&layer=mapnik&marker=${mapPlace.lat}%2C${mapPlace.lon}`} loading="lazy" referrerPolicy="no-referrer" /><div className={s.mapCaption}><strong><MapPin aria-hidden="true" size={17} />{mapPlace.name}</strong><span>{mapPlace.area}</span><small>Fictional neighborhood pin · not a business address. Select a place to move it.</small><a href={`https://www.openstreetmap.org/?mlat=${mapPlace.lat}&mlon=${mapPlace.lon}#map=15/${mapPlace.lat}/${mapPlace.lon}`} target="_blank" rel="noreferrer">Open geographic map ↗</a><small>© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap contributors</a>. Internet needed. Map unavailable? Use the list or map link.</small></div></div><div className={s.mapList}>{filtered.map(p => <article key={p.id} className={mapPlace.id === p.id ? s.mapSelected : ""}><button className={s.mapPick} onClick={() => setMapId(p.id)} aria-pressed={mapPlace.id === p.id}><MapPin aria-hidden="true" size={22} /><span><strong>{p.name}</strong><small>{p.category} · {p.neighborhood}</small></span></button><div className={s.mapActions}><button data-offer-id={p.id} onClick={e => openOffer(p, e.currentTarget)}>Sample perk<ArrowRight aria-hidden="true" size={16} /></button><button onClick={() => toggleSave(p)} aria-label={`${state.saved.includes(p.id) ? "Unsave" : "Save"} ${p.name}`} aria-pressed={state.saved.includes(p.id)}><Bookmark aria-hidden="true" size={17} fill={state.saved.includes(p.id) ? "currentColor" : "none"} /></button></div></article>)}</div></div>}
        </section>}
      </>}
      <footer className={s.footer}><div><strong>Fina Calle Discover</strong><p>A local discovery concept by Fina Calle / AMMA Ventures.</p><p>Adult-managed family experiences. No child data, real signup or personal proof collected.</p></div><div><button className={s.reset} onClick={() => setResetConfirm(true)}><RotateCcw aria-hidden="true" size={16} />Reset demo</button><p>Progress lives only in this browser.</p></div></footer>
      {resetConfirm && <div className={s.resetPanel} role="alert"><strong>Clear your demo progress?</strong><p>This removes this demo’s saved places, destinations, claims and passport stamps from this browser.</p><button className={s.primary} onClick={reset}>Clear demo progress</button><button className={s.secondary} onClick={() => setResetConfirm(false)}>Keep progress</button></div>}
    </div>
  </main>;
}
