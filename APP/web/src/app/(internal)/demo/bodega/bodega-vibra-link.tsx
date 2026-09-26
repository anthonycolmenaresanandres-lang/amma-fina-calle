import Link from "next/link";
import styles from "./page.module.css";

export function BodegaVibraLink({ floating = false }: { floating?: boolean }) {
  return (
    <Link
      className={floating ? styles.floatingPlay : styles.teaserPlay}
      href="/bodega-sessions-review"
      prefetch={false}
      aria-label="Play Bodega Vibra. Es que no entienden la vibra."
    >
      <span className={styles.vibraMark} aria-hidden="true">
        <span /><span /><span /><span /><span />
      </span>
      <span className={styles.vibraCopy}>
        <strong>PLAY BODEGA VIBRA</strong>
        <small>ES QUE NO ENTIENDEN LA VIBRA</small>
      </span>
      <span className={styles.vibraArrow} aria-hidden="true">→</span>
    </Link>
  );
}
