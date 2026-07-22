"use client";

import { useState } from "react";
import styles from "./page.module.css";

const ROUTE_PATH =
  "M0 72h132v92h118V38h118v86h66l22-42 26 94 31-132 32 154 31-116 28 72 27-44 31 14h88l55 0c56 0 74 33 124 33 56 0 73-47 132-47 48 0 77 31 123 31h56";

export function RouteBecomesRhythm() {
  const [beat, setBeat] = useState(0);

  return (
    <button
      aria-label="Play the Bodega route rhythm animation"
      className={styles.routeButton}
      onClick={() => setBeat((currentBeat) => currentBeat + 1)}
      type="button"
    >
      <svg aria-hidden="true" className={styles.routeSvg} viewBox="0 0 1200 230">
        <path
          className={styles.routePath}
          d={ROUTE_PATH}
          fill="none"
          pathLength={1}
          strokeLinecap="square"
          strokeLinejoin="miter"
          strokeWidth="12"
        />
        <path
          className={styles.routeSignal}
          d={ROUTE_PATH}
          fill="none"
          pathLength={1}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="18"
        />
        {beat > 0 ? (
          <path
            className={styles.routeHit}
            d={ROUTE_PATH}
            fill="none"
            key={beat}
            pathLength={1}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="24"
          />
        ) : null}
        <circle className={styles.routeNodeStart} cx="250" cy="38" r="10" />
        <circle className={styles.routeNodeEnd} cx="1144" cy="141" r="10" />
      </svg>
    </button>
  );
}
