import type { CSSProperties, ReactNode } from "react";
import styles from "./venue-menu.module.css";

type Props = {
  brandName: string;
  brand: ReactNode;
  nav: ReactNode;
  featured: ReactNode;
  menu: ReactNode;
  game: ReactNode;
  visit: ReactNode;
  engagement: ReactNode;
  footer: ReactNode;
  skipHref: string;
  skipLabel: string;
  previewLabel?: string;
  theme?: CSSProperties;
};

// The markup and CSS are shared by Bodega and Project Seed. Each venue supplies
// only its menu data, artwork, links, and theme variables.
export function VenueMenuLayout({ brandName, brand, nav, featured, menu, game, visit, engagement, footer, skipHref, skipLabel, previewLabel = "Preview", theme }: Props) {
  return <main className={styles.page} style={theme}>
    <div className={styles.shell}>
      <a className={styles.skipLink} href={skipHref}>{skipLabel}</a>
      <header className={styles.hero}>
        <span className={styles.preview}>{previewLabel}</span>
        <h1 className={styles.srOnly}>{brandName} menu</h1>
        {brand}
      </header>
      {nav}
      {featured}
      <div className={styles.menuGrid}>{menu}</div>
      {game}
      {visit}
      {engagement}
      <footer className={styles.footer}>{footer}</footer>
    </div>
  </main>;
}
