export type Owner = "player" | "enemy" | "neutral";

export type TowerConfig = {
  id: string;
  xPct: number;
  yPct: number;
  owner: Owner;
  value: number;
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
  projectileSpeed: number;
  aiThinkMinMs: number;
  aiThinkMaxMs: number;
};

export type EngineConfig = {
  brandName: string;
  skinName: string;
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