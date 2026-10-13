import { letteringWords } from "./lettering";
import styles from "./olympia.module.css";

/** Visible custom vectors + real heading/link text, with no client-side font load. */
export function OlympiaLettering({ text }: { text: string }) {
  return <span className={styles.lettering}>
    <span className={styles.letteringText}>{text}</span>
    {letteringWords(text).map(({ width, glyphs }, index) => <svg
      key={index} className={styles.letteringWord} data-olympia-lettering="counter"
      aria-hidden="true" focusable="false" viewBox={`0 0 ${width} 80`}
      width={`${width / 80}em`} height="1em">
      <g fill="none" stroke="currentColor" strokeWidth="13" strokeLinecap="round" strokeLinejoin="round">
        {glyphs.map(({ path, x }, glyphIndex) => <path key={glyphIndex} d={path} transform={`translate(${x} 0)`} />)}
      </g>
    </svg>)}
  </span>;
}
