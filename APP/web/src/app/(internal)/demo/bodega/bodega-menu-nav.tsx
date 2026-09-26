"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "./page.module.css";

const sections = [
  { id: "fall-sessions", label: "Fall" },
  { id: "bodega-classics", label: "Classics" },
  { id: "signature-cafecito", label: "Cafecito" },
  { id: "non-coffee", label: "Non-coffee" },
  { id: "morning-bites", label: "Bites" },
  { id: "bakery-case", label: "Bakery" },
  { id: "hours", label: "Visit" },
];

export function BodegaMenuNav() {
  const [active, setActive] = useState("fall-sessions");
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
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) candidates = ["hours"];
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
  }, []);
  return <>
    <nav className={styles.sectionNav} aria-label="Menu categories">
    {sections.map(({ id, label }) => <a href={`#${id}`} key={id} onClick={() => setActive(id)} aria-current={active === id ? "location" : undefined}>{label}</a>)}
    </nav>
    <Link className={styles.floatingPlay} href="/bodega-sessions-review" prefetch={false}>PLAY BODEGA RUSH</Link>
  </>;
}
