"use client";

import type { CSSProperties } from "react";
import Image from "next/image";
import styles from "./page.module.css";

const MUFFIN_ART = "/assets/bodega/fall/cinnamon-muffin.webp";

type Props = { completedRounds: number; previousRounds?: number; compact?: boolean };

export default function MuffinMeter({ completedRounds, previousRounds, compact = false }: Props) {
  const completed = Math.max(0, Math.min(5, completedRounds));
  const percent = completed * 20;
  const previous = previousRounds === undefined ? percent : Math.max(0, Math.min(5, previousRounds)) * 20;
  const fillStyle = { "--meter-from": `${100 - previous}%`, "--meter-to": `${100 - percent}%` } as CSSProperties;

  return <div
    className={`${styles.muffinMeter} ${compact ? styles.muffinMeterCompact : ""}`}
    data-reset={previous > percent}
    role="progressbar"
    aria-label="Muffin challenge progress"
    aria-valuemin={0}
    aria-valuemax={100}
    aria-valuenow={percent}
    aria-valuetext={`${percent} percent. ${completed} of 5 rounds complete. This tracks challenge progress, not a partial muffin claim.`}
    style={fillStyle}
  >
    <div className={styles.muffinMeterArt} aria-hidden="true">
      <Image className={styles.muffinMeterGhost} src={MUFFIN_ART} alt="" width={80} height={80} />
      <Image className={styles.muffinMeterFill} src={MUFFIN_ART} alt="" width={80} height={80} />
    </div>
    <div className={styles.muffinMeterDetail}>
      <div className={styles.muffinMeterHeading}><span>MUFFIN METER</span><strong>{percent}%</strong></div>
      <div className={styles.muffinMeterSteps} aria-hidden="true">
        {Array.from({ length: 5 }, (_, index) => <span key={index} data-filled={index < completed} />)}
      </div>
      <small>{completed === 5 ? "CHALLENGE COMPLETE" : `${completed} OF 5 ROUNDS CLEAR`}</small>
    </div>
  </div>;
}
