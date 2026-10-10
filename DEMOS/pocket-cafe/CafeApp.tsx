import React,{Component,useCallback,useEffect,useRef,useState} from 'react';
import {ArrowRight,ArrowUpRight,Pause,Play,RotateCcw,Volume2,VolumeX,X} from 'lucide-react';
import {Game} from './Game';
import {LEVELS} from './levels';
import {COLATTAO} from './brand/colattao';
import {gameAudio,type GameState} from './utils';
import './styles.css';

class RenderBoundary extends Component<{children:React.ReactNode},{failed:boolean}>{
  state={failed:false};static getDerivedStateFromError(){return{failed:true};}
  render(){return this.state.failed?<div className="render-error"><h2>3D needs a moment.</h2><p>Enable WebGL in your browser and reload to play.</p><button onClick={()=>location.reload()}>Reload</button></div>:this.props.children;}
}
function Steering({onChange}:{onChange:(v:{x:number;y:number})=>void}){
  const active=useRef<number|null>(null),origin=useRef({x:0,y:0});
  const[stick,setStick]=useState<{x:number;y:number;dx:number;dy:number}|null>(null);
  const release=useCallback(()=>{active.current=null;setStick(null);onChange({x:0,y:0});},[onChange]);
  useEffect(()=>{window.addEventListener('blur',release);return()=>{window.removeEventListener('blur',release);onChange({x:0,y:0});};},[onChange,release]);
  return <div className="steering" aria-label="Drag to steer" onPointerDown={e=>{
    active.current=e.pointerId;e.currentTarget.setPointerCapture(e.pointerId);const box=e.currentTarget.getBoundingClientRect();origin.current={x:e.clientX-box.left,y:e.clientY-box.top};setStick({...origin.current,dx:0,dy:0});onChange({x:0,y:0});
  }} onPointerMove={e=>{if(active.current!==e.pointerId)return;const box=e.currentTarget.getBoundingClientRect();let dx=e.clientX-box.left-origin.current.x,dy=e.clientY-box.top-origin.current.y;const size=Math.hypot(dx,dy);if(size>44){dx=dx/size*44;dy=dy/size*44;}setStick({...origin.current,dx,dy});onChange({x:dx/44,y:dy/44});}} onPointerUp={release} onPointerCancel={release} onLostPointerCapture={release}>
    {stick&&<span className="joystick" style={{left:stick.x,top:stick.y}}><span style={{transform:`translate(${stick.dx}px,${stick.dy}px)`}}/></span>}
  </div>;
}
export default function CafeApp(){
  const[state,setState]=useState<GameState>({status:'START',score:0,level:1,timer:60});
  const stateRef=useRef(state);stateRef.current=state;
  const[round,setRound]=useState(0),[tier,setTier]=useState(1),[sound,setSound]=useState(false),[help,setHelp]=useState(false),[vector,setVector]=useState({x:0,y:0}),[toast,setToast]=useState('');
  const toastTimer=useRef<ReturnType<typeof setTimeout>|null>(null);
  const level=LEVELS[(state.level-1)%LEVELS.length],progress=Math.min(100,Math.round(state.score/level.targetScore*100));
  const noHostRpc=useCallback(async()=>{},[]);
  useEffect(()=>{gameAudio.setMuted(!sound);},[sound]);
  useEffect(()=>{const hidden=()=>{if(document.hidden){setState(s=>s.status==='PLAYING'?{...s,status:'PAUSED'}:s);setVector({x:0,y:0});}};document.addEventListener('visibilitychange',hidden);return()=>document.removeEventListener('visibilitychange',hidden);},[]);
  useEffect(()=>()=>{if(toastTimer.current)clearTimeout(toastTimer.current);},[]);
  const start=useCallback((number=1)=>{setState({status:'PLAYING',score:0,level:number,timer:LEVELS[number-1].timeLimit});setTier(1);setVector({x:0,y:0});setToast('');setRound(r=>r+1);setHelp(false);gameAudio.playConfirmSelect();},[]);
  const finish=useCallback(()=>{const current=stateRef.current;setVector({x:0,y:0});setState(s=>({...s,status:current.score>=LEVELS[current.level-1].targetScore?'VICTORY':'GAME_OVER',timer:0}));},[]);
  const tierChanged=useCallback((next:number)=>{setTier(next);setToast(COLATTAO.tierNames[next-1]);if(toastTimer.current)clearTimeout(toastTimer.current);toastTimer.current=setTimeout(()=>setToast(''),1800);},[]);
  const inRound=state.status==='PLAYING'||state.status==='PAUSED';
  return <div className="cafe-app" data-phase={state.status}>
    <header className="brand-bar"><img src={COLATTAO.logo} alt="Colattao Coffee House"/><span>POCKET CAFÉ</span><button className="icon-button" aria-label={sound?'Mute sound':'Enable sound'} onClick={()=>setSound(s=>!s)}>{sound?<Volume2 size={19}/>:<VolumeX size={19}/>}</button></header>
    {inRound&&<div className="hud"><div><span className="eyebrow">{COLATTAO.levelNames[state.level-1]}</span><strong data-testid="score">{state.score.toLocaleString()} <small>/ {level.targetScore.toLocaleString()}</small></strong></div><div className={`timer ${(state.timer??60)<=10?'urgent':''}`} data-testid="timer">{state.timer}s</div><button className="icon-button" aria-label="Pause round" onClick={()=>{setVector({x:0,y:0});setState(s=>({...s,status:'PAUSED'}));}}><Pause size={20}/></button></div>}
    <main className="stage"><RenderBoundary><Game key={round} gameState={state} setGameState={setState} gameStateRef={stateRef} exitChat={noHostRpc} selectedSkinId="colattao" joystickVector={vector} onTierChange={tierChanged} onRoundTimeEnd={finish}/></RenderBoundary>
      {state.status==='PLAYING'&&<><Steering onChange={setVector}/><div className="growth"><span>SIZE {tier} / 5</span><strong>{COLATTAO.tierNames[tier-1]}</strong><div><i style={{width:`${progress}%`}}/></div></div><div className="control-hint">Drag to steer <span>·</span> WASD / arrows</div>{toast&&<div className="tier-toast">{toast}<ArrowUpRight size={18}/></div>}</>}
      {state.status==='START'&&<section className="welcome" style={{backgroundImage:`linear-gradient(180deg,rgba(22,12,8,.78),rgba(22,12,8,.94)),url(${COLATTAO.background})`}}><div className="welcome-art"><span className="edition">THE COFFEE HOUSE COLLECTION</span><div className="product-fan">{COLATTAO.products.map((p,i)=><figure key={p.name} className={`product product-${i}`}><img src={p.image} alt={p.name}/><figcaption>{p.name}</figcaption></figure>)}</div><span className="art-note">A little café. A big appetite.</span></div>
        <div className="welcome-copy"><span className="eyebrow">COLATTAO COFFEE HOUSE</span><h1>Pocket<br/><em>Café.</em></h1><p>Sweep up the little things.<br/>Grow into the whole table.</p><div className="round-facts"><span>60 seconds</span><span>3 tables</span><span>True 3D</span></div><div className="level-select" aria-label="Choose a table">{COLATTAO.levelNames.map((name,i)=><button key={name} aria-pressed={state.level===i+1} onClick={()=>setState(s=>({...s,level:i+1}))}><span>0{i+1}</span><strong>{name}</strong></button>)}</div><button className="primary" data-testid="start-button" onClick={()=>start(state.level)}>Let's play<ArrowRight size={20}/></button><button className="text-button" onClick={()=>setHelp(true)}>How to play</button><span className="ai-note">AI-assisted game · Made for a little break</span></div>
      </section>}
      {state.status==='PAUSED'&&<div className="modal-shell"><section className="modal"><span className="eyebrow">TAKE A BREATHER</span><h2>Coffee break.</h2><p>Your table will be right here.</p><button className="primary" onClick={()=>setState(s=>({...s,status:'PLAYING'}))}>Keep playing<Play size={18}/></button><button className="secondary" data-testid="restart-button" onClick={()=>start(state.level)}>Start again<RotateCcw size={18}/></button><button className="text-button" onClick={()=>setState(s=>({...s,status:'START'}))}>Back to tables</button></section></div>}
      {(state.status==='VICTORY'||state.status==='GAME_OVER'||state.status==='LEVEL_COMPLETE')&&<div className="modal-shell"><section className="modal results"><span className="eyebrow">ROUND COMPLETE</span><h2>{state.status==='VICTORY'?'Beautifully collected.':'One more sip?'}</h2><div className="result-score" data-testid="result-score">{state.score.toLocaleString()}<span>points</span></div><p>{state.status==='VICTORY'?'Table target reached.':'Every little thing adds up.'}</p><button className="primary" data-testid="restart-button" onClick={()=>start(state.level)}>Play again<RotateCcw size={18}/></button>{state.status==='VICTORY'&&state.level<3&&<button className="secondary" onClick={()=>start(state.level+1)}>Next table<ArrowRight size={18}/></button>}<button className="text-button" onClick={()=>setState(s=>({...s,status:'START'}))}>Choose a table</button><span className="ai-note">Just for fun · No prizes or purchases</span></section></div>}
      {help&&<div className="modal-shell"><section className="modal"><button className="close-modal icon-button" aria-label="Close instructions" onClick={()=>setHelp(false)}><X size={18}/></button><span className="eyebrow">THE LITTLE RULES</span><h2>Small first.<br/>Then everything.</h2><p>Drag anywhere on the table, or use WASD / arrow keys. Collect smaller objects to grow. Bigger objects stay blocked until you're ready.</p><p>Reach the table's point target in 60 seconds. Pause whenever you like.</p><button className="primary" onClick={()=>setHelp(false)}>Got it<ArrowRight size={18}/></button></section></div>}
    </main>
  </div>;
}
