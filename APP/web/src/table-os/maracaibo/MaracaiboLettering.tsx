"use client";

import Image from "next/image";
import { useState, type CSSProperties } from "react";
import { letteringAssets } from "./lettering-assets";
import styles from "./maracaibo.module.css";

/** Real text stays available to assistive technology and when artwork fails. */
export function Lettering({ name, label, category = false, priority = false }: {
  name: string;
  label: string;
  category?: boolean;
  priority?: boolean;
}): React.JSX.Element {
  const [loaded, setLoaded] = useState(false);
  const asset = letteringAssets[name as keyof typeof letteringAssets];
  if (!asset) return <span>{label}</span>;
  const src = `/assets/maracaibo/lettering/${name}.webp`;
  return <span className={styles.lettering} data-loaded={loaded} data-category={category} style={{
    "--letter-ratio": asset.width / asset.height,
    "--letter-image": `url("${src}")`,
  } as CSSProperties}>
    <span className={styles.letteringFallback}>{label}</span>
    <Image src={src} width={asset.width} height={asset.height} alt="" aria-hidden="true"
      className={styles.letteringImage} unoptimized priority={priority}
      onLoad={() => setLoaded(true)} onError={() => setLoaded(false)} />
    {category ? <span className={styles.letteringTint} aria-hidden="true" /> : null}
  </span>;
}
