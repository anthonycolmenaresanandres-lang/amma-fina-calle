"use client";

import { useEffect, useRef, useState } from "react";
import { BodegaSealLettering } from "./bodega-seal-lettering";
import styles from "./page.module.css";

const LEFT = "82,483 138,483 163,514 180,470 201,525 237,445 254,495 343,495";
const RIGHT = "411,495 494,495 512,445 539,525 566,470 583,483 635,483";
const LEFT_PEAK = "82,483 138,483 163,520 180,462 201,535 237,433 254,495 343,495";
const LEFT_SETTLE = "82,483 138,483 163,511 180,475 201,520 237,451 254,495 343,495";
const RIGHT_PEAK = "411,495 494,495 512,433 539,535 566,459 583,483 635,483";
const RIGHT_SETTLE = "411,495 494,495 512,451 539,520 566,476 583,483 635,483";
const EASING = "0.42 0 0.58 1;0.42 0 0.58 1;0.42 0 0.58 1;0.42 0 0.58 1;0.42 0 0.58 1";

export function BodegaSignalLogo() {
  const seal = useRef<SVGSVGElement>(null);
  const started = useRef(false);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const svg = seal.current;
    if (!svg) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let inView = !("IntersectionObserver" in window);
    // Native SVG point interpolation: no React renders or JS work per frame.
    // Without SMIL support, the source polylines remain a complete static logo.
    if (typeof svg.pauseAnimations !== "function") return;
    if (!started.current) {
      svg.pauseAnimations();
      svg.setCurrentTime(0);
      svg.querySelectorAll<SVGAnimationElement>("animate").forEach((animation) => animation.beginElement());
      started.current = true;
    }
    const sync = () => {
      if (inView && !document.hidden && !reducedMotion.matches && !paused) {
        svg.unpauseAnimations();
      } else {
        svg.pauseAnimations();
        if (reducedMotion.matches) svg.setCurrentTime(0);
      }
    };
    const observer = "IntersectionObserver" in window ? new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      sync();
    }) : null;
    observer?.observe(svg);
    document.addEventListener("visibilitychange", sync);
    reducedMotion.addEventListener("change", sync);
    sync();
    return () => {
      svg.pauseAnimations();
      observer?.disconnect();
      document.removeEventListener("visibilitychange", sync);
      reducedMotion.removeEventListener("change", sync);
    };
  }, [paused]);

  return (
    <div className={styles.sealStage}>
      <svg ref={seal} className={styles.sealMark} viewBox="0 0 720 720" width="720" height="720" role="img" aria-label="Bodega Cafe — Virginia Beach" focusable="false">
        <circle cx="360" cy="360" r="340" fill="#fff" />
        <circle cx="360" cy="360" r="322" fill="none" stroke="#000" strokeWidth="3" />
        <BodegaSealLettering />
        <g fill="none" stroke="#000" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round">
          <path d="M343 495 C335 486 326 483 320 478 C293 477 279 460 280 437 C280 419 291 409 310 406 L310 389 H444 C443 436 433 477 411 495 M309 426 C298 423 295 431 297 443 C299 454 304 459 311 461" />
          <polyline points={LEFT}>
            <animate attributeName="points" begin="indefinite" dur="6s" repeatCount="indefinite" calcMode="spline" keySplines={EASING} keyTimes="0;0.10;0.22;0.32;0.42;1" values={`${LEFT};${LEFT};${LEFT_PEAK};${LEFT_SETTLE};${LEFT};${LEFT}`} />
          </polyline>
          <polyline points={RIGHT}>
            <animate attributeName="points" begin="indefinite" dur="6s" repeatCount="indefinite" calcMode="spline" keySplines={EASING} keyTimes="0;0.40;0.52;0.62;0.72;1" values={`${RIGHT};${RIGHT};${RIGHT_PEAK};${RIGHT_SETTLE};${RIGHT};${RIGHT}`} />
          </polyline>
        </g>
      </svg>
      <button className={styles.sealMotionToggle} type="button" aria-label={paused ? "Resume logo animation" : "Pause logo animation"} aria-pressed={paused} onClick={() => setPaused((value) => !value)}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
          {paused ? <path d="M5 3 13 8 5 13Z" /> : <path d="M4 3H7V13H4ZM9 3H12V13H9Z" />}
        </svg>
      </button>
    </div>
  );
}
