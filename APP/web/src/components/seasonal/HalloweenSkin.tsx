"use client";

import { useEffect, useRef } from "react";
import styles from "./HalloweenSkin.module.css";
import Image from "next/image";
import { createGhostCloth } from "./ghostCloth";

// Midnight November 1 in New York is 04:00 UTC (DST is still in effect).
export const HALLOWEEN_START = Date.parse("2026-10-01T00:00:00-04:00");
export const HALLOWEEN_END = Date.parse("2026-11-01T00:00:00-04:00");
export function halloweenActive(now = Date.now()) {
  return now >= HALLOWEEN_START && now < HALLOWEEN_END;
}
export function ghostDelay(first: boolean, random = Math.random()) {
  return first ? 15000 + random * 5000 : 45000 + random * 30000;
}

// Keep the normal footprint where it fits; compact phones can use a 72px-tall visitor.
export function ghostLane(boxes: Pick<DOMRect, "width" | "height" | "left" | "right" | "top" | "bottom">[],
  viewportWidth: number, viewportHeight: number, width: number, height: number) {
  for (const candidate of [height, Math.min(height, 72)]) {
    for (let top = 48; top < viewportHeight - candidate - 12; top += 4) {
      if (!boxes.some(box => box.width > 2 && box.height > 2 && box.right > 0 &&
        box.left < viewportWidth && box.bottom > top - 4 && box.top < top + candidate + 8)) {
        return { top, width: width * candidate / height, height: candidate };
      }
    }
  }
  return null;
}

export default function HalloweenSkin({ brand, collection = false }: { brand: "colattao" | "bodega"; collection?: boolean }) {
  const root = useRef<HTMLDivElement>(null);
  const ghost = useRef<HTMLDivElement>(null);
  const cloth = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const element = root.current;
    const visitor = ghost.current;
    if (!element || !visitor) return;
    let timer: ReturnType<typeof setTimeout>;
    let animation: Animation | undefined;
    let reverse = false;
    let clothMotion: ReturnType<typeof createGhostCloth> | undefined;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const hide = () => { animation?.cancel(); visitor.style.opacity = "0"; clothMotion?.stop(); };
    const blocked = () => document.hidden || reduced.matches ||
      Boolean(document.querySelector("canvas:not([data-ghost-cloth]), [role='dialog'], [aria-modal='true'], [data-game-active='true']")) ||
      Boolean(document.activeElement?.closest("form, input, textarea, select, [contenteditable='true']"));
    // Find an empty horizontal band using actual text and control rectangles.
    // If the page is dense, omit this visit rather than crossing content.
    const clearLane = () => {
      const boxes: DOMRect[] = [];
      document.querySelectorAll("a,button,input,textarea,select,canvas,video,img[alt*='Bodega Cafe'],img[alt*='Colattao Coffee']").forEach(node => {
        if (!element.contains(node) && node.checkVisibility?.({ opacityProperty: true, visibilityProperty: true }) !== false) boxes.push(node.getBoundingClientRect());
      });
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      let node: Node | null;
      while ((node = walker.nextNode())) {
        const parent = node.parentElement;
        if (!node.textContent?.trim() || !parent || element.contains(parent) ||
          parent.closest("script,style,[aria-hidden='true'],.sr-only") ||
          parent.checkVisibility?.({ opacityProperty: true, visibilityProperty: true }) === false ||
          getComputedStyle(parent).visibility === "hidden") continue;
        const range = document.createRange();
        range.selectNodeContents(node);
        boxes.push(...Array.from(range.getClientRects()));
      }
      visitor.style.width = "";
      visitor.style.height = "";
      const size = visitor.getBoundingClientRect();
      return ghostLane(boxes, window.innerWidth, window.innerHeight, size.width, size.height);
    };
    const visit = () => {
      if (!halloweenActive()) { element.hidden = true; hide(); return; }
      if (!blocked()) {
        const lane = clearLane();
        if (lane !== null) {
          visitor.style.top = lane.top + "px";
          visitor.style.width = lane.width + "px";
          visitor.style.height = lane.height + "px";
          const width = visitor.getBoundingClientRect().width;
          const from = reverse ? window.innerWidth + width : -width;
          const to = reverse ? -width : window.innerWidth + width;
          animation?.cancel();
          if (!clothMotion && cloth.current) clothMotion = createGhostCloth(cloth.current, "/assets/seasonal/halloween-2026/ghost-ivory.webp");
          clothMotion?.start();
          visitor.style.opacity = "1";
          animation = visitor.animate([
            { transform: `translate3d(${from}px,0,0) rotate(-5deg)`, opacity: 0 },
            { transform: `translate3d(${from + (to-from)*.2}px,-4px,0) rotate(3deg)`, opacity: .85, offset: .2 },
            { transform: `translate3d(${from + (to-from)*.6}px,3px,0) rotate(-3deg)`, opacity: .85, offset: .6 },
            { transform: `translate3d(${to}px,0,0) rotate(5deg)`, opacity: 0 }
          ], { duration: 8000, easing: "ease-in-out", fill: "forwards" });
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
      clearTimeout(timer); clearTimeout(expiry); hide(); clothMotion?.destroy();
      document.removeEventListener("visibilitychange", pause);
      document.removeEventListener("focusin", pause);
      reduced.removeEventListener("change", pause);
      document.removeEventListener("scroll", hide, true);
      document.removeEventListener("pointerdown", hide);
      window.removeEventListener("resize", hide);
    };
  }, []);
  return <div ref={root} hidden aria-hidden="true" data-halloween-skin={brand}
    className={`${styles.skin} ${brand === "bodega" ? styles.bodega : styles.colattao} ${collection ? styles.collection : ""}`}>
    <div className={styles.trim}>
      <span className={styles.web}><Image src={`/assets/seasonal/halloween-2026/spiderweb-${brand === "bodega" ? "charcoal" : "silver"}.webp`} alt="" width={384} height={384} /></span>
      <span className={styles.webRight}><Image src={`/assets/seasonal/halloween-2026/spiderweb-${brand === "bodega" ? "charcoal" : "silver"}.webp`} alt="" width={384} height={384} /></span>
      <span className={styles.pumpkin}><Image src="/assets/seasonal/halloween-2026/jack-o-lantern.webp" alt="" width={384} height={384} /></span>
      <span className={styles.resident}><Image src="/assets/seasonal/halloween-2026/ghost-ivory.webp" alt="" width={384} height={576} /></span>
    </div>
    <div className={styles.flight}><div ref={ghost} className={styles.ghost}>
      <Image src="/assets/seasonal/halloween-2026/ghost-ivory.webp" alt="" width={384} height={576} />
      <canvas ref={cloth} data-ghost-cloth="" />
    </div></div>
  </div>;
}
