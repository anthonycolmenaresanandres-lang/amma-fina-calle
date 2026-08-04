"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  confirmOwnerRequest,
  sendOwnerReview,
  triageOwnerRequest,
} from "@/lib/owner/request-desk/actions";
import { Loader2, Send, Sparkles } from "lucide-react";
import { Chip, Panel, buttonClass, cn } from "@/components/ui";
import styles from "./owner-portal.module.css";

/**
 * The AI Request Desk — the owner's primary surface. Type a change in plain
 * words → instant preview → confirm → "live on your menu."
 *
 * Live (`demo=false`, signed-in dashboard): calls the server triage/confirm
 * actions, which apply through the audited `apply_owner_change` rail or file a
 * `change_request`. Demo (`demo=true`, login-free preview): a deterministic
 * client matcher so the experience is fully playable without auth.
 */

type Item = { name: string; price: number | string; is_available: boolean };

type Result =
  | { kind: "apply"; title: string; detail: string }
  | { kind: "review"; reason: string }
  | null;

function money(v: number | string) {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? `$${n.toFixed(2)}` : "Ask";
}

// Demo-only deterministic matcher (mirrors the server triage's headline cases).
function parse(text: string, items: Item[]): Result {
  const t = ` ${text.toLowerCase().trim()} `;
  if (!t.trim()) return null;
  const found = items.find((it) => t.includes(it.name.toLowerCase()));
  if (found && /\b(86|sold out|out of|hide|unavailable|we.?re out|ran out)\b/.test(t)) {
    return { kind: "apply", title: `86 “${found.name}”`, detail: "It disappears from your live menu until you bring it back." };
  }
  if (found && /\b(bring back|back on|available again|show|un.?86)\b/.test(t)) {
    return { kind: "apply", title: `Bring back “${found.name}”`, detail: "It returns to your live menu right away." };
  }
  const priceMatch = t.match(/\$?\s*(\d+(?:\.\d{1,2})?)/);
  if (found && priceMatch && /(\$|\bto\b|\bprice\b|\bnow\b|\bmake\b|dollar)/.test(t)) {
    return { kind: "apply", title: `Change “${found.name}” price`, detail: `${money(found.price)} → $${Number(priceMatch[1]).toFixed(2)} — live on your menu.` };
  }
  return { kind: "review", reason: "I’ll pass this to the Fina Calle team — they’ll handle it and follow up." };
}

const DEFAULT_CHIPS = ["86 the Flan Latte", "change Mocha to $8", "bring back Cortado"];

export default function AskBar({
  items,
  demo = false,
  restaurantId,
  suggestedPrompts,
}: {
  items: Item[];
  demo?: boolean;
  restaurantId?: string;
  suggestedPrompts?: string[];
}) {
  const router = useRouter();
  const [text, setText] = useState("");
  const [submitted, setSubmitted] = useState("");
  const [result, setResult] = useState<Result>(null);
  const [done, setDone] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const interactive = demo || Boolean(restaurantId);
  const chips = suggestedPrompts?.length ? suggestedPrompts : DEFAULT_CHIPS;

  function analyze(value: string) {
    if (!value.trim()) return;
    setDone(null);
    setSubmitted(value);
    if (demo) {
      setResult(parse(value, items));
      return;
    }
    startTransition(async () => {
      const fd = new FormData();
      fd.set("text", value);
      const s = await triageOwnerRequest(restaurantId ?? "", { phase: "idle" }, fd);
      if (s.phase === "apply") {
        setResult({
          kind: "apply",
          title: `${s.proposal.entityLabel} · ${s.proposal.fieldLabel}`,
          detail: `${s.proposal.currentDisplay} → ${s.proposal.newDisplay} — live on your menu.`,
        });
      } else if (s.phase === "review") {
        setResult({ kind: "review", reason: s.reason });
      } else if (s.phase === "error") {
        setResult({ kind: "review", reason: s.message });
      } else {
        setResult(null);
      }
    });
  }

  function reset() {
    setText("");
    setSubmitted("");
    setResult(null);
    setDone(null);
  }

  function confirm() {
    const kind = result?.kind;
    if (demo) {
      setDone(kind === "apply" ? "✓ Done — it’s live on your menu. Customers see it now." : "✓ Sent to the Fina Calle team. You’ll hear back.");
      setResult(null);
      setText("");
      return;
    }
    startTransition(async () => {
      const fd = new FormData();
      fd.set("text", submitted);
      if (kind === "apply") {
        const r = await confirmOwnerRequest(restaurantId ?? "", { phase: "idle" }, fd);
        setDone(r.phase === "applied" ? `✓ ${r.message} Customers see it now.` : r.phase === "error" ? r.message : "Done.");
        if (r.phase === "applied") router.refresh();
      } else {
        const r = await sendOwnerReview(restaurantId ?? "", { phase: "idle" }, fd);
        setDone(r.phase === "sent" ? "✓ Sent to the Fina Calle team. You’ll hear back." : r.phase === "error" ? r.message : "Sent.");
      }
      setResult(null);
      setText("");
    });
  }

  return (
    <Panel className={styles.requestSurface}>
      <p className={styles.requestKicker}>
        <span className={styles.frameNumber}>01</span>
        <Sparkles size={13} strokeWidth={2} aria-hidden />
        Request desk
      </p>
      <h2 className={styles.requestTitle}>Make a change.</h2>
      <p className={styles.requestIntro}>Type it. Preview it. Confirm it.</p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (interactive) analyze(text);
        }}
        className={styles.requestForm}
      >
        <Sparkles size={15} strokeWidth={1.75} aria-hidden className="shrink-0 text-[#4f9dff]/80" />
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={!interactive || pending}
          autoComplete="off"
          placeholder="What should change…"
          className="min-w-0 flex-1 bg-transparent text-sm text-[#f4f6f7] placeholder:text-[#7f8a91] outline-none disabled:opacity-70"
          aria-label="Ask for a change"
        />
        <button
          type="submit"
          disabled={!interactive || !text.trim() || pending}
          aria-label="Send"
          className={cn(
            styles.requestSubmit,
            "flex shrink-0 items-center justify-center transition hover:bg-[#8bbcff] disabled:cursor-not-allowed disabled:opacity-50",
          )}
        >
          {pending ? (
            <Loader2 size={15} strokeWidth={2.25} aria-hidden className="animate-spin" />
          ) : (
            <Send size={15} strokeWidth={2} aria-hidden />
          )}
        </button>
      </form>

      {!result && !done ? (
        <div className={styles.promptList}>
          {chips.map((c) =>
            interactive ? (
              <button
                key={c}
                type="button"
                disabled={pending}
                onClick={() => {
                  setText(c);
                  analyze(c);
                }}
                className={cn(
                  styles.promptButton,
                  "px-3 py-1.5 transition hover:border-[#78aef8] hover:text-white disabled:opacity-50",
                )}
              >
                {c}
              </button>
            ) : (
              <Chip key={c} className={styles.promptButton}>{c}</Chip>
            ),
          )}
        </div>
      ) : null}

      {result?.kind === "apply" ? (
        <div
          aria-live="polite"
          className={cn(
            styles.responseCard,
            "mt-3 border border-[#4f9dff]/30 bg-[#4f9dff]/8 px-4 py-3",
          )}
        >
          <p className="text-sm font-semibold text-[#bfdcff]">{result.title}</p>
          <p className="mt-1 text-sm text-[#cfe0f5]/90">{result.detail}</p>
          <div className="mt-3 flex gap-2">
            <button type="button" onClick={confirm} disabled={pending} className={buttonClass("primary")}>
              {pending ? "Applying…" : "Confirm change"}
            </button>
            <button type="button" onClick={reset} disabled={pending} className={buttonClass("ghost")}>
              Cancel
            </button>
          </div>
        </div>
      ) : null}

      {result?.kind === "review" ? (
        <div
          aria-live="polite"
          className={cn(
            styles.responseCard,
            "mt-3 border border-white/12 bg-white/[0.03] px-4 py-3",
          )}
        >
          <p className="text-sm text-[#c8d0d4]">{result.reason}</p>
          <div className="mt-3 flex gap-2">
            <button type="button" onClick={confirm} disabled={pending} className={buttonClass("primary")}>
              {pending ? "Sending…" : "Send to the team"}
            </button>
            <button type="button" onClick={reset} disabled={pending} className={buttonClass("ghost")}>
              Cancel
            </button>
          </div>
        </div>
      ) : null}

      {done ? (
        <div
          aria-live="polite"
          className={cn(
            styles.responseCard,
            "mt-3 flex items-center justify-between gap-3 border border-[#7fd1a2]/35 bg-[#173a2b]/45 px-4 py-3 text-[#bdf0d4]",
          )}
        >
          <p className="text-sm font-medium">{done}</p>
          <button type="button" onClick={reset} className={buttonClass("ghost", "shrink-0")}>
            Done
          </button>
        </div>
      ) : null}
    </Panel>
  );
}
