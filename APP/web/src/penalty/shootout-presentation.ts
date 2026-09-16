import type { PenaltySkin } from "./types";

export type ShootoutCharacter = { id: string; name: string; number: string; image: string; width: number; height: number };
/** Presentation only. The match engine, rules and input remain shared. */
export type ShootoutPresentation = {
  title: string;
  heading: string;
  location: string;
  invitation: string;
  menuHref: string;
  backdrop: string;
  characters: readonly [ShootoutCharacter, ...ShootoutCharacter[]];
  skinForPlayer: (player: ShootoutCharacter) => PenaltySkin;
};
