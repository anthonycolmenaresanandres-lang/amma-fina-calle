"use client";

import { useMemo, useState } from "react";
import { menuSections } from "./menu-data";
import styles from "./portal.module.css";

export default function MenuExplorer(): React.JSX.Element {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");

  const visibleSections = useMemo(() => {
    const term = query.trim().toLocaleLowerCase();

    return menuSections
      .filter((section) => category === "all" || section.id === category)
      .map((section) => ({
        ...section,
        items: section.items.filter((item) => {
          if (!term) return true;
          return [item.name, item.description, item.note]
            .filter(Boolean)
            .some((value) => value?.toLocaleLowerCase().includes(term));
        }),
      }))
      .filter((section) => section.items.length > 0);
  }, [category, query]);

  return (
    <div>
      <label className="sr-only" htmlFor="aj-menu-search">Search the Holland Road menu</label>
      <input
        id="aj-menu-search"
        className={styles.input}
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search wings, burgers, crab, kids…"
      />

      <div className={styles.categoryRail} role="group" aria-label="Menu categories">
        <button
          type="button"
          aria-pressed={category === "all"}
          className={`${styles.categoryButton} ${category === "all" ? styles.categoryButtonActive : ""}`}
          onClick={() => setCategory("all")}
        >
          Full menu
        </button>
        {menuSections.map((section) => (
          <button
            key={section.id}
            type="button"
            aria-pressed={category === section.id}
            className={`${styles.categoryButton} ${category === section.id ? styles.categoryButtonActive : ""}`}
            onClick={() => setCategory(section.id)}
          >
            {section.title}
          </button>
        ))}
      </div>

      {visibleSections.length ? visibleSections.map((section) => (
        <section key={section.id} className={styles.menuSection} aria-labelledby={`menu-${section.id}`}>
          <div className={styles.menuHeading}>
            <h3 id={`menu-${section.id}`}>{section.title}</h3>
            <span>{section.items.length} items</span>
          </div>
          {section.note ? <p className={styles.menuDescription}>{section.note}</p> : null}
          <div className={styles.menuGrid}>
            {section.items.map((item) => (
              <article key={`${section.id}-${item.name}`} className={styles.menuItem}>
                <h4>{item.name}</h4>
                <span className={styles.menuPrice}>{item.price}</span>
                {item.description ? <p className={styles.menuDescription}>{item.description}</p> : null}
                {item.note ? <p className={styles.menuNote}>{item.note}</p> : null}
              </article>
            ))}
          </div>
        </section>
      )) : (
        <p className={styles.gameStatus}>No matching menu items. Try a shorter search.</p>
      )}
    </div>
  );
}
