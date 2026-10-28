"use client";

import { useEffect, useRef } from "react";
import styles from "./HalloweenSkin.module.css";

// Midnight November 1 in New York is 04:00 UTC (DST is still in effect).
export const HALLOWEEN_START = Date.parse("2026-10-01T00:00:00-04:00");
export const HALLOWEEN_END = Date.parse("2026-11-01T00:00:00-04:00");
export function halloweenActive(now = Date.now()) {
  return now >= HALLOWEEN_START && now < HALLOWEEN_END;
}
export function ghostDelay(first: boolean, random = Math.random()) {
  return first ? 15000 + random * 5000 : 45000 + random * 30000;
}

function Ghost() {
  return <svg viewBox="0 0 64 72" fill="none"><path d="M10 62V29a22 22 0 0 1 44 0v33l-9-5-7 7-8-7-9 6-6-6Z" fill="currentColor"/><ellipse cx="25" cy="29" rx="3" ry="5" fill="var(--face, #202b27)"/><ellipse cx="41" cy="29" rx="3" ry="5" fill="var(--face, #202b27)"/><path d="M29 43q4 4 8 0" stroke="var(--face, #202b27)" strokeWidth="2" strokeLinecap="round"/></svg>;
}
function Web() {
  return <svg viewBox="0 0 120 120" fill="none" stroke="currentColor" strokeWidth=".8"><path d="M0 0v115M0 0h115M0 0l110 110M0 0l110 46M0 0l46 110M0 35q16-1 24-11 10-8 11-24M0 68q31-2 48-20Q66 31 68 0M0 103q48-3 73-30 27-25 30-73M0 35q7 10 13 32M0 68q14 13 26 34M35 0q10 7 32 13M68 0q13 14 34 26M24 24q0 14 24 24M48 48q0 19 25 25"/></svg>;
}
function Bat() {
  return <svg viewBox="0 0 100 45" fill="currentColor"><path d="m49 14-6-9-2 13C27 8 13 10 2 2c2 17 9 29 23 29 2-7 9-6 14 2l11 10 11-10c5-8 12-9 14-2 14 0 21-12 23-29-11 8-25 6-39 16L57 5l-6 9Z"/></svg>;
}
function Pumpkin() {
  return <svg viewBox="0 0 90 80" fill="none"><path d="M44 20q-3-14 9-16" stroke="currentColor" strokeWidth="6"/><path d="M44 23C8 7-5 66 23 73q12 6 22 0c15 9 37-2 38-23 1-23-19-36-39-27Z" fill="currentColor"/><path d="M44 24c-17 11-17 37 0 49m2-49c17 11 17 37 0 49" stroke="#182d25" strokeWidth="2" opacity=".5"/><path d="m24 42 11-6-1 11Zm33-6 11 6-10 5ZM31 56l8 4 5-3 6 3 10-5c-4 15-24 15-29 1Z" fill="#182d25"/></svg>;
}

export default function HalloweenSkin({ brand }: { brand: "colattao" | "bodega" }) {
  const root = useRef<HTMLDivElement>(null);
  const ghost = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = root.current;
    const visitor = ghost.current;
    if (!element || !visitor) return;
    let timer: ReturnType<typeof setTimeout>;
    let animation: Animation | undefined;
    let reverse = false;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const hide = () => { animation?.cancel(); visitor.style.opacity = "0"; };
    const blocked = () => document.hidden || reduced.matches ||
      Boolean(document.querySelector("canvas, [role='dialog'], [aria-modal='true'], [data-game-active='true']")) ||
      Boolean(document.activeElement?.closest("form, input, textarea, select, [contenteditable='true']"));
    // Find an empty horizontal band using actual text and control rectangles.
    // If the page is dense, omit this visit rather than crossing content.
    const clearLane = () => {
      const boxes: DOMRect[] = [];
      document.querySelectorAll("a,button,input,textarea,select,canvas,video").forEach(node => {
        if (!element.contains(node)) boxes.push(node.getBoundingClientRect());
      });
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      let node: Node | null;
      while ((node = walker.nextNode())) {
        const parent = node.parentElement;
        if (!node.textContent?.trim() || !parent || element.contains(parent) ||
          parent.closest("script,style,[aria-hidden='true']") ||
          getComputedStyle(parent).visibility === "hidden") continue;
        const range = document.createRange();
        range.selectNodeContents(node);
        boxes.push(...Array.from(range.getClientRects()));
      }
      for (let y = 48; y < window.innerHeight - 52; y += 8) {
        if (!boxes.some(box => box.width > 0 && box.height > 0 && box.right > 0 &&
          box.left < window.innerWidth && box.bottom > y - 4 && box.top < y + 44)) return y;
      }
      return null;
    };
    const visit = () => {
      if (!halloweenActive()) { element.hidden = true; hide(); return; }
      if (!blocked()) {
        const lane = clearLane();
        if (lane !== null) {
          visitor.style.top = lane + "px";
          const from = reverse ? window.innerWidth + 44 : -44;
          const to = reverse ? -44 : window.innerWidth + 44;
          visitor.style.opacity = "1";
          animation = visitor.animate([
            { transform: `translate3d(${from}px,0,0) rotate(-5deg)`, opacity: 0 },
            { transform: `translate3d(${from + (to-from)*.2}px,-4px,0) rotate(3deg)`, opacity: .85, offset: .2 },
            { transform: `translate3d(${from + (to-from)*.6}px,3px,0) rotate(-3deg)`, opacity: .85, offset: .6 },
            { transform: `translate3d(${to}px,0,0) rotate(5deg)`, opacity: 0 }
          ], { duration: 3600, easing: "ease-in-out", fill: "forwards" });
          reverse = !reverse;
        }
      }
      timer = setTimeout(visit, ghostDelay(false));
    };
    element.hidden = !halloweenActive();
    timer = setTimeout(visit, ghostDelay(true));
    const expiry = setTimeout(() => { element.hidden = true; hide(); clearTimeout(timer); },
      Math.max(0, Math.min(HALLOWEEN_END - Date.now(), 2147483647)));
    const pause = () => { if (blocked()) hide(); };
    document.addEventListener("visibilitychange", pause);
    document.addEventListener("focusin", pause);
    reduced.addEventListener("change", pause);
    document.addEventListener("scroll", hide, { passive: true, capture: true });
    document.addEventListener("pointerdown", hide, { passive: true });
    window.addEventListener("resize", hide);
    return () => {
      clearTimeout(timer); clearTimeout(expiry); hide();
      document.removeEventListener("visibilitychange", pause);
      document.removeEventListener("focusin", pause);
      reduced.removeEventListener("change", pause);
      document.removeEventListener("scroll", hide, true);
      document.removeEventListener("pointerdown", hide);
      window.removeEventListener("resize", hide);
    };
  }, []);
  return <div ref={root} hidden aria-hidden="true" data-halloween-skin={brand}
    className={`${styles.skin} ${brand === "bodega" ? styles.bodega : styles.colattao}`}>
    <div className={styles.trim}><span className={styles.web}><Web /></span><span className={styles.webRight}><Web /></span>
      <span className={styles.bat}><Bat /></span><span className={styles.batSmall}><Bat /></span>
      <span className={styles.pumpkin}><Pumpkin /></span><span className={styles.resident}><Ghost /></span></div>
    <div className={styles.flight}><div ref={ghost} className={styles.ghost}><Ghost /></div></div>
  </div>;
}
