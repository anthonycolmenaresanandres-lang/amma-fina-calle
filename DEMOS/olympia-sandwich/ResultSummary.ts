import type {EndReason} from '../collector-standard/engine';
interface ResultInput {won:boolean;reason:EndReason|null;score:number;target:number;rivalScore:number;pointsBeforeCapture:number}
export function resultSummary({won,reason,score,target,rivalScore,pointsBeforeCapture}:ResultInput){
 const captured=reason==='player-consumed';
 return {
  title:won?'You win!':'You lose',
  ending:reason==='counter-cleared'?'Counter cleared':captured?'Sandwich captured':'Time up',
  reason:captured?'A larger rival ate your sandwich.':won?'Target reached. You finished ahead of every rival.':score<target?`Target missed by ${(target-score).toLocaleString()} points.`:score===rivalScore?'Target reached, but you tied the rival. Finish ahead to win.':'Target reached, but the rival finished ahead.',
  score,scoreLabel:'Final score',
  captureNote:captured?`${pointsBeforeCapture.toLocaleString()} points earned before capture were transferred to the rival.`:null,
 };
}
