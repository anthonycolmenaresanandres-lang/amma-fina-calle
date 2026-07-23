/**
 * Table Football's public contract. These values are deliberately JSON-safe so
 * a Supabase Broadcast transport can relay them without adapting the payload.
 * Venue configuration is presentation-only; match mechanics live in engine.ts.
 */

export const TABLE_FOOTBALL_PROTOCOL = "table-football/v1" as const;

export type TeamId = "home" | "away";
export type TableFootballMode = "1v1" | "2v2";
export type TableFootballRole = "goalkeeper" | "forward";
export type MatchPhase = "ready" | "playing" | "goal" | "finished";

export type CountryColorTeam = Readonly<{
  id: string;
  countryCode: string;
  label: string;
  primary: number;
  secondary: number;
}>;

/** Generic country-color choices only: no flags, crests, club, league, or event marks. */
export const COUNTRY_COLOR_TEAMS: readonly CountryColorTeam[] = [
  { id: "blue-white", countryCode: "AR", label: "Sky & White", primary: 0x6cb7e8, secondary: 0xf7fbff },
  { id: "green-gold", countryCode: "BR", label: "Green & Gold", primary: 0x168a4a, secondary: 0xf3cb39 },
  { id: "red-white", countryCode: "US", label: "Red & White", primary: 0xc84343, secondary: 0xf7f4ed },
  { id: "orange-navy", countryCode: "NL", label: "Orange & Navy", primary: 0xe87622, secondary: 0x162c4d },
] as const;

export type TableFootballVenueSkin = Readonly<{
  id: string;
  venueName: string;
  table: number;
  rail: number;
  pitch: number;
  pitchLine: number;
  text: number;
  mutedText: number;
  ball: number;
  goal: number;
}>;

export const DEFAULT_TABLE_FOOTBALL_SKIN: TableFootballVenueSkin = {
  id: "fina-calle-table",
  venueName: "Table Football",
  table: 0x15191b,
  rail: 0x2c3438,
  pitch: 0x1c6c45,
  pitchLine: 0xd9e6d4,
  text: 0xf7f5ed,
  mutedText: 0xb9c5bc,
  ball: 0xf7f5ed,
  goal: 0x101416,
};

/** String-token configuration shape for a parent venue registry. */
export type TableMatchSkin = Readonly<{
  id: string;
  name: string;
  background: string;
  pitch: string;
  pitchLine: string;
  accent: string;
  text: string;
  home: string;
  away: string;
}>;

export type TeamOption = Readonly<{
  id: string;
  label: string;
  shortLabel: string;
  flagEmoji?: string;
  primary: string;
  secondary: string;
}>;

const hexColor = (value: string): number => Number.parseInt(value.replace("#", ""), 16) || 0;

export function countryColorTeamFromOption(team: TeamOption): CountryColorTeam {
  return { id: team.id, countryCode: team.shortLabel, label: team.label, primary: hexColor(team.primary), secondary: hexColor(team.secondary) };
}

export function tableFootballSkinFromMatchSkin(skin: TableMatchSkin): TableFootballVenueSkin {
  return {
    id: skin.id,
    venueName: skin.name,
    table: hexColor(skin.background),
    rail: hexColor(skin.accent),
    pitch: hexColor(skin.pitch),
    pitchLine: hexColor(skin.pitchLine),
    text: hexColor(skin.text),
    mutedText: hexColor(skin.pitchLine),
    ball: hexColor(skin.text),
    goal: hexColor(skin.background),
  };
}

export type TableFootballMatchOptions = Readonly<{
  roomId: string;
  mode: TableFootballMode;
  home: CountryColorTeam;
  away: CountryColorTeam;
  durationSeconds?: number;
}>;

export type TableFootballPlayer = Readonly<{
  id: string;
  team: TeamId;
  role: TableFootballRole;
  x: number;
  y: number;
  move: -1 | 0 | 1;
  kickCooldownTicks: number;
}>;

export type TableFootballState = Readonly<{
  protocol: typeof TABLE_FOOTBALL_PROTOCOL;
  roomId: string;
  mode: TableFootballMode;
  phase: MatchPhase;
  tick: number;
  durationMs: number;
  timeRemainingMs: number;
  score: Readonly<Record<TeamId, number>>;
  ball: Readonly<{ x: number; y: number; vx: number; vy: number }>;
  players: readonly TableFootballPlayer[];
  serveTeam: TeamId;
  goalPauseTicks: number;
  lastGoal: TeamId | null;
  inputSeqByPlayer: Readonly<Record<string, number>>;
}>;

export type TableFootballInputMessage = Readonly<{
  protocol: typeof TABLE_FOOTBALL_PROTOCOL;
  type: "input";
  roomId: string;
  playerId: string;
  sequence: number;
  clientTick: number;
  move: -1 | 0 | 1;
  kick: boolean;
}>;

export type TableFootballStateMessage = Readonly<{
  protocol: typeof TABLE_FOOTBALL_PROTOCOL;
  type: "state";
  roomId: string;
  state: TableFootballState;
}>;

export type TableFootballMessage = TableFootballInputMessage | TableFootballStateMessage;

export type TableFootballPlayerAssignment = Readonly<{
  playerId: string;
  team: TeamId;
  role: TableFootballRole;
}>;
