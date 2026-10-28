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

export function ghostScales(viewportWidth: number) {
  return viewportWidth < 700 ? [1, .82] : [1, .86, .72];
}

type GhostBox = Pick<DOMRect, "width" | "height" | "left" | "right" | "top" | "bottom"> & { priority?: number };

// Prefer clear space, then use the least occupied viewport band with a translucent visitor.
// Dense menu text must never prevent a visit while the guest is browsing.
export function ghostLane(boxes: GhostBox[],
  viewportWidth: number, viewportHeight: number, width: number, height: number, compactLimit = 72) {
  if (width <= 0 || height <= 0 || viewportWidth <= 0 || viewportHeight <= 0) return null;
  const visible = boxes.filter(box => box.width > 2 && box.height > 2 && box.right > 0 && box.left < viewportWidth);
  const compact = Math.min(height, compactLimit, Math.max(24, viewportHeight - 96));
  for (const candidate of [height, compact]) {
    for (let top = 48; top < viewportHeight - candidate - 12; top += 4) {
      if (!visible.some(box => box.bottom > top - 4 && box.top < top + candidate + 8)) {
        return { top, width: width * candidate / height, height: candidate, opacity: .55 };
      }
    }
  }
  let top = 48, least = Infinity;
  for (let candidate = 48; candidate <= Math.max(48, viewportHeight - compact - 16); candidate += 8) {
    const cost = visible.reduce((total, box) => total + Math.max(0,
      Math.min(box.bottom, candidate + compact + 8) - Math.max(box.top, candidate - 4)) *
      Math.max(0, Math.min(box.right, viewportWidth) - Math.max(box.left, 0)) * (box.priority ?? 1), 0);
    if (cost < least) { least = cost; top = candidate; }
  }
  return { top, width: width * compact / height, height: compact, opacity: .32 };
}

export default function HalloweenSkin({ brand, collection = false }: { brand: "colattao" | "bodega"; collection?: boolean }) {
  const root = useRef<HTMLDivElement>(null);
  const ghosts = useRef<(HTMLDivElement | null)[]>([]);
  const cloths = useRef<(HTMLCanvasElement | null)[]>([]);
  useEffect(() => {
    const element = root.current;
    const visitors = ghosts.current.filter((node): node is HTMLDivElement => node !== null);
    if (!element || !visitors.length) return;
    let timer: ReturnType<typeof setTimeout>;
    const animations: (Animation | undefined)[] = [];
    const departures = new Set<ReturnType<typeof setTimeout>>();
    let reverse = false;
    const motions: (ReturnType<typeof createGhostCloth> | undefined)[] = [];
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const hide = () => {
      departures.forEach(clearTimeout); departures.clear();
      visitors.forEach((visitor, index) => { animations[index]?.cancel(); visitor.style.opacity = "0"; motions[index]?.stop(); });
    };
    const blocked = () => document.hidden || reduced.matches ||
      Boolean(document.querySelector("canvas:not([data-ghost-cloth]), [role='dialog'], [aria-modal='true'], [data-game-active='true']")) ||
      Boolean(document.activeElement?.closest("textarea, select, input:not([type='button']):not([type='submit']):not([type='reset']):not([type='checkbox']):not([type='radio']):not([type='range']):not([type='color']):not([type='hidden']), [contenteditable]:not([contenteditable='false'])"));
    // Recompute the route from the current viewport at every scheduled visit.
    const clearLanes = () => {
      const boxes: GhostBox[] = [];
      document.querySelectorAll("a,button,input,textarea,select,canvas,video,img[alt*='Bodega Cafe'],img[alt*='Colattao Coffee']").forEach(node => {
        if (!element.contains(node) && node.checkVisibility?.({ opacityProperty: true, visibilityProperty: true }) !== false) {
          const box: DOMRect & { priority?: number } = node.getBoundingClientRect();
          box.priority = node.matches("a,button,input,textarea,select") ? 4 : 2;
          boxes.push(box);
        }
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
      return ghostScales(window.innerWidth).map((scale, index) => {
        const visitor = visitors[index];
        if (!visitor) return null;
        visitor.style.width = ""; visitor.style.height = "";
        const size = visitor.getBoundingClientRect();
        const lane = ghostLane(boxes, window.innerWidth, window.innerHeight,
          size.width * scale, size.height * scale, 72 * scale);
        if (lane) boxes.push({ left: 0, right: window.innerWidth, width: window.innerWidth,
          top: lane.top - 20, bottom: lane.top + lane.height + 20, height: lane.height + 40, priority: 8 });
        return lane;
      });
    };
    const visit = () => {
      if (!halloweenActive()) { element.hidden = true; hide(); return; }
      if (!blocked()) {
        hide();
        const lanes = clearLanes();
        const groupReverse = reverse;
        reverse = !reverse;
        lanes.forEach((lane, index) => {
          if (!lane) return;
          const depart = () => {
            if (blocked() || !halloweenActive()) { hide(); return; }
            const visitor = visitors[index];
            visitor.style.top = lane.top + "px";
            visitor.style.width = lane.width + "px";
            visitor.style.height = lane.height + "px";
            const width = lane.width;
            const from = groupReverse ? window.innerWidth + width : -width;
            const to = groupReverse ? -width : window.innerWidth + width;
            const canvas = cloths.current[index];
            if (!motions[index] && canvas) motions[index] = createGhostCloth(canvas, "/assets/seasonal/halloween-2026/ghost-ivory.webp");
            motions[index]?.start();
            visitor.style.opacity = "1";
            animations[index] = visitor.animate([
              { transform: `translate3d(${from}px,0,0) rotate(-5deg)`, opacity: 0 },
              { transform: `translate3d(${from + (to-from)*.2}px,-4px,0) rotate(3deg)`, opacity: lane.opacity, offset: .2 },
              { transform: `translate3d(${from + (to-from)*.6}px,3px,0) rotate(-3deg)`, opacity: lane.opacity, offset: .6 },
              { transform: `translate3d(${to}px,0,0) rotate(5deg)`, opacity: 0 }
            ], { duration: 8000, easing: "ease-in-out", fill: "forwards" });
          };
          if (index === 0) depart();
          else {
            const pending = setTimeout(() => { departures.delete(pending); depart(); }, index * 700);
            departures.add(pending);
          }
        });
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
    // Ordinary browsing never cancels or reschedules a visit. Actual game/modal activation still does.
    const activity = new MutationObserver(() => { if (blocked()) hide(); });
    activity.observe(document.body, { childList: true, subtree: true, attributes: true,
      attributeFilter: ["data-game-active", "aria-modal", "role"] });
    return () => {
      clearTimeout(timer); clearTimeout(expiry); hide(); motions.forEach(motion => motion?.destroy());
      document.removeEventListener("visibilitychange", pause);
      document.removeEventListener("focusin", pause);
      reduced.removeEventListener("change", pause);
      activity.disconnect();
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
    <div className={styles.flight}>{[0, 1, 2].map(index => <div key={index} data-ghost-visitor={index}
      ref={node => { ghosts.current[index] = node; }} className={styles.ghost}>
      <Image src="/assets/seasonal/halloween-2026/ghost-ivory.webp" alt="" width={384} height={576} />
      <canvas ref={node => { cloths.current[index] = node; }} data-ghost-cloth="" />
    </div>)}</div>
  </div>;
}
