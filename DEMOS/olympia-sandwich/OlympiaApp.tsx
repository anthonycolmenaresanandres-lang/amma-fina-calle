import React,{Component,useCallback,useEffect,useRef,useState} from 'react';
import {Game} from './Game';
import {LEVELS} from './levels';
import {gameAudio,type GameState} from './utils';
import Hero from './Hero';
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
 const[state,setState]=useState<GameState>({status:'START',score:0,level:1,timer:60});
 const stateRef=useRef(state);stateRef.current=state;
 const[round,setRound]=useState(0),[tier,setTier]=useState(1),[sound,setSound]=useState(false),[vector,setVector]=useState(ZERO),[help,setHelp]=useState(false),[toast,setToast]=useState('');
 const timer=useRef<ReturnType<typeof setTimeout>|null>(null),level=LEVELS[(state.level-1)%LEVELS.length];
 const inRound=state.status==='PLAYING'||state.status==='PAUSED',finished=['VICTORY','GAME_OVER','LEVEL_COMPLETE'].includes(state.status);
 const noHostRpc=useCallback(async()=>{},[]);
 useEffect(()=>{gameAudio.setMuted(!sound);},[sound]);
 useEffect(()=>{const stop=()=>{setState(s=>s.status==='PLAYING'?{...s,status:'PAUSED'}:s);setVector(ZERO);};const hidden=()=>{if(document.hidden)stop();};document.addEventListener('visibilitychange',hidden);window.addEventListener('blur',stop);return()=>{document.removeEventListener('visibilitychange',hidden);window.removeEventListener('blur',stop);};},[]);
 useEffect(()=>()=>{if(timer.current)clearTimeout(timer.current);},[]);
 const start=useCallback((number=1)=>{if(timer.current)clearTimeout(timer.current);setState({status:'PLAYING',score:0,level:number,timer:LEVELS[number-1].timeLimit});setTier(1);setVector(ZERO);setToast('');setRound(r=>r+1);setHelp(false);gameAudio.playConfirmSelect();},[]);
 const finish=useCallback(()=>{const current=stateRef.current;setVector(ZERO);setState(s=>({...s,status:current.score>=LEVELS[current.level-1].targetScore?'VICTORY':'GAME_OVER',timer:0}));},[]);
 const tierChanged=useCallback((next:number)=>{setTier(next);setToast('Sandwich grew. Larger ingredients are ready.');if(timer.current)clearTimeout(timer.current);timer.current=setTimeout(()=>setToast(''),1600);},[]);
 const back=()=>{setVector(ZERO);setState(s=>({...s,status:'START'}));};
 return <div className="olympia-app" data-phase={state.status}>
 <a className="skip-link" href="#main">Skip to game</a>
 <header className="brand-bar"><a className="wordmark" href="/olympia" aria-label="Back to Olympia menu">OLYMPIA <small>DELI & JUICE BAR</small></a><span className="draft">Game preview</span><button aria-label={sound?'Mute sound':'Enable sound'} onClick={()=>setSound(v=>!v)}>{sound?'Sound on':'Sound off'}</button></header>
 <main id="main" tabIndex={-1} className="stage">
 {inRound&&<><div className="hud"><div><span>Counter {state.level}</span><strong data-testid="score">{state.score.toLocaleString()} <small>/ {level.targetScore.toLocaleString()}</small></strong></div><strong className="timer" data-testid="timer">{state.timer}s</strong><button onClick={()=>{setVector(ZERO);setState(s=>({...s,status:'PAUSED'}));}}>Pause</button></div>
 <RenderBoundary><Game key={round} gameState={state} setGameState={setState} gameStateRef={stateRef} exitChat={noHostRpc} selectedSkinId="olympia" joystickVector={vector} onTierChange={tierChanged} onRoundTimeEnd={finish}/></RenderBoundary>
 {state.status==='PLAYING'&&<Steering onChange={setVector}/>}
 <div className="counter-caption"><span>SIZE {tier} / 5</span><p>Small ingredients first. Drag to steer.</p><span className="keyboard-note">WASD / arrows · Esc to pause</span></div><div className="tier-toast" role="status">{toast}</div></>}
 {state.status==='START'&&<section className="welcome">
 <div className="intro"><p className="eyebrow">THE DELI COUNTER</p><h1>Make room<br/>for a sandwich.</h1><p>Gather the little ingredients.<br/>Grow into the whole counter.</p></div><Hero/>
 <div className="welcome-actions"><p className="round-facts">60 seconds <span>·</span> Three counters</p><fieldset className="level-select"><legend>Choose a counter</legend>{LEVELS.map((l,i)=><button key={l.levelNumber} aria-pressed={state.level===i+1} onClick={()=>setState(s=>({...s,level:i+1}))}>{['First slice','Lunch rush','Full counter'][i]}</button>)}</fieldset>
 <button className="primary" data-testid="start-button" onClick={()=>start(state.level)}>Start collecting <span aria-hidden="true">↗</span></button><button className="text-button" onClick={()=>setHelp(true)}>How to play</button>
 <details className="study-note"><summary>About this sandwich study</summary><p>Illustrated bread, cooked filling and pale cheese are based on the supplied sandwich photo. The exact menu item, meat and cheese varieties still await confirmation.</p></details></div></section>}
 {state.status==='PAUSED'&&<Dialog title="Take a break." onClose={()=>setState(s=>({...s,status:'PLAYING'}))}><p>Your counter is waiting.</p><button className="primary" onClick={()=>setState(s=>({...s,status:'PLAYING'}))}>Keep collecting</button><button onClick={()=>start(state.level)}>Restart counter</button><button className="text-button" onClick={back}>Back to start</button></Dialog>}
 {finished&&<section className="results"><p className="eyebrow">ROUND COMPLETE</p><h1>{state.status==='VICTORY'?'Nicely gathered.':'Another helping?'}</h1><Hero/><strong className="result-score">{state.score.toLocaleString()} <small>points</small></strong><p>{state.status==='VICTORY'?'Counter target reached.':'Start small, then collect larger ingredients.'}</p><button className="primary" onClick={()=>start(state.level)}>Play again</button>{state.status==='VICTORY'&&state.level<3&&<button onClick={()=>start(state.level+1)}>Next counter</button>}<button className="text-button" onClick={back}>Back to start</button></section>}
 {help&&<Dialog title="Small ingredients first." onClose={()=>setHelp(false)}><p>Drag anywhere on the counter, or use WASD / arrow keys. Smaller ingredients make your sandwich grow. Larger ingredients stay blocked until you reach their size.</p><p>Reach the point target before 60 seconds. Pause whenever you like.</p><button className="primary" onClick={()=>setHelp(false)}>Got it</button></Dialog>}
 </main><footer className="draft-footer">Sandwich study · Recipe awaiting confirmation</footer></div>;
}
