import Link from "next/link";
import { ArrowLeft, LogOut } from "lucide-react";
import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
} from "react";

/**
 * Fina Calle OS — owner UI kit.
 *
 * Small, presentational building blocks on the existing black + gold tokens so
 * styling stops being copy-pasted inline. Server-component safe (no hooks).
 *
 * Palette: page #030405 · card #07090b · field #0e1316 · text #f4f6f7
 * muted #aeb7bd · faint #7f8a91 · gold #d8b36d · success #7fd1a2 · danger #ff7a66
 */

export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

// --- Card --------------------------------------------------------------------

export function Card({
  className,
  children,
  as: As = "section",
}: {
  className?: string;
  children: ReactNode;
  as?: "section" | "div";
}) {
  return (
    <As
      className={cn(
        "rounded-3xl border border-white/[0.08] bg-[#07090b]/80 p-5 sm:p-6",
        "shadow-[0_40px_120px_-60px_rgba(0,0,0,0.9)] ring-1 ring-white/[0.02] backdrop-blur",
        className,
      )}
    >
      {children}
    </As>
  );
}

// --- Section heading ---------------------------------------------------------

export function SectionHeading({
  children,
  hint,
  icon,
  tone = "gold",
}: {
  children: ReactNode;
  hint?: ReactNode;
  /** Optional leading icon (e.g. a Lucide glyph), inherits the heading color. */
  icon?: ReactNode;
  /** Heading accent — "gold" (default, owner routes) or "accent" (sapphire). */
  tone?: "gold" | "accent";
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <h2
        className={cn(
          "inline-flex items-center gap-2 text-[0.7rem] font-semibold uppercase tracking-[0.26em]",
          tone === "accent" ? "text-[#4f9dff]" : "text-[#d8b36d]",
        )}
      >
        {icon}
        {children}
      </h2>
      {hint ? <span className="text-[0.7rem] text-[#7f8a91]">{hint}</span> : null}
    </div>
  );
}

// --- Button ------------------------------------------------------------------

export type ButtonVariant = "primary" | "gold" | "ghost" | "subtle" | "danger" | "success";

const BUTTON_BASE =
  "inline-flex items-center justify-center gap-2 rounded-full text-xs font-semibold uppercase tracking-[0.14em] transition disabled:cursor-not-allowed disabled:opacity-45";

const BUTTON_VARIANTS: Record<ButtonVariant, string> = {
  primary: "bg-[#eef2f4] px-5 py-2.5 text-[#07090b] hover:bg-white",
  gold:
    "bg-gradient-to-b from-[#e4c680] to-[#cfa457] px-5 py-2.5 text-[#0a0c0e] shadow-[0_10px_30px_-12px_rgba(216,179,109,0.6)] hover:from-[#eed093] hover:to-[#d8b36d]",
  ghost:
    "border border-white/15 px-4 py-2 text-[#eef2f4] hover:border-[#d8b36d]/60 hover:text-white",
  subtle:
    "border border-white/10 bg-white/[0.03] px-4 py-2 text-[#cfd6da] hover:bg-white/[0.06] hover:text-white",
  danger:
    "border border-[#ff7a66]/40 bg-[#8f3e2e]/16 px-4 py-2 text-[#ffad9f] hover:bg-[#8f3e2e]/26",
  success:
    "border border-[#7fd1a2]/40 bg-[#7fd1a2]/10 px-4 py-2 text-[#9fe5bd] hover:bg-[#7fd1a2]/16",
};

export function buttonClass(variant: ButtonVariant = "ghost", className?: string): string {
  return cn(BUTTON_BASE, BUTTON_VARIANTS[variant], className);
}

export function Button({
  variant = "ghost",
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant }) {
  return <button className={buttonClass(variant, className)} {...props} />;
}

export function ButtonLink({
  variant = "ghost",
  className,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement> & { variant?: ButtonVariant }) {
  return <a className={buttonClass(variant, className)} {...props} />;
}

// --- Field -------------------------------------------------------------------

export const fieldClass =
  "w-full rounded-xl border border-white/12 bg-[#0e1316] px-3.5 py-2.5 text-sm text-[#f4f6f7] placeholder:text-[#7f8a91] outline-none transition focus:border-[#d8b36d]/70 focus:ring-2 focus:ring-[#d8b36d]/20 disabled:opacity-60";

export function Field({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(fieldClass, className)} {...props} />;
}

// --- Status pill -------------------------------------------------------------

export type PillTone = "success" | "danger" | "neutral" | "gold" | "accent";

const PILL_TONES: Record<PillTone, string> = {
  success: "border-[#7fd1a2]/30 bg-[#7fd1a2]/10 text-[#9fe5bd]",
  danger: "border-[#ff7a66]/30 bg-[#8f3e2e]/16 text-[#ffad9f]",
  neutral: "border-white/12 bg-white/[0.03] text-[#aeb7bd]",
  gold: "border-[#d8b36d]/30 bg-[#d8b36d]/10 text-[#f4d99c]",
  accent: "border-[#4f9dff]/35 bg-[#4f9dff]/12 text-[#bfdcff]",
};

export function StatusPill({
  tone = "neutral",
  dot = false,
  children,
}: {
  tone?: PillTone;
  dot?: boolean;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.14em]",
        PILL_TONES[tone],
      )}
    >
      {dot ? <StatusDot tone={tone} /> : null}
      {children}
    </span>
  );
}

const DOT_TONES: Record<PillTone, string> = {
  success: "bg-[#7fd1a2]",
  danger: "bg-[#ff7a66]",
  neutral: "bg-[#aeb7bd]",
  gold: "bg-[#d8b36d]",
  accent: "bg-[#4f9dff]",
};

export function StatusDot({ tone = "neutral", className }: { tone?: PillTone; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "inline-block h-1.5 w-1.5 flex-none rounded-full shadow-[0_0_10px_-1px_currentColor]",
        DOT_TONES[tone],
        className,
      )}
    />
  );
}

// --- Chip (presentational; example prompts) ----------------------------------

export function Chip({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-[#c8d0d4]",
        className,
      )}
    >
      {children}
    </span>
  );
}

// --- Page shell --------------------------------------------------------------
// The black + gold operations ground (spotlights + grain + vignette) plus the
// centered column, in one place. Replaces the four stacked background <div>s
// that were hand-copied onto every /customers screen.

export function PageShell({
  children,
  width = "6xl",
  className,
}: {
  children: ReactNode;
  width?: "md" | "4xl" | "6xl";
  className?: string;
}) {
  const widths = { md: "max-w-md", "4xl": "max-w-4xl", "6xl": "max-w-6xl" } as const;
  return (
    <main className="fc-bg relative isolate flex min-h-dvh flex-col overflow-hidden px-5 py-5 text-[#f4f6f7] sm:px-8 lg:px-10">
      <div className="fc-grain" aria-hidden />
      <div className="fc-vignette" aria-hidden />
      <div
        className={cn(
          "relative z-[1] mx-auto flex min-h-[calc(100dvh-2.5rem)] w-full flex-1 flex-col",
          widths[width],
          className,
        )}
      >
        {children}
      </div>
    </main>
  );
}

// --- Top bar (back link + right-side actions) --------------------------------

export function TopBar({
  backHref,
  backLabel,
  children,
}: {
  backHref: string;
  backLabel: string;
  children?: ReactNode;
}) {
  return (
    <header className="flex items-center justify-between gap-4 text-[0.68rem] uppercase tracking-[0.28em] text-[#cfd6da]/62">
      <Link
        href={backHref}
        className="group inline-flex items-center gap-2 transition hover:text-white"
      >
        <ArrowLeft
          size={15}
          strokeWidth={1.75}
          aria-hidden
          className="text-[#4f9dff] transition-transform group-hover:-translate-x-0.5"
        />
        {backLabel}
      </Link>
      {children ? (
        <nav className="flex items-center gap-4 tracking-[0.28em]">{children}</nav>
      ) : null}
    </header>
  );
}

export function SignOutButton() {
  return (
    <form action="/customers/signout" method="post">
      <button
        type="submit"
        className="inline-flex items-center gap-1.5 uppercase tracking-[0.28em] transition hover:text-white"
      >
        <LogOut size={13} strokeWidth={1.75} aria-hidden />
        Sign out
      </button>
    </form>
  );
}

// --- Display typography -------------------------------------------------------

export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2.5 text-xs font-semibold uppercase tracking-[0.34em] text-[#4f9dff]",
        className,
      )}
    >
      <span aria-hidden className="h-px w-6 bg-gradient-to-r from-[#4f9dff]/80 to-transparent" />
      {children}
    </span>
  );
}

export function PageTitle({
  children,
  shine = false,
  className,
}: {
  children: ReactNode;
  shine?: boolean;
  className?: string;
}) {
  return (
    <h1
      className={cn(
        "fc-balance mt-5 text-4xl font-semibold tracking-[-0.02em] text-[#f4f6f7] sm:text-5xl",
        className,
      )}
    >
      {shine ? <span className="rb-shiny-text">{children}</span> : children}
    </h1>
  );
}

export function Lede({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p className={cn("mt-5 max-w-xl text-base leading-7 text-[#c8d0d4] sm:text-lg", className)}>
      {children}
    </p>
  );
}

// --- Premium panel (milled card with specular top edge) ----------------------

export function Panel({
  className,
  children,
  as: As = "section",
}: {
  className?: string;
  children: ReactNode;
  as?: "section" | "div" | "article";
}) {
  return <As className={cn("fc-panel p-5 sm:p-6", className)}>{children}</As>;
}

// --- Monogram (business initials avatar) -------------------------------------

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "•";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function Monogram({ name, className }: { name: string; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "inline-flex h-12 w-12 flex-none items-center justify-center rounded-2xl border border-[#4f9dff]/35",
        "bg-gradient-to-br from-[#4f9dff]/22 to-[#0b1220] text-sm font-semibold tracking-[0.06em] text-[#bfdcff]",
        "shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]",
        className,
      )}
    >
      {initialsOf(name)}
    </span>
  );
}

// --- Stat tile (metric in a dl) ----------------------------------------------

export function StatTile({
  label,
  children,
  icon,
  className,
}: {
  label: ReactNode;
  children: ReactNode;
  /** Optional leading glyph in the label row (inherits the muted label color). */
  icon?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-white/[0.08] bg-[#090c0f]/72 p-4 transition hover:border-[#4f9dff]/25",
        className,
      )}
    >
      <dt className="flex items-center gap-1.5 text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-[#cfd6da]/56">
        {icon}
        {label}
      </dt>
      <dd className="mt-1.5 text-lg font-semibold text-[#eef2f4]">{children}</dd>
    </div>
  );
}
