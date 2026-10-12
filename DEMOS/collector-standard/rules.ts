/** Versioned, opt-in rules. No other client imports this profile. */
export interface RaceRules {
 id:string;seconds:number;target:number;rivalSpeed:number;rivalReaction:number;rivalGrace:number;
 rivalCount:number;behavior:'gather'|'contest'|'hunt';captureRatio:number;captureHold:number;captureGrace:number;
}
export const COLLECTOR_RACE_V2:readonly RaceRules[]=[
 {id:'collector-race-v2/1',seconds:45,target:3000,rivalSpeed:.62,rivalReaction:.65,rivalGrace:2.5,rivalCount:1,behavior:'gather',captureRatio:1.3,captureHold:.2,captureGrace:4},
 {id:'collector-race-v2/2',seconds:45,target:6000,rivalSpeed:.68,rivalReaction:.50,rivalGrace:2.5,rivalCount:2,behavior:'contest',captureRatio:1.3,captureHold:.2,captureGrace:4},
 {id:'collector-race-v2/3',seconds:45,target:10000,rivalSpeed:.74,rivalReaction:.40,rivalGrace:2.5,rivalCount:3,behavior:'hunt',captureRatio:1.3,captureHold:.2,captureGrace:4},
];
export const captureRadius=(radius:number)=>radius*.9;
export const canConsume=(predatorRadius:number,preyRadius:number,distance:number,ratio=1.3)=>
 predatorRadius>=preyRadius*ratio&&distance+captureRadius(preyRadius)<=captureRadius(predatorRadius)+1e-9;
export function raceOutcome(score:number,rivalScore:number,target:number){return score<target?'target-missed':score<=rivalScore?'rival-ahead':'won';}
