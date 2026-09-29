"use client";

import { useEffect, useState } from "react";
import styles from "./page.module.css";

const sections = [
  { id: "breakfast", label: "Breakfast" },
  { id: "mediterranean", label: "Mediterranean" },
  { id: "diner", label: "Diner" },
  { id: "drinks", label: "Drinks" },
  { id: "visit", label: "Visit" },
];

export function ScrambledMenuNav() {
  const [active, setActive] = useState(sections[0].id);

  useEffect(() => {
    const targets = sections.map(({ id }) => document.getElementById(id));
    let frame = 0;

    const update = () => {
      frame = 0;
      let closest = -Infinity;
      let current = sections[0].id;

      targets.forEach((target, index) => {
        if (!target) return;
        const top = target.getBoundingClientRect().top;
        if (top <= 112 && top > closest) {
          closest = top;
          current = sections[index].id;
        }
      });

      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) {
        current = "visit";
      }

      setActive((previous) => (previous === current ? previous : current));
    };

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, []);

  return (
    <nav className={styles.sectionNav} aria-label="Menu sections">
      {sections.map(({ id, label }) => (
        <a
          href={`#${id}`}
          key={id}
          onClick={() => setActive(id)}
          aria-current={active === id ? "location" : undefined}
        >
          {label}
        </a>
      ))}
    </nav>
  );
}
