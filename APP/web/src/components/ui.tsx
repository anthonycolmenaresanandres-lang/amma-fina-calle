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
}: {
  children: ReactNode;
  hint?: ReactNode;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <h2 className="text-[0.7rem] font-semibold uppercase tracking-[0.26em] text-[#d8b36d]">
        {children}
      </h2>
      {hint ? <span className="text-[0.7rem] text-[#7f8a91]">{hint}</span> : null}
    </div>
  );
}

// --- Button ------------------------------------------------------------------

export type ButtonVariant = "primary" | "ghost" | "subtle" | "danger" | "success";

const BUTTON_BASE =
  "inline-flex items-center justify-center gap-2 rounded-full text-xs font-semibold uppercase tracking-[0.14em] transition disabled:cursor-not-allowed disabled:opacity-45";

const BUTTON_VARIANTS: Record<ButtonVariant, string> = {
  primary: "bg-[#eef2f4] px-5 py-2.5 text-[#07090b] hover:bg-white",
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

export type PillTone = "success" | "danger" | "neutral" | "gold";

const PILL_TONES: Record<PillTone, string> = {
  success: "border-[#7fd1a2]/30 bg-[#7fd1a2]/10 text-[#9fe5bd]",
  danger: "border-[#ff7a66]/30 bg-[#8f3e2e]/16 text-[#ffad9f]",
  neutral: "border-white/12 bg-white/[0.03] text-[#aeb7bd]",
  gold: "border-[#d8b36d]/30 bg-[#d8b36d]/10 text-[#f4d99c]",
};

export function StatusPill({ tone = "neutral", children }: { tone?: PillTone; children: ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.14em]",
        PILL_TONES[tone],
      )}
    >
      {children}
    </span>
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
