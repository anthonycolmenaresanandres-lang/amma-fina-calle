// Explicitly captioned official photographs. Evidence: OPERATIONS/EL_MARIACHI/2026-10-24/ITEM_PHOTO_PROVENANCE.json.
// Kept separate from the unchanged ordering-menu snapshot and voice catalog.
type MenuItemPhoto = { src: string; width: number; height: number; alt: string };

export const itemPhotos: Readonly<Partial<Record<string, MenuItemPhoto>>> = {
  "1143": {
    src: "/assets/el-mariachi/menu/1143-fajitas-fundida.webp",
    width: 480, height: 360,
    alt: "Fajitas Fundida in the restaurant's original photograph",
  },
  "2913": {
    src: "/assets/el-mariachi/menu/2913-pizza-birria.webp",
    width: 480, height: 360,
    alt: "Pizza Birria in the restaurant's original photograph",
  },
};
