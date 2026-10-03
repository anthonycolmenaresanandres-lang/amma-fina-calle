import type { SVGProps } from "react";
import Image from "next/image";

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
