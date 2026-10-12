import React,{useEffect,useMemo,useRef} from 'react';
import {FrameProvider,useFrame} from './FrameLoop';
import {CounterPainter} from './CanvasVisuals';
import {CollectorRace} from '../collector-standard/engine';
import {COLLECTOR_RACE_V1} from '../collector-standard/rules';
import {GROWTH_TIERS} from './gameplay';
import {LEVELS,generateLevelItems} from './levels';
import {useInput,type InputSnapshot} from './input';
import {gameAudio,type GameState} from './utils';

export interface RaceSnapshot {score:number;rivalScore:number;timer:number;tier:number;done:boolean;won:boolean}
interface GameProps {
 gameState:GameState;
 setGameState:React.Dispatch<React.SetStateAction<GameState>>;
 joystickVector:{x:number;y:number};
 onProgress:(snapshot:RaceSnapshot)=>void;
 onTierChange:(tier:number)=>void;
}
function Scene({gameState,setGameState,joystickVector,onProgress,onTierChange,inputRef}:GameProps&{inputRef:React.MutableRefObject<InputSnapshot>}){
 const levelIndex=gameState.level-1,level=LEVELS[levelIndex];
 const race=useMemo(()=>new CollectorRace(generateLevelItems(levelIndex),GROWTH_TIERS.map(g=>({...g,minMass:g.requiredMass})),level.arenaWidth,level.arenaDepth,COLLECTOR_RACE_V1[levelIndex]),[levelIndex,level]);
 const canvasRef=useRef<HTMLCanvasElement>(null),painterRef=useRef<CounterPainter|null>(null);
 const cancelRef=useRef(false),progressRef=useRef('');
 useEffect(()=>{if(!canvasRef.current)return;const painter=new CounterPainter(canvasRef.current);painterRef.current=painter;return()=>{painter.dispose();painterRef.current=null;};},[]);
 useFrame((_,delta)=>{
  const input=inputRef.current,cancel=!!input?.actions.cancel;
  if(cancel&&!cancelRef.current)setGameState(s=>({...s,status:s.status==='PAUSED'?'PLAYING':'PAUSED'}));
  cancelRef.current=cancel;
  const direction={x:0,z:0};
  if(input?.actions){direction.x=Number(!!input.actions.right)-Number(!!input.actions.left);direction.z=Number(!!input.actions.down)-Number(!!input.actions.up);}
  const stick=Math.hypot(joystickVector.x,joystickVector.y)>.02?joystickVector:input?.joystickVector;
  if(stick){direction.x+=stick.x;direction.z+=stick.y;}
  race.step(delta,direction,gameState.status==='PLAYING');
  for(const event of race.events)if(event.actor==='player'){
   if(event.type==='claim')gameAudio.playPotionGulp();
   if(event.type==='score')gameAudio.playCoinPickup();
   if(event.type==='grow'){gameAudio.playPowerupChime();onTierChange(event.tier!);}
  }
  const snapshot={score:race.player.score,rivalScore:race.rival.score,timer:Math.ceil(race.remaining),tier:race.player.tier,done:race.remaining===0,won:race.outcome==='won'};
  const key=JSON.stringify(snapshot);if(key!==progressRef.current){progressRef.current=key;onProgress(snapshot);}
  painterRef.current?.paint({collector:race.player,rival:race.rival,items:race.items,width:level.arenaWidth,depth:level.arenaDepth,active:gameState.status==='PLAYING'},delta);
 });
 return <canvas ref={canvasRef} className="counter-canvas" role="img" aria-label="Deli countertop. Your green sandwich competes with an amber rival for ingredients."/>;
}
export function Game(props:GameProps){
 const containerRef=useRef<HTMLDivElement>(null),inputRef=useInput(containerRef,{enabled:props.gameState.status==='PLAYING'});
 return <div ref={containerRef} className="canvas-wrapper"><FrameProvider><Scene {...props} inputRef={inputRef}/></FrameProvider></div>;
}
