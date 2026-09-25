"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import styles from "./page.module.css";

export function BodegaSignalLogo() {
  const stage = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = stage.current;
    if (!element) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let inView = !("IntersectionObserver" in window);
    const sync = () => {
      element.dataset.beat = inView && !document.hidden && !reducedMotion.matches ? "running" : "paused";
    };
    const observer = "IntersectionObserver" in window ? new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      sync();
    }) : null;
    observer?.observe(element);
    document.addEventListener("visibilitychange", sync);
    reducedMotion.addEventListener("change", sync);
    sync();
    return () => {
      observer?.disconnect();
      document.removeEventListener("visibilitychange", sync);
      reducedMotion.removeEventListener("change", sync);
    };
  }, []);
  return (
    <div ref={stage} className={styles.sealStage} data-beat="paused">
      <div className={styles.sealMark}>
        <Image
          alt="Bodega Cafe circular logo"
          className={styles.sealImage}
          height={720}
          priority
          src="/assets/bodega/review/bodega-round-seal-review.webp"
          width={720}
        />
        <svg
          aria-hidden="true"
          className={styles.waveformMotion}
          focusable="false"
          viewBox="0 0 720 720"
        >
          <ellipse className={styles.logoOutlineMask} cx="358" cy="349" rx="323" ry="322" />
          <path
            className={styles.cupMotion}
            d="M 306 388 H 447 L 438 450 C 434 482 410 500 377 500 C 347 500 326 483 321 454 L 311 388 Z M 319 416 C 292 405 278 419 280 441 C 282 462 299 474 325 463"
            pathLength="100"
          />
          <path
            className={`${styles.waveformPulse} ${styles.waveformLeft}`}
            d="M 92 484 H 143 L 166 513 L 194 444 L 219 513 L 245 480 H 318"
            pathLength="100"
          />
          <path
            className={`${styles.waveformPulse} ${styles.waveformRight}`}
            d="M 451 482 H 494 L 520 447 L 545 513 L 566 469 L 584 484 H 635"
            pathLength="100"
          />
        </svg>
      </div>
    </div>
  );
}
