/** Opt-in collector race standard. Existing skins are unchanged until they import it. */
export interface RaceRules {
  id: string;
  seconds: number;
  target: number;
  rivalSpeed: number;
  rivalReaction: number;
  rivalGrace: number;
}
export const COLLECTOR_RACE_V1: readonly RaceRules[] = [
  {id:'collector-race-v1/1',seconds:45,target:2400,rivalSpeed:0.62,rivalReaction:0.65,rivalGrace:2.5},
  {id:'collector-race-v1/2',seconds:45,target:5000,rivalSpeed:0.68,rivalReaction:0.50,rivalGrace:2.5},
  {id:'collector-race-v1/3',seconds:45,target:9000,rivalSpeed:0.74,rivalReaction:0.40,rivalGrace:2.5},
];
export const captureRadius = (radius:number) => radius * 0.9;
export function raceOutcome(score:number,rivalScore:number,target:number) {
  return score < target ? 'target-missed' : score <= rivalScore ? 'rival-ahead' : 'won';
}
