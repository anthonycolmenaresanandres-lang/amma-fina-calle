"use client";
import {useEffect,useRef,useState,type PointerEvent} from 'react';
import Image from 'next/image';
import type {CollectorRace,RaceResult} from '../collector-standard/engine';
import {COUNTERS,createChocolateRace} from '../game-config';
import {Lettering} from '../Lettering';
import {drawCounter,loadArt} from './renderer';
import styles from './game.module.css';
type Mode='ready'|'running'|'paused'|'result';
type Pointer={x:number;y:number;dx:number;dy:number;id:number};
export default function ChocolateGame(){
 const [level,setLevel]=useState(0),[round,setRound]=useState(0),[mode,setMode]=useState<Mode>('ready');
 const [hud,setHud]=useState({score:0,seconds:45});
 const [result,setResult]=useState<Readonly<RaceResult>|null>(null);
 const canvas=useRef<HTMLCanvasElement>(null),race=useRef<CollectorRace|null>(null),modeRef=useRef<Mode>('ready');
 const pointer=useRef<Pointer|null>(null),keys=useRef(new Set<string>()),dialogTitle=useRef<HTMLHeadingElement>(null),overlay=useRef<HTMLElement>(null);
 const spec=COUNTERS[level];
 const changeMode=(next:Mode)=>{modeRef.current=next;pointer.current=null;keys.current.clear();setMode(next);};
 const start=()=>{setResult(null);setRound(n=>n+1);changeMode('running');canvas.current?.focus();};
 useEffect(()=>{
  const game=createChocolateRace(level);race.current=game;const art=loadArt();const c=canvas.current;if(!c)return;
  const ctx=c.getContext('2d');if(!ctx)return;let frame=0,last=performance.now(),lastHud=0,rendered=0;let w=0,h=0;
  const resize=()=>{const rect=c.getBoundingClientRect();w=rect.width;h=rect.height;const dpr=Math.min(window.devicePixelRatio||1,2);c.width=Math.round(w*dpr);c.height=Math.round(h*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);};
  const observer=new ResizeObserver(resize);observer.observe(c);resize();
  const tick=(now:number)=>{const dt=(now-last)/1000;last=now;
   let direction={x:0,z:0};const k=keys.current;
   if(k.has('ArrowLeft')||k.has('a'))direction.x--;if(k.has('ArrowRight')||k.has('d'))direction.x++;
   if(k.has('ArrowUp')||k.has('w'))direction.z--;if(k.has('ArrowDown')||k.has('s'))direction.z++;
   if(pointer.current)direction={x:pointer.current.dx,z:pointer.current.dy};
   game.step(dt,direction,modeRef.current==='running');
   if(game.result&&modeRef.current==='running'){setResult(game.result);modeRef.current='result';pointer.current=null;keys.current.clear();setMode('result');}
   if(now-lastHud>160){lastHud=now;setHud({score:game.result?.reason==='player-consumed'?game.result.pointsBeforeCapture:game.player.score,seconds:Math.ceil(game.remaining)});}
   if(now-rendered>(modeRef.current==='running'?32:800)){rendered=now;drawCounter(ctx,w,h,game,level,art,pointer.current);}
   frame=requestAnimationFrame(tick);
  };frame=requestAnimationFrame(tick);
  const release=()=>{pointer.current=null;keys.current.clear();};
  const hidden=()=>{release();if(document.hidden&&modeRef.current==='running'){modeRef.current='paused';setMode('paused');}};
  const blur=()=>{release();if(modeRef.current==='running'){modeRef.current='paused';setMode('paused');}};
  const down=(e:KeyboardEvent)=>{if(e.target instanceof HTMLElement&&e.target.closest('button,a'))return;const key=e.key.length===1?e.key.toLowerCase():e.key;if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','w','a','s','d'].includes(key)&&modeRef.current==='running'){e.preventDefault();keys.current.add(key);}if(e.key==='Escape'&&modeRef.current==='running'){e.preventDefault();blur();}};
  const up=(e:KeyboardEvent)=>keys.current.delete(e.key.length===1?e.key.toLowerCase():e.key);
  window.addEventListener('keydown',down);window.addEventListener('keyup',up);window.addEventListener('blur',blur);document.addEventListener('visibilitychange',hidden);
  return()=>{cancelAnimationFrame(frame);observer.disconnect();release();window.removeEventListener('keydown',down);window.removeEventListener('keyup',up);window.removeEventListener('blur',blur);document.removeEventListener('visibilitychange',hidden);race.current=null;};
 },[level,round]);
 useEffect(()=>{if(mode==='paused'||mode==='result')dialogTitle.current?.focus();},[mode]);
 const move=(e:PointerEvent<HTMLCanvasElement>)=>{const p=pointer.current;if(!p||p.id!==e.pointerId)return;const rect=e.currentTarget.getBoundingClientRect(),dx=e.clientX-rect.left-p.x,dy=e.clientY-rect.top-p.y,length=Math.hypot(dx,dy);p.dx=length>6?dx/Math.max(length,32):0;p.dy=length>6?dy/Math.max(length,32):0;};
 const won=result?.outcome==='won';
 const reason=result?.reason==='player-consumed'?'A larger rival collected you.':result?.reason==='counter-cleared'?'The counter is clear.':'Time is up.';
 return <main className={styles.game}>
  <header className={styles.toolbar} inert={mode==='paused'||mode==='result'}><a href="/royal-chocolate">Back to menu</a><span>Chocolate Counter</span>{mode==='running'?<button onClick={()=>changeMode('paused')}>Pause</button>:<span className={styles.concept}>Concept</span>}</header>
  <div className={styles.scoreboard} aria-label="Round status"><span><small>Your score</small>{hud.score.toLocaleString()}</span><span><small>Goal</small>{spec.target.toLocaleString()}</span><span><small>Time</small>{hud.seconds}s</span></div>
  <div className={styles.arena}>
   <canvas ref={canvas} tabIndex={mode==='running'?0:-1} aria-label="Chocolate counter. Drag anywhere to steer. Short drags move slowly. Use arrow keys or WASD on a keyboard." aria-describedby="game-help" onPointerDown={e=>{if(modeRef.current!=='running'||pointer.current)return;e.currentTarget.setPointerCapture(e.pointerId);const r=e.currentTarget.getBoundingClientRect();pointer.current={x:e.clientX-r.left,y:e.clientY-r.top,dx:0,dy:0,id:e.pointerId};}} onPointerMove={move} onPointerUp={e=>{if(pointer.current?.id===e.pointerId)pointer.current=null;}} onPointerCancel={()=>{pointer.current=null;}} onLostPointerCapture={()=>{pointer.current=null;}}/>
   {mode==='ready'&&<section className={styles.overlay} aria-labelledby="start-title"><p className={styles.eyebrow}>The Royal Chocolate · Fina Calle concept</p><h1 id="start-title"><Lettering text="Chocolate"/><Lettering text="Counter"/></h1><Image src="/assets/royal-chocolate/apple.svg" alt="Illustrated chocolate apple" width={130} height={110} unoptimized/><p>Collect sweets. Grow your chocolate swirl.<br/>Eat smaller rivals. Larger rivals can eat you.</p><div className={styles.levels} aria-label="Choose a counter">{COUNTERS.map((counter,i)=><button key={counter.name} aria-pressed={i===level} onClick={()=>setLevel(i)}>Counter {i+1}<small>{i+1} {i===0?'rival':'rivals'}</small></button>)}</div><p className={styles.description}>Drag anywhere to steer. Short drags move slowly. Keyboard: arrows or WASD.</p><h2>{spec.name}</h2><p className={styles.description}>{spec.description}</p><button className={styles.primary} onClick={start}>Start collecting</button><small>45 seconds · Illustrative game art · No real rewards</small></section>}
   {mode==='paused'&&<section ref={overlay} className={styles.overlay} role="dialog" onKeyDown={e=>{if(e.key!=='Tab')return;const controls=overlay.current?.querySelectorAll<HTMLElement>('button,a[href]');if(!controls?.length)return;const first=controls[0],last=controls[controls.length-1];if(e.shiftKey&&(document.activeElement===first||document.activeElement===dialogTitle.current)){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}} aria-modal="true" aria-labelledby="pause-title"><h2 id="pause-title" ref={dialogTitle} tabIndex={-1}>Take a sweet pause.</h2><p>The counter and clock are stopped.</p><p className={styles.description}>Drag to steer, or use arrows / WASD. Eat a fully enclosed rival when you are at least 30% bigger. Hold briefly. The same rule protects you from similar-sized rivals.</p><button className={styles.primary} onClick={()=>{changeMode('running');canvas.current?.focus();}}>Resume collecting</button><a href="/royal-chocolate">Back to menu</a></section>}
   {mode==='result'&&result&&<section ref={overlay} className={styles.overlay} role="dialog" onKeyDown={e=>{if(e.key!=='Tab')return;const controls=overlay.current?.querySelectorAll<HTMLElement>('button,a[href]');if(!controls?.length)return;const first=controls[0],last=controls[controls.length-1];if(e.shiftKey&&(document.activeElement===first||document.activeElement===dialogTitle.current)){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}} aria-modal="true" aria-labelledby="result-title"><p className={styles.eyebrow}>Counter {level+1} complete</p><h2 id="result-title" ref={dialogTitle} tabIndex={-1}>{won?'Sweet victory!':'Round lost'}</h2><p>{reason}</p><strong className={styles.finalScore}>{(result.reason==='player-consumed'?result.pointsBeforeCapture:result.score).toLocaleString()} <small>points</small></strong><p>{result.outcome==='target-missed'?'Reach the score goal to win.':result.outcome==='rival-ahead'?'Beat the leading rival’s score to win.':won?'You reached the goal and beat the rivals.':'Grow before challenging a rival.'}</p><p className={styles.description}>Goal {spec.target.toLocaleString()} · Leading rival {result.rivalScore.toLocaleString()}</p><button className={styles.primary} onClick={start}>Play this counter again</button>{level<2&&<button onClick={()=>{setLevel(n=>n+1);setResult(null);changeMode('ready');}}>Choose next counter</button>}<button onClick={()=>{setRound(n=>n+1);changeMode('ready');}}>Choose a counter</button><a href="/royal-chocolate">Back to menu</a></section>}
  </div>
  <p id="game-help" className="sr-only">Drag to steer; short drags move slowly. Arrows or WASD also move. Grow at least 30% larger than a rival, fully enclose it, and hold briefly to eat it. Larger rivals can eat you under the same rules. Escape pauses.</p>
 </main>;
}
