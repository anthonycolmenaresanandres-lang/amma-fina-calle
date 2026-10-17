"use client";
import {useEffect,useRef,useState,type PointerEvent} from 'react';
import Image from 'next/image';
import {venueFor} from './data';
import type {CollectorRace,RaceResult} from './collector-standard/engine';
import {countersFor,GROWTH,createFoodRace} from './game-config';

import {drawCounter,loadArt} from './renderer';
import styles from './game.module.css';
type Mode='ready'|'running'|'paused'|'result';
type Pointer={x:number;y:number;dx:number;dy:number;id:number};
const DIRECTIONS={up:{x:0,z:-1},down:{x:0,z:1},left:{x:-1,z:0},right:{x:1,z:0}};
export default function FoodGame({slug}:{slug:string}){
 const venue=venueFor(slug);const COUNTERS=countersFor(venue);
 const [level,setLevel]=useState(0),[round,setRound]=useState(0),[mode,setMode]=useState<Mode>('ready');
 const [hud,setHud]=useState({score:0,seconds:45,tier:1,remaining:0,leader:0});
 const [result,setResult]=useState<Readonly<RaceResult>|null>(null);
 const canvas=useRef<HTMLCanvasElement>(null),race=useRef<CollectorRace|null>(null),modeRef=useRef<Mode>('ready');
 const pointer=useRef<Pointer|null>(null),keys=useRef(new Set<string>()),held=useRef<keyof typeof DIRECTIONS|null>(null),dialogTitle=useRef<HTMLHeadingElement>(null),overlay=useRef<HTMLElement>(null);
 const spec=COUNTERS[level];
 const changeMode=(next:Mode)=>{modeRef.current=next;pointer.current=null;keys.current.clear();held.current=null;setMode(next);};
 const start=()=>{setResult(null);setRound(n=>n+1);changeMode('running');canvas.current?.focus();};
 useEffect(()=>{
  const game=createFoodRace(venue,level);race.current=game;const art=loadArt(venue);const c=canvas.current;if(!c)return;
  const ctx=c.getContext('2d');if(!ctx)return;let frame=0,last=0,lastHud=0,rendered=0;let w=0,h=0;
  const resize=()=>{const rect=c.getBoundingClientRect();w=rect.width;h=rect.height;const dpr=Math.min(window.devicePixelRatio||1,2);c.width=Math.round(w*dpr);c.height=Math.round(h*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);};
  const observer=new ResizeObserver(resize);observer.observe(c);resize();
  const tick=(now:number)=>{const dt=last?(now-last)/1000:0;last=now;
   let direction={x:0,z:0};const k=keys.current;
   if(k.has('ArrowLeft')||k.has('a'))direction.x--;if(k.has('ArrowRight')||k.has('d'))direction.x++;
   if(k.has('ArrowUp')||k.has('w'))direction.z--;if(k.has('ArrowDown')||k.has('s'))direction.z++;
   if(held.current)direction=DIRECTIONS[held.current];if(pointer.current)direction={x:pointer.current.dx,z:pointer.current.dy};
   game.step(dt,direction,modeRef.current==='running');
   if(game.result&&modeRef.current==='running'){setResult(game.result);modeRef.current='result';pointer.current=null;keys.current.clear();held.current=null;setMode('result');}
   if(now-lastHud>160){lastHud=now;setHud({score:game.result?.pointsBeforeCapture||game.player.score,seconds:Math.ceil(game.remaining),tier:game.player.tier,remaining:game.items.filter(i=>!i.collected).length,leader:game.leaderScore});}
   if(now-rendered>(modeRef.current==='running'?32:800)){rendered=now;drawCounter(ctx,w,h,game,level,art,pointer.current,venue);}
   frame=requestAnimationFrame(tick);
  };frame=requestAnimationFrame(tick);
  const release=()=>{pointer.current=null;held.current=null;keys.current.clear();};
  const hidden=()=>{release();if(document.hidden&&modeRef.current==='running'){modeRef.current='paused';setMode('paused');}};
  const blur=()=>{release();if(modeRef.current==='running'){modeRef.current='paused';setMode('paused');}};
  const down=(e:KeyboardEvent)=>{if(e.target instanceof HTMLElement&&e.target.closest('button,a'))return;const key=e.key.length===1?e.key.toLowerCase():e.key;if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','w','a','s','d'].includes(key)&&modeRef.current==='running'){e.preventDefault();keys.current.add(key);}if(e.key==='Escape'&&modeRef.current==='running'){e.preventDefault();blur();}};
  const up=(e:KeyboardEvent)=>keys.current.delete(e.key.length===1?e.key.toLowerCase():e.key);
  window.addEventListener('keydown',down);window.addEventListener('keyup',up);window.addEventListener('blur',blur);document.addEventListener('visibilitychange',hidden);
  return()=>{cancelAnimationFrame(frame);observer.disconnect();release();window.removeEventListener('keydown',down);window.removeEventListener('keyup',up);window.removeEventListener('blur',blur);document.removeEventListener('visibilitychange',hidden);race.current=null;};
 },[level,round,venue]);
 useEffect(()=>{if(mode==='paused'||mode==='result')dialogTitle.current?.focus();},[mode]);
 const move=(e:PointerEvent<HTMLCanvasElement>)=>{const p=pointer.current;if(!p||p.id!==e.pointerId)return;const rect=e.currentTarget.getBoundingClientRect(),dx=e.clientX-rect.left-p.x,dy=e.clientY-rect.top-p.y,length=Math.hypot(dx,dy);p.dx=length>6?dx/Math.max(length,32):0;p.dy=length>6?dy/Math.max(length,32):0;};
 const won=result?.outcome==='won';
 const reason=result?.reason==='player-consumed'?'A larger rival collected you.':result?.reason==='counter-cleared'?'The counter is clear.':'Time is up.';
 return <main className={styles.game} data-venue={venue.short}>
  <header className={styles.toolbar} inert={mode==='paused'||mode==='result'}><a href={'/'+slug}>Back to menu</a><span>{venue.game}</span>{mode==='running'?<button onClick={()=>changeMode('paused')}>Pause</button>:<span className={styles.concept}>Concept</span>}</header>
  <div className={styles.scoreboard} aria-label="Round status"><span><small>Your score</small>{hud.score.toLocaleString()}</span><span><small>Goal</small>{spec.target.toLocaleString()}</span><span><small>Time</small>{hud.seconds}s</span></div>
  <div className={styles.arena}>
   <canvas ref={canvas} tabIndex={mode==='running'?0:-1} aria-label="Food counter. Drag to steer, or use arrow keys, WASD, or the direction buttons." aria-describedby="game-help" onPointerDown={e=>{if(modeRef.current!=='running'||pointer.current)return;e.currentTarget.setPointerCapture(e.pointerId);const r=e.currentTarget.getBoundingClientRect();pointer.current={x:e.clientX-r.left,y:e.clientY-r.top,dx:0,dy:0,id:e.pointerId};}} onPointerMove={move} onPointerUp={e=>{if(pointer.current?.id===e.pointerId)pointer.current=null;}} onPointerCancel={()=>{pointer.current=null;}} onLostPointerCapture={()=>{pointer.current=null;}}/>
   {mode==='ready'&&<section className={styles.overlay} aria-labelledby="start-title"><p className={styles.eyebrow}>{venue.name} · Fina Calle demo</p><h1 id="start-title" className={styles.gameTitle}>{venue.game}</h1><Image src={'/assets/'+slug+'/'+venue.foods[0]+'.svg'} alt="Original food illustration" width={130} height={110} unoptimized/><p>Collect food. Grow your serving bowl.<br/>Capture smaller rivals. Keep clear of larger ones.</p><div className={styles.levels} aria-label="Choose a counter">{COUNTERS.map((counter,i)=><button key={counter.name} aria-pressed={i===level} onClick={()=>setLevel(i)}>Counter {i+1}<small>{i+1} {i===0?'rival':'rivals'}</small></button>)}</div><h2>{spec.name}</h2><p className={styles.description}>{spec.description}</p><button className={styles.primary} onClick={start}>Start collecting</button><small>45 seconds · Illustrative game art · No real rewards</small></section>}
   {mode==='paused'&&<section ref={overlay} className={styles.overlay} role="dialog" onKeyDown={e=>{if(e.key!=='Tab')return;const controls=overlay.current?.querySelectorAll<HTMLElement>('button,a[href]');if(!controls?.length)return;const first=controls[0],last=controls[controls.length-1];if(e.shiftKey&&(document.activeElement===first||document.activeElement===dialogTitle.current)){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}} aria-modal="true" aria-labelledby="pause-title"><h2 id="pause-title" ref={dialogTitle} tabIndex={-1}>Take a little pause.</h2><p>The counter and clock are stopped.</p><button className={styles.primary} onClick={()=>{changeMode('running');canvas.current?.focus();}}>Resume collecting</button><a href={'/'+slug}>Back to menu</a></section>}
   {mode==='result'&&result&&<section ref={overlay} className={styles.overlay} role="dialog" onKeyDown={e=>{if(e.key!=='Tab')return;const controls=overlay.current?.querySelectorAll<HTMLElement>('button,a[href]');if(!controls?.length)return;const first=controls[0],last=controls[controls.length-1];if(e.shiftKey&&(document.activeElement===first||document.activeElement===dialogTitle.current)){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}} aria-modal="true" aria-labelledby="result-title"><p className={styles.eyebrow}>Counter {level+1} complete</p><h2 id="result-title" ref={dialogTitle} tabIndex={-1}>{won?'You won!':'Round lost'}</h2><p>{reason}</p><strong className={styles.finalScore}>{(result.reason==='player-consumed'?result.pointsBeforeCapture:result.score).toLocaleString()} <small>points</small></strong><p>{result.outcome==='target-missed'?'Reach the score goal to win.':result.outcome==='rival-ahead'?'Beat the leading rival’s score to win.':won?'You reached the goal and beat the rivals.':'Grow before challenging a rival.'}</p><p className={styles.description}>Goal {spec.target.toLocaleString()} · Leading rival {result.rivalScore.toLocaleString()}</p><button className={styles.primary} onClick={start}>Play this counter again</button>{level<2&&<button onClick={()=>{setLevel(n=>n+1);setResult(null);changeMode('ready');}}>Choose next counter</button>}<button onClick={()=>{setRound(n=>n+1);changeMode('ready');}}>Choose a counter</button><a href={'/'+slug}>Back to menu</a></section>}
  </div>
  <footer className={styles.controls} inert={mode==='paused'||mode==='result'}><div className={styles.growth}><span>{GROWTH[hud.tier-1].title}</span><span>{hud.remaining} food left</span></div><p id="game-help">Drag to steer · Arrows / WASD · Hold a direction</p><div className={styles.directions} aria-label="Direction controls">{(Object.keys(DIRECTIONS) as (keyof typeof DIRECTIONS)[]).map(direction=><button key={direction} disabled={mode!=='running'} aria-label={`Move ${direction}`} onPointerDown={e=>{held.current=direction;e.currentTarget.setPointerCapture(e.pointerId);}} onPointerUp={()=>{held.current=null;}} onPointerCancel={()=>{held.current=null;}} onLostPointerCapture={()=>{held.current=null;}} onKeyDown={e=>{if(e.key===' '||e.key==='Enter'){e.preventDefault();held.current=direction;}}} onKeyUp={()=>{held.current=null;}} onBlur={()=>{held.current=null;}}>{direction}</button>)}</div><details><summary>How to win</summary><p>Reach the goal and outscore the leading rival before 45 seconds or the food run out. Bigger products unlock as you grow. Capture needs a 30% size advantage and full containment for a moment. The same rule applies to everyone.</p></details></footer>
 </main>;
}
