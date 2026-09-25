"use client";

import Image from "next/image";
import { useEffect, useId, useRef } from "react";
import styles from "./fina-calle-signature.module.css";

const EMBLEM = "/assets/fina-calle/emblem-colattao.webp";
// Clip the approved artwork at render time: the logo and QR are never redrawn.
const UPPER = "M0 42H106L116 71L101 106L87 132L121 172L139 219L121 244L86 234L46 198L28 149L0 116Z";
const LOWER = "M0 244L100 244L120 253L115 282L93 288L61 319L51 354L73 383L121 399L139 422L128 445L79 450L38 414L0 372Z";
const ARMS = [
  { name: "upper-left", lower: false, mirrored: false, delay: 0 },
  { name: "upper-right", lower: false, mirrored: true, delay: 0.028 },
  { name: "lower-right", lower: true, mirrored: true, delay: 0.056 },
  { name: "lower-left", lower: true, mirrored: false, delay: 0.084 },
] as const;
const SPLINE = "0.4 0 0.2 1";

function Motion({ type, values, delay = 0 }: { type: "translate" | "rotate"; values: string[]; delay?: number }) {
  return <animateTransform attributeName="transform" type={type} begin="indefinite" dur="3.6s" fill="freeze" repeatCount="1"
    values={[values[0], ...values].join(";")} keyTimes={`0;${0.01 + delay};${0.45 + delay};${0.72 + delay};0.94;1`}
    calcMode="spline" keySplines={Array(5).fill(SPLINE).join(";")} />;
}

function Arm({ id, lower, mirrored, delay }: { id: string; lower: boolean; mirrored: boolean; delay: number }) {
  const elbow = lower ? 370 : 160;
  const wrist = lower ? 411 : 208;
  const source = <use href={`#${id}-source`} transform={mirrored ? "translate(460 0) scale(-1 1)" : undefined} />;
  const partId = `${id}-${lower ? "lower" : "upper"}`;
  return <g transform={mirrored ? "translate(460 0) scale(-1 1)" : undefined}>
    <g>
      <Motion type="translate" delay={delay} values={[lower ? "78 -200" : "76 -58", lower ? "25 -65" : "24 -18", "0 0", "0 0.4", "0 0"]} />
      <animate attributeName="opacity" begin="indefinite" dur="3.6s" fill="freeze" values="0;0;1;1" keyTimes={`0;${0.01 + delay};${0.19 + delay};1`} />
      <g>
        <Motion type="rotate" delay={delay} values={[`-18 100 ${lower ? 262 : 76}`, `-7 100 ${lower ? 262 : 76}`, `0 100 ${lower ? 262 : 76}`, `0 100 ${lower ? 262 : 76}`, `0 100 ${lower ? 262 : 76}`]} />
        <g clipPath={`url(#${partId}-proximal)`}>{source}</g>
        <g>
          <Motion type="rotate" delay={delay} values={[`24 70 ${elbow}`, `12 70 ${elbow}`, `2 70 ${elbow}`, `0 70 ${elbow}`, `0 70 ${elbow}`]} />
          <g clipPath={`url(#${partId}-wrist)`}>{source}</g>
          <g>
            <Motion type="rotate" delay={delay} values={[`-16 108 ${wrist}`, `-12 108 ${wrist}`, `-3 108 ${wrist}`, `0 108 ${wrist}`, `0 108 ${wrist}`]} />
            <g clipPath={`url(#${partId}-jaw-a)`}>{source}</g>
          </g>
          <g>
            <Motion type="rotate" delay={delay} values={[`14 108 ${wrist}`, `10 108 ${wrist}`, `3 108 ${wrist}`, `0 108 ${wrist}`, `0 108 ${wrist}`]} />
            <g clipPath={`url(#${partId}-jaw-b)`}>{source}</g>
          </g>
        </g>
      </g>
    </g>
  </g>;
}

function ProtectedCenter() {
  return <>
    <path d="M119 0H343L369 25L350 82L331 120L323 158L357 192L347 226H109L111 208L90 180L99 153L110 113L99 84Z" />
    <rect x="116" y="236" width="224" height="188" />
    <rect x="112" y="436" width="234" height="27" />
  </>;
}

export function FinaCalleSignature() {
  const id = useId().replace(/:/g, "");
  const stage = useRef<HTMLSpanElement>(null);
  const scene = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const root = stage.current;
    const svg = scene.current;
    if (!root || !svg || typeof svg.pauseAnimations !== "function" || !("IntersectionObserver" in window)) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduced.matches) return;
    let disposed = false;
    let ready = false;
    let visible = false;
    let completed = false;
    const animations = svg.querySelectorAll<SVGAnimationElement>("animate, animateTransform");
    const clock = svg.querySelector("[data-clock]");
    if (!clock || Array.from(animations).some((animation) => typeof animation.beginElement !== "function")) return;
    const finish = () => {
      completed = true;
      svg.pauseAnimations();
      // Restore the exact original pixels in the final pose, with no looping.
      root.dataset.phase = "complete";
      observer.disconnect();
      document.removeEventListener("visibilitychange", sync);
      reduced.removeEventListener("change", sync);
    };
    const sync = () => {
      if (completed || disposed) return;
      if (reduced.matches) { finish(); return; }
      if (ready && visible && !document.hidden) {
        root.dataset.phase = "playing";
        svg.unpauseAnimations();
      } else svg.pauseAnimations();
    };
    svg.pauseAnimations();
    svg.setCurrentTime(0);
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting && entry.intersectionRatio >= 0.3;
      sync();
    }, { threshold: [0, 0.3] });
    observer.observe(root);
    clock?.addEventListener("endEvent", finish);
    document.addEventListener("visibilitychange", sync);
    reduced.addEventListener("change", sync);
    // Wait for the shared source to decode before exposing the rig.
    const source = new window.Image();
    source.onload = () => {
      if (disposed || completed) return;
      animations.forEach((animation) => animation.beginElement());
      svg.setCurrentTime(0);
      ready = true;
      root.dataset.phase = "armed";
      sync();
    };
    source.onerror = finish;
    source.src = EMBLEM;
    return () => {
      disposed = true;
      source.onload = null;
      source.onerror = null;
      svg.pauseAnimations();
      observer.disconnect();
      clock?.removeEventListener("endEvent", finish);
      document.removeEventListener("visibilitychange", sync);
      reduced.removeEventListener("change", sync);
      delete root.dataset.phase;
    };
  }, []);

  return <span ref={stage} className={styles.signature} aria-hidden="true">
    <Image className={styles.original} src={EMBLEM} alt="" width={460} height={488} sizes="184px" loading="lazy" unoptimized />
    <svg ref={scene} className={styles.rig} viewBox="0 0 460 488" width="460" height="488" focusable="false">
      <defs>
        <image id={`${id}-source`} href={EMBLEM} width="460" height="488" />
        <filter id={`${id}-black`} colorInterpolationFilters="sRGB"><feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" /></filter>
        <mask id={`${id}-body`} maskUnits="userSpaceOnUse" x="0" y="0" width="460" height="488" style={{ maskType: "luminance" }}>
          <rect width="460" height="488" fill="white" />
          <g fill="black"><path d={UPPER} /><path d={LOWER} /><g transform="translate(460 0) scale(-1 1)"><path d={UPPER} /><path d={LOWER} /></g></g>
          <g fill="white"><ProtectedCenter /></g>
        </mask>
        <mask id={`${id}-clear-center`} maskUnits="userSpaceOnUse" x="0" y="0" width="460" height="488" style={{ maskType: "luminance" }}>
          <rect width="460" height="488" fill="white" /><g fill="black"><ProtectedCenter /></g>
        </mask>
        {[false, true].map((lower) => {
          const key = `${id}-${lower ? "lower" : "upper"}`;
          const elbow = lower ? 370 : 160;
          const wrist = lower ? 411 : 208;
          return <g key={key}>
            <clipPath id={`${key}-outline`}><path d={lower ? LOWER : UPPER} /></clipPath>
            <clipPath id={`${key}-proximal`}><rect width="460" height={elbow} clipPath={`url(#${key}-outline)`} /></clipPath>
            <clipPath id={`${key}-wrist`}><rect y={elbow} width="460" height={wrist - elbow} clipPath={`url(#${key}-outline)`} /></clipPath>
            <clipPath id={`${key}-jaw-a`}><rect y={wrist} width="108" height={488 - wrist} clipPath={`url(#${key}-outline)`} /></clipPath>
            <clipPath id={`${key}-jaw-b`}><rect x="108" y={wrist} width="352" height={488 - wrist} clipPath={`url(#${key}-outline)`} /></clipPath>
          </g>;
        })}
      </defs>
      <g filter={`url(#${id}-black)`}>
        <use href={`#${id}-source`} mask={`url(#${id}-body)`} />
        <g mask={`url(#${id}-clear-center)`}>
          {ARMS.map((arm) => <Arm key={arm.name} id={id} lower={arm.lower} mirrored={arm.mirrored} delay={arm.delay} />)}
        </g>
      </g>
      <animate data-clock="true" attributeName="opacity" begin="indefinite" dur="3.6s" values="1;1" fill="freeze" repeatCount="1" />
    </svg>
  </span>;
}
