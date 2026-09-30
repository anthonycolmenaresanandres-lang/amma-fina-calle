"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import styles from "./venue-menu.module.css";

export type VenueMenuNavSection = { id: string; label: string };

export function VenueMenuNav({ sections, floatingAction }: { sections: VenueMenuNavSection[]; floatingAction: ReactNode }) {
  const [active, setActive] = useState(sections[0]?.id ?? "");
  useEffect(() => {
    const targets = sections.map(({ id }) => document.getElementById(id));
    let frame = 0;
    const update = () => {
      frame = 0;
      let closest = -Infinity;
      let candidates: string[] = [];
      targets.forEach((target, index) => {
        if (!target) return;
        const top = target.getBoundingClientRect().top;
        if (top > 120) return;
        if (top > closest + 2) { closest = top; candidates = [sections[index].id]; }
        else if (Math.abs(top - closest) <= 2) candidates.push(sections[index].id);
      });
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) candidates = [sections[sections.length - 1].id];
      setActive((previous) => candidates.includes(previous) ? previous : candidates[0] ?? sections[0].id);
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [sections]);
  return <>
    <nav className={styles.sectionNav} aria-label="Menu categories">
      {sections.map(({ id, label }) => <a href={`#${id}`} key={id} onClick={() => setActive(id)} aria-current={active === id ? "location" : undefined}>{label}</a>)}
    </nav>
    {floatingAction}
  </>;
}
