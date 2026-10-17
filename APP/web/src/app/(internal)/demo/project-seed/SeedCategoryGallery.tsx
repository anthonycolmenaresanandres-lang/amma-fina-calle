import Image from "next/image";
import { octoberMenuGroups, seedMenuGroups } from "./menu-data";
import styles from "./october.module.css";

// Decorative category cues, not additional menu products or recipe claims.
// Generic coffee art represents both coffee groups; exact item names stay in menu-data.
const categoryArt: Record<string, string> = {
  "october-lattes": "/assets/project-seed/october/pms-latte-v1.webp",
  "october-non-coffee": "/assets/project-seed/october/bbl-refresher-v1.webp",
  signature: "/assets/project-seed/seed-rush/buko-pandan-latte-illustrated-v2.webp",
  "cold-brew": "/assets/project-seed/seed-rush/dark-iced-coffee-illustrated-v2.webp",
  coffee: "/assets/project-seed/seed-rush/dark-iced-coffee-illustrated-v2.webp",
  "tea-more": "/assets/project-seed/seed-rush/iced-green-latte-illustrated-v2.webp",
};

export function SeedCategoryGallery() {
  return <nav className={styles.categoryGallery} aria-label="Menu categories">
    {[...octoberMenuGroups, ...seedMenuGroups].map((group) => <a
      className={styles.categoryProduct}
      key={group.id}
      href={`#${group.id}`}
      aria-label={group.name}
      aria-controls={group.id}
      data-seed-category-link={group.id}
    >
      <Image src={categoryArt[group.id]} alt="" width={256} height={256} sizes="(max-width: 699px) 84px, 112px" />
      <span className={styles.categoryProductLabel}>{group.name}</span>
      <small aria-hidden="true">{group.items.length} items</small>
    </a>)}
  </nav>;
}
