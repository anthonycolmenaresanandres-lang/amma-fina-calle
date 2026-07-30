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
          <defs>
            <radialGradient id="bodega-golden-flash" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fff8d6" stopOpacity="0.96" />
              <stop offset="28%" stopColor="#f0c34f" stopOpacity="0.74" />
              <stop offset="72%" stopColor="#f0c34f" stopOpacity="0.16" />
              <stop offset="100%" stopColor="#f0c34f" stopOpacity="0" />
            </radialGradient>
          </defs>
          <ellipse className={styles.logoOutlineMask} cx="358" cy="349" rx="323" ry="322" />
          <circle
            className={styles.goldenFlash}
            cx="360"
            cy="478"
            fill="url(#bodega-golden-flash)"
            r="132"
          />
          <path
            className={styles.cupMotion}
            d="M 306 388 H 447 L 438 450 C 434 482 410 500 377 500 C 347 500 326 483 321 454 L 311 388 Z M 319 416 C 292 405 278 419 280 441 C 282 462 299 474 325 463"
            pathLength="100"
          />
          <path
            className={styles.waveformPulse}
            d="M 92 484 H 143 L 166 513 L 194 444 L 219 513 L 245 480 H 318"
            pathLength="100"
          />
          <path
            className={styles.waveformPulse}
            d="M 451 482 H 494 L 520 447 L 545 513 L 566 469 L 584 484 H 635"
            pathLength="100"
          />
        </svg>
      </div>
    </div>
  );
}
