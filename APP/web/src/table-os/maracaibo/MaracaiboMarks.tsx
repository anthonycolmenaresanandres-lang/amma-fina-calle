import type { SVGProps } from "react";
import Image from "next/image";
import styles from "./maracaibo.module.css";

export function TeamMark({ team, ...props }: SVGProps<SVGSVGElement> & { team: "home" | "away" }): React.JSX.Element {
  return (
    <svg viewBox="0 0 40 40" fill="none" aria-hidden="true" {...props}>
      {team === "home" ? (
        <g stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <path d="M5 15c5-8 10 8 15 0s10 8 15 0M5 24c5-8 10 8 15 0s10 8 15 0" />
        </g>
      ) : <path d="m24 5-13 17h12l-6 13L31 17H19l5-12Z" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />}
    </svg>
  );
}

export function FlagArtwork({ className, prominent = false, decorative = false }: { className?: string; prominent?: boolean; decorative?: boolean }): React.JSX.Element {
  return <span className={className}><Image
    src={prominent ? "/assets/maracaibo/venezuelan-flag-concept-960.webp" : "/assets/maracaibo/venezuelan-flag-concept-480.webp"}
    width={prominent ? 960 : 480} height={prominent ? 640 : 320}
    alt={decorative ? "" : "Original concept artwork of a satin Venezuelan flag with eight white stars"}
    unoptimized priority={prominent}
  /></span>;
}

/** Original supplied mark. The source region is preserved pixel-for-pixel. */
export function LogoArtwork({ className, priority = false }: { className?: string; priority?: boolean }): React.JSX.Element {
  return <Image className={className} src="/assets/maracaibo/maracaibo-kitchen-cocktails-logo.png" width={626} height={626} alt="Maracaibo Bistro — Kitchen & Cocktails" unoptimized priority={priority} />;
}

export function PlateMark(): React.JSX.Element {
  return <svg viewBox="0 0 40 40" fill="none" aria-hidden="true"><g stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="21" cy="20" r="11" /><circle cx="21" cy="20" r="7" /><path d="M4 7v10m3-10v10M4 13h3m-1.5 4v16M36 7v26m0-26c-5 3-5 11 0 13" /></g></svg>;
}

export function FootballMark(): React.JSX.Element {
  return <svg viewBox="0 0 40 40" fill="none" aria-hidden="true"><g stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"><circle cx="20" cy="20" r="15" /><path d="m20 13 7 5-3 8h-8l-3-8 7-5Zm0 0V5m7 13 7-4M24 26l5 7M16 26l-5 7M13 18l-7-4" /></g></svg>;
}

const OBJECT_ART = {
  bell: "/assets/maracaibo/service-bell-480.webp",
  drink: "/assets/maracaibo/citrus-drink-480.webp",
  football: "/assets/maracaibo/football-480.webp",
} as const;

/** Generated atmosphere only; labels and controls never depend on this artwork. */
export function DecorativeArtwork({ kind, className }: { kind: keyof typeof OBJECT_ART; className?: string }): React.JSX.Element {
  return <span className={[styles.objectArtwork, className].filter(Boolean).join(" ")} data-maracaibo-object={kind} aria-hidden="true"><Image
    src={OBJECT_ART[kind]} width={480} height={480} alt="" unoptimized loading="eager" draggable={false}
    onError={(event) => { event.currentTarget.style.visibility = "hidden"; }}
  /></span>;
}
