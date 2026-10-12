import React,{createContext,useContext,useEffect,useLayoutEffect,useMemo,useRef} from 'react';
type FrameCallback=(state:undefined,delta:number)=>void;
type Subscriber={priority:number;run:FrameCallback};
const Frames=createContext<Set<Subscriber>|null>(null);
/** Presentation clock only. The original simulation still clamps delta itself. */
export function FrameProvider({children}:{children:React.ReactNode}){
 const subscribers=useMemo(()=>new Set<Subscriber>(),[]);
 useEffect(()=>{let id=0,last=performance.now();const tick=(now:number)=>{
  const delta=(now-last)/1000;last=now;
  for(const entry of [...subscribers].sort((a,b)=>a.priority-b.priority))entry.run(undefined,delta);
  id=requestAnimationFrame(tick);
 };id=requestAnimationFrame(tick);return()=>cancelAnimationFrame(id);},[subscribers]);
 return <Frames.Provider value={subscribers}>{children}</Frames.Provider>;
}
export function useFrame(callback:FrameCallback,priority=0){
 const subscribers=useContext(Frames),latest=useRef(callback);
 useLayoutEffect(()=>{latest.current=callback;},[callback]);
 useEffect(()=>{if(!subscribers)return;const entry={priority,run:(_:undefined,dt:number)=>latest.current(undefined,dt)};
 subscribers.add(entry);return()=>{subscribers.delete(entry);};},[subscribers,priority]);
}
