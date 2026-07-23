"use client";

import Image from "next/image";
import { useState } from "react";
import styles from "./page.module.css";

export function MovingBodegaSeal() {
  const [hit, setHit] = useState(0);

  return (
    <div className={styles.sealStage}>
      <span className={styles.sealTrack} aria-hidden="true" />
      <button
        aria-label="Move the Bodega Cafe circular logo"
        className={styles.sealButton}
        onClick={() => setHit((current) => current + 1)}
        type="button"
      >
        <span className={styles.sealTraveler}>
          <span className={hit > 0 ? styles.sealDiscHit : styles.sealDisc} key={hit}>
            <Image
              alt="Bodega Cafe cup and waveform circular logo"
              className={styles.movingSealImage}
              height={720}
              priority
              src="/assets/bodega/review/bodega-round-seal-review.webp"
              width={720}
            />
          </span>
        </span>
      </button>
      <span className={styles.sealHint}>Tap the seal / move the block</span>
    </div>
  );
}
