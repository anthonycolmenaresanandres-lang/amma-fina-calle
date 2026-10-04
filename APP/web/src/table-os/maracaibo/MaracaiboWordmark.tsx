"use client";

import Image from "next/image";
import { useState } from "react";
import styles from "./maracaibo.module.css";

/** Newly authored vector lettering; real name remains available as fallback. */
export function MaracaiboWordmark(): React.JSX.Element {
  const [loaded, setLoaded] = useState(false);
  return (
    <span className={styles.brandText} data-loaded={loaded} translate="no">
      <span className={styles.brandNameFallback}>Maracaibo Bistro</span>
      <Image
        className={styles.brandNameImage}
        src="/assets/maracaibo/maracaibo-bistro-wordmark.svg"
        width={278}
        height={122}
        alt=""
        aria-hidden="true"
        unoptimized
        loading="eager"
        onLoad={() => setLoaded(true)}
        onError={() => setLoaded(false)}
      />
    </span>
  );
}

