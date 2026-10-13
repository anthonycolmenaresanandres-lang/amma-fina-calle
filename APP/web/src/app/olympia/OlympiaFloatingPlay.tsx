import { OlympiaLettering } from "./OlympiaLettering";
import styles from "./olympia.module.css";

// A normal document link keeps the standalone game out of the menu's JS bundle.
export function OlympiaFloatingPlay() {
  return <a
    id="olympia-floating-play"
    className={styles.floatingPlay}
    href="/demo/olympia-sandwich/index.html"
    aria-label="Play Olympia Sandwich Counter"
  >
    <span className={styles.floatingPlayTitle}><OlympiaLettering text="Play" /></span>
    <span className={styles.floatingPlayGame}>Sandwich Counter</span>
  </a>;
}