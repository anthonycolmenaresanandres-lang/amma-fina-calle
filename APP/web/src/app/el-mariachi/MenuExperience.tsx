"use client";

import Image from "next/image";
import Link from "next/link";
import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowDown, ArrowRight, ArrowUpRight, ChevronDown, Clock3, MapPin, Phone, Plus, Search, X } from "lucide-react";
import { ElMariachiNav } from "./ElMariachiNav";
import { BRAND_URL, MENU_RETRIEVED, LOGO_PATH, categories, getCategory, jacksonville, normalizeSearch, type Location, type MenuItem } from "./data";
import { visualAssets } from "./visual-assets";
import { itemPhotos } from "./item-photos";
import styles from "./menu.module.css";

const dayNames: Record<string, string> = {
  Sun: "Sunday", Mon: "Monday", Tue: "Tuesday", Wed: "Wednesday", Thu: "Thursday", Fri: "Friday", Sat: "Saturday",
};

function FeaturedDish({ dish }: { dish: (typeof visualAssets.food)[number] }) {
  const [failed, setFailed] = useState(false);
  const image = failed ? dish.fallback : dish;
  return (
    <figure className={styles.foodFigure}>
      <div className={styles.foodImageWrap}>
        <Image src={image.src} alt={image.alt} width={image.width} height={image.height}
          sizes="(max-width: 760px) 46vw, (max-width: 1440px) 24vw, 330px"
          className={failed ? styles.foodPhotoFallback : styles.foodCutout}
          onError={() => setFailed(true)} />
      </div>
      <figcaption className={styles.foodCaption}>{dish.label}</figcaption>
    </figure>
  );
}

function ExternalArrow() {
  return <ArrowUpRight size={18} aria-hidden="true" />;
}

function ItemDisclosure({ item }: { item: MenuItem }) {
  const [failedPhoto, setFailedPhoto] = useState<string | null>(null);
  const photo = itemPhotos[item.id];
  const visiblePhoto = photo && failedPhoto !== photo.src ? photo : undefined;

  return (
    <details className={styles.menuItem} id={`dish-${item.id}`}>
      <summary className={visiblePhoto ? `${styles.itemSummary} ${styles.itemSummaryWithPhoto}` : styles.itemSummary}>
        {visiblePhoto && (
          <Image
            src={visiblePhoto.src}
            alt=""
            width={visiblePhoto.width}
            height={visiblePhoto.height}
            sizes="(max-width: 760px) 80px, 96px"
            loading="lazy"
            className={styles.itemPhoto}
            onError={() => setFailedPhoto(visiblePhoto.src)}
          />
        )}
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

function HeroScene() {
  const [backgroundFailed, setBackgroundFailed] = useState(false);
  const [dishFailed, setDishFailed] = useState(false);
  const courtyard = backgroundFailed ? null : visualAssets.courtyard;
  const grill = dishFailed ? {
    src: "/assets/el-mariachi/official-grill.jpg", width: 1047, height: 785,
    alt: "Grilled meats, cactus, onion and a fried egg in El Mariachi's official food photograph",
    transparent: false, generated: false,
  } : visualAssets.grill;

  return (
    <section className={styles.hero} aria-labelledby="hero-heading" data-scene={courtyard ? "courtyard" : "plain"}>
      {courtyard && <div className={styles.heroBackdrop} aria-hidden="true">
        <Image src={courtyard.src} alt="" fill sizes="100vw" preload className={styles.courtyardImage} onError={() => setBackgroundFailed(true)} />
      </div>}
      <div className={styles.heroCopy}>
        <p className={styles.eyebrow}>El Mariachi Mex &amp; Grill</p>
        <h1 id="hero-heading" className={styles.heroTitle}><span lang="es">¡Buen<br /><span>provecho!</span></span></h1>
        <p className={styles.heroIntro}>Mexican favorites in Jacksonville, North Carolina.</p>
        <a href="#menu" className={styles.heroCta}>Find your flavor<ArrowDown size={19} aria-hidden="true" /></a>
      </div>
      <figure className={styles.heroFigure}>
        <div className={`${styles.heroImageWrap} ${grill.transparent ? styles.cutoutWrap : styles.photoWrap}`}>
          <Image src={grill.src} alt={grill.alt} width={grill.width} height={grill.height} sizes="(max-width: 760px) 100vw, 58vw" preload className={grill.transparent ? styles.heroCutout : styles.heroImage} onError={() => setDishFailed(true)} />
        </div>
        <figcaption className={styles.photoCaption}>{grill.generated ? "A new angle on the original grill photograph" : "From the El Mariachi kitchen"}</figcaption>
      </figure>
      {courtyard && <p className={styles.sceneCaption}>An imagined courtyard. An El Mariachi concept.</p>}
    </section>
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

function scrollToCategory(categoryId: string) {
  document.getElementById(`heading-${categoryId}`)?.focus({ preventScroll: true });
  document.getElementById(`category-${categoryId}`)?.scrollIntoView({
    behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
    block: "start",
  });
}

export default function MenuExperience() {
  const searchParams = useSearchParams();
  const categoryId = getCategory(searchParams.get("category"));
  const query = searchParams.get("q")?.slice(0, 120) ?? "";
  const deferredQuery = useDeferredValue(query);
  const pendingScrollRef = useRef<string | null>(null);
  const location = jacksonville;
  const playHref = "/el-mariachi/play";
  const menuHref = "/el-mariachi#menu";

  function updateFilters(values: Record<string, string | null>, push = false) {
    const url = new URL(window.location.href);
    // Legacy location links still show and order from Jacksonville only.
    url.searchParams.delete("location");
    for (const [key, value] of Object.entries(values)) {
      if (value === null || value === "" || value === "all") url.searchParams.delete(key);
      else url.searchParams.set(key, value);
    }
    // Next's native-history integration keeps useSearchParams and browser Back in sync.
    if (push) window.history.pushState(null, "", url);
    else window.history.replaceState(null, "", url);
  }

  function updateSearch(value: string) {
    pendingScrollRef.current = null;
    const search = normalizeSearch(value);
    const firstMatch = search ? categories.find((category) => category.items.some((item) =>
      normalizeSearch(`${item.name} ${item.description} ${category.name}`).includes(search),
    )) : undefined;
    updateFilters({ q: value, category: firstMatch?.id ?? null });
  }

  function selectCategory(id: string) {
    if (categoryId === id) {
      pendingScrollRef.current = null;
      scrollToCategory(id);
      return;
    }
    pendingScrollRef.current = id;
    updateFilters({ category: id }, true);
  }

  function toggleCategory(id: string) {
    pendingScrollRef.current = null;
    updateFilters({ category: categoryId === id ? null : id }, true);
  }

  const visibleCategories = useMemo(() => {
    const search = normalizeSearch(deferredQuery);
    return categories
      .map((category, index) => ({
        ...category,
        tone: ["green", "white", "red"][index % 3],
        items: category.items.filter((item) => !search || normalizeSearch(`${item.name} ${item.description} ${category.name}`).includes(search)),
      }))
      .filter((category) => category.items.length > 0);
  }, [deferredQuery]);
  const resultCount = visibleCategories.reduce((count, category) => count + category.items.length, 0);

  useEffect(() => {
    if (pendingScrollRef.current !== categoryId || query !== deferredQuery) return;
    pendingScrollRef.current = null;
    scrollToCategory(categoryId);
  }, [categoryId, query, deferredQuery]);

  return (
    <>
      <a href="#menu" className={styles.skipLink}>Skip to menu</a>
      <ElMariachiNav active="menu" orderUrl={location.orderUrl} locationName={location.name} menuHref={menuHref} playHref={playHref} />
      <header className={styles.masthead}>
        <Link href="/el-mariachi" className={styles.brand} aria-label="El Mariachi concept home">
          <Image src={LOGO_PATH} alt="El Mariachi Mex & Grill" width={826} height={826} sizes="(max-width: 600px) 76px, 92px" className={styles.brandLogo} />
          <span>Mex &amp; Grill<span>Jacksonville, NC</span></span>
        </Link>
        <p className={styles.conceptLabel}>Independent Fina Calle concept</p>
      </header>
      <main>
        <HeroScene />
        <section id="menu" className={styles.menuSection} aria-labelledby="menu-heading" tabIndex={-1}>
          <nav className={styles.categoryNav} aria-label="Menu categories">
            <div className={styles.categoryNavLabel}><span>Choose a category</span><span>{visibleCategories.length > 0 && <>Scroll for more<ArrowRight size={14} aria-hidden="true" /></>}</span></div>
            <div className={styles.categoryBar}>
              {visibleCategories.length > 0 ? visibleCategories.map((category) => (
                <button type="button" key={category.id} data-tone={category.tone} aria-pressed={categoryId === category.id} aria-expanded={categoryId === category.id} aria-controls={`panel-${category.id}`} onClick={() => selectCategory(category.id)}>
                  <span>{category.name}</span>
                </button>
              )) : <p className={styles.categoryEmpty}>No matching categories</p>}
            </div>
          </nav>
          <div className={styles.menuHeadingRow}>
            <div><p className={styles.eyebrow}>Something for every craving</p><h2 id="menu-heading" className={styles.sectionTitle}>The menu<span>.</span></h2></div>
            <p className={styles.menuLocation}><MapPin size={17} aria-hidden="true" />Jacksonville, NC</p>
          </div>
          <LocationDetails location={location} />
          <div className={styles.menuTools}>
            <div className={styles.searchWrap}>
              <Search size={19} aria-hidden="true" />
              <label htmlFor="mariachi-search" className={styles.srOnly}>Search the Jacksonville menu</label>
              <input id="mariachi-search" name="q" type="search" autoComplete="off" placeholder="Search tacos, fajitas, churros…" maxLength={120} value={query} onChange={(event) => updateSearch(event.target.value)} />
              {query && <button type="button" aria-label="Clear menu search" onClick={() => { updateSearch(""); document.getElementById("mariachi-search")?.focus(); }}><X size={18} aria-hidden="true" /></button>}
            </div>
          </div>
          <div className={styles.menuResults} aria-busy={query !== deferredQuery}>
            <div className={styles.menuResultMeta}>
              <p className={styles.srOnly} role="status" aria-live="polite" aria-atomic="true">{query ? `${resultCount} ${resultCount === 1 ? "dish" : "dishes"} in ${visibleCategories.length} ${visibleCategories.length === 1 ? "category" : "categories"}` : "All menu categories available"}</p>
              <span>Open a category, then a dish for details</span>
            </div>
            {visibleCategories.length === 0 ? (
              <div className={styles.emptyState}>
                <h3>No dishes found.</h3>
                <p>Try a different name or explore the full menu.</p>
                <button type="button" onClick={() => updateSearch("")}>Show the full menu<ArrowRight size={18} aria-hidden="true" /></button>
              </div>
            ) : visibleCategories.map((category) => {
              const expanded = categoryId === category.id;
              return (
                <section className={styles.categorySection} id={`category-${category.id}`} key={category.id} aria-labelledby={`heading-${category.id}`}>
                  <h3 className={styles.categoryHeading}>
                    <button type="button" id={`heading-${category.id}`} className={styles.categoryToggle} aria-expanded={expanded} aria-controls={`panel-${category.id}`} onClick={() => toggleCategory(category.id)}>
                      <span>{category.name}</span>
                      <span className={styles.categoryToggleMeta}><ChevronDown size={22} aria-hidden="true" /></span>
                    </button>
                  </h3>
                  <div id={`panel-${category.id}`} className={styles.categoryPanel} hidden={!expanded}>
                    {expanded && <div className={styles.dishList}>{category.items.map((item) => <ItemDisclosure key={item.id} item={item} />)}</div>}
                  </div>
                </section>
              );
            })}
            <div className={styles.priceNote}>
              <p>Jacksonville online base prices, recorded {MENU_RETRIEVED}. Options, taxes and fees may be extra. Prices and availability can change.</p>
              <a href={location.orderUrl} target="_blank" rel="noopener noreferrer">See the restaurant&apos;s current menu<ExternalArrow /><span className={styles.srOnly}> (opens in a new tab)</span></a>
            </div>
          </div>
        </section>
        <section className={styles.interlude} aria-labelledby="play-heading">
          <div className={styles.interludePhotos}>
            {visualAssets.food.map(dish => <FeaturedDish key={dish.src} dish={dish} />)}
          </div>
          <div className={styles.interludeCopy}>
            <p className={styles.eyebrow}>A little break at the table</p>
            <h2 id="play-heading">Start small.<br /><span>Swallow the scene.</span></h2>
            <p>Glide through the courtyard. Collect, grow, and clear a little more.</p>
            <Link href={playHref}>Let&apos;s play<ArrowRight size={19} aria-hidden="true" /></Link>
          </div>
        </section>
      </main>
    </>
  );
}
