import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
const rootPath=fileURLToPath(new URL('..',import.meta.url));
const source=fs.readFileSync(path.join(rootPath,'src/components/seasonal/HalloweenSkin.tsx'),'utf8');
const code=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX}}).outputText;
for(const viewportWidth of [390,1280]){
 let effect,timerId=0,reduced=false,hasGame=false,focus='body',refCount=0,cancels=0,starts=0,stops=0,created=0,destroyed=0,activity,observing=false,maxActive=0;
 const timers=new Map(),events=new Map(),mediaEvents=new Map(),windowEvents=new Map(),visits=[],active=new Set();
 const root={hidden:true,contains:()=>false};
 const visitors=Array.from({length:3},(_,owner)=>{const visitor={style:{},getBoundingClientRect:()=>({width:parseFloat(visitor.style.width)||(viewportWidth<700?72:96),height:parseFloat(visitor.style.height)||(viewportWidth<700?108:144)}),animate:(frames,options)=>{visits.push({owner,frames,options});active.add(owner);maxActive=Math.max(maxActive,active.size);return{cancel:()=>{cancels++;active.delete(owner);}};}};return visitor;});
 const refs=[root,visitors,[{},{},{}]];
 const obstacle={checkVisibility:()=>true,matches:()=>true,getBoundingClientRect:()=>({left:0,right:viewportWidth,top:0,bottom:844,width:viewportWidth,height:844})};
 const document={hidden:false,body:{},activeElement:{closest:selector=>focus==='editable'||focus==='formButton'&&selector.includes('form,')?{}:null},querySelector:()=>hasGame?{}:null,querySelectorAll:()=>[obstacle],createTreeWalker:()=>({nextNode:()=>null}),addEventListener:(type,fn)=>events.set(type,fn),removeEventListener:type=>events.delete(type)};
 const media={get matches(){return reduced;},addEventListener:(type,fn)=>mediaEvents.set(type,fn),removeEventListener:type=>mediaEvents.delete(type)};
 const window={innerHeight:844,innerWidth:viewportWidth,matchMedia:()=>media,addEventListener:(type,fn)=>windowEvents.set(type,fn),removeEventListener:type=>windowEvents.delete(type)};
 class Clock extends Date{static now(){return Date.parse('2026-10-28T13:00:00Z');}}
 const context={exports:{},Date:Clock,Math,document,window,NodeFilter:{SHOW_TEXT:4},MutationObserver:class{constructor(fn){activity=fn;}observe(){observing=true;}disconnect(){observing=false;}},setTimeout:(fn,delay)=>{timers.set(++timerId,{fn,delay});return timerId;},clearTimeout:id=>timers.delete(id),require:name=>name==='react'?{useRef:()=>({current:refs[refCount++]}),useEffect:fn=>effect=fn}:name==='react/jsx-runtime'?{jsx:()=>null,jsxs:()=>null}:name==='./ghostCloth'?{createGhostCloth:()=>{created++;return{start:()=>starts++,stop:()=>stops++,destroy:()=>destroyed++};}}:{default:{}}};
 vm.runInNewContext(code,context);context.exports.default({brand:'colattao'});const cleanup=effect();assert.equal(root.hidden,false);assert.equal(observing,true);
 const count=viewportWidth<700?2:3;
 const flushFollowers=()=>{for(const[id,t]of[...timers].filter(([,t])=>t.delay===700||t.delay===1400)){if(timers.has(id)){timers.delete(id);t.fn();}}};
 const first=[...timers.values()].find(t=>t.delay>=15000&&t.delay<=20000);assert.ok(first);first.fn();assert.equal(visits.length,1);assert.equal(starts,1);assert.ok([...timers.values()].some(t=>t.delay===700));
 const timerCount=timers.size;
 for(let i=0;i<8;i++){events.get('pointerdown')?.();events.get('touchstart')?.();events.get('scroll')?.();windowEvents.get('resize')?.();focus='formButton';events.get('focusin')();}
 assert.equal(cancels,0);assert.equal(stops,0);assert.equal(timers.size,timerCount,'browsing must not reset stagger or cadence');flushFollowers();assert.equal(visits.length,count);assert.equal(starts,count);assert.equal(created,count);assert.equal(maxActive,count);assert.ok(new Set(visitors.slice(0,count).map(v=>v.style.height)).size>1);assert.ok(new Set(visitors.slice(0,count).map(v=>v.style.top)).size>1);assert.ok(visits.every(v=>v.options.duration===8000&&v.frames[1].opacity===.32));
 const next=()=>[...timers.values()].filter(t=>t.delay>=45000&&t.delay<=75000).at(-1);
 const coords=frames=>frames.map(f=>Number(f.transform.match(/translate3d\(([-.\d]+)/)[1]));
 focus='editable';events.get('focusin')();assert.ok(visitors.every(v=>v.style.opacity==='0'));next().fn();assert.equal(visits.length,count);focus='body';next().fn();flushFollowers();assert.equal(visits.length,2*count);assert.ok(coords(visits[0].frames)[0]<coords(visits[0].frames).at(-1));assert.ok(coords(visits[count].frames)[0]>coords(visits[count].frames).at(-1));
 hasGame=true;activity();next().fn();assert.equal(visits.length,2*count);hasGame=false;activity();next().fn();flushFollowers();assert.equal(visits.length,3*count);
 document.hidden=true;events.get('visibilitychange')();next().fn();assert.equal(visits.length,3*count);document.hidden=false;events.get('visibilitychange')();next().fn();flushFollowers();assert.equal(visits.length,4*count);
 reduced=true;mediaEvents.get('change')();next().fn();assert.equal(visits.length,4*count);reduced=false;mediaEvents.get('change')();next().fn();flushFollowers();assert.equal(visits.length,5*count);assert.equal(created,count,'reuse bounded cloth renderer pool');
 next().fn();assert.equal(visits.length,5*count+1);focus='editable';events.get('focusin')();flushFollowers();assert.equal(visits.length,5*count+1,'suppression must cancel queued followers');
 const expiry=[...timers.values()].find(t=>t.delay>75000);expiry.fn();assert.equal(root.hidden,true);cleanup();assert.equal(destroyed,count);assert.equal(observing,false);assert.equal(events.size,0);assert.equal(mediaEvents.size,0);assert.equal(windowEvents.size,0);assert.ok(maxActive<=3);
 console.log('PASS '+viewportWidth+'px actual controller: '+count+' staggered varied ghosts; bounded/reused cloth pool; repeated input/cadence stability; editable/game/hidden/reduced suppression and resume; queued-follower cancellation, expiry and cleanup.');
}
