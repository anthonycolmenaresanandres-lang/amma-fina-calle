import Image from "next/image";
import styles from "./page.module.css";

export function BodegaSignalLogo() {
  return (
    <div className={styles.sealStage}>
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
          <path d="M 92 484 H 143 L 166 513 L 194 444 L 219 513 L 245 480 H 318" pathLength="100" />
          <path d="M 451 482 H 494 L 520 447 L 545 513 L 566 469 L 584 484 H 635" pathLength="100" />
        </svg>
      </div>
    </div>
  );
}
