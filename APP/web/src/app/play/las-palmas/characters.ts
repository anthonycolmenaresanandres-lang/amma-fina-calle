import { LASPALMAS_PENALTY_SKIN } from "@/penalty/skin/skins";
import type { PenaltySkin } from "@/penalty/types";

export const LAS_PALMAS_CHARACTERS = [
  { id: "burrito", name: "Burrito California", number: "10", image: "/assets/laspalmas/penalty/kicker-laspalmas-burrito-v1.webp", width: 444, height: 697 },
  { id: "quesabirria", name: "Quesabirria", number: "7", image: "/assets/laspalmas/penalty/kicker-laspalmas-quesabirria-v1.webp", width: 496, height: 664 },
] as const;
export type LasPalmasCharacter = (typeof LAS_PALMAS_CHARACTERS)[number];

export function characterSkin(character: { image: string }): PenaltySkin {
  // Explicit choice wins at EVERY difficulty. Never mutate the shared registry.
  return { ...LASPALMAS_PENALTY_SKIN, chrome: { ...LASPALMAS_PENALTY_SKIN.chrome, externalHud: true }, assets: { ...LASPALMAS_PENALTY_SKIN.assets, kicker: character.image }, levelKickers: undefined };
}
