"use client";

import Image from "next/image";
import Link from "next/link";
import { useDeferredValue, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowDown, ArrowRight, ArrowUpRight, ChevronDown, Clock3, MapPin, Phone, Plus, Search, X } from "lucide-react";
import { ElMariachiNav } from "./ElMariachiNav";
import { BRAND_URL, MENU_RETRIEVED, LOGO_PATH, categories, getCategory, getLocation, locations, normalizeSearch, totalItems, type Location, type MenuItem } from "./data";
import styles from "./menu.module.css";

const dayNames: Record<string, string> = {
  Sun: "Sunday", Mon: "Monday", Tue: "Tuesday", Wed: "Wednesday", Thu: "Thursday", Fri: "Friday", Sat: "Saturday",
};

function ExternalArrow() {
  return <ArrowUpRight size={18} aria-hidden="true" />;
}

function ItemDisclosure({ item }: { item: MenuItem }) {
  return (
    <details className={styles.menuItem} id={`dish-${item.id}`}>
      <summary className={styles.itemSummary}>
        <span className={styles.itemName}>{item.name}</span>
        <span className={styles.itemPrice}>{item.priceDisplay}</span>
        <Plus size={17} className={styles.itemPlus} aria-hidden="true" />
      </summary>
      <div className={styles.itemDetail}>
        {item.description && <p>{item.description}</p>}
        <a href={item.orderUrl} target="_blank" rel="noopener noreferrer" className={styles.itemOrder}>
          View options & order<ExternalArrow />
          <span className={styles.srOnly}> {item.name}, Jacksonville, on restaurant ordering (opens in a new tab)</span>
        </a>
      </div>
    </details>
  );
}

function LocationDetails({ location }: { location: Location }) {
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location.fullAddress)}`;
  return (
    <div className={styles.locationInfo}>
      <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className={styles.locationAddress}>
        <MapPin size={18} aria-hidden="true" />
        <span>{location.street}<span>{location.city}, {location.state} {location.postalCode}</span></span>
        <span className={styles.srOnly}> (opens directions in a new tab)</span>
      </a>
      <div className={styles.locationContacts}>
        <a href={location.phoneHref}><Phone size={16} aria-hidden="true" />{location.phone}</a>
        <details className={styles.hours} key={location.slug}>
          <summary><Clock3 size={16} aria-hidden="true" /><span>Hours</span><ChevronDown size={15} aria-hidden="true" /></summary>
          <div className={styles.hoursContent}>
            <p>{location.name} · Eastern time</p>
            <dl>
              {Object.entries(location.hours).map(([day, hours]) => (
                <div key={day}><dt>{dayNames[day]}</dt><dd>{hours}</dd></div>
              ))}
            </dl>
            <a href={BRAND_URL} target="_blank" rel="noopener noreferrer">Confirm holiday hours<ExternalArrow /><span className={styles.srOnly}> (opens in a new tab)</span></a>
          </div>
        </details>
      </div>
    </div>
  );
}

export default function MenuExperience() {
  const searchParams = useSearchParams();
  const location = getLocation(searchParams.get("location"));
  const categoryId = getCategory(searchParams.get("category"));
  const query = searchParams.get("q")?.slice(0, 120) ?? "";
  const deferredQuery = useDeferredValue(query);
  const isJacksonville = location.slug === "jacksonville";
  const playHref = `/el-mariachi/play?location=${location.slug}`;
  const menuHref = `/el-mariachi?location=${location.slug}#menu`;

  function updateFilters(values: Record<string, string | null>, push = false) {
    const url = new URL(window.location.href);
    for (const [key, value] of Object.entries(values)) {
      if (value === null || value === "" || value === "all") url.searchParams.delete(key);
      else url.searchParams.set(key, value);
    }
    // Next's native-history integration keeps useSearchParams and browser Back in sync.
    if (push) window.history.pushState(null, "", url);
    else window.history.replaceState(null, "", url);
  }

  const visibleCategories = useMemo(() => {
    const search = normalizeSearch(deferredQuery);
    return categories
      .filter((category) => categoryId === "all" || category.id === categoryId)
      .map((category) => ({
        ...category,
        items: category.items.filter((item) => !search || normalizeSearch(`${item.name} ${item.description} ${category.name}`).includes(search)),
      }))
      .filter((category) => category.items.length > 0);
  }, [categoryId, deferredQuery]);
  const resultCount = visibleCategories.reduce((count, category) => count + category.items.length, 0);

  return (
    <>
      <a href="#menu" className={styles.skipLink}>Skip to menu</a>
      <ElMariachiNav active="menu" orderUrl={location.orderUrl} locationName={location.name} menuHref={menuHref} playHref={playHref} />
      <header className={styles.masthead}>
        <Link href="/el-mariachi" className={styles.brand} aria-label="El Mariachi concept home">
          <Image src={LOGO_PATH} alt="El Mariachi Mex & Grill" width={826} height={826} sizes="(max-width: 600px) 76px, 92px" className={styles.brandLogo} />
          <span>Mex & Grill<span>North Carolina</span></span>
        </Link>
        <p className={styles.conceptLabel}>Independent Fina Calle concept</p>
      </header>
      <main>
        <section className={styles.hero} aria-labelledby="hero-heading">
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>El Mariachi Mex & Grill</p>
            <h1 id="hero-heading" className={styles.heroTitle}><span lang="es">¡Buen<br /><span>provecho!</span></span></h1>
            <p className={styles.heroIntro}>Mexican favorites. Six North Carolina locations.</p>
            <a href="#menu" className={styles.heroCta}>Find your flavor<ArrowDown size={19} aria-hidden="true" /></a>
          </div>
          <figure className={styles.heroFigure}>
            <div className={styles.heroImageWrap}>
              <Image src="/assets/el-mariachi/official-grill.jpg" alt="Grilled meats, cactus and a fried egg on a skillet, from the official El Mariachi website" width={1047} height={785} sizes="(max-width: 760px) 100vw, 55vw" preload className={styles.heroImage} />
            </div>
            <figcaption className={styles.photoCaption}>From the El Mariachi kitchen</figcaption>
            <div className={styles.heroSeal} aria-hidden="true"><span>Mex</span><span>&</span><span>Grill</span></div>
          </figure>
        </section>
        <div className={styles.flavorLine} aria-hidden="true"><span>Tacos</span><span>✦</span><span>Fajitas</span><span>✦</span><span>Birria</span><span>✦</span><span>Y mucho más</span></div>
        <section id="menu" className={styles.menuSection} aria-labelledby="menu-heading" tabIndex={-1}>
          <div className={styles.menuHeadingRow}>
            <div><p className={styles.eyebrow}>Something for every craving</p><h2 id="menu-heading" className={styles.sectionTitle}>The menu<span>.</span></h2></div>
            <div className={styles.locationControl}>
              <label htmlFor="mariachi-location"><MapPin size={15} aria-hidden="true" />Your location</label>
              <div className={styles.selectWrap}>
                <select id="mariachi-location" name="location" value={location.slug} onChange={(event) => updateFilters({ location: event.target.value, category: null, q: null }, true)}>
                  {locations.map((place) => <option value={place.slug} key={place.slug}>{place.name}</option>)}
                </select>
                <ChevronDown size={21} aria-hidden="true" />
              </div>
            </div>
          </div>
          <LocationDetails location={location} />
          {isJacksonville ? (
            <>
              <div className={styles.menuTools}>
                <div className={styles.searchWrap}>
                  <Search size={19} aria-hidden="true" />
                  <label htmlFor="mariachi-search" className={styles.srOnly}>Search the Jacksonville menu</label>
                  <input id="mariachi-search" name="q" type="search" autoComplete="off" placeholder="Search tacos, fajitas, churros…" maxLength={120} value={query} onChange={(event) => updateFilters({ q: event.target.value })} />
                  {query && <button type="button" aria-label="Clear menu search" onClick={() => updateFilters({ q: null })}><X size={18} aria-hidden="true" /></button>}
                </div>
                <div className={styles.categorySelect}>
                  <label htmlFor="mariachi-category" className={styles.srOnly}>Menu category</label>
                  <select id="mariachi-category" name="category" value={categoryId} onChange={(event) => updateFilters({ category: event.target.value }, true)}>
                    <option value="all">All categories</option>
                    {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
                  </select>
                  <ChevronDown size={19} aria-hidden="true" />
                </div>
              </div>
              <div className={styles.menuLayout}>
                <aside className={styles.categorySidebar} aria-label="Menu categories">
                  <p>Browse the menu</p>
                  <button type="button" aria-pressed={categoryId === "all"} onClick={() => updateFilters({ category: null }, true)}><span>Everything</span><span>{totalItems}</span></button>
                  {categories.map((category) => (
                    <button type="button" key={category.id} aria-pressed={categoryId === category.id} onClick={() => updateFilters({ category: category.id }, true)}><span>{category.name}</span><span>{category.items.length}</span></button>
                  ))}
                </aside>
                <div className={styles.menuResults} aria-busy={query !== deferredQuery}>
                  <div className={styles.menuResultMeta}>
                    <p role="status" aria-live="polite" aria-atomic="true">{query || categoryId !== "all" ? `${resultCount} ${resultCount === 1 ? "dish" : "dishes"} found` : "Jacksonville menu"}</p>
                    <span>Tap a dish for details</span>
                  </div>
                  {visibleCategories.length === 0 ? (
                    <div className={styles.emptyState}>
                      <h3>No dishes found.</h3>
                      <p>Try a different name or explore the full menu.</p>
                      <button type="button" onClick={() => updateFilters({ q: null, category: null }, true)}>Show the full menu<ArrowRight size={18} aria-hidden="true" /></button>
                    </div>
                  ) : visibleCategories.map((category) => (
                    <section className={styles.categorySection} key={`${category.id}-${deferredQuery}`} aria-labelledby={`heading-${category.id}`}>
                      <div className={styles.categoryHeading}><h3 id={`heading-${category.id}`}>{category.name}</h3><span>{category.items.length}</span></div>
                      <div className={styles.dishList}>{category.items.map((item) => <ItemDisclosure key={item.id} item={item} />)}</div>
                    </section>
                  ))}
                  <div className={styles.priceNote}>
                    <p>Jacksonville online base prices, recorded {MENU_RETRIEVED}. Options, taxes and fees may be extra. Prices and availability can change.</p>
                    <a href={location.orderUrl} target="_blank" rel="noopener noreferrer">See the restaurant’s current menu<ExternalArrow /><span className={styles.srOnly}> (opens in a new tab)</span></a>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className={styles.otherLocation}>
              <div><p className={styles.eyebrow}>{location.name}, North Carolina</p><h3>Your local<br />El Mariachi.</h3></div>
              <div><p>See {location.name}’s dishes, current prices and options on the restaurant’s ordering menu.</p><p className={styles.fulfillment}>{location.deliveryAvailableOnOfficialPage ? "Pickup & delivery" : "Pickup"}</p><a href={location.orderUrl} target="_blank" rel="noopener noreferrer" className={styles.solidCta}>Open {location.name} menu<ExternalArrow /><span className={styles.srOnly}> (opens in a new tab)</span></a></div>
            </div>
          )}
        </section>
        <section className={styles.interlude} aria-labelledby="play-heading">
          <div className={styles.interludePhotos}>
            <Image src="/assets/el-mariachi/official-fajitas.jpg" alt="El Mariachi’s official photograph labeled Fajitas fundida, served in a pineapple" width={922} height={692} sizes="(max-width: 760px) 50vw, 28vw" />
            <Image src="/assets/el-mariachi/official-birria.jpg" alt="El Mariachi’s official photograph labeled Pizza Birria, with salsa and consommé" width={922} height={692} sizes="(max-width: 760px) 50vw, 28vw" />
          </div>
          <div className={styles.interludeCopy}>
            <p className={styles.eyebrow}>A little rhythm at the table</p>
            <h2 id="play-heading">Got a minute?<br /><span>Find your beat.</span></h2>
            <p>Tap along in Mariachi Rush.</p>
            <Link href={playHref}>Let’s play<ArrowRight size={19} aria-hidden="true" /></Link>
          </div>
        </section>
      </main>
    </>
  );
}
