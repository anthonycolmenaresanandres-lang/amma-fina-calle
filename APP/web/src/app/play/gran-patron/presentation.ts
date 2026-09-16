import { baseColors } from "@/penalty/config";
import type { PenaltySkin } from "@/penalty/types";
import type { ShootoutCharacter, ShootoutPresentation } from "@/penalty/shootout-presentation";

export const GRAN_PATRON_CHARACTERS = [
  { id: "burrito-california", name: "Burrito California", number: "10", image: "/assets/granpatron/game/burrito-v1.webp", width: 640, height: 960 },
  { id: "pina-loca", name: "Piña Loca", number: "7", image: "/assets/granpatron/game/pina-v1.webp", width: 640, height: 960 },
] as const;
export function granPatronSkin(player: ShootoutCharacter): PenaltySkin {
  return {
    id: "gran-patron", displayName: "Gran Patrón", brandName: "Gran Patrón Shootout", skinName: "Gran Patrón Shootout",
    colors: { ...baseColors, bg: 0x071b13, sky: 0x102d21, grass: 0x245b34, grassLine: 0x417648, goalFrame: 0xf6e9cd, net: 0xd8c3a3, accent: 0xedbf75, keeper: 0xd55d83, keeperAccent: 0x21342a, text: "#f6e9cd" },
    assets: { kicker: player.image, background: "/assets/granpatron/game/cantina-pitch-v1.webp" },
    chrome: { externalHud: true },
    layoutFit: { goalTopPct: 0.23, goalBottomPct: 0.57, postExtensionPct: 0, spotXPct: 0.68 },
    keeperAppearance: { skinTone: 0x75452f, hairColor: 0x171719 },
    kickerFit: { scale: 2.4, offsetXPct: -0.2 }, ballFit: { scale: 1.7 },
    backgroundFit: { scrim: 0.15, pitchLinePct: 0.57 },
  };
}
export const GRAN_PATRON_PRESENTATION: ShootoutPresentation = {
  title: "Gran Patrón Shootout", heading: "Gran Patrón", location: "Gran Patrón · Princess Anne",
  invitation: "The cantina is your stadium", menuHref: "/demo/gran-patron",
  backdrop: "/assets/granpatron/game/cantina-pitch-v1.webp",
  characters: GRAN_PATRON_CHARACTERS, skinForPlayer: granPatronSkin,
};
