export type Owner = "player" | "enemy" | "neutral";

export type TowerConfig = {
  id: string;
  xPct: number;
  yPct: number;
  owner: Owner;
  value: number;
};

export type StickerConfig = {
  id: string;
  towerId: string;
  label: string;
  xOffsetPct: number;
  yOffsetPct: number;
};

export type LinkConfig = {
  a: string;
  b: string;
};

export type RulesConfig = {
  matchDurationSec: number;
  tickMs: number;
  growthPerSec: number;
  maxTowerValue: number;
  sendPercent: number;
  towerRadius: number;
  unitRadius: number;
  projectileSpeed: number;
  sendCadenceBaseMs: number;
  sendCadenceMinMs: number;
  sendCadenceValueMultiplier: number;
  stickerScale: number;
  maxStickerCount: number;
  visualDensity: "simple" | "medium" | "rich";
  aiThinkMinMs: number;
  aiThinkMaxMs: number;
};

export type EngineConfig = {
  id: string;
  levelNumber: number;
  levelName: string;
  brandName: string;
  skinName: string;
  selectText: string;
  winText: string;
  loseText: string;
  colors: {
    bg: number;
    grid: number;
    player: number;
    enemy: number;
    neutral: number;
    text: string;
  };
  rules: RulesConfig;
  towers: TowerConfig[];
  links: LinkConfig[];
  stickers?: StickerConfig[];
};

export type TowerState = {
  id: string;
  xPct: number;
  yPct: number;
  owner: Owner;
  value: number;
};

export type PacketState = {
  id: string;
  fromId: string;
  toId: string;
  owner: Exclude<Owner, "neutral">;
  amount: number;
  progress: number;
};
