import React,{Component,useCallback,useEffect,useRef,useState} from 'react';
import {Game,type RaceSnapshot} from './Game';
import {COLLECTOR_RACE_V2} from '../collector-standard/rules';
import {RACE_LEVELS} from './raceLevels';
import {gameAudio,type GameState} from './utils';
import Hero from './Hero';
import {resultSummary} from './ResultSummary';
import './styles.css';
type Vector={x:number;y:number};
const ZERO:Vector={x:0,y:0};
class RenderBoundary extends Component<{children:React.ReactNode},{failed:boolean}>{
 state={failed:false};static getDerivedStateFromError(){return{failed:true};}
 render(){return this.state.failed?<div className="render-error"><h2>The game could not load.</h2><p>Reload to try again.</p><button onClick={()=>location.reload()}>Reload game</button></div>:this.props.children;}
}
function Steering({onChange}:{onChange:(v:Vector)=>void}){
 const active=useRef<number|null>(null),origin=useRef(ZERO);
 const[stick,setStick]=useState<{x:number;y:number;dx:number;dy:number}|null>(null);
 const release=useCallback(()=>{active.current=null;setStick(null);onChange(ZERO);},[onChange]);
 useEffect(()=>{window.addEventListener('blur',release);return()=>{window.removeEventListener('blur',release);onChange(ZERO);};},[onChange,release]);
 return <div className="steering" role="application" tabIndex={0} aria-label="Sandwich counter. Drag to steer, or use arrow keys and WASD. Escape pauses."
 onPointerDown={e=>{if(active.current!==null)return;active.current=e.pointerId;e.currentTarget.setPointerCapture(e.pointerId);const box=e.currentTarget.getBoundingClientRect();origin.current={x:e.clientX-box.left,y:e.clientY-box.top};setStick({...origin.current,dx:0,dy:0});onChange(ZERO);}}
 onPointerMove={e=>{if(active.current!==e.pointerId)return;const box=e.currentTarget.getBoundingClientRect();let dx=e.clientX-box.left-origin.current.x,dy=e.clientY-box.top-origin.current.y;const size=Math.hypot(dx,dy);if(size>48){dx=dx/size*48;dy=dy/size*48;}setStick({...origin.current,dx,dy});onChange({x:dx/48,y:dy/48});}}
 onPointerUp={release} onPointerCancel={release} onLostPointerCapture={release}>
 {stick&&<span className="joystick" style={{left:stick.x,top:stick.y}}><span style={{transform:'translate('+stick.dx+'px,'+stick.dy+'px)'}}/></span>}
 </div>;
}
function Dialog({title,children,onClose}:{title:string;children:React.ReactNode;onClose?:()=>void}){
 const ref=useRef<HTMLDialogElement>(null);
 useEffect(()=>{const dialog=ref.current;dialog?.showModal();return()=>dialog?.close();},[]);
 return <dialog ref={ref} className="dialog" aria-label={title} onCancel={e=>{e.preventDefault();onClose?.();}}><h2>{title}</h2>{children}</dialog>;
}
export default function OlympiaApp(){
 const[state,setState]=useState<GameState>({status:'START',score:0,level:1,timer:45});
 const [rivalScore,setRivalScore]=useState(0),[rivalsAlive,setRivalsAlive]=useState(1),[endReason,setEndReason]=useState<RaceSnapshot['endReason']>(null),[lostPoints,setLostPoints]=useState(0);
 const[round,setRound]=useState(0),[tier,setTier]=useState(1),[sound,setSound]=useState(false),[vector,setVector]=useState(ZERO),[help,setHelp]=useState(false),[toast,setToast]=useState('');
 const ended=useRef(false),resultRef=useRef<HTMLElement>(null);
 const timer=useRef<ReturnType<typeof setTimeout>|null>(null),level=COLLECTOR_RACE_V2[(state.level-1)%COLLECTOR_RACE_V2.length];
 const inRound=state.status==='PLAYING'||state.status==='PAUSED',finished=['VICTORY','GAME_OVER','LEVEL_COMPLETE'].includes(state.status);
 useEffect(()=>{gameAudio.setMuted(!sound);},[sound]);
 useEffect(()=>{if(finished)resultRef.current?.focus();},[finished]);
 useEffect(()=>{const stop=()=>{setState(s=>s.status==='PLAYING'?{...s,status:'PAUSED'}:s);setVector(ZERO);};const hidden=()=>{if(document.hidden)stop();};document.addEventListener('visibilitychange',hidden);window.addEventListener('blur',stop);return()=>{document.removeEventListener('visibilitychange',hidden);window.removeEventListener('blur',stop);};},[]);
 useEffect(()=>()=>{if(timer.current)clearTimeout(timer.current);},[]);
 const start=useCallback((number=1)=>{ended.current=false;if(timer.current)clearTimeout(timer.current);setState({status:'PLAYING',score:0,level:number,timer:COLLECTOR_RACE_V2[number-1].seconds});setRivalScore(0);setRivalsAlive(COLLECTOR_RACE_V2[number-1].rivalCount);setEndReason(null);setLostPoints(0);setTier(1);setVector(ZERO);setToast('');setRound(r=>r+1);setHelp(false);gameAudio.playConfirmSelect();},[]);
 const progress=useCallback((next:RaceSnapshot)=>{if(ended.current)return;if(next.done){ended.current=true;if(timer.current)clearTimeout(timer.current);setToast('');}setRivalScore(next.rivalScore);setRivalsAlive(next.rivalsAlive);setEndReason(next.endReason);setLostPoints(next.pointsBeforeCapture);setState(s=>({...s,score:next.score,timer:next.timer,status:next.done?(next.won?'VICTORY':'GAME_OVER'):s.status}));if(next.done)setVector(ZERO);},[]);
 const tierChanged=useCallback((next:number)=>{setTier(next);setToast('Sandwich grew. Larger ingredients are ready.');if(timer.current)clearTimeout(timer.current);timer.current=setTimeout(()=>setToast(''),1600);},[]);
 const rivalConsumed=useCallback((points:number)=>{setToast(points?`Rival eaten. +${points.toLocaleString()} earned points.`:'Rival eaten. Keep collecting.');if(timer.current)clearTimeout(timer.current);timer.current=setTimeout(()=>setToast(''),1800);},[]);
 const result=resultSummary({won:state.status==='VICTORY',reason:endReason,score:state.score,target:level.target,rivalScore,pointsBeforeCapture:lostPoints});
 const back=()=>{setVector(ZERO);setState(s=>({...s,status:'START'}));};
 return <div className="olympia-app" data-phase={state.status}>
 <a className="skip-link" href="#main">Skip to game</a>
 <header className="brand-bar"><a className="wordmark" href="/olympia" aria-label="Back to Olympia menu">OLYMPIA <small>DELI & JUICE BAR</small></a><span className="draft">Game preview</span><button aria-label={sound?'Mute sound':'Enable sound'} onClick={()=>setSound(v=>!v)}>{sound?'Sound on':'Sound off'}</button></header>
 <main id="main" tabIndex={-1} className="stage">
 {inRound&&<><div className="hud"><div><span>You · Counter {state.level}</span><strong data-testid="score">{state.score.toLocaleString()} <small>/ {level.target.toLocaleString()}</small></strong></div><div className="rival-score"><span>Rivals {rivalsAlive}/{level.rivalCount}</span><strong data-testid="rival-score">{rivalsAlive?rivalScore.toLocaleString():'Caught'}</strong></div><strong className="timer" data-testid="timer">{state.timer}s</strong><button onClick={()=>{setVector(ZERO);setState(s=>({...s,status:'PAUSED'}));}}>Pause</button></div>
 <RenderBoundary><Game key={round} gameState={state} setGameState={setState} joystickVector={vector} onTierChange={tierChanged} onRivalConsumed={rivalConsumed} onProgress={progress}/></RenderBoundary>
 {state.status==='PLAYING'&&<Steering onChange={setVector}/>}
 <div className="counter-caption"><span>SIZE {tier} / 5</span><p>Reach {level.target.toLocaleString()} · {rivalsAlive?'Beat the leader.':'Clear the counter.'}</p><span className="keyboard-note">WASD / arrows · Esc to pause</span></div><div className="tier-toast" role="status">{toast}</div></>}
 {state.status==='START'&&<section className="welcome">
 <div className="intro"><p className="eyebrow">THE DELI COUNTER</p><h1>Make room<br/>for a sandwich.</h1><p>Gather the little ingredients.<br/>Grow your sandwich. Beat the rival.</p></div><Hero/>
 <div className="welcome-actions"><p className="round-facts">Up to 45 seconds <span>·</span> {level.rivalCount} {level.rivalCount===1?'rival':'rivals'}</p><fieldset className="level-select"><legend>Choose a counter</legend>{RACE_LEVELS.map((l,i)=><button key={l.name} aria-pressed={state.level===i+1} onClick={()=>setState(s=>({...s,level:i+1}))}>{l.name}</button>)}</fieldset><p className="level-description">{RACE_LEVELS[state.level-1].description}</p>
 <button className="primary" data-testid="start-button" onClick={()=>start(state.level)}>Start collecting <span aria-hidden="true">↗</span></button><button className="text-button" onClick={()=>setHelp(true)}>How to play</button>
 <details className="study-note"><summary>About this sandwich study</summary><p>Illustrated bread, cooked filling and pale cheese are based on the supplied sandwich photo. The exact menu item, meat and cheese varieties still await confirmation.</p></details></div></section>}
 {state.status==='PAUSED'&&<Dialog title="Take a break." onClose={()=>setState(s=>({...s,status:'PLAYING'}))}><p>Both sandwiches and the clock are paused.</p><button className="primary" onClick={()=>setState(s=>({...s,status:'PLAYING'}))}>Keep collecting</button><button onClick={()=>start(state.level)}>Restart counter</button><button className="text-button" onClick={back}>Back to start</button></Dialog>}
 {finished&&<section ref={resultRef} tabIndex={-1} className="results" data-outcome={state.status==='VICTORY'?'win':'loss'} aria-labelledby="result-title" aria-describedby="result-reason">
 <p className="eyebrow">{result.ending} · Round over</p><h1 id="result-title">{result.title}</h1><p id="result-reason" className="result-reason">{result.reason}</p>
 <dl className="result-totals"><div><dt>{result.scoreLabel}</dt><dd data-testid="final-score">{result.score.toLocaleString()}</dd></div><div><dt>Target</dt><dd>{level.target.toLocaleString()}</dd></div><div><dt>Rival leader</dt><dd>{rivalScore.toLocaleString()}</dd></div></dl>
 {result.captureNote&&<p className="capture-note">{result.captureNote}</p>}
 <div className="result-actions"><button className="primary" onClick={()=>start(state.level)}>Play again</button><a className="menu-return" href="/olympia">Back to Olympia menu</a>{state.status==='VICTORY'&&state.level<3&&<button onClick={()=>start(state.level+1)}>Next counter</button>}<button className="text-button" onClick={back}>Choose a counter</button></div><Hero/>
 </section>}
 {help&&<Dialog title="Small ingredients first." onClose={()=>setHelp(false)}><p>Drag anywhere on the counter, or use WASD / arrow keys. Smaller ingredients make your sandwich grow. Larger ingredients stay blocked until you reach their size.</p><p>Reach the target and finish ahead of the leading rival. The round ends when every ingredient finishes dropping, or at 45 seconds. A sandwich at least 30% larger can eat another by fully covering its rim for 0.2 seconds. Equal sizes are safe. You get a 2.5-second movement head start, and nobody can eat another sandwich during the first 4 seconds. Eating a rival transfers only its earned points and growth. Rivals can eat each other too. Pause whenever you like.</p><button className="primary" onClick={()=>setHelp(false)}>Got it</button></Dialog>}
 </main><footer className="draft-footer">Sandwich study · Recipe awaiting confirmation</footer></div>;
}
