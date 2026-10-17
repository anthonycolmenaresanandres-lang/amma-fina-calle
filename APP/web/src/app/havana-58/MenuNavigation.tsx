"use client";
import {useEffect,type ReactNode} from 'react';
export function MenuNavigation({children}:{children:ReactNode}) {
 useEffect(()=>{
  const open = (hash:string) => {const target=document.getElementById(hash.slice(1));if(target instanceof HTMLDetailsElement) target.open=true;};
  const hash = () => open(location.hash);
  const click = (event:MouseEvent) => {const link=(event.target as Element)?.closest('a[href^="#"]');if(link) open(link.getAttribute('href')||'');};
  hash(); document.addEventListener('click',click);window.addEventListener('hashchange',hash);
  return()=>{document.removeEventListener('click',click);window.removeEventListener('hashchange',hash);};
 },[]);
 return children;
}
