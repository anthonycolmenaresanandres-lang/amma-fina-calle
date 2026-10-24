// AI-enhanced cutouts of explicitly identified restaurant-source photographs.
// Evidence: OPERATIONS/EL_MARIACHI/2026-10-24/ITEM_PHOTO_PROVENANCE.json.
// Separate from the unchanged ordering-menu snapshot and voice catalog.
type MenuItemPhoto = { src: string; width: number; height: number; alt: string };

export const itemPhotos: Readonly<Partial<Record<string, MenuItemPhoto>>> = {
  "1143": {
    src: "/assets/el-mariachi/menu/1143-fajitas-fundida.webp",
    width: 480, height: 320,
    alt: "AI-enhanced transparent cutout of Fajitas Fundida",
  },
  "2913": {
    src: "/assets/el-mariachi/menu/2913-pizza-birria.webp",
    width: 480, height: 320,
    alt: "AI-enhanced transparent cutout of Pizza Birria",
  },
  "1207": {
    src: "/assets/el-mariachi/menu/1207-arroz-con-pollo-cutout-v1.webp",
    width: 480, height: 480,
    alt: "AI-enhanced transparent cutout of Arroz Con Pollo",
  },
  "2915": {
    src: "/assets/el-mariachi/menu/2915-arroz-texano-cutout-v1.webp",
    width: 480, height: 480,
    alt: "AI-enhanced transparent cutout of Arroz Texano",
  },
  "2912": {
    src: "/assets/el-mariachi/menu/2912-quesabirria-cutout-v1.webp",
    width: 480, height: 480,
    alt: "AI-enhanced transparent cutout of Quesabirria",
  },
};
