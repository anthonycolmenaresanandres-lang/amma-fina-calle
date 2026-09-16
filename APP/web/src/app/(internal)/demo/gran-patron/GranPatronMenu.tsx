"use client";
import Image from "next/image";
import { useState } from "react";
import { ChevronDown, Search, X } from "lucide-react";
import { GRAN_PATRON_LINKS as links, GRAN_PATRON_MANIFEST as source, itemPrice, searchMenu, type MenuGroup } from "@/table-os/menu/gran-patron";
import styles from "./GranPatron.module.css";

const groups: MenuGroup[] = ["Food", "Lunch", "Dinner", "Drinks"];
export default function GranPatronMenu() {
  const [group, setGroup] = useState<MenuGroup>("Food");
  const [query, setQuery] = useState("");
  const sections = searchMenu(query, group);
  const searching = query.trim().length > 0;
  const count = sections.reduce((total, section) => total + section.items.length, 0);
  return <section id="menu" className={styles.menu} aria-labelledby="menu-heading">
    <header className={styles.menuIntro}><p className={styles.eyebrow}>Find your flavor</p><h2 id="menu-heading">At your table.</h2><p>Browse, explore, and make it yours.</p><p className={styles.notice}>Menu preview · awaiting restaurant confirmation. Prices and availability may change.</p></header>
    <div className={styles.menuControls}>
      <div className={styles.groups} aria-label="Choose a menu">{groups.map(value => <button key={value} type="button" aria-pressed={!searching && group === value} onClick={() => { setGroup(value); setQuery(""); }}>{value}</button>)}</div>
      <div className={styles.search}><Search aria-hidden="true" /><label className={styles.srOnly} htmlFor="menu-search">Search all food and drinks</label><input id="menu-search" name="search" type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Search dishes & drinks…" autoComplete="off" />{query ? <button type="button" aria-label="Clear search" onClick={() => setQuery("")}><X aria-hidden="true" /></button> : null}</div>
      {!searching ? <label className={styles.categorySelect}>Jump to a category<select value="" onChange={event => { const section = document.getElementById(event.target.value); section?.scrollIntoView({ block: "start" }); section?.focus({ preventScroll: true }); }}><option value="" disabled>Browse {sections.length} categories</option>{sections.map(section => <option key={section.id} value={`section-${section.id}`}>{section.name}</option>)}</select></label> : null}
    </div>
    <div className={styles.menuBody}>
      <p className={styles.results} role="status">{searching ? `${count} results across all menus` : `${group} menu · ${count} items`}</p>
      {!searching && group === "Lunch" ? <p className={styles.context}>{source.lunchNotice}</p> : null}
      {!count ? <div className={styles.empty}><h3>No matches yet.</h3><p>Try a dish, ingredient or drink name.</p><button type="button" onClick={() => setQuery("")}>Show {group.toLowerCase()} menu</button></div> : null}
      {sections.map(section => <section className={styles.section} key={section.id} id={`section-${section.id}`} tabIndex={-1} aria-labelledby={`heading-${section.id}`}>
        <header><p className={styles.eyebrow}>{section.group}{section.group === "Drinks" ? ` · ${section.sourceGroup}` : ""}</p><h3 id={`heading-${section.id}`}>{section.name}</h3>{section.note ? <p className={styles.context}>{section.note}</p> : null}{section.name === "DRAFT" ? <p className={styles.context}>{source.beerNotice}</p> : null}</header>
        {section.items.map(item => <details key={item.id} className={styles.dish} data-item-id={item.id}>
          <summary><span className={styles.dishName}>{item.name}{item.photo ? <small>Photo inside</small> : null}</span><span className={styles.price}>{itemPrice(item)}</span><ChevronDown aria-hidden="true" /></summary>
          <div className={styles.dishBody}>{item.description ? item.description.split(" • ").map((paragraph, index) => <p key={index}>{paragraph}</p>) : <p>Ask our team for more details.</p>}{item.prices.length > 1 ? <ul className={styles.sizes} aria-label="Sizes and prices">{item.prices.map(price => <li key={price}>{price}</li>)}</ul> : null}{item.photo ? <Image src={item.photo} alt={item.name} width={800} height={800} sizes="(max-width: 600px) 85vw, 400px" loading="lazy" /> : null}</div>
        </details>)}
      </section>)}
      <aside className={styles.source}><p>{source.foodNotice}</p><p>Source menu checked September 16, 2026.</p><div><a href={links.foodSource} target="_blank" rel="noopener noreferrer">Restaurant food menu<span className={styles.srOnly}> (opens a new tab)</span></a><a href={links.drinksSource} target="_blank" rel="noopener noreferrer">Restaurant drinks menu<span className={styles.srOnly}> (opens a new tab)</span></a></div></aside>
    </div>
  </section>;
}
