import React,{useState} from 'react';
import {ART,inspectedPath} from './assets';
export default function Hero(){
 const path=inspectedPath(ART.finishedSandwich),[failed,setFailed]=useState(false);
 return <figure className="sandwich-hero">
  {path&&!failed?<img src={path} onError={()=>setFailed(true)} width="720" height="302" fetchPriority="high" alt="Illustrated golden sandwich with cooked filling and pale melted cheese"/>:
   <div className="hero-placeholder" role="img" aria-label="Sandwich with bread, cooked filling and pale cheese"><span className="bread top"/><span className="cheese"/><span className="meat"/><span className="bread base"/></div>}
 </figure>;
}
